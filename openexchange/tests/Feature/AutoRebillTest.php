<?php

namespace Tests\Feature;

use App\Models\AccessKey;
use App\Models\Client;
use App\Models\ClientModelRate;
use App\Models\ModelCatalog;
use App\Models\ModelPriceProposal;
use App\Models\ProviderBackend;
use App\Models\UsageRecord;
use App\Models\User;
use App\Services\Metering\MeteringService;
use App\Services\Pricing\ModelSyncService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

/**
 * The invariant: usage must never stay billed at $0 once its model has a price.
 * Every path that sets a price settles the outstanding usage automatically.
 */
class AutoRebillTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Cache::forget('oe.pricing.quotes');
    }

    private function client(int $balance = 100_000, int $markupBps = 2500): Client
    {
        return Client::create([
            'name' => 'Acme', 'slug' => 'acme-'.uniqid(), 'balance_cents' => $balance,
            'default_markup_bps' => $markupBps, 'auto_topup' => false,
        ]);
    }

    /** A usage record that metered with NO cost basis. */
    private function unpricedUsage(Client $c, string $model, int $billed = 0, string $source = 'gateway', string $provider = 'openai'): UsageRecord
    {
        return UsageRecord::create([
            'client_id' => $c->id, 'provider' => $provider, 'model' => $model,
            'period_start' => now(), 'period_end' => now(),
            'input_tokens' => 1_000_000, 'output_tokens' => 1_000_000,
            'provider_cost_cents' => 0, 'billed_cents' => $billed, 'source' => $source,
            'request_id' => uniqid(),
        ]);
    }

    /** The shape PricingResolver caches quotes in. */
    private function cacheQuote(string $provider, string $model, float $in, float $out): void
    {
        $existing = Cache::get('oe.pricing.quotes', []);
        $existing[$provider.'|'.$model] = [$provider, $model, $in, $out, 0.0, 'openrouter', "{$provider}/{$model}"];
        Cache::put('oe.pricing.quotes', $existing, now()->addHour());
    }

    /* ------------------------------ the gateway hole ------------------------------ */

    public function test_the_gateway_registers_a_model_it_has_never_seen(): void
    {
        Http::fake(['generativelanguage.googleapis.com/*' => Http::response([
            'candidates' => [['content' => ['parts' => [['text' => 'hi']]]]],
            'usageMetadata' => ['promptTokenCount' => 1_000_000, 'candidatesTokenCount' => 1_000_000],
        ])]);
        ProviderBackend::create(['provider' => 'google', 'backend' => 'aistudio', 'label' => 'g', 'secret' => 'k', 'status' => 'active']);
        $client = $this->client();
        [, $plain] = AccessKey::generate($client, 'prod');

        $this->withToken($plain)->postJson('/v1/chat', ['model' => 'gemini-brand-new', 'messages' => [['role' => 'user', 'content' => 'hi']]])->assertOk();

        // It used to bill $0 AND never appear in the catalogue — invisible revenue loss.
        $this->assertDatabaseHas('model_catalog', ['provider' => 'google', 'model' => 'gemini-brand-new', 'price_source' => 'discovered']);
        $this->assertSame(1, app(MeteringService::class)->pendingRebillCount('google', 'gemini-brand-new'));
    }

    public function test_the_gateway_prices_a_new_model_immediately_from_the_cached_feed(): void
    {
        $this->cacheQuote('google', 'gemini-brand-new', 1.0, 3.0);
        Http::fake(['generativelanguage.googleapis.com/*' => Http::response([
            'candidates' => [['content' => ['parts' => [['text' => 'hi']]]]],
            'usageMetadata' => ['promptTokenCount' => 1_000_000, 'candidatesTokenCount' => 1_000_000],
        ])]);
        ProviderBackend::create(['provider' => 'google', 'backend' => 'aistudio', 'label' => 'g', 'secret' => 'k', 'status' => 'active']);
        $client = $this->client();
        [, $plain] = AccessKey::generate($client, 'prod');

        // cost $1 + $3 = 400c, +25% = 500c. Billed right the FIRST time, no rebill needed.
        $this->withToken($plain)->postJson('/v1/chat', ['model' => 'gemini-brand-new', 'messages' => [['role' => 'user', 'content' => 'hi']]])
            ->assertOk()->assertJsonPath('usage.billed_cents', 500);

        $this->assertSame(0, app(MeteringService::class)->pendingRebillCount());
        $this->assertSame(100_000 - 500, $client->fresh()->balance_cents);
    }

    /** The feed must never sit in front of an inference request. */
    public function test_a_cold_feed_cache_does_not_trigger_an_http_call_on_the_gateway_path(): void
    {
        Http::fake([
            'generativelanguage.googleapis.com/*' => Http::response(['candidates' => [['content' => ['parts' => [['text' => 'hi']]]]], 'usageMetadata' => ['promptTokenCount' => 10, 'candidatesTokenCount' => 10]]),
            'openrouter.ai/*' => Http::response([], 500),
        ]);
        ProviderBackend::create(['provider' => 'google', 'backend' => 'aistudio', 'label' => 'g', 'secret' => 'k', 'status' => 'active']);
        [, $plain] = AccessKey::generate($this->client(), 'prod');

        $this->withToken($plain)->postJson('/v1/chat', ['model' => 'gemini-cold', 'messages' => [['role' => 'user', 'content' => 'hi']]])->assertOk();

        Http::assertNotSent(fn ($req) => str_contains($req->url(), 'openrouter.ai'));
    }

    /* ------------------------------ the rebill hole ------------------------------- */

    public function test_rebill_settles_a_record_that_already_billed_a_per_request_fee(): void
    {
        $client = $this->client(markupBps: 0);
        ClientModelRate::create([
            'client_id' => $client->id, 'provider' => 'openai', 'model' => 'gpt-x',
            'pricing_mode' => 'markup', 'markup_bps' => 0, 'per_request_fee_cents' => 5,
        ]);
        // Metered with no cost basis, but the fee still billed 5c — the old rebill()
        // required billed_cents == 0, so this record stayed under-billed forever.
        $rec = $this->unpricedUsage($client, 'gpt-x', billed: 5);
        ModelCatalog::create(['provider' => 'openai', 'model' => 'gpt-x', 'input_usd_per_million' => 1.0, 'output_usd_per_million' => 1.0]);

        $stats = app(MeteringService::class)->rebill();

        // cost = $2 = 200c; billed = 200 * 1.0 + 5 fee = 205c; delta = 200c.
        $this->assertSame(1, $stats['rebilled']);
        $this->assertSame(200, $stats['billed_cents']);
        $rec->refresh();
        $this->assertEqualsWithDelta(200, (float) $rec->provider_cost_cents, 1e-6);
        $this->assertSame(205, $rec->billed_cents);
        $this->assertSame(100_000 - 200, $client->fresh()->balance_cents);
    }

    public function test_rebill_credits_the_client_when_the_new_amount_is_lower(): void
    {
        $client = $this->client(markupBps: 2500);
        // Metered under a fixed sell price that billed 1000c with no cost basis…
        $rec = $this->unpricedUsage($client, 'gpt-x', billed: 1_000);
        ModelCatalog::create(['provider' => 'openai', 'model' => 'gpt-x', 'input_usd_per_million' => 0.5, 'output_usd_per_million' => 0.5]);
        // …and the rate card has since moved to the client's 25% markup.
        $stats = app(MeteringService::class)->rebill();

        // cost = $1 = 100c; billed = 125c; delta = -875c => refund.
        $this->assertSame(1, $stats['rebilled']);
        $this->assertSame(-875, $stats['billed_cents']);
        $this->assertSame(1, $stats['credited']);
        $this->assertSame(125, $rec->fresh()->billed_cents);
        $this->assertSame(100_000 + 875, $client->fresh()->balance_cents);
    }

    public function test_rebill_is_idempotent(): void
    {
        $client = $this->client();
        $this->unpricedUsage($client, 'gpt-x');
        ModelCatalog::create(['provider' => 'openai', 'model' => 'gpt-x', 'input_usd_per_million' => 1.0, 'output_usd_per_million' => 1.0]);

        app(MeteringService::class)->rebill();
        $after = $client->fresh()->balance_cents;
        $second = app(MeteringService::class)->rebill();

        $this->assertSame(0, $second['rebilled']);
        $this->assertSame($after, $client->fresh()->balance_cents);
    }

    public function test_rebilling_one_model_does_not_sweep_up_a_similarly_named_one(): void
    {
        $client = $this->client();
        $mini = $this->unpricedUsage($client, 'gpt-4o-mini');
        $dated = $this->unpricedUsage($client, 'gpt-4o-2026-03-05');
        ModelCatalog::create(['provider' => 'openai', 'model' => 'gpt-4o', 'input_usd_per_million' => 2.5, 'output_usd_per_million' => 10.0]);
        ModelCatalog::create(['provider' => 'openai', 'model' => 'gpt-4o-mini', 'input_usd_per_million' => 0.15, 'output_usd_per_million' => 0.60]);

        $stats = app(MeteringService::class)->rebill(null, 'openai', 'gpt-4o');

        // Only the dated snapshot of gpt-4o. gpt-4o-mini is its own model.
        $this->assertSame(1, $stats['rebilled']);
        $this->assertEqualsWithDelta(0, (float) $mini->fresh()->provider_cost_cents, 1e-6, 'gpt-4o-mini is untouched');
        $this->assertEqualsWithDelta(1250, (float) $dated->fresh()->provider_cost_cents, 1e-6);
    }

    public function test_rebill_skips_records_whose_model_is_still_unpriced(): void
    {
        $client = $this->client();
        $this->unpricedUsage($client, 'gpt-x');
        ModelCatalog::create(['provider' => 'openai', 'model' => 'gpt-x', 'input_usd_per_million' => 0, 'output_usd_per_million' => 0]);

        $stats = app(MeteringService::class)->rebill();

        $this->assertSame(0, $stats['rebilled']);
        $this->assertSame(1, app(MeteringService::class)->pendingRebillCount());
    }

    /* --------------------------- auto-rebill on every price path -------------------- */

    public function test_setting_a_price_by_hand_auto_rebills(): void
    {
        $client = $this->client();
        $this->unpricedUsage($client, 'gpt-x');
        $model = ModelCatalog::create(['provider' => 'openai', 'model' => 'gpt-x', 'input_usd_per_million' => 0, 'output_usd_per_million' => 0]);
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->patch("/admin/models/{$model->id}", ['input' => 1.0, 'output' => 1.0, 'active' => true])
            ->assertSessionHas('flash');

        // cost 200c, +25% = 250c — billed without anyone clicking anything.
        $this->assertSame(100_000 - 250, $client->fresh()->balance_cents);
        $this->assertDatabaseHas('audit_logs', ['action' => 'metering.rebill']);
    }

    public function test_adding_a_model_with_a_price_auto_rebills_its_orphaned_usage(): void
    {
        $client = $this->client();
        $this->unpricedUsage($client, 'gpt-ghost'); // usage arrived before the model existed
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->post('/admin/models', ['provider' => 'openai', 'model' => 'gpt-ghost', 'input' => 1.0, 'output' => 1.0]);

        $this->assertSame(100_000 - 250, $client->fresh()->balance_cents);
    }

    public function test_accepting_a_price_proposal_auto_rebills(): void
    {
        $client = $this->client();
        $this->unpricedUsage($client, 'gpt-x');
        $model = ModelCatalog::create(['provider' => 'openai', 'model' => 'gpt-x', 'input_usd_per_million' => 0, 'output_usd_per_million' => 0]);
        $proposal = ModelPriceProposal::create([
            'model_catalog_id' => $model->id,
            'current_input_usd_per_million' => 0, 'current_output_usd_per_million' => 0,
            'proposed_input_usd_per_million' => 1.0, 'proposed_output_usd_per_million' => 1.0,
            'source' => 'openrouter', 'status' => 'pending',
        ]);
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->post("/admin/proposals/{$proposal->id}/accept");

        $this->assertSame(100_000 - 250, $client->fresh()->balance_cents);
    }

    public function test_the_daily_sync_auto_prices_and_settles_in_one_pass(): void
    {
        Http::fake([
            'openrouter.ai/*' => Http::response(['data' => [
                ['id' => 'openai/gpt-x', 'pricing' => ['prompt' => '0.000001', 'completion' => '0.000001']],
            ]]),
            '*' => Http::response([], 404),
        ]);
        $client = $this->client();
        $this->unpricedUsage($client, 'gpt-x');
        ModelCatalog::create(['provider' => 'openai', 'model' => 'gpt-x', 'input_usd_per_million' => 0, 'output_usd_per_million' => 0]);

        $stats = app(ModelSyncService::class)->sync();

        $this->assertSame(1, $stats['priced']);
        $this->assertSame(1, $stats['rebilled']);
        $this->assertSame(250, $stats['rebilled_cents']);
        $this->assertSame(100_000 - 250, $client->fresh()->balance_cents);
    }

    /* --------------------------------- manual controls ----------------------------- */

    public function test_the_per_model_rebill_button_settles_that_model(): void
    {
        $client = $this->client();
        $this->unpricedUsage($client, 'gpt-x');
        // Priced directly on the row, bypassing the auto-settle path.
        $model = ModelCatalog::create(['provider' => 'openai', 'model' => 'gpt-x', 'input_usd_per_million' => 1.0, 'output_usd_per_million' => 1.0]);
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->post("/admin/models/{$model->id}/rebill")->assertSessionHas('flash');

        $this->assertSame(100_000 - 250, $client->fresh()->balance_cents);
    }

    public function test_the_per_model_rebill_button_refuses_an_unpriced_model(): void
    {
        $model = ModelCatalog::create(['provider' => 'openai', 'model' => 'gpt-x', 'input_usd_per_million' => 0, 'output_usd_per_million' => 0]);
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->post("/admin/models/{$model->id}/rebill");

        $this->assertSame('error', session('flash')['type']);
    }

    public function test_price_from_feed_button_prices_and_settles(): void
    {
        $this->cacheQuote('openai', 'gpt-x', 1.0, 1.0);
        $client = $this->client();
        $this->unpricedUsage($client, 'gpt-x');
        $model = ModelCatalog::create(['provider' => 'openai', 'model' => 'gpt-x', 'input_usd_per_million' => 0, 'output_usd_per_million' => 0]);
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->post("/admin/models/{$model->id}/price-from-feed");

        $this->assertEquals(1.0, (float) $model->fresh()->input_usd_per_million);
        $this->assertSame(100_000 - 250, $client->fresh()->balance_cents);
    }

    public function test_price_from_feed_reports_when_the_feed_has_no_quote(): void
    {
        $model = ModelCatalog::create(['provider' => 'openai', 'model' => 'gpt-unknown', 'input_usd_per_million' => 0, 'output_usd_per_million' => 0]);
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->post("/admin/models/{$model->id}/price-from-feed");

        $this->assertSame('error', session('flash')['type']);
        $this->assertFalse($model->fresh()->isPriced());
    }

    public function test_the_platform_rebill_button_explains_why_nothing_happened(): void
    {
        $client = $this->client();
        $this->unpricedUsage($client, 'gpt-x'); // model has no price at all
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->post('/admin/platform/rebill');

        $this->assertSame('info', session('flash')['type']);
        $this->assertStringContainsString('unpriced', session('flash')['message']);
    }

    public function test_the_models_page_surfaces_the_unbilled_exposure(): void
    {
        $client = $this->client();
        $this->unpricedUsage($client, 'gpt-x');
        ModelCatalog::create(['provider' => 'openai', 'model' => 'gpt-x', 'input_usd_per_million' => 1.0, 'output_usd_per_million' => 1.0]);
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->get('/admin/models')->assertInertia(fn ($page) => $page
            ->where('exposure.unbilled_records', 1)
            ->where('exposure.ready_to_rebill', 1)
            ->where('exposure.recoverable_cents', 200));
    }
}
