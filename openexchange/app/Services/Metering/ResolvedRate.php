<?php

namespace App\Services\Metering;

use App\Models\ClientModelRate;

/**
 * The rate card that applies to one client+provider+model, and the single place
 * that turns provider cost + tokens into what we bill.
 *
 * Two modes:
 *   markup — billed = provider_cost x (1 + markup_bps/10000).   Margin follows cost.
 *   fixed  — billed = tokens x your own $/1M sell price.        Margin absorbs cost moves.
 *
 * Both then add `per_request_fee_cents`, and both respect `min_margin_bps`, a floor
 * that guarantees you never bill below cost x (1 + floor) — the guard against an
 * upstream price rise quietly turning a model unprofitable.
 */
final class ResolvedRate
{
    public function __construct(
        public readonly string $mode = 'markup',
        public readonly ?int $markupBps = null,
        public readonly ?float $inputUsdPerMillion = null,
        public readonly ?float $outputUsdPerMillion = null,
        public readonly int $perRequestFeeCents = 0,
        public readonly ?int $minMarginBps = null,
        public readonly ?int $rateId = null,
        public readonly string $origin = 'client_default',
    ) {}

    public static function fromRow(ClientModelRate $row): self
    {
        return new self(
            mode: $row->pricing_mode ?: 'markup',
            markupBps: $row->markup_bps,
            inputUsdPerMillion: $row->input_usd_per_million !== null ? (float) $row->input_usd_per_million : null,
            outputUsdPerMillion: $row->output_usd_per_million !== null ? (float) $row->output_usd_per_million : null,
            perRequestFeeCents: (int) $row->per_request_fee_cents,
            minMarginBps: $row->min_margin_bps,
            rateId: $row->id,
            origin: self::originFor($row),
        );
    }

    public static function markup(int $bps, string $origin = 'client_default'): self
    {
        return new self(mode: 'markup', markupBps: $bps, origin: $origin);
    }

    private static function originFor(ClientModelRate $row): string
    {
        return match (true) {
            $row->client_id && $row->model => 'client_model',
            $row->client_id && $row->provider => 'client_provider',
            (bool) $row->client_id => 'client',
            (bool) $row->model => 'global_model',
            (bool) $row->provider => 'global_provider',
            default => 'global',
        };
    }

    /**
     * Money is settled to the micro-cent before rounding up. Below that is float dust,
     * not revenue: one micro-cent is a hundred-millionth of a dollar.
     */
    private const PRECISION = 6;

    /**
     * What we charge the client, in integer cents.
     *
     * Two distinct inputs, and mixing them up is how margin disappears:
     *
     *   $chargeBasisCents — the model's charge-on price, EXACT fractional cents.
     *                       Markup % is applied to THIS.
     *   $realCostCents    — what the provider actually charges us, EXACT. The margin
     *                       floor protects THIS, because that's the only number that
     *                       can make a request unprofitable. Defaults to the charge
     *                       basis when a model has no separate charge-on price.
     *
     * ROUNDING. Everything is computed in exact fractional cents and rounded UP exactly
     * once, here, at the point of charging. Rounding earlier is what made a 0.45¢
     * gpt-4o request bill $0: the cost rounded to 0¢, and 0¢ × any markup is still 0¢.
     *
     * Consequences, deliberately:
     *   - any billable usage costs the client at least 1¢, so no request is ever free;
     *   - the fraction of a penny we round up is real revenue we actually collect;
     *   - `provider_cost_cents` keeps its exact sub-cent value, so margin stays honest
     *     even on a workload of requests that each cost less than a penny.
     *
     * @param  int  $requests  Only the gateway knows a true request count; pulled usage
     *                         buckets aggregate many requests, so they pass 0 and skip the fee.
     */
    public function billedCents(
        float $chargeBasisCents,
        int $inputTokens,
        int $outputTokens,
        int $requests = 0,
        ?float $realCostCents = null,
    ): int {
        $realCostCents ??= $chargeBasisCents;

        $billed = $this->mode === 'fixed'
            ? (($inputTokens / 1_000_000) * (float) ($this->inputUsdPerMillion ?? 0)
                + ($outputTokens / 1_000_000) * (float) ($this->outputUsdPerMillion ?? 0)) * 100
            : $chargeBasisCents * (1 + (($this->markupBps ?? 0) / 10000));

        $billed += $this->perRequestFeeCents * max(0, $requests);

        if ($this->minMarginBps !== null && $realCostCents > 0) {
            $billed = max($billed, $realCostCents * (1 + $this->minMarginBps / 10000));
        }

        return self::ceilCents($billed);
    }

    /**
     * Round up to the next whole cent — but only for money that is actually there.
     *
     * `ceil()` alone would turn a float artefact like 1250.0000000000002 into 1251,
     * over-charging a penny for free. Settling to the micro-cent first erases the dust
     * while keeping every real fraction: one genuine micro-cent still costs a penny.
     */
    public static function ceilCents(float $cents): int
    {
        if ($cents <= 0.0) {
            return 0;
        }

        return (int) ceil(round($cents, self::PRECISION));
    }

    /** Realised markup in bps for a booked line — the number margin reports care about. */
    public static function effectiveMarkupBps(int $providerCostCents, int $billedCents): ?int
    {
        if ($providerCostCents <= 0) {
            return null; // undefined: no cost basis to mark up
        }

        return (int) round((($billedCents - $providerCostCents) / $providerCostCents) * 10000);
    }

    /** Human summary for the admin rate-card UI. */
    public function label(): string
    {
        $core = $this->mode === 'fixed'
            ? '$'.rtrim(rtrim(number_format((float) $this->inputUsdPerMillion, 2), '0'), '.').' / $'.rtrim(rtrim(number_format((float) $this->outputUsdPerMillion, 2), '0'), '.').' per 1M'
            : '+'.number_format(($this->markupBps ?? 0) / 100, ($this->markupBps ?? 0) % 100 === 0 ? 0 : 2).'%';

        if ($this->perRequestFeeCents > 0) {
            $core .= ' + '.number_format($this->perRequestFeeCents / 100, 2).'/req';
        }

        return $core;
    }
}
