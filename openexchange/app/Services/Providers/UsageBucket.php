<?php

namespace App\Services\Providers;

use Carbon\CarbonImmutable;

/** Provider-agnostic unit of metered usage for one model over one time window. */
class UsageBucket
{
    public function __construct(
        public string $provider,
        public string $model,
        public CarbonImmutable $periodStart,
        public CarbonImmutable $periodEnd,
        public int $inputTokens,
        public int $outputTokens,
        public ?int $providerCostCents = null, // if the provider reported an actual cost
    ) {}

    /** Stable idempotency key for (key, model, window). */
    public function idempotencyParts(): array
    {
        return [
            'model' => $this->model,
            'period_start' => $this->periodStart->toDateTimeString(),
            'period_end' => $this->periodEnd->toDateTimeString(),
        ];
    }
}
