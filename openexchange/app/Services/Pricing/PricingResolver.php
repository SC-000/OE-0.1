<?php

namespace App\Services\Pricing;

use Illuminate\Support\Facades\Cache;

/**
 * Merges every configured PricingSource into one lookup, lowest priority number
 * winning. `manual` never appears here — an admin-set price lives on the catalogue
 * row itself and outranks every source by construction.
 */
class PricingResolver
{
    /** @var list<PricingSource>|null */
    private ?array $sources = null;

    /** @return array<string, PriceQuote> keyed by "provider|model" */
    public function quotes(bool $fresh = false): array
    {
        $ttl = (int) config('openexchange.pricing.cache_minutes', 180);

        if ($fresh || $ttl <= 0) {
            Cache::forget('oe.pricing.quotes');
        }

        /** @var array<string, array> $raw */
        $raw = Cache::remember('oe.pricing.quotes', now()->addMinutes(max(1, $ttl)), function () {
            $merged = [];
            foreach ($this->sources() as $source) {
                foreach ($source->quotes() as $key => $quote) {
                    $merged[$key] ??= [
                        $quote->provider, $quote->model, $quote->inputUsdPerMillion,
                        $quote->outputUsdPerMillion, $quote->cachedInputUsdPerMillion, $quote->source, $quote->ref,
                    ];
                }
            }

            return $merged;
        });

        return $this->hydrate($raw);
    }

    /**
     * Quotes we already have, without ever hitting the network.
     *
     * Metering and the gateway call this on the hot path: a brand-new model can be
     * priced the moment it is first seen, but an HTTP round-trip must never sit in
     * front of a client's inference request. Returns [] on a cold cache; the daily
     * `models:sync` keeps it warm.
     *
     * @return array<string, PriceQuote>
     */
    public function cachedQuotes(): array
    {
        $raw = Cache::get('oe.pricing.quotes');

        return is_array($raw) ? $this->hydrate($raw) : [];
    }

    /**
     * @param  array<string, array>  $raw
     * @return array<string, PriceQuote>
     */
    private function hydrate(array $raw): array
    {
        return array_map(fn ($r) => new PriceQuote($r[0], $r[1], $r[2], $r[3], $r[4], $r[5], $r[6]), $raw);
    }

    /**
     * The quote for a catalogue model — exact id first, then the undated base name
     * (gpt-5.4-2026-03-05 and gpt-5.4 share a price).
     */
    public function quoteFor(array $quotes, string $provider, string $model): ?PriceQuote
    {
        foreach ($this->lookupKeys($provider, $model) as $key) {
            if (isset($quotes[$key])) {
                return $quotes[$key];
            }
        }

        return null;
    }

    /** @return list<string> */
    private function lookupKeys(string $provider, string $model): array
    {
        $keys = [$model];
        $undated = preg_replace('/-\d{4}-\d{2}-\d{2}$/', '', $model) ?: $model;
        $keys[] = $undated;
        $keys[] = preg_replace('/-(preview|exp|latest)$/', '', $undated) ?: $undated;

        return array_values(array_unique(array_map(fn ($k) => $provider.'|'.$k, $keys)));
    }

    /** @return list<PricingSource> */
    private function sources(): array
    {
        if ($this->sources !== null) {
            return $this->sources;
        }

        $sources = [];
        foreach ((array) config('openexchange.pricing.sources', [OpenRouterPricingSource::class]) as $class) {
            $s = app($class);
            if ($s instanceof PricingSource) {
                $sources[] = $s;
            }
        }
        usort($sources, fn ($a, $b) => $a->priority() <=> $b->priority());

        return $this->sources = $sources;
    }
}
