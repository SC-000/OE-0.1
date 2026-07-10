<?php

namespace App\Services\Metering;

use App\Models\ModelCatalog;
use App\Models\ProviderKey;
use App\Models\UsageRecord;
use App\Services\Billing\BalanceService;
use App\Services\Providers\UsageBucket;
use App\Support\DetectsUniqueViolations;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;

/**
 * Converts pulled usage into billed debits — idempotently. A usage window that
 * has already been metered (unique on key+model+window) is never billed twice.
 */
class MeteringService
{
    use DetectsUniqueViolations;

    public function __construct(
        private RateResolver $rates,
        private BalanceService $balance,
    ) {}

    /**
     * Ingest a batch of buckets for one provider key.
     *
     * @param  UsageBucket[]  $buckets
     * @return array{metered:int, skipped:int, billed_cents:int}
     */
    public function ingest(ProviderKey $key, array $buckets): array
    {
        $key->loadMissing('client');
        $metered = 0;
        $skipped = 0;
        $billed = 0;
        $watermark = $key->watermark_at;

        foreach ($buckets as $bucket) {
            $record = $this->meterBucket($key, $bucket);
            if ($record === null) {
                $skipped++;

                continue;
            }
            $metered++;
            $billed += $record->billed_cents;
            if ($watermark === null || $bucket->periodEnd->gt($watermark)) {
                $watermark = $bucket->periodEnd;
            }
        }

        $key->forceFill([
            'last_synced_at' => now(),
            'watermark_at' => $watermark,
        ])->save();

        return ['metered' => $metered, 'skipped' => $skipped, 'billed_cents' => $billed];
    }

    /** Meter a single bucket; returns null if it was already metered. */
    public function meterBucket(ProviderKey $key, UsageBucket $bucket): ?UsageRecord
    {
        $client = $key->client;

        $catalog = $this->catalogFor($bucket->provider, $bucket->model);
        if (! $catalog && ($bucket->providerCostCents ?? null) === null) {
            // Register the BASE model name (dated snapshots like …-2026-03-05 share one
            // price) so the admin prices it once and every snapshot maps to it.
            $base = preg_replace('/-\d{4}-\d{2}-\d{2}$/', '', $bucket->model) ?: $bucket->model;
            $catalog = ModelCatalog::firstOrCreate(
                ['provider' => $bucket->provider, 'model' => $base],
                ['input_usd_per_million' => 0, 'output_usd_per_million' => 0, 'active' => true],
            );
        }
        $providerCost = $catalog
            ? $catalog->costCents($bucket->inputTokens, $bucket->outputTokens)
            : (int) ($bucket->providerCostCents ?? 0);

        // Pulled buckets aggregate an unknown number of requests, so no per-request fee.
        $billed = $this->rates->resolve($client, $bucket->provider, $bucket->model)
            ->billedCents($providerCost, $bucket->inputTokens, $bucket->outputTokens);

        return DB::transaction(function () use ($key, $client, $bucket, $providerCost, $billed) {
            $idem = $bucket->idempotencyParts();
            try {
                $record = UsageRecord::create([
                    'client_id' => $client->id,
                    'provider_key_id' => $key->id,
                    'provider' => $bucket->provider,
                    'model' => $bucket->model,
                    'period_start' => $idem['period_start'],
                    'period_end' => $idem['period_end'],
                    'input_tokens' => $bucket->inputTokens,
                    'output_tokens' => $bucket->outputTokens,
                    'provider_cost_cents' => $providerCost,
                    'billed_cents' => $billed,
                    'source' => 'pull',
                ]);
            } catch (QueryException $e) {
                if ($this->isUniqueViolation($e)) {
                    return null; // already metered — never double-bill
                }
                throw $e;
            }

            if ($billed > 0) {
                $this->balance->debit(
                    $client,
                    $billed,
                    'usage_debit',
                    "{$bucket->provider}/{$bucket->model} usage",
                    "usage:{$record->id}",
                    ['tokens_in' => $bucket->inputTokens, 'tokens_out' => $bucket->outputTokens, 'provider_cost_cents' => $providerCost],
                );
            }

            return $record;
        });
    }

    /**
     * Re-price usage that metered at $0 because its model was unpriced at the time.
     * Idempotent: only touches records still at $0, and only when the model now has a
     * price. Debits the client the newly-computed amount.
     *
     * @return array{rebilled:int, billed_cents:int}
     */
    public function rebill(?int $clientId = null): array
    {
        $rebilled = 0;
        $billedTotal = 0;

        UsageRecord::query()
            ->where('provider_cost_cents', 0)
            ->where('billed_cents', 0)
            ->whereRaw('(input_tokens + output_tokens) > 0')
            ->when($clientId, fn ($q, $id) => $q->where('client_id', $id))
            ->with('client')
            ->chunkById(200, function ($records) use (&$rebilled, &$billedTotal) {
                foreach ($records as $rec) {
                    $catalog = $this->catalogFor($rec->provider, $rec->model);
                    $cost = $catalog ? $catalog->costCents((int) $rec->input_tokens, (int) $rec->output_tokens) : 0;
                    $client = $rec->client;
                    if ($cost <= 0 || ! $client) {
                        continue;
                    }
                    $billed = $this->rates->resolve($client, $rec->provider, $rec->model)
                        ->billedCents($cost, (int) $rec->input_tokens, (int) $rec->output_tokens);

                    DB::transaction(function () use ($rec, $cost, $billed, $client, &$rebilled, &$billedTotal) {
                        $fresh = UsageRecord::whereKey($rec->id)->lockForUpdate()->first();
                        if (! $fresh || (int) $fresh->billed_cents !== 0) {
                            return; // already billed by a concurrent run
                        }
                        $fresh->update(['provider_cost_cents' => $cost, 'billed_cents' => $billed]);
                        if ($billed > 0) {
                            $this->balance->debit($client, $billed, 'usage_debit', "{$rec->provider}/{$rec->model} usage (re-billed)", "usage:{$rec->id}", ['rebill' => true]);
                        }
                        $rebilled++;
                        $billedTotal += $billed;
                    });
                }
            });

        return ['rebilled' => $rebilled, 'billed_cents' => $billedTotal];
    }

    /** Look up a model's price, mapping dated snapshots (…-YYYY-MM-DD) to the base model. */
    private function catalogFor(string $provider, string $model): ?ModelCatalog
    {
        $exact = ModelCatalog::where('provider', $provider)->where('model', $model)->first();
        if ($exact) {
            return $exact;
        }
        $base = preg_replace('/-\d{4}-\d{2}-\d{2}$/', '', $model);
        if ($base !== $model) {
            return ModelCatalog::where('provider', $provider)->where('model', $base)->first();
        }

        return null;
    }
}
