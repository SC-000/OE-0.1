<?php

namespace Database\Seeders;

use App\Models\AccessKey;
use App\Models\BalanceLedgerEntry;
use App\Models\Client;
use App\Models\ModelCatalog;
use App\Models\PaymentMethod;
use App\Models\ProviderBackend;
use App\Models\ProviderKey;
use App\Models\TopUp;
use App\Models\UsageRecord;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Provider cost catalogue ($/1M tokens).
        $catalog = [
            ['openai', 'gpt-5.5', 5.00, 30.00],
            ['openai', 'gpt-5.4', 2.50, 15.00],
            ['openai', 'gpt-5.4-mini', 0.75, 4.50],
            ['openai', 'gpt-5.4-nano', 0.20, 1.25],
            ['anthropic', 'claude-fable-5', 10.00, 50.00],
            ['anthropic', 'claude-opus-4-8', 5.00, 25.00],
            ['anthropic', 'claude-sonnet-5', 3.00, 15.00],
            ['anthropic', 'claude-haiku-4-5', 1.00, 5.00],
            ['google', 'gemini-3.1-pro-preview', 2.00, 12.00],
            ['google', 'gemini-3.5-flash', 1.50, 9.00],
            ['google', 'gemini-3.1-flash-lite', 0.25, 1.50],
            ['google', 'gemini-2.5-flash', 0.30, 2.50],
            ['google', 'gemini-2.5-flash-lite', 0.10, 0.40],
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

        // Primary demo client + users.
        $acme = Client::updateOrCreate(['slug' => 'acme-inc'], [
            'name' => 'Acme Inc', 'status' => 'active', 'balance_cents' => 4250,
            'min_balance_cents' => 1000, 'topup_amount_cents' => 5000, 'auto_topup' => true,
            'default_markup_bps' => 2500,
        ]);

        User::updateOrCreate(['email' => 'demo@openexchange.ai'], [
            'name' => 'Ada Reyes', 'password' => Hash::make('password'),
            'email_verified_at' => now(), 'client_id' => $acme->id, 'role' => 'owner',
        ]);
        User::updateOrCreate(['email' => 'admin@openexchange.ai'], [
            'name' => 'Platform Admin', 'password' => Hash::make('password'),
            'email_verified_at' => now(), 'client_id' => null, 'role' => 'admin',
        ]);

        // Other clients for the admin view.
        $northwind = Client::updateOrCreate(['slug' => 'northwind'], [
            'name' => 'Northwind', 'balance_cents' => 120400, 'default_markup_bps' => 3000, 'min_balance_cents' => 5000, 'topup_amount_cents' => 25000,
        ]);
        $globex = Client::updateOrCreate(['slug' => 'globex'], [
            'name' => 'Globex', 'balance_cents' => 310, 'default_markup_bps' => 4000,
        ]);

        // Provider keys (one project per client).
        ProviderKey::updateOrCreate(['client_id' => $acme->id, 'provider' => 'openai', 'label' => 'production'], [
            'secret' => 'sk-demo-acme', 'external_project_id' => 'proj_acme', 'external_key_id' => 'a21e', 'status' => 'active', 'last_synced_at' => now()->subMinutes(2),
        ]);
        ProviderKey::updateOrCreate(['client_id' => $acme->id, 'provider' => 'google', 'label' => 'gemini'], [
            'secret' => 'goog-demo-acme', 'external_project_id' => 'gcp-acme', 'external_key_id' => '9f0b', 'status' => 'active', 'last_synced_at' => now()->subMinutes(5),
        ]);
        ProviderKey::updateOrCreate(['client_id' => $northwind->id, 'provider' => 'openai', 'label' => 'production'], [
            'secret' => 'sk-demo-nw', 'external_project_id' => 'proj_nw', 'external_key_id' => '7c15', 'status' => 'active', 'last_synced_at' => now()->subMinute(),
        ]);

        // Sample metered usage + matching ledger for Acme (idempotent-ish: only if empty).
        if ($acme->usageRecords()->count() === 0) {
            $key = $acme->providerKeys()->where('provider', 'openai')->first();
            $rows = [
                ['gpt-5.4', 412_000, 138_000, 1],
                ['claude-sonnet-5', 286_000, 96_000, 2],
                ['gemini-2.5-flash', 640_000, 210_000, 3],
                ['llama-4-maverick', 198_000, 71_000, 4],
                ['deepseek-v4-pro', 92_000, 34_000, 5],
            ];
            foreach ($rows as [$model, $in, $out, $daysAgo]) {
                $start = Carbon::today()->subDays($daysAgo);
                $rec = UsageRecord::create([
                    'client_id' => $acme->id, 'provider_key_id' => $key->id, 'provider' => 'openai',
                    'model' => $model, 'period_start' => $start, 'period_end' => $start->copy()->addDay(),
                    'input_tokens' => $in, 'output_tokens' => $out,
                    'provider_cost_cents' => rand(300, 900), 'billed_cents' => rand(500, 1200), 'source' => 'seed',
                ]);
                BalanceLedgerEntry::create([
                    'client_id' => $acme->id, 'type' => 'usage_debit', 'amount_cents' => -$rec->billed_cents,
                    'balance_after_cents' => $acme->balance_cents, 'description' => "openai/{$model} usage", 'reference' => "usage:{$rec->id}",
                ]);
            }
            foreach ([['Jul 7, 2026', 5], ['Jul 5, 2026', 12]] as [$d, $daysAgo]) {
                $t = TopUp::create(['client_id' => $acme->id, 'amount_cents' => 5000, 'status' => 'succeeded', 'trigger' => 'auto', 'billings_invoice_id' => 'inv_'.uniqid()]);
                BalanceLedgerEntry::create(['client_id' => $acme->id, 'type' => 'topup_credit', 'amount_cents' => 5000, 'balance_after_cents' => $acme->balance_cents, 'description' => 'Auto top-up', 'reference' => "topup:{$t->id}"]);
            }
            PaymentMethod::create(['client_id' => $acme->id, 'billings_pm_id' => 'pm_demo', 'brand' => 'visa', 'last4' => '4242', 'exp_month' => 8, 'exp_year' => 28, 'is_default' => true]);
        }

        // Gateway: upstream backends (what the gateway calls with) + a demo access key.
        ProviderBackend::updateOrCreate(['provider' => 'openai', 'backend' => 'openai', 'label' => 'openai-prod'], ['secret' => env('OPENAI_API_KEY', 'sk-demo'), 'status' => 'active']);
        ProviderBackend::updateOrCreate(['provider' => 'google', 'backend' => 'aistudio', 'label' => 'gemini-prod'], ['secret' => env('GEMINI_API_KEY', 'AIza-demo'), 'status' => 'active']);

        if (! AccessKey::where('client_id', $acme->id)->exists()) {
            $demoSecret = 'oxk_live_demo00000000000000000000000000000000';
            $ak = AccessKey::create(['client_id' => $acme->id, 'name' => 'Production app', 'prefix' => substr($demoSecret, 0, 16), 'key_hash' => hash('sha256', $demoSecret), 'status' => 'active', 'last_used_at' => now()->subMinutes(3)]);
            foreach ([['gemini-2.5-flash', 'google', 420_000, 140_000], ['gpt-5.4', 'openai', 180_000, 60_000]] as [$m, $p, $in, $out]) {
                UsageRecord::create(['client_id' => $acme->id, 'access_key_id' => $ak->id, 'provider' => $p, 'model' => $m, 'period_start' => now()->subDay(), 'period_end' => now(), 'input_tokens' => $in, 'output_tokens' => $out, 'provider_cost_cents' => rand(50, 300), 'billed_cents' => rand(80, 400), 'source' => 'gateway', 'request_id' => (string) Str::uuid()]);
            }
        }
    }
}
