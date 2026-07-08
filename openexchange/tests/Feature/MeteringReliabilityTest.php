<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\ModelCatalog;
use App\Models\UsageRecord;
use App\Services\Metering\MeteringService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class MeteringReliabilityTest extends TestCase
{
    use RefreshDatabase;

    public function test_rebill_prices_dated_snapshots_and_debits_the_client(): void
    {
        $client = Client::create(['name' => 'X', 'slug' => 'x', 'balance_cents' => 100000, 'default_markup_bps' => 0]);
        ModelCatalog::create(['provider' => 'openai', 'model' => 'gpt-x', 'input_usd_per_million' => 1.0, 'output_usd_per_million' => 2.0]);

        // A dated snapshot that metered at $0 (model was unpriced at pull time).
        UsageRecord::create([
            'client_id' => $client->id, 'provider' => 'openai', 'model' => 'gpt-x-2026-01-01',
            'period_start' => now(), 'period_end' => now(), 'input_tokens' => 1_000_000, 'output_tokens' => 1_000_000,
            'provider_cost_cents' => 0, 'billed_cents' => 0, 'source' => 'pull', 'request_id' => (string) Str::uuid(),
        ]);

        $result = app(MeteringService::class)->rebill($client->id);

        // cost = $1 in + $2 out = $3 = 300c; markup 0 → billed 300.
        $this->assertSame(1, $result['rebilled']);
        $this->assertDatabaseHas('usage_records', ['client_id' => $client->id, 'model' => 'gpt-x-2026-01-01', 'billed_cents' => 300]);
        $this->assertSame(100000 - 300, $client->fresh()->balance_cents);

        // Idempotent — a second run charges nothing more.
        app(MeteringService::class)->rebill($client->id);
        $this->assertSame(100000 - 300, $client->fresh()->balance_cents);
    }
}
