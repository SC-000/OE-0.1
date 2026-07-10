<?php

namespace App\Console\Commands;

use App\Models\Client;
use App\Models\ProviderKey;
use App\Models\UsageRecord;
use App\Services\Billing\AutoTopupService;
use App\Services\Metering\MeteringService;
use App\Services\Providers\GoogleUsagePuller;
use App\Services\Providers\OpenAiUsagePuller;
use Carbon\CarbonImmutable;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Throwable;

/**
 * Pull provider usage → meter (idempotently) → debit balances → auto top-up
 * any client that fell below its minimum. Safe to run on a schedule; one key
 * failing never blocks the others.
 *
 * The run writes a structured summary to `oe.metering.last_run` and stamps each key
 * with its own outcome, because a pull that quietly returns nothing looks exactly like
 * a pull that had nothing to return — and only one of those is fine. A key whose
 * `external_project_id` doesn't exist upstream returns an EMPTY result, not an error.
 */
class PullUsage extends Command
{
    protected $signature = 'metering:pull {--client= : Only this client id} {--no-topup : Skip auto top-up}';

    protected $description = 'Pull OpenAI + Google usage, meter it, and auto top-up low balances';

    public function handle(
        OpenAiUsagePuller $openai,
        GoogleUsagePuller $google,
        MeteringService $metering,
        AutoTopupService $topups,
    ): int {
        $lookback = (int) config('openexchange.metering.pull_lookback_hours', 48);
        $until = CarbonImmutable::now();
        $totalMetered = 0;
        $totalBilled = 0;
        $failed = 0;
        $empty = 0;
        $errors = [];

        $keys = ProviderKey::query()
            ->where('status', 'active')
            ->when($this->option('client'), fn ($q, $id) => $q->where('client_id', $id))
            ->with('client')
            ->get();

        foreach ($keys as $key) {
            $since = $key->watermark_at
                ? CarbonImmutable::parse($key->watermark_at)
                : $until->subHours($lookback);

            // A watermark at or after `until` would make the provider reject the window
            // ("End time must be after start time"). Older rows carry exactly that, from
            // when an open day-bucket's future end_time was stored. Re-read the lookback
            // window instead — re-metering a bucket is safe and bills only the difference.
            if ($since->gte($until)) {
                $since = $until->subHours($lookback);
            }

            // Transition guard for the move from daily provider buckets to 15-minute
            // buckets. A legacy open daily row has already billed its cumulative usage;
            // pulling minute buckets again from midnight would bill the same usage twice.
            if ($key->last_synced_at) {
                $openWideBucket = UsageRecord::query()
                    ->where('provider_key_id', $key->id)
                    ->where('source', 'pull')
                    ->where('period_start', '<=', $until)
                    ->where('period_end', '>', $until)
                    ->orderByDesc('period_end')
                    ->first();

                if ($openWideBucket && $openWideBucket->period_start->diffInMinutes($openWideBucket->period_end) > 15) {
                    $lastSynced = CarbonImmutable::parse($key->last_synced_at);
                    if ($lastSynced->gt($since) && $lastSynced->lt($until)) {
                        $since = $lastSynced;
                    }
                }
            }

            try {
                $buckets = match ($key->provider) {
                    'openai' => $openai->pull($key, $since, $until),
                    'google' => $google->pull($key, $since, $until),
                    default => [],
                };
                $summary = $metering->ingest($key, $buckets, $until);
                $totalMetered += $summary['metered'] + $summary['updated'];
                $totalBilled += $summary['billed_cents'];

                $key->forceFill([
                    'last_error' => null,
                    'last_error_at' => null,
                    'last_pull_records' => count($buckets),
                ])->save();

                if ($buckets === []) {
                    $empty++;
                }

                $this->line(sprintf(
                    '  [%s] key #%d "%s": %d returned, %d new, %d grew, %d unchanged, $%.2f billed%s',
                    $key->provider, $key->id, $key->label,
                    count($buckets), $summary['metered'], $summary['updated'], $summary['skipped'], $summary['billed_cents'] / 100,
                    $buckets === [] ? '  <- nothing upstream for project '.($key->external_project_id ?: '(none)') : '',
                ));
            } catch (Throwable $e) {
                report($e);
                $failed++;
                $message = mb_substr($e->getMessage(), 0, 300);
                $errors[] = "key #{$key->id} ({$key->provider}/{$key->label}): {$message}";

                $key->forceFill(['last_error' => $message, 'last_error_at' => now()])->save();
                $this->error("  key #{$key->id} ({$key->provider}) failed: {$message}");
            }
        }

        // Self-heal: re-price any usage that metered at $0 because its model was unpriced.
        $rebill = $metering->rebill($this->option('client') ? (int) $this->option('client') : null);
        if ($rebill['rebilled'] > 0) {
            $totalBilled += $rebill['billed_cents'];
            $this->line(sprintf('  re-billed %d unpriced record(s): $%.2f', $rebill['rebilled'], $rebill['billed_cents'] / 100));
        }

        if (! $this->option('no-topup')) {
            Client::where('auto_topup', true)
                ->when($this->option('client'), fn ($q, $id) => $q->whereKey($id))
                ->get()
                ->each(function (Client $client) use ($topups) {
                    $topup = $topups->maybeTopup($client);
                    if ($topup) {
                        $this->line("  top-up client #{$client->id}: {$topup->status} (\${$topup->amount_cents}c)");
                    }
                });
        }

        // Record the run so the admin can see what the metering job actually did —
        // including doing nothing, and why.
        Cache::forever('oe.metering.last_run', [
            'at' => now()->toDateTimeString(),
            'keys' => $keys->count(),
            'metered' => $totalMetered,
            'billed_cents' => $totalBilled,
            'rebilled' => $rebill['rebilled'],
            'failed' => $failed,
            'empty' => $empty,
            'errors' => array_slice($errors, 0, 5),
        ]);

        if ($failed > 0) {
            $this->warn("{$failed} of {$keys->count()} key(s) failed. See /admin/platform.");
        }
        $this->info('metering:pull complete.');

        // Never fail the schedule for an upstream outage — the run is recorded either way.
        return self::SUCCESS;
    }
}
