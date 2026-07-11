<?php

namespace App\Services\Billing;

use App\Services\Metering\ResolvedRate;

/**
 * What a usage charge would bill, priced exactly as ChargeService will bill it.
 *
 * This exists so the number the admin is shown before committing and the number the
 * client is actually charged come from one calculation. A preview that re-derives the
 * price itself is just a plausible lie: it drifts the moment a rate-card override, a
 * fixed sell price, a charge-on basis or a margin floor enters the picture.
 */
final class UsageQuote
{
    public function __construct(
        public readonly float $providerCostCentsExact,
        public readonly float $chargeBasisCentsExact,
        public readonly int $billedCents,
        public readonly ResolvedRate $rate,
        public readonly bool $pinned,
        public readonly bool $priced,
    ) {}

    /** Rounded, for display only — the exact fractional value is what gets stored. */
    public function providerCostCents(): int
    {
        return (int) round($this->providerCostCentsExact);
    }

    public function marginCents(): int
    {
        return $this->billedCents - $this->providerCostCents();
    }

    /** @return array<string, mixed> */
    public function toArray(): array
    {
        return [
            'provider_cost_cents' => $this->providerCostCents(),
            'charge_basis_cents' => (int) round($this->chargeBasisCentsExact),
            'billed_cents' => $this->billedCents,
            'margin_cents' => $this->marginCents(),
            'effective_markup_bps' => ResolvedRate::effectiveMarkupBps($this->providerCostCents(), $this->billedCents),
            'rate' => [
                'mode' => $this->rate->mode,
                'origin' => $this->rate->origin,
                'label' => $this->rate->label(),
            ],
            'pinned' => $this->pinned,
            'priced' => $this->priced,
        ];
    }
}
