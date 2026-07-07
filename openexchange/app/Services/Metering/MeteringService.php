<?php

namespace App\Services\Metering;

use App\Models\ModelCatalog;
use App\Models\ProviderKey;
use App\Models\UsageRecord;
use App\Services\Billing\BalanceService;
use App\Services\Providers\UsageBucket;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;

/**
 * Converts pulled usage into billed debits — idempotently. A usage window that
 * has already been metered (unique on key+model+window) is never billed twice.
 */
class MeteringService
{
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

        $catalog = ModelCatalog::where('provider', $bucket->provider)->where('model', $bucket->model)->first();
        $providerCost = $catalog
            ? $catalog->costCents($bucket->inputTokens, $bucket->outputTokens)
            : (int) ($bucket->providerCostCents ?? 0);

        $markupBps = $this->rates->markupBps($client, $bucket->provider, $bucket->model);
        $billed = (int) round($providerCost * (1 + $markupBps / 10000));

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

    private function isUniqueViolation(QueryException $e): bool
    {
        $code = (string) ($e->errorInfo[0] ?? '');
        $msg = strtolower($e->getMessage());

        return $code === '23000' || $code === '23505'
            || str_contains($msg, 'unique') || str_contains($msg, 'duplicate');
    }
}
