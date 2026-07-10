<?php

namespace Database\Seeders;

use App\Models\ModelCatalog;
use App\Models\User;
use App\Services\Pricing\ModelSyncService;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Seeds only what a fresh install needs: the model catalogue and a platform admin.
 * No demo clients, keys or usage — those are created from the admin UI.
 *
 * Deliberately does NOT ship hand-typed prices. A stale hardcoded price is worse than
 * an obviously-missing one: it silently destroys margin and nothing flags it. (The old
 * table had gemini-2.5-pro at $5.00 output when the real price was $10.00.) Instead we
 * seed the model IDs unpriced and pull the real cost basis from the pricing feed. If the
 * feed is unreachable the models stay unpriced, the admin sees them flagged red at
 * /admin/models, and re-billing settles any usage once they're priced.
 */
class DatabaseSeeder extends Seeder
{
    /** Models a fresh install should know about. Prices come from the feed, never from here. */
    private const MODELS = [
        'openai' => ['gpt-5.5', 'gpt-5.4', 'gpt-5.4-mini', 'gpt-5.4-nano', 'gpt-4o', 'gpt-4o-mini', 'o3', 'o4-mini'],
        'anthropic' => ['claude-fable-5', 'claude-opus-4-8', 'claude-sonnet-5', 'claude-haiku-4-5'],
        'google' => ['gemini-3.1-pro-preview', 'gemini-3.5-flash', 'gemini-3.1-flash-lite', 'gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.5-pro'],
        'meta' => ['llama-4-maverick', 'llama-4-scout'],
        'deepseek' => ['deepseek-v4-pro', 'deepseek-v4-flash'],
        'xai' => ['grok-4.3', 'grok-4.1-fast'],
        'mistral' => ['mistral-large-2512', 'mistral-small-2603'],
    ];

    public function run(): void
    {
        foreach (self::MODELS as $provider => $models) {
            foreach ($models as $model) {
                ModelCatalog::firstOrCreate(
                    ['provider' => $provider, 'model' => $model],
                    [
                        'input_usd_per_million' => 0,
                        'output_usd_per_million' => 0,
                        'active' => true,
                        'client_visible' => true,
                        'price_source' => 'seed',
                        'first_seen_at' => now(),
                    ],
                );
            }
        }

        $this->priceFromFeed();

        // Platform admin login — change the password after first sign-in.
        User::updateOrCreate(['email' => 'admin@openexchange.ai'], [
            'name' => 'Platform Admin',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
            'client_id' => null,
            'role' => 'admin',
        ]);
    }

    /** Best-effort: a seed must still succeed offline or in CI. */
    private function priceFromFeed(): void
    {
        try {
            $stats = app(ModelSyncService::class)->sync();
            $this->command?->info("  Priced {$stats['priced']} model(s) from the pricing feed.");
        } catch (\Throwable $e) {
            $this->command?->warn('  Pricing feed unavailable ('.$e->getMessage().').');
        }

        $unpriced = ModelCatalog::where('input_usd_per_million', 0)->where('output_usd_per_million', 0)->count();
        if ($unpriced > 0) {
            $this->command?->warn("  {$unpriced} model(s) are unpriced and would bill \$0. Run `php artisan models:sync`, or price them at /admin/models.");
        }
    }
}
