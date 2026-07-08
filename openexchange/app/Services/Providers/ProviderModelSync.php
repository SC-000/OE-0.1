<?php

namespace App\Services\Providers;

use App\Models\ModelCatalog;
use App\Models\ProviderBackend;
use Illuminate\Support\Facades\Http;

/**
 * Auto-discovers the model IDs available in your OpenAI + Google accounts and adds
 * any missing ones to the catalogue. Providers do NOT expose pricing via API, so we
 * price known models from a bundled table and flag the rest as unpriced ($0) for the
 * admin to fill. Never overwrites an admin-set price.
 *
 * Prices are $/1M tokens [input, output].
 */
class ProviderModelSync
{
    private const PRICES = [
        'openai' => [
            'gpt-5.5' => [5.00, 30.00], 'gpt-5.4' => [2.50, 15.00], 'gpt-5.4-mini' => [0.75, 4.50],
            'gpt-5.4-nano' => [0.20, 1.25], 'gpt-4o' => [2.50, 10.00], 'gpt-4o-mini' => [0.15, 0.60],
            'o3' => [2.00, 8.00], 'o4-mini' => [1.10, 4.40],
        ],
        'google' => [
            'gemini-3.1-pro-preview' => [2.00, 12.00], 'gemini-3.5-flash' => [1.50, 9.00],
            'gemini-3.1-flash-lite' => [0.25, 1.50], 'gemini-2.5-flash' => [0.30, 2.50],
            'gemini-2.5-flash-lite' => [0.10, 0.40], 'gemini-2.5-pro' => [1.25, 5.00],
            'gemini-2.0-flash' => [0.10, 0.40],
        ],
    ];

    /** @return array{added:int,priced:int,seen:int} */
    public function sync(): array
    {
        $added = 0;
        $priced = 0;
        $seen = 0;

        foreach ([['openai', $this->openaiModels()], ['google', $this->googleModels()]] as [$provider, $ids]) {
            foreach ($ids as $id) {
                $seen++;
                if ($provider === 'openai' && ! preg_match('/^(gpt|o\d|chatgpt)/', $id)) {
                    continue;
                }
                if ($provider === 'google' && ! str_contains($id, 'gemini')) {
                    continue;
                }
                $price = self::PRICES[$provider][$id] ?? null;
                $existing = ModelCatalog::where('provider', $provider)->where('model', $id)->first();

                if ($existing) {
                    // Only fill a price we know AND the admin hasn't set one yet.
                    if ($price && (float) $existing->input_usd_per_million === 0.0 && (float) $existing->output_usd_per_million === 0.0) {
                        $existing->update(['input_usd_per_million' => $price[0], 'output_usd_per_million' => $price[1]]);
                        $priced++;
                    }

                    continue;
                }

                ModelCatalog::create([
                    'provider' => $provider,
                    'model' => $id,
                    'input_usd_per_million' => $price[0] ?? 0,
                    'output_usd_per_million' => $price[1] ?? 0,
                    'active' => true,
                ]);
                $added++;
                if ($price) {
                    $priced++;
                }
            }
        }

        return ['added' => $added, 'priced' => $priced, 'seen' => $seen];
    }

    /** @return list<string> */
    private function openaiModels(): array
    {
        $key = ProviderBackend::pick('openai')?->secret ?: config('openexchange.openai.admin_key');
        if (! $key) {
            return [];
        }
        $res = Http::withToken($key)->timeout(20)->get(rtrim((string) config('openexchange.openai.base', 'https://api.openai.com'), '/').'/v1/models');

        return $res->successful() ? collect($res->json('data', []))->pluck('id')->filter()->values()->all() : [];
    }

    /** @return list<string> */
    private function googleModels(): array
    {
        $key = ProviderBackend::pick('google', 'aistudio')?->secret;
        if (! $key) {
            return [];
        }
        $res = Http::timeout(20)->get('https://generativelanguage.googleapis.com/v1beta/models', ['key' => $key, 'pageSize' => 200]);

        return $res->successful()
            ? collect($res->json('models', []))->pluck('name')->filter()->map(fn ($n) => str_replace('models/', '', (string) $n))->values()->all()
            : [];
    }
}
