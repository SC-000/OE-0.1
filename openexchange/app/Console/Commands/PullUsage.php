<?php

namespace App\Console\Commands;

use App\Models\Client;
use App\Models\ProviderKey;
use App\Services\Billing\AutoTopupService;
use App\Services\Metering\MeteringService;
use App\Services\Providers\GoogleUsagePuller;
use App\Services\Providers\OpenAiUsagePuller;
use Carbon\CarbonImmutable;
use Illuminate\Console\Command;
use Throwable;

/**
 * Pull provider usage → meter (idempotently) → debit balances → auto top-up
 * any client that fell below its minimum. Safe to run on a schedule; one key
 * failing never blocks the others.
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

        $keys = ProviderKey::query()
            ->where('status', 'active')
            ->when($this->option('client'), fn ($q, $id) => $q->where('client_id', $id))
            ->with('client')
            ->get();

        foreach ($keys as $key) {
            $since = $key->watermark_at
                ? CarbonImmutable::parse($key->watermark_at)
                : $until->subHours($lookback);

            try {
                $buckets = match ($key->provider) {
                    'openai' => $openai->pull($key, $since, $until),
                    'google' => $google->pull($key, $since, $until),
                    default => [],
                };
                $summary = $metering->ingest($key, $buckets);
                $this->line(sprintf(
                    '  [%s] key #%d "%s": %d metered, %d skipped, $%.2f billed',
                    $key->provider, $key->id, $key->label,
                    $summary['metered'], $summary['skipped'], $summary['billed_cents'] / 100,
                ));
            } catch (Throwable $e) {
                report($e);
                $this->error("  key #{$key->id} ({$key->provider}) failed: ".$e->getMessage());
            }
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

        $this->info('metering:pull complete.');

        return self::SUCCESS;
    }
}
