<?php

namespace App\Services\Pricing;

use App\Models\ModelCatalog;

/**
 * The single entry point for "we just saw a model — make sure it exists and has a price".
 *
 * Called from the metering pull AND the real-time gateway, so a model that appears
 * mid-month can never bill at $0 while also being invisible in the admin catalogue.
 * It prices from the CACHED feed only — an inference request must never wait on an
 * HTTP call to OpenRouter. If the cache is cold the row is created unpriced, the
 * admin sees it flagged, and `models:sync` + auto-rebill settle it shortly after.
 */
class ModelRegistrar
{
    public function __construct(private PricingResolver $pricing) {}

    /** Dated snapshots (…-2026-03-05) share their base model's price and alias. */
    public static function baseModel(string $model): string
    {
        return preg_replace('/-\d{4}-\d{2}-\d{2}$/', '', $model) ?: $model;
    }

    /** Find or create the catalogue row for this model, pricing it if the feed cache can. */
    public function ensure(string $provider, string $model): ModelCatalog
    {
        $row = ModelCatalog::firstOrCreate(
            ['provider' => $provider, 'model' => self::baseModel($model)],
            [
                'input_usd_per_million' => 0,
                'output_usd_per_million' => 0,
                'active' => true,
                'client_visible' => true,
                'price_source' => 'discovered',
                'first_seen_at' => now(),
            ],
        );

        if (! $row->isPriced()) {
            $this->priceFromCachedFeed($row);
        }

        return $row;
    }

    /** Apply the cached feed price to an unpriced (or any) row. False when we have no quote. */
    public function priceFromCachedFeed(ModelCatalog $row): bool
    {
        $quotes = $this->pricing->cachedQuotes();
        if ($quotes === []) {
            return false;
        }

        $quote = $this->pricing->quoteFor($quotes, $row->provider, $row->model);
        if (! $quote || ! $quote->isPriced()) {
            return false;
        }

        $row->forceFill([
            'input_usd_per_million' => $quote->inputUsdPerMillion,
            'output_usd_per_million' => $quote->outputUsdPerMillion,
            'cached_input_usd_per_million' => $quote->cachedInputUsdPerMillion,
            'price_source' => $quote->source,
            'feed_input_usd_per_million' => $quote->inputUsdPerMillion,
            'feed_output_usd_per_million' => $quote->outputUsdPerMillion,
            'feed_ref' => $quote->ref,
            'feed_synced_at' => now(),
            'tier' => $row->tier ?: ModelCatalog::tierFor($quote->inputUsdPerMillion + $quote->outputUsdPerMillion),
        ])->save();

        return true;
    }
}
