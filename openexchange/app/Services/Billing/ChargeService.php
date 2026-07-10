<?php

namespace App\Services\Billing;

use App\Models\Charge;
use App\Models\ChargeRun;
use App\Models\Client;
use App\Models\ModelCatalog;
use App\Models\UsageRecord;
use App\Services\Metering\RateResolver;
use App\Support\DetectsUniqueViolations;
use Carbon\CarbonImmutable;
use Illuminate\Database\QueryException;
use Illuminate\Support\Facades\DB;
use Throwable;

/**
 * Bills the things that aren't gateway traffic: recurring platform fees, one-off
 * charges and credits, and off-platform AI cost.
 *
 * A `usage` charge writes a real UsageRecord so it appears in the client's dashboard
 * as token usage rather than a mystery line item. It is always stamped `source=manual`
 * and linked to the admin who created it, so any line can be traced back to a person.
 *
 * Idempotent: one ChargeRun per (charge, period). Running charges:run twice in a day
 * bills once.
 */
class ChargeService
{
    use DetectsUniqueViolations;

    public function __construct(
        private RateResolver $rates,
        private BalanceService $balance,
        private AutoTopupService $topups,
    ) {}

    /**
     * Apply every recurring charge due at `$at`.
     *
     * @return array{applied:int,skipped:int,billed_cents:int}
     */
    public function runDue(?CarbonImmutable $at = null): array
    {
        $at ??= CarbonImmutable::now();
        $applied = 0;
        $skipped = 0;
        $billed = 0;

        Charge::query()
            ->where('active', true)
            ->whereIn('cadence', ['daily', 'monthly'])
            ->with('client')
            ->chunkById(100, function ($charges) use ($at, &$applied, &$skipped, &$billed) {
                foreach ($charges as $charge) {
                    if (! $charge->dueAt($at) || ! $charge->client) {
                        $skipped++;

                        continue;
                    }
                    $run = $this->apply($charge, $at);
                    if ($run === null) {
                        $skipped++;

                        continue;
                    }
                    $applied++;
                    $billed += $run->amount_cents;
                }
            });

        return ['applied' => $applied, 'skipped' => $skipped, 'billed_cents' => $billed];
    }

    /** Apply one charge for the period containing `$at`. Null when already applied. */
    public function apply(Charge $charge, ?CarbonImmutable $at = null): ?ChargeRun
    {
        $at ??= CarbonImmutable::now();
        $period = $charge->periodKey($at);
        $client = $charge->client;
        if (! $client) {
            return null;
        }

        try {
            $run = DB::transaction(function () use ($charge, $client, $period, $at) {
                // Claim the period first — the unique index is the idempotency guard.
                $run = ChargeRun::create([
                    'charge_id' => $charge->id,
                    'period_key' => $period,
                    'amount_cents' => 0,
                ]);

                $amount = $charge->isUsage()
                    ? $this->applyUsage($charge, $client, $run, $at)
                    : $this->applyFee($charge, $client, $period);

                $run->forceFill(['amount_cents' => $amount])->save();
                $charge->forceFill(['last_run_at' => $at])->save();

                return $run;
            });
        } catch (QueryException $e) {
            if ($this->isUniqueViolation($e)) {
                return null; // this period is already billed
            }
            throw $e;
        }

        // Best-effort: a charge can be what tips a client below their floor.
        try {
            if ($client->fresh()->isLow()) {
                $this->topups->maybeTopup($client->fresh());
            }
        } catch (Throwable $e) {
            report($e);
        }

        return $run;
    }

    /** A named ledger line. Positive amount debits; negative credits. */
    private function applyFee(Charge $charge, Client $client, string $period): int
    {
        $amount = (int) $charge->amount_cents;
        if ($amount === 0) {
            return 0;
        }

        $this->balance->apply(
            $client,
            -$amount, // fee (+) => balance movement (-)
            $amount > 0 ? 'fee' : 'credit',
            $charge->name,
            "charge:{$charge->id}:{$period}",
            ['charge_id' => $charge->id, 'kind' => 'fee'],
        );

        return $amount;
    }

    /**
     * Materialise the charge as metered usage. Billed through the client's own rate
     * card unless the admin pinned a flat `amount_cents`.
     */
    private function applyUsage(Charge $charge, Client $client, ChargeRun $run, CarbonImmutable $at): int
    {
        $provider = $charge->provider ?: 'openai';
        $model = $charge->model ?: 'unspecified';
        $in = (int) $charge->input_tokens;
        $out = (int) $charge->output_tokens;

        $catalog = ModelCatalog::where('provider', $provider)->where('model', $model)->first();
        $providerCost = $catalog ? $catalog->costCents($in, $out) : 0;
        $chargeBasis = $catalog ? $catalog->chargeBasisCents($in, $out) : $providerCost;

        $billed = $charge->amount_cents > 0
            ? (int) $charge->amount_cents
            : $this->rates->resolve($client, $provider, $model)->billedCents($chargeBasis, $in, $out, 0, $providerCost);

        $record = UsageRecord::create([
            'client_id' => $client->id,
            'provider_key_id' => null,
            'access_key_id' => null,
            'provider' => $provider,
            'model' => $model,
            'period_start' => $at,
            'period_end' => $at,
            'input_tokens' => $in,
            'output_tokens' => $out,
            'provider_cost_cents' => $providerCost,
            'billed_cents' => $billed,
            'source' => 'manual',
            'request_id' => "charge:{$charge->id}:{$run->period_key}",
        ]);

        $run->forceFill(['usage_record_id' => $record->id])->save();

        if ($billed > 0) {
            $this->balance->debit(
                $client,
                $billed,
                'usage_debit',
                $charge->name,
                "charge:{$charge->id}:{$run->period_key}",
                ['charge_id' => $charge->id, 'kind' => 'usage', 'tokens_in' => $in, 'tokens_out' => $out, 'provider_cost_cents' => $providerCost],
            );
        }

        return $billed;
    }
}
