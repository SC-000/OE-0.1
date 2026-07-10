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
        'base_input_usd_per_million' => 'decimal:6',
        'base_output_usd_per_million' => 'decimal:6',
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

    /**
     * REAL COST, exact, in fractional cents. Feed this into pricing — never a rounded
     * value, or a 0.45¢ request rounds to 0¢ and then any markup of it is also 0¢.
     */
    public function costCentsExact(int $inputTokens, int $outputTokens): float
    {
        return self::money($inputTokens, $outputTokens, (float) $this->input_usd_per_million, (float) $this->output_usd_per_million);
    }

    /**
     * REAL COST rounded to a whole cent, for DISPLAY only.
     *
     * Never store this: `usage_records.provider_cost_cents` holds the exact fractional
     * value (see costCentsExact), because rounding what we PAY destroys margin.
     */
    public function costCents(int $inputTokens, int $outputTokens): int
    {
        return (int) round($this->costCentsExact($inputTokens, $outputTokens));
    }

    /**
     * CHARGE-ON PRICE, exact, in fractional cents — the basis that markup % and
     * rate-card overrides sit on top of. Defaults to the real cost, so a model with no
     * charge-on price behaves exactly as it always did.
     */
    public function chargeBasisCentsExact(int $inputTokens, int $outputTokens): float
    {
        return self::money($inputTokens, $outputTokens, $this->baseInput(), $this->baseOutput());
    }

    /** Charge-on price rounded for display. Do NOT bill from this — use the exact form. */
    public function chargeBasisCents(int $inputTokens, int $outputTokens): int
    {
        return (int) round($this->chargeBasisCentsExact($inputTokens, $outputTokens));
    }

    public function baseInput(): float
    {
        return $this->base_input_usd_per_million !== null
            ? (float) $this->base_input_usd_per_million
            : (float) $this->input_usd_per_million;
    }

    public function baseOutput(): float
    {
        return $this->base_output_usd_per_million !== null
            ? (float) $this->base_output_usd_per_million
            : (float) $this->output_usd_per_million;
    }

    /** True when the admin has set a charge-on price distinct from the real cost. */
    public function hasChargeBasis(): bool
    {
        return $this->base_input_usd_per_million !== null || $this->base_output_usd_per_million !== null;
    }

    /** How much the charge-on price is padded over the real cost, in bps. Null when no cost. */
    public function basisPaddingBps(): ?int
    {
        $cost = $this->blendedUsdPerMillion();
        if ($cost <= 0.0) {
            return null;
        }

        return (int) round((($this->baseInput() + $this->baseOutput() - $cost) / $cost) * 10000);
    }

    /** Fractional cents. Never rounded here — rounding happens once, at the point of charging. */
    private static function money(int $inputTokens, int $outputTokens, float $inPerM, float $outPerM): float
    {
        $usd = ($inputTokens / 1_000_000) * $inPerM + ($outputTokens / 1_000_000) * $outPerM;

        return $usd * 100;
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
