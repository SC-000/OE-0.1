<?php

namespace App\Services\Metering;

use App\Models\ModelCatalog;
use App\Models\ProviderKey;
use App\Models\UsageRecord;
use App\Services\Billing\BalanceService;
use App\Services\Pricing\ModelRegistrar;
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
        private ModelRegistrar $registrar,
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
            // Register the BASE model name (dated snapshots share one price) and price it
            // from the cached feed if we can, so this bucket bills correctly the first time.
            $catalog = $this->registrar->ensure($bucket->provider, $bucket->model);
        }
        $providerCost = $catalog
            ? $catalog->costCents($bucket->inputTokens, $bucket->outputTokens)
            : (int) ($bucket->providerCostCents ?? 0);
        // Markup sits on the charge-on price, not on what the provider charged us.
        $chargeBasis = $catalog
            ? $catalog->chargeBasisCents($bucket->inputTokens, $bucket->outputTokens)
            : $providerCost;

        // Pulled buckets aggregate an unknown number of requests, so no per-request fee.
        $billed = $this->rates->resolve($client, $bucket->provider, $bucket->model)
            ->billedCents($chargeBasis, $bucket->inputTokens, $bucket->outputTokens, 0, $providerCost);

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
     * Re-price usage that metered without a cost basis, now that its model has a price.
     *
     * The trigger is `provider_cost_cents = 0`, NOT `billed_cents = 0`: a record can be
     * unpriced yet still have billed something (a per-request fee, or a fixed-price rate
     * card that ignores cost). Those records are under-billed AND carry a wrong cost
     * basis, so margin reporting lies about them. We recompute both and settle only the
     * DIFFERENCE, which means a re-bill can also credit a client if the new price makes
     * their line cheaper.
     *
     * Idempotent: once a record has a cost basis it is never picked up again, and the
     * row is re-checked under a lock before being touched.
     *
     * @param  string|null  $model  Base model name; its dated snapshots are re-billed too.
     * @return array{rebilled:int, billed_cents:int, credited:int}
     */
    public function rebill(?int $clientId = null, ?string $provider = null, ?string $model = null): array
    {
        $rebilled = 0;
        $netCents = 0;
        $credited = 0;

        UsageRecord::query()
            ->where('provider_cost_cents', 0)
            ->whereRaw('(input_tokens + output_tokens) > 0')
            ->when($clientId, fn ($q, $id) => $q->where('client_id', $id))
            ->when($provider, fn ($q, $p) => $q->where('provider', $p))
            // `gpt-4o` must not sweep up `gpt-4o-mini`, so the LIKE is only a prefilter —
            // baseModel() below is what actually decides membership.
            ->when($model, fn ($q, $m) => $q->where(fn ($w) => $w->where('model', $m)->orWhere('model', 'like', $m.'-%')))
            ->with('client')
            ->chunkById(200, function ($records) use ($model, &$rebilled, &$netCents, &$credited) {
                foreach ($records as $rec) {
                    if ($model !== null && ModelRegistrar::baseModel($rec->model) !== $model) {
                        continue;
                    }

                    $client = $rec->client;
                    $catalog = $this->catalogFor($rec->provider, $rec->model);
                    if (! $client || ! $catalog || ! $catalog->isPriced()) {
                        continue;
                    }

                    $in = (int) $rec->input_tokens;
                    $out = (int) $rec->output_tokens;
                    $cost = $catalog->costCents($in, $out);
                    if ($cost <= 0) {
                        continue; // priced, but this token volume rounds to nothing
                    }

                    // Gateway rows are one request; pulled buckets aggregate an unknown count.
                    $requests = $rec->source === 'gateway' ? 1 : 0;
                    $billed = $this->rates->resolve($client, $rec->provider, $rec->model)
                        ->billedCents($catalog->chargeBasisCents($in, $out), $in, $out, $requests, $cost);

                    DB::transaction(function () use ($rec, $cost, $billed, $client, &$rebilled, &$netCents, &$credited) {
                        $fresh = UsageRecord::whereKey($rec->id)->lockForUpdate()->first();
                        if (! $fresh || (int) $fresh->provider_cost_cents !== 0) {
                            return; // a concurrent run already settled this record
                        }

                        $was = (int) $fresh->billed_cents;
                        $fresh->update(['provider_cost_cents' => $cost, 'billed_cents' => $billed]);

                        $delta = $billed - $was;
                        if ($delta !== 0) {
                            $this->balance->apply(
                                $client,
                                -$delta, // owed more => balance down; owed less => refund
                                'usage_debit',
                                "{$rec->provider}/{$rec->model} usage (re-billed)",
                                "usage:{$rec->id}:rebill",
                                ['rebill' => true, 'was_billed_cents' => $was, 'now_billed_cents' => $billed, 'provider_cost_cents' => $cost],
                            );
                        }

                        $rebilled++;
                        $netCents += $delta;
                        if ($delta < 0) {
                            $credited++;
                        }
                    });
                }
            });

        return ['rebilled' => $rebilled, 'billed_cents' => $netCents, 'credited' => $credited];
    }

    /**
     * Re-price usage that ALREADY has a cost basis, at today's cost + charge-on price +
     * rate card. Use when a price was wrong, not merely missing (that's `rebill()`).
     *
     * Unlike `rebill()` this rewrites history, so it always settles the exact difference
     * and is safe to run twice — the second run computes a delta of zero. Pass
     * `dryRun: true` to preview who moves and by how much before committing.
     *
     * The client's statement shows a generic "Usage — inference" line, same as any other
     * metered usage: no model id leaks. Their BALANCE does move, and the ledger records
     * it — a re-cost cannot be, and should not be, invisible to the person paying.
     *
     * @return array{records:int, was_cents:int, now_cents:int, delta_cents:int, credited:int, applied:bool}
     */
    public function recost(?int $clientId, string $provider, string $model, bool $dryRun = false): array
    {
        $records = 0;
        $was = 0;
        $now = 0;
        $credited = 0;

        UsageRecord::query()
            ->whereRaw('(input_tokens + output_tokens) > 0')
            ->where('provider', $provider)
            ->where(fn ($q) => $q->where('model', $model)->orWhere('model', 'like', $model.'-%'))
            ->when($clientId, fn ($q, $id) => $q->where('client_id', $id))
            ->with('client')
            ->chunkById(200, function ($rows) use ($model, $dryRun, &$records, &$was, &$now, &$credited) {
                foreach ($rows as $rec) {
                    if (ModelRegistrar::baseModel($rec->model) !== $model) {
                        continue; // `gpt-4o` must not sweep up `gpt-4o-mini`
                    }

                    $client = $rec->client;
                    $catalog = $this->catalogFor($rec->provider, $rec->model);
                    if (! $client || ! $catalog || ! $catalog->isPriced()) {
                        continue;
                    }

                    $in = (int) $rec->input_tokens;
                    $out = (int) $rec->output_tokens;
                    $cost = $catalog->costCents($in, $out);
                    $requests = $rec->source === 'gateway' ? 1 : 0;
                    $billed = $this->rates->resolve($client, $rec->provider, $rec->model)
                        ->billedCents($catalog->chargeBasisCents($in, $out), $in, $out, $requests, $cost);

                    $delta = $billed - (int) $rec->billed_cents;
                    $records++;
                    $was += (int) $rec->billed_cents;
                    $now += $billed;
                    if ($delta < 0) {
                        $credited++;
                    }
                    if ($dryRun || ($delta === 0 && (int) $rec->provider_cost_cents === $cost)) {
                        continue;
                    }

                    DB::transaction(function () use ($rec, $cost, $billed, $client) {
                        $fresh = UsageRecord::whereKey($rec->id)->lockForUpdate()->first();
                        if (! $fresh) {
                            return;
                        }
                        // Read the previous amount BEFORE update() re-syncs the model's originals,
                        // and recompute the delta under the lock in case a concurrent run moved it.
                        $wasCents = (int) $fresh->billed_cents;
                        $liveDelta = $billed - $wasCents;

                        $fresh->update(['provider_cost_cents' => $cost, 'billed_cents' => $billed]);

                        if ($liveDelta !== 0) {
                            $this->balance->apply(
                                $client,
                                -$liveDelta, // owes more => balance down; owes less => refund
                                'usage_debit',
                                "{$rec->provider}/{$rec->model} usage (re-costed)",
                                "usage:{$rec->id}:recost",
                                ['recost' => true, 'was_billed_cents' => $wasCents, 'now_billed_cents' => $billed, 'provider_cost_cents' => $cost],
                            );
                        }
                    });
                }
            });

        return [
            'records' => $records,
            'was_cents' => $was,
            'now_cents' => $now,
            'delta_cents' => $now - $was,
            'credited' => $credited,
            'applied' => ! $dryRun,
        ];
    }

    /** How much usage is sitting unpriced, so the admin can see the exposure before acting. */
    public function pendingRebillCount(?string $provider = null, ?string $model = null): int
    {
        return UsageRecord::query()
            ->where('provider_cost_cents', 0)
            ->whereRaw('(input_tokens + output_tokens) > 0')
            ->when($provider, fn ($q, $p) => $q->where('provider', $p))
            ->when($model, fn ($q, $m) => $q->where(fn ($w) => $w->where('model', $m)->orWhere('model', 'like', $m.'-%')))
            ->count();
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
