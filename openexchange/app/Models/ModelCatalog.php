<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ModelCatalog extends Model
{
    protected $table = 'model_catalog';

    protected $guarded = [];

    protected $casts = [
        'input_usd_per_million' => 'decimal:6',
        'output_usd_per_million' => 'decimal:6',
        'cached_input_usd_per_million' => 'decimal:6',
        'feed_input_usd_per_million' => 'decimal:6',
        'feed_output_usd_per_million' => 'decimal:6',
        'feed_synced_at' => 'datetime',
        'first_seen_at' => 'datetime',
        'active' => 'boolean',
        'client_visible' => 'boolean',
    ];

    /** @return HasMany<ModelPriceProposal, $this> */
    public function proposals(): HasMany
    {
        return $this->hasMany(ModelPriceProposal::class);
    }

    /** Provider cost in integer cents for the given token counts. */
    public function costCents(int $inputTokens, int $outputTokens): int
    {
        $usd = ($inputTokens / 1_000_000) * (float) $this->input_usd_per_million
            + ($outputTokens / 1_000_000) * (float) $this->output_usd_per_million;

        return (int) round($usd * 100);
    }

    public function isPriced(): bool
    {
        return (float) $this->input_usd_per_million > 0 || (float) $this->output_usd_per_million > 0;
    }

    /** Blended $/1M used to rank models into tiers. */
    public function blendedUsdPerMillion(): float
    {
        return (float) $this->input_usd_per_million + (float) $this->output_usd_per_million;
    }

    /** Proper brand casing — ucfirst() would give us "Openai". */
    private const PROVIDER_LABELS = [
        'openai' => 'OpenAI', 'google' => 'Google', 'anthropic' => 'Anthropic',
        'meta' => 'Meta', 'mistral' => 'Mistral', 'deepseek' => 'DeepSeek',
        'xai' => 'xAI', 'qwen' => 'Qwen',
    ];

    public static function providerLabel(string $provider): string
    {
        return self::PROVIDER_LABELS[strtolower($provider)] ?? ucfirst($provider);
    }

    public static function tierLabel(?string $tier): string
    {
        return ucfirst($tier ?: 'standard');
    }

    /**
     * What a client sees. Falls back to a tier label so a brand-new model never
     * leaks its raw id just because nobody has aliased it yet.
     */
    public function clientLabel(): string
    {
        return $this->display_alias
            ?: self::providerLabel($this->provider).' '.self::tierLabel($this->tier);
    }

    /** Price band → tier, from the blended $/1M cost basis. */
    public static function tierFor(float $blendedUsdPerMillion): string
    {
        return match (true) {
            $blendedUsdPerMillion >= 15.0 => 'premium',
            $blendedUsdPerMillion >= 2.0 => 'standard',
            default => 'lite',
        };
    }
}
