<?php

namespace Tests\Feature;

use App\Models\ModelCatalog;
use App\Models\ModelPriceProposal;
use App\Models\User;
use App\Services\Pricing\ModelSyncService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class PricingFeedTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Cache::forget('oe.pricing.quotes');
    }

    /** OpenRouter quotes prices per single token, as strings. */
    private function fakeFeed(array $models): void
    {
        Http::fake([
            'openrouter.ai/*' => Http::response(['data' => $models]),
            '*' => Http::response([], 404), // provider discovery returns nothing
        ]);
    }

    private function model(string $id, float $in, float $out): array
    {
        return ['id' => $id, 'pricing' => ['prompt' => (string) ($in / 1e6), 'completion' => (string) ($out / 1e6)]];
    }

    public function test_a_new_model_is_auto_priced_so_it_never_bills_at_zero(): void
    {
        $this->fakeFeed([$this->model('openai/gpt-x', 2.5, 10.0)]);

        // Metering auto-creates unpriced rows when it sees an unknown model in usage.
        ModelCatalog::create(['provider' => 'openai', 'model' => 'gpt-x', 'input_usd_per_million' => 0, 'output_usd_per_million' => 0]);

        $stats = app(ModelSyncService::class)->sync();

        $model = ModelCatalog::where('model', 'gpt-x')->first();
        $this->assertSame(1, $stats['priced']);
        $this->assertSame(0, $stats['proposed']);
        $this->assertEquals(2.5, (float) $model->input_usd_per_million);
        $this->assertEquals(10.0, (float) $model->output_usd_per_million);
        $this->assertSame('openrouter', $model->price_source);
        $this->assertSame('standard', $model->tier);
    }

    public function test_a_price_change_on_a_priced_model_is_queued_not_applied(): void
    {
        $this->fakeFeed([$this->model('google/gemini-2.5-pro', 1.25, 10.0)]);

        ModelCatalog::create(['provider' => 'google', 'model' => 'gemini-2.5-pro', 'input_usd_per_million' => 1.25, 'output_usd_per_million' => 5.0]);

        $stats = app(ModelSyncService::class)->sync();

        $this->assertSame(1, $stats['proposed']);
        $this->assertSame(0, $stats['priced']);

        // Billing is untouched until a human accepts.
        $model = ModelCatalog::where('model', 'gemini-2.5-pro')->first();
        $this->assertEquals(5.0, (float) $model->output_usd_per_million);

        $proposal = ModelPriceProposal::where('status', 'pending')->firstOrFail();
        $this->assertEquals(10.0, (float) $proposal->proposed_output_usd_per_million);
        $this->assertSame(80.0, $proposal->deltaPct()); // 6.25 -> 11.25 blended
    }

    public function test_accepting_a_proposal_moves_the_cost_basis(): void
    {
        $this->fakeFeed([$this->model('google/gemini-2.5-pro', 1.25, 10.0)]);
        ModelCatalog::create(['provider' => 'google', 'model' => 'gemini-2.5-pro', 'input_usd_per_million' => 1.25, 'output_usd_per_million' => 5.0]);
        app(ModelSyncService::class)->sync();

        $admin = User::factory()->create(['role' => 'admin']);
        $proposal = ModelPriceProposal::where('status', 'pending')->firstOrFail();

        $this->actingAs($admin)->post("/admin/proposals/{$proposal->id}/accept")->assertRedirect();

        $this->assertEquals(10.0, (float) ModelCatalog::where('model', 'gemini-2.5-pro')->value('output_usd_per_million'));
        $this->assertSame('accepted', $proposal->fresh()->status);
        $this->assertDatabaseHas('audit_logs', ['action' => 'price.accept']);
    }

    public function test_a_rejected_price_is_not_proposed_again(): void
    {
        $this->fakeFeed([$this->model('openai/gpt-x', 1.0, 2.0)]);
        ModelCatalog::create(['provider' => 'openai', 'model' => 'gpt-x', 'input_usd_per_million' => 1.0, 'output_usd_per_million' => 9.0]);

        $sync = app(ModelSyncService::class);
        $sync->sync();
        $sync->rejectProposal(ModelPriceProposal::where('status', 'pending')->firstOrFail());

        Cache::forget('oe.pricing.quotes');
        $stats = $sync->sync();

        $this->assertSame(0, $stats['proposed'], 'the admin already said no to this exact price');
        $this->assertSame(0, ModelPriceProposal::where('status', 'pending')->count());
    }

    public function test_a_manual_price_is_never_overwritten_but_drift_is_recorded(): void
    {
        $this->fakeFeed([$this->model('openai/gpt-x', 2.0, 8.0)]);
        ModelCatalog::create([
            'provider' => 'openai', 'model' => 'gpt-x',
            'input_usd_per_million' => 3.0, 'output_usd_per_million' => 12.0, 'price_source' => 'manual',
        ]);

        app(ModelSyncService::class)->sync();

        $model = ModelCatalog::where('model', 'gpt-x')->first();
        $this->assertEquals(3.0, (float) $model->input_usd_per_million, 'admin price stands');
        $this->assertSame('manual', $model->price_source);
        $this->assertEquals(2.0, (float) $model->feed_input_usd_per_million, 'but we record what the feed says');
        $this->assertNotNull($model->feed_synced_at);
    }

    /**
     * The feed spells versions with dots (`claude-opus-4.8`); the providers' own API ids
     * use dashes (`claude-opus-4-8`), and the catalogue holds the API id. Without
     * normalisation every Claude model ships unpriced and bills $0.
     */
    public function test_a_dotted_feed_id_prices_the_dashed_api_id(): void
    {
        $this->fakeFeed([$this->model('anthropic/claude-opus-4.8', 5.0, 25.0)]);
        ModelCatalog::create(['provider' => 'anthropic', 'model' => 'claude-opus-4-8', 'input_usd_per_million' => 0, 'output_usd_per_million' => 0]);

        $stats = app(ModelSyncService::class)->sync();

        $this->assertSame(1, $stats['priced']);
        $model = ModelCatalog::where('model', 'claude-opus-4-8')->first();
        $this->assertEquals(5.0, (float) $model->input_usd_per_million);
        $this->assertEquals(25.0, (float) $model->output_usd_per_million);
        $this->assertSame('anthropic/claude-opus-4.8', $model->feed_ref);
    }

    /**
     * An EXACT feed id must always beat another model's normalised alias, whichever order
     * they arrive in — otherwise `gpt-5.4`'s alias could claim the price of a real,
     * different `gpt-5-4`.
     */
    public function test_an_exact_id_beats_another_models_normalised_alias(): void
    {
        // Dotted model first: its `gpt-5-4` alias must NOT shadow the real `gpt-5-4`.
        $this->fakeFeed([
            $this->model('openai/gpt-5.4', 2.0, 8.0),
            $this->model('openai/gpt-5-4', 99.0, 99.0),
        ]);
        ModelCatalog::create(['provider' => 'openai', 'model' => 'gpt-5.4', 'input_usd_per_million' => 0, 'output_usd_per_million' => 0]);
        ModelCatalog::create(['provider' => 'openai', 'model' => 'gpt-5-4', 'input_usd_per_million' => 0, 'output_usd_per_million' => 0]);

        app(ModelSyncService::class)->sync();

        $this->assertEquals(2.0, (float) ModelCatalog::where('model', 'gpt-5.4')->value('input_usd_per_million'));
        $this->assertEquals(99.0, (float) ModelCatalog::where('model', 'gpt-5-4')->value('input_usd_per_million'), 'the real gpt-5-4 keeps its own price');
    }

    public function test_a_dated_snapshot_inherits_the_base_model_price(): void
    {
        $this->fakeFeed([$this->model('openai/gpt-x', 2.5, 10.0)]);
        ModelCatalog::create(['provider' => 'openai', 'model' => 'gpt-x-2026-03-05', 'input_usd_per_million' => 0, 'output_usd_per_million' => 0]);

        app(ModelSyncService::class)->sync();

        $this->assertEquals(2.5, (float) ModelCatalog::where('model', 'gpt-x-2026-03-05')->value('input_usd_per_million'));
    }

    public function test_a_variable_price_is_treated_as_unknown_not_free(): void
    {
        Http::fake([
            'openrouter.ai/*' => Http::response(['data' => [
                ['id' => 'openai/gpt-var', 'pricing' => ['prompt' => '-1', 'completion' => '-1']],
            ]]),
            '*' => Http::response([], 404),
        ]);
        ModelCatalog::create(['provider' => 'openai', 'model' => 'gpt-var', 'input_usd_per_million' => 0, 'output_usd_per_million' => 0]);

        $stats = app(ModelSyncService::class)->sync();

        $this->assertSame(0, $stats['priced'], 'a -1 price must not be read as $0');
        $this->assertEquals(0.0, (float) ModelCatalog::where('model', 'gpt-var')->value('input_usd_per_million'));
    }

    /** `:free` is an OpenRouter serving variant, and $0 there means free — not "needs pricing". */
    public function test_import_feed_skips_serving_variants_and_models_we_do_not_serve(): void
    {
        $this->fakeFeed([
            $this->model('openai/gpt-oss-120b:free', 0.0, 0.0),
            $this->model('openai/gpt-oss-20b', 0.0, 0.0),
            $this->model('openai/gpt-4o', 2.5, 10.0),
        ]);

        app(ModelSyncService::class)->sync(importFeed: true);

        $this->assertSame(['gpt-4o'], ModelCatalog::pluck('model')->all());
    }

    public function test_a_feed_outage_does_not_break_the_sync(): void
    {
        Http::fake(['*' => Http::response('gateway timeout', 504)]);

        $stats = app(ModelSyncService::class)->sync();

        $this->assertNotEmpty($stats['errors']);
        $this->assertSame(0, $stats['proposed']);
    }
}
