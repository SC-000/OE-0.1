<?php

namespace App\Services\Pricing;

use Illuminate\Support\Facades\Http;

/**
 * OpenRouter publishes an unauthenticated catalogue of ~350 models with per-token
 * list prices that track the providers' own published rates. It is the only
 * machine-readable source that covers new models on the day they ship.
 *
 * Prices arrive as $ per *single* token (strings), e.g. "0.0000025" → $2.50/1M.
 * A price of "-1" means "variable / not quoted" and is treated as unknown.
 */
class OpenRouterPricingSource implements PricingSource
{
    /** OpenRouter vendor slug → our provider key. */
    private const VENDORS = [
        'openai' => 'openai',
        'google' => 'google',
        'anthropic' => 'anthropic',
        'meta-llama' => 'meta',
        'mistralai' => 'mistral',
        'deepseek' => 'deepseek',
        'x-ai' => 'xai',
        'qwen' => 'qwen',
    ];

    public function priority(): int
    {
        return 100;
    }

    public function name(): string
    {
        return 'openrouter';
    }

    /** @return array<string, PriceQuote> */
    public function quotes(): array
    {
        $url = rtrim((string) config('openexchange.pricing.openrouter_url', 'https://openrouter.ai/api/v1/models'), '/');
        $res = Http::timeout((int) config('openexchange.pricing.timeout', 25))->acceptJson()->get($url);

        if (! $res->successful()) {
            throw new \RuntimeException("OpenRouter pricing feed returned HTTP {$res->status()}.");
        }

        // Parse first, then index in two passes: EXACT ids for every model before any
        // fuzzy alias. Otherwise an alias of `gpt-5.4` could claim the key `gpt-5-4`
        // before a genuinely different `gpt-5-4` model gets to register its own id.
        $quotes = [];
        foreach ($res->json('data', []) as $m) {
            $id = (string) ($m['id'] ?? '');
            if (! str_contains($id, '/')) {
                continue;
            }
            [$vendor, $slug] = explode('/', $id, 2);
            $provider = self::VENDORS[$vendor] ?? null;
            if (! $provider) {
                continue; // a vendor we don't resell
            }

            $in = $this->perMillion($m['pricing']['prompt'] ?? null);
            $out_ = $this->perMillion($m['pricing']['completion'] ?? null);
            if ($in === null || $out_ === null) {
                continue;
            }

            $quotes[] = [$provider, $slug, new PriceQuote(
                provider: $provider,
                model: $slug,
                inputUsdPerMillion: $in,
                outputUsdPerMillion: $out_,
                cachedInputUsdPerMillion: $this->perMillion($m['pricing']['input_cache_read'] ?? null) ?? 0.0,
                source: $this->name(),
                ref: $id,
            )];
        }

        $out = [];
        foreach ($quotes as [$provider, $slug, $quote]) {
            $out[$provider.'|'.$slug] ??= $quote;
        }
        // Then the aliases a catalogue row might legitimately carry, so `gemini-2.5-flash`
        // matches the feed's `gemini-2.5-flash-preview-09-2025`, and Anthropic's dashed
        // API id `claude-opus-4-8` matches the feed's dotted `claude-opus-4.8`.
        foreach ($quotes as [$provider, $slug, $quote]) {
            foreach ($this->aliases($provider, $slug) as $key) {
                $out[$key] ??= $quote;
            }
        }

        return $out;
    }

    /** "0.0000025" → 2.5 ; "-1"/null/"" → null (unknown, not free). */
    private function perMillion(mixed $perToken): ?float
    {
        if ($perToken === null || $perToken === '') {
            return null;
        }
        $v = (float) $perToken;

        return $v < 0 ? null : round($v * 1_000_000, 6);
    }

    /**
     * Exact id first, then progressively-stripped forms. Order matters: the first
     * quote written under a key wins, so the most exact model claims it.
     *
     * @return list<string>
     */
    private function aliases(string $provider, string $slug): array
    {
        $keys = [$slug];

        // openrouter variant suffixes: :free, :thinking, :online
        $bare = explode(':', $slug)[0];
        $keys[] = $bare;

        // dated snapshots: -2026-03-05, -09-2025, -preview-09-2025
        $undated = preg_replace('/-(preview-)?\d{2,4}-\d{2}(-\d{2})?$/', '', $bare) ?: $bare;
        $keys[] = $undated;

        // trailing -preview / -exp / -latest
        $keys[] = preg_replace('/-(preview|exp|latest)$/', '', $undated) ?: $undated;

        // Version separators differ between the feed and the providers' own API ids:
        // OpenRouter says `claude-opus-4.8`, Anthropic's API calls it `claude-opus-4-8`.
        // Index both spellings so the catalogue (which holds real API ids) matches.
        foreach ($keys as $k) {
            if (str_contains($k, '.')) {
                $keys[] = str_replace('.', '-', $k);
            }
        }

        return array_values(array_unique(array_map(fn ($k) => $provider.'|'.$k, array_filter($keys))));
    }
}
