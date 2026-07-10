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
     * What we charge the client, in integer cents.
     *
     * @param  int  $requests  Only the gateway knows a true request count; pulled usage
     *                         buckets aggregate many requests, so they pass 0 and skip the fee.
     */
    public function billedCents(int $providerCostCents, int $inputTokens, int $outputTokens, int $requests = 0): int
    {
        $base = $this->mode === 'fixed'
            ? (int) round(
                (($inputTokens / 1_000_000) * (float) ($this->inputUsdPerMillion ?? 0)
                + ($outputTokens / 1_000_000) * (float) ($this->outputUsdPerMillion ?? 0)) * 100
            )
            : (int) round($providerCostCents * (1 + (($this->markupBps ?? 0) / 10000)));

        $base += $this->perRequestFeeCents * max(0, $requests);

        if ($this->minMarginBps !== null && $providerCostCents > 0) {
            $base = max($base, (int) round($providerCostCents * (1 + $this->minMarginBps / 10000)));
        }

        return max(0, $base);
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
