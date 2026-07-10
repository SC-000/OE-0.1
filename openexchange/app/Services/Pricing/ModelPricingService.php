<?php

namespace App\Services\Pricing;

use App\Models\ModelCatalog;
use App\Services\Metering\MeteringService;

/**
 * Setting a price is never just a database write.
 *
 * Usage that metered while a model had no cost basis was billed wrong — it sat at $0
 * (or at a bare per-request fee), and its recorded provider cost was 0, so every margin
 * figure that touched it was a lie. The moment a price exists, that usage must be
 * settled. This service is the ONLY place a model's cost basis changes, so no caller
 * can forget the second half.
 *
 * Re-billing is safe to repeat: it only touches records whose `provider_cost_cents` is
 * still 0, and it settles the difference, so a client is never double-charged.
 */
class ModelPricingService
{
    public function __construct(private MeteringService $metering) {}

    /**
     * An admin typed this price. It outranks every feed, for good.
     *
     * @return array{rebilled:int, billed_cents:int, credited:int}
     */
    public function setManualPrice(ModelCatalog $model, float $input, float $output): array
    {
        $model->forceFill([
            'input_usd_per_million' => $input,
            'output_usd_per_million' => $output,
            'price_source' => 'manual',
            'tier' => $model->tier ?: ModelCatalog::tierFor($input + $output),
            'first_seen_at' => $model->first_seen_at ?? now(),
        ])->save();

        return $this->settle($model);
    }

    /**
     * A price came from a pricing source (feed today, an official API tomorrow).
     *
     * @return array{rebilled:int, billed_cents:int, credited:int}
     */
    public function applyQuote(ModelCatalog $model, PriceQuote $quote): array
    {
        $model->forceFill([
            'input_usd_per_million' => $quote->inputUsdPerMillion,
            'output_usd_per_million' => $quote->outputUsdPerMillion,
            'cached_input_usd_per_million' => $quote->cachedInputUsdPerMillion,
            'price_source' => $quote->source,
            'feed_input_usd_per_million' => $quote->inputUsdPerMillion,
            'feed_output_usd_per_million' => $quote->outputUsdPerMillion,
            'feed_ref' => $quote->ref,
            'feed_synced_at' => now(),
            'tier' => $model->tier ?: ModelCatalog::tierFor($quote->inputUsdPerMillion + $quote->outputUsdPerMillion),
            'first_seen_at' => $model->first_seen_at ?? now(),
        ])->save();

        return $this->settle($model);
    }

    /** Raw cost basis, e.g. accepting a price-change proposal. */
    public function applyPrice(ModelCatalog $model, float $input, float $output, string $source): array
    {
        $model->forceFill([
            'input_usd_per_million' => $input,
            'output_usd_per_million' => $output,
            'price_source' => $source,
            'tier' => ModelCatalog::tierFor($input + $output),
        ])->save();

        return $this->settle($model);
    }

    /**
     * Re-bill every usage record that metered against this model with no cost basis.
     * No-op (and cheap) when the model is still unpriced or nothing is outstanding.
     *
     * @return array{rebilled:int, billed_cents:int, credited:int}
     */
    public function settle(ModelCatalog $model): array
    {
        $none = ['rebilled' => 0, 'billed_cents' => 0, 'credited' => 0];

        if (! $model->isPriced()) {
            return $none;
        }

        return $this->metering->rebill(null, $model->provider, $model->model);
    }

    /** Usage records still waiting on a cost basis for this model. */
    public function outstanding(ModelCatalog $model): int
    {
        return $this->metering->pendingRebillCount($model->provider, $model->model);
    }
}
