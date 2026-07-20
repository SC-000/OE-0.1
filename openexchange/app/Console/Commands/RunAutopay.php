<?php

namespace App\Console\Commands;

use App\Models\Client;
use App\Services\Billing\AutoTopupService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Throwable;

/**
 * Auto top-up, on demand — and, more usefully, an answer to "why was this client
 * NOT charged?". The same gate that runs on `metering:pull` runs here, so a dry run
 * reports the real reason rather than a re-implementation of it that can drift.
 *
 * Charges are stamped trigger='auto', not 'manual' — this is the automatic path,
 * just invoked by hand.
 */
class RunAutopay extends Command
{
    protected $signature = 'oe:autopay
        {--client= : only this client id}
        {--dry-run : report the decision for every client, charge nothing}
        {--force : bypass the guard rails and charge (still recorded as auto)}';

    protected $description = 'Run (or explain) auto top-up for low-balance clients.';

    public function handle(AutoTopupService $topups): int
    {
        $clients = Client::query()
            ->when($this->option('client'), fn ($q, $id) => $q->whereKey($id))
            ->orderBy('id')
            ->get();

        if ($clients->isEmpty()) {
            $this->warn('No clients matched.');

            return self::SUCCESS;
        }

        $rows = [];
        $details = [];
        $charged = 0;
        $failed = 0;

        foreach ($clients as $client) {
            $decision = $topups->evaluate($client);

            // Only ever surface clients that are actually low; the rest are just noise.
            if ($decision['reason'] === 'not_low' && ! $this->option('client')) {
                continue;
            }

            $status = $decision['eligible'] ? '<fg=green>eligible</>' : "<fg=yellow>{$decision['reason']}</>";
            $outcome = $this->option('dry-run') ? '(dry run)' : '—';

            if (! $this->option('dry-run')) {
                try {
                    $topup = $this->option('force')
                        ? $topups->topup($client, 'auto')
                        : $topups->maybeTopup($client);

                    if ($topup) {
                        $outcome = $topup->status === 'succeeded'
                            ? "<fg=green>charged {$topup->amount_cents}c</>"
                            : "<fg=red>{$topup->status}</> ".mb_substr((string) $topup->failure_reason, 0, 60);
                        $topup->status === 'succeeded' ? $charged++ : $failed++;
                    } else {
                        $outcome = '<fg=gray>skipped</>';
                    }
                } catch (Throwable $e) {
                    $failed++;
                    $outcome = '<fg=red>error</> '.mb_substr($e->getMessage(), 0, 60);
                }
            }

            $rows[] = [
                $client->id,
                mb_substr((string) $client->name, 0, 22),
                sprintf('%.2f', $client->balance_cents / 100),
                sprintf('%.2f', $client->min_balance_cents / 100),
                $client->auto_topup ? 'on' : '<fg=red>off</>',
                "{$decision['auto_today']}/".($decision['max_per_day'] > 0 ? $decision['max_per_day'] : '∞'),
                Cache::has("autotopup:lock:{$client->id}") ? 'yes' : 'no',
                $status,
                $outcome,
            ];
            $details[] = "  #{$client->id} {$decision['reason']} — {$decision['detail']}";
        }

        if ($rows === []) {
            $this->info('No client is below its minimum balance — nothing for auto top-up to do.');

            return self::SUCCESS;
        }

        $this->table(
            ['id', 'client', 'bal $', 'min $', 'auto', 'today', 'locked', 'decision', 'outcome'],
            $rows,
        );

        $this->line('<fg=gray>Why each client was or was not charged:</>');
        foreach ($details as $detail) {
            $this->line($detail);
        }

        if (! $this->option('dry-run')) {
            $this->newLine();
            $this->info("Charged {$charged}, failed {$failed}.");
        }

        return self::SUCCESS;
    }
}
