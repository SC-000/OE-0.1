<?php

namespace App\Services\Gateway;

/** Normalised result of one upstream model call — exact token counts included. */
class AdapterResult
{
    public function __construct(
        public string $content,
        public int $inputTokens,
        public int $outputTokens,
        public string $model,
        public array $raw = [],
    ) {}
}
