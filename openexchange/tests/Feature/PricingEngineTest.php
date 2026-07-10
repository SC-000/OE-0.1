<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\ClientModelRate;
use App\Models\ModelCatalog;
use App\Models\User;
use App\Services\Metering\RateResolver;
use App\Services\Metering\ResolvedRate;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PricingEngineTest extends TestCase
{
    use RefreshDatabase;

    private function client(array $attrs = []): Client
    {
        return Client::create(array_merge(['name' => 'X', 'slug' => 'x-'.uniqid(), 'default_markup_bps' => 2500], $attrs));
    }

    public function test_markup_mode_marks_up_the_provider_cost(): void
    {
        $rate = new ResolvedRate(mode: 'markup', markupBps: 2500);

        // 1000c cost + 25% = 1250c
        $this->assertSame(1250, $rate->billedCents(1000, 1_000_000, 500_000));
    }

    public function test_fixed_mode_ignores_provider_cost_and_bills_the_sell_price(): void
    {
        // $3/1M in, $12/1M out. 2M in + 1M out = $6 + $12 = $18 = 1800c.
        $rate = new ResolvedRate(mode: 'fixed', inputUsdPerMillion: 3.0, outputUsdPerMillion: 12.0);

        $this->assertSame(1800, $rate->billedCents(99999, 2_000_000, 1_000_000));
    }

    public function test_per_request_fee_is_added_once_per_request(): void
    {
        $rate = new ResolvedRate(mode: 'markup', markupBps: 0, perRequestFeeCents: 5);

        $this->assertSame(105, $rate->billedCents(100, 0, 0, requests: 1));
        // Pulled usage aggregates unknown request counts, so it passes 0 and pays no fee.
        $this->assertSame(100, $rate->billedCents(100, 0, 0, requests: 0));
    }

    public function test_min_margin_floor_prevents_billing_below_cost(): void
    {
        // Sell price says 100c, but cost is 200c and the floor demands +10% => 220c.
        $rate = new ResolvedRate(mode: 'fixed', inputUsdPerMillion: 1.0, outputUsdPerMillion: 0.0, minMarginBps: 1000);

        $this->assertSame(220, $rate->billedCents(200, 1_000_000, 0));
    }

    public function test_min_margin_floor_is_inert_when_there_is_no_cost_basis(): void
    {
        $rate = new ResolvedRate(mode: 'fixed', inputUsdPerMillion: 1.0, outputUsdPerMillion: 0.0, minMarginBps: 5000);

        $this->assertSame(100, $rate->billedCents(0, 1_000_000, 0));
    }

    public function test_effective_markup_is_undefined_without_a_cost_basis(): void
    {
        $this->assertNull(ResolvedRate::effectiveMarkupBps(0, 500));
        $this->assertSame(2500, ResolvedRate::effectiveMarkupBps(1000, 1250));
    }

    public function test_resolver_falls_back_to_the_client_default(): void
    {
        $client = $this->client(['default_markup_bps' => 4000]);
        $rate = app(RateResolver::class)->resolve($client, 'openai', 'gpt-x');

        $this->assertSame('markup', $rate->mode);
        $this->assertSame(4000, $rate->markupBps);
        $this->assertSame('client_default', $rate->origin);
    }

    public function test_most_specific_rate_wins(): void
    {
        $client = $this->client(['default_markup_bps' => 1000]);

        ClientModelRate::create(['client_id' => null, 'provider' => null, 'model' => null, 'pricing_mode' => 'markup', 'markup_bps' => 2000]);
        ClientModelRate::create(['client_id' => null, 'provider' => 'openai', 'model' => null, 'pricing_mode' => 'markup', 'markup_bps' => 3000]);
        ClientModelRate::create(['client_id' => $client->id, 'provider' => 'openai', 'model' => 'gpt-x', 'pricing_mode' => 'markup', 'markup_bps' => 9000]);

        $resolver = app(RateResolver::class);

        $this->assertSame(9000, $resolver->resolve($client, 'openai', 'gpt-x')->markupBps, 'client+model beats everything');
        $this->assertSame(3000, $resolver->resolve($client, 'openai', 'other')->markupBps, 'global+provider beats global');
        $this->assertSame(2000, $resolver->resolve($client, 'google', 'gemini')->markupBps, 'global default row beats client default');
    }

    public function test_the_rate_preview_endpoint_prices_a_hypothetical_request(): void
    {
        $client = $this->client(['default_markup_bps' => 5000]);
        ModelCatalog::create(['provider' => 'openai', 'model' => 'gpt-x', 'input_usd_per_million' => 2.0, 'output_usd_per_million' => 8.0]);
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->postJson('/admin/rates/preview', [
            'client_id' => $client->id, 'provider' => 'openai', 'model' => 'gpt-x',
            'input_tokens' => 1_000_000, 'output_tokens' => 1_000_000,
        ])->assertOk()->assertJson([
            'provider_cost_cents' => 1000,   // $2 + $8
            'billed_cents' => 1500,          // +50%
            'margin_cents' => 500,
            'effective_markup_bps' => 5000,
            'priced' => true,
        ]);
    }

    public function test_resolver_returns_a_fixed_price_row(): void
    {
        $client = $this->client();
        ClientModelRate::create([
            'client_id' => $client->id, 'provider' => 'openai', 'model' => 'gpt-x',
            'pricing_mode' => 'fixed', 'input_usd_per_million' => 5, 'output_usd_per_million' => 20,
        ]);

        $rate = app(RateResolver::class)->resolve($client, 'openai', 'gpt-x');

        $this->assertSame('fixed', $rate->mode);
        $this->assertSame(2500, $rate->billedCents(1, 1_000_000, 1_000_000)); // $5 + $20 = 2500c
        $this->assertSame('client_model', $rate->origin);
        // markupBps() must not lie about a fixed row.
        $this->assertSame(0, app(RateResolver::class)->markupBps($client, 'openai', 'gpt-x'));
    }
}
