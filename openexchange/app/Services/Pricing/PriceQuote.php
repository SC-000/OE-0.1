<?php

namespace App\Services\Pricing;

/** One provider's list price for one model, normalised to $ per 1M tokens. */
final class PriceQuote
{
    public function __construct(
        public readonly string $provider,       // openai | google | anthropic | …
        public readonly string $model,          // gpt-4o
        public readonly float $inputUsdPerMillion,
        public readonly float $outputUsdPerMillion,
        public readonly float $cachedInputUsdPerMillion = 0.0,
        public readonly string $source = 'openrouter',
        public readonly ?string $ref = null,    // the source's own id, e.g. openai/gpt-4o
    ) {}

    public function key(): string
    {
        return $this->provider.'|'.$this->model;
    }

    public function isPriced(): bool
    {
        return $this->inputUsdPerMillion > 0 || $this->outputUsdPerMillion > 0;
    }
}
