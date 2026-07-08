<?php

namespace Database\Seeders;

use App\Models\ModelCatalog;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Seeds only what a fresh install needs: the model-cost catalogue and a platform
 * admin login. No demo clients, keys or usage — those are created from the admin UI.
 */
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Provider cost catalogue ($/1M tokens) — input, output.
        $catalog = [
            ['openai', 'gpt-5.5', 5.00, 30.00],
            ['openai', 'gpt-5.4', 2.50, 15.00],
            ['openai', 'gpt-5.4-mini', 0.75, 4.50],
            ['openai', 'gpt-5.4-nano', 0.20, 1.25],
            ['openai', 'gpt-4o', 2.50, 10.00],
            ['openai', 'gpt-4o-mini', 0.15, 0.60],
            ['openai', 'o3', 2.00, 8.00],
            ['openai', 'o4-mini', 1.10, 4.40],
            ['anthropic', 'claude-fable-5', 10.00, 50.00],
            ['anthropic', 'claude-opus-4-8', 5.00, 25.00],
            ['anthropic', 'claude-sonnet-5', 3.00, 15.00],
            ['anthropic', 'claude-haiku-4-5', 1.00, 5.00],
            ['google', 'gemini-3.1-pro-preview', 2.00, 12.00],
            ['google', 'gemini-3.5-flash', 1.50, 9.00],
            ['google', 'gemini-3.1-flash-lite', 0.25, 1.50],
            ['google', 'gemini-2.5-flash', 0.30, 2.50],
            ['google', 'gemini-2.5-flash-lite', 0.10, 0.40],
            ['google', 'gemini-2.5-pro', 1.25, 5.00],
            ['meta', 'llama-4-maverick', 0.15, 0.60],
            ['meta', 'llama-4-scout', 0.08, 0.30],
            ['deepseek', 'deepseek-v4-pro', 0.435, 0.87],
            ['deepseek', 'deepseek-v4-flash', 0.14, 0.28],
            ['xai', 'grok-4.3', 1.25, 2.50],
            ['xai', 'grok-4.1-fast', 0.20, 0.50],
            ['mistral', 'mistral-large-2512', 2.00, 6.00],
            ['mistral', 'mistral-small-2603', 0.20, 0.60],
        ];
        foreach ($catalog as [$p, $m, $in, $out]) {
            ModelCatalog::updateOrCreate(['provider' => $p, 'model' => $m], [
                'input_usd_per_million' => $in, 'output_usd_per_million' => $out, 'active' => true,
            ]);
        }

        // Platform admin login — change the password after first sign-in.
        User::updateOrCreate(['email' => 'admin@openexchange.ai'], [
            'name' => 'Platform Admin',
            'password' => Hash::make('password'),
            'email_verified_at' => now(),
            'client_id' => null,
            'role' => 'admin',
        ]);
    }
}
