<?php

namespace App\Services\Pricing;

/**
 * A source of provider list prices.
 *
 * The resolution chain is manual > official > feed (see PricingResolver). Today only
 * the OpenRouter feed is implemented, because neither OpenAI's `/v1/models` nor
 * Google's `models` endpoint returns pricing — they return capabilities only. If a
 * provider ever ships a price API, implement this interface, give it a lower
 * `priority()` number than the feed, and register it in config/openexchange.php.
 * Nothing else has to change.
 */
interface PricingSource
{
    /** Lower runs first and wins. official = 10, feed = 100. */
    public function priority(): int;

    public function name(): string;

    /**
     * Every price this source knows, keyed by "provider|model".
     *
     * @return array<string, PriceQuote>
     */
    public function quotes(): array;
}
