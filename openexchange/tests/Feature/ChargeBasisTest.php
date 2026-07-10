<?php

namespace Tests\Feature;

use App\Models\AccessKey;
use App\Models\Client;
use App\Models\ClientModelRate;
use App\Models\ModelCatalog;
use App\Models\ProviderBackend;
use App\Models\UsageRecord;
use App\Models\User;
use App\Services\Metering\MeteringService;
use App\Services\Metering\RateResolver;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

/**
 * A model carries TWO prices:
 *   real cost       — what the provider charges us. Margin is measured against it.
 *   charge-on price — what markup % is applied on top of.
 * Conflating them is how margin disappears, so every path is pinned here.
 */
class ChargeBasisTest extends TestCase
{
    use RefreshDatabase;

    private function client(int $markupBps = 2500, int $balance = 100_000): Client
    {
        return Client::create([
            'name' => 'Acme', 'slug' => 'acme-'.uniqid(), 'balance_cents' => $balance,
            'default_markup_bps' => $markupBps, 'auto_topup' => false,
        ]);
    }

    /** cost $1+$1 per 1M; charge-on $2+$2 per 1M. */
    private function model(): ModelCatalog
    {
        return ModelCatalog::create([
            'provider' => 'openai', 'model' => 'gpt-x', 'active' => true,
            'input_usd_per_million' => 1.0, 'output_usd_per_million' => 1.0,
            'base_input_usd_per_million' => 2.0, 'base_output_usd_per_million' => 2.0,
        ]);
    }

    public function test_charge_basis_defaults_to_the_real_cost(): void
    {
        $m = ModelCatalog::create(['provider' => 'openai', 'model' => 'gpt-y', 'input_usd_per_million' => 3.0, 'output_usd_per_million' => 5.0]);

        $this->assertFalse($m->hasChargeBasis());
        $this->assertSame(800, $m->costCents(1_000_000, 1_000_000));
        $this->assertSame(800, $m->chargeBasisCents(1_000_000, 1_000_000), 'no charge-on price => bill on cost, as before');
    }

    public function test_markup_applies_to_the_charge_on_price_not_the_real_cost(): void
    {
        $m = $this->model();

        $this->assertSame(200, $m->costCents(1_000_000, 1_000_000), 'real cost: $1 + $1');
        $this->assertSame(400, $m->chargeBasisCents(1_000_000, 1_000_000), 'charge-on: $2 + $2');
        $this->assertSame(10000, $m->basisPaddingBps(), 'charge-on is 100% over cost');
    }

    public function test_the_gateway_bills_on_the_charge_basis_and_records_the_real_cost(): void
    {
        Http::fake(['api.openai.com/*' => Http::response([
            'choices' => [['message' => ['content' => 'hi']]],
            'usage' => ['prompt_tokens' => 1_000_000, 'completion_tokens' => 1_000_000],
        ])]);
        ProviderBackend::create(['provider' => 'openai', 'backend' => 'openai', 'label' => 'p', 'secret' => 'sk', 'status' => 'active']);
        $this->model();
        $client = $this->client();
        [, $plain] = AccessKey::generate($client, 'prod');

        // charge-on 400c x 1.25 = 500c billed. Real cost stays 200c.
        $this->withToken($plain)->postJson('/v1/chat', ['model' => 'gpt-x', 'messages' => [['role' => 'user', 'content' => 'hi']]])
            ->assertOk()->assertJsonPath('usage.billed_cents', 500);

        $this->assertDatabaseHas('usage_records', ['model' => 'gpt-x', 'provider_cost_cents' => 200, 'billed_cents' => 500]);

        // True margin is 300c (60% of revenue), NOT the 25% the markup column implies.
        $rec = UsageRecord::firstOrFail();
        $this->assertEqualsWithDelta(300, $rec->billed_cents - (float) $rec->provider_cost_cents, 1e-6);
        $this->assertSame(100_000 - 500, $client->fresh()->balance_cents);
    }

    public function test_the_margin_floor_protects_the_real_cost_not_the_charge_basis(): void
    {
        $client = $this->client();
        // A fixed sell price of $0.50/1M would bill 100c — below the $2 real cost.
        ModelCatalog::create([
            'provider' => 'openai', 'model' => 'gpt-z', 'active' => true,
            'input_usd_per_million' => 1.0, 'output_usd_per_million' => 1.0,
            'base_input_usd_per_million' => 9.0, 'base_output_usd_per_million' => 9.0,
        ]);
        ClientModelRate::create([
            'client_id' => $client->id, 'provider' => 'openai', 'model' => 'gpt-z',
            'pricing_mode' => 'fixed', 'input_usd_per_million' => 0.5, 'output_usd_per_million' => 0.5,
            'min_margin_bps' => 5000, // never below cost + 50%
        ]);

        $rate = app(RateResolver::class)->resolve($client, 'openai', 'gpt-z');
        // floor = realCost 200c x 1.5 = 300c, beating both the 100c fixed price
        // and any calculation based on the inflated 1800c charge basis.
        $this->assertSame(300, $rate->billedCents(1800, 1_000_000, 1_000_000, 0, 200));
    }

    public function test_admin_can_set_a_charge_on_price_without_touching_the_real_cost(): void
    {
        $m = ModelCatalog::create(['provider' => 'openai', 'model' => 'gpt-x', 'input_usd_per_million' => 1.0, 'output_usd_per_million' => 1.0]);
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->patch("/admin/models/{$m->id}", [
            'input' => 1.0, 'output' => 1.0, 'base_input' => 2.0, 'base_output' => 2.0, 'active' => true,
        ])->assertRedirect();

        $m->refresh();
        $this->assertEquals(1.0, (float) $m->input_usd_per_million, 'real cost untouched');
        $this->assertEquals(2.0, (float) $m->base_input_usd_per_million);
        $this->assertDatabaseHas('audit_logs', ['action' => 'model.charge_basis']);
    }

    public function test_a_charge_on_price_equal_to_the_cost_is_stored_as_null(): void
    {
        $m = $this->model();
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->patch("/admin/models/{$m->id}", [
            'input' => 1.0, 'output' => 1.0, 'base_input' => 1.0, 'base_output' => 1.0, 'active' => true,
        ]);

        $m->refresh();
        $this->assertNull($m->base_input_usd_per_million, '"same as cost" is null, not a duplicated number');
        $this->assertFalse($m->hasChargeBasis());
    }

    /* -------------------------------- re-cost at current rate ------------------------------- */

    private function usage(Client $c, int $billed, int $cost = 200): UsageRecord
    {
        return UsageRecord::create([
            'client_id' => $c->id, 'provider' => 'openai', 'model' => 'gpt-x',
            'period_start' => now(), 'period_end' => now(),
            'input_tokens' => 1_000_000, 'output_tokens' => 1_000_000,
            'provider_cost_cents' => $cost, 'billed_cents' => $billed, 'source' => 'pull',
            'request_id' => uniqid(),
        ]);
    }

    public function test_recost_dry_run_previews_without_writing(): void
    {
        $client = $this->client();
        $this->model();
        $rec = $this->usage($client, billed: 250); // billed on the old cost basis

        $preview = app(MeteringService::class)->recost($client->id, 'openai', 'gpt-x', dryRun: true);

        $this->assertSame(1, $preview['records']);
        $this->assertSame(250, $preview['was_cents']);
        $this->assertSame(500, $preview['now_cents']); // charge-on 400c x 1.25
        $this->assertSame(250, $preview['delta_cents']);
        $this->assertFalse($preview['applied']);

        $this->assertSame(250, $rec->fresh()->billed_cents, 'a preview must not write');
        $this->assertSame(100_000, $client->fresh()->balance_cents);
    }

    public function test_recost_settles_the_difference_and_is_idempotent(): void
    {
        $client = $this->client();
        $this->model();
        $rec = $this->usage($client, billed: 250);

        $first = app(MeteringService::class)->recost($client->id, 'openai', 'gpt-x');
        $this->assertSame(250, $first['delta_cents']);
        $this->assertSame(500, $rec->fresh()->billed_cents);
        $this->assertSame(100_000 - 250, $client->fresh()->balance_cents);

        $second = app(MeteringService::class)->recost($client->id, 'openai', 'gpt-x');
        $this->assertSame(0, $second['delta_cents'], 'running twice must not double-charge');
        $this->assertSame(100_000 - 250, $client->fresh()->balance_cents);
    }

    public function test_recost_refunds_when_the_new_price_is_lower(): void
    {
        $client = $this->client();
        // Charge-on price now BELOW what they were billed.
        ModelCatalog::create([
            'provider' => 'openai', 'model' => 'gpt-x', 'active' => true,
            'input_usd_per_million' => 1.0, 'output_usd_per_million' => 1.0,
        ]);
        $this->usage($client, billed: 1_000);

        $result = app(MeteringService::class)->recost($client->id, 'openai', 'gpt-x');

        $this->assertSame(-750, $result['delta_cents']); // 200c x 1.25 = 250c
        $this->assertSame(1, $result['credited']);
        $this->assertSame(100_000 + 750, $client->fresh()->balance_cents);
    }

    public function test_recost_is_scoped_to_one_client_and_one_model(): void
    {
        $a = $this->client();
        $b = $this->client();
        $this->model();
        ModelCatalog::create(['provider' => 'openai', 'model' => 'gpt-x-mini', 'input_usd_per_million' => 1.0, 'output_usd_per_million' => 1.0]);

        $mine = $this->usage($a, billed: 250);
        $theirs = $this->usage($b, billed: 250);
        $mini = UsageRecord::create([
            'client_id' => $a->id, 'provider' => 'openai', 'model' => 'gpt-x-mini',
            'period_start' => now(), 'period_end' => now(), 'input_tokens' => 1_000_000, 'output_tokens' => 1_000_000,
            'provider_cost_cents' => 200, 'billed_cents' => 250, 'source' => 'pull', 'request_id' => uniqid(),
        ]);

        app(MeteringService::class)->recost($a->id, 'openai', 'gpt-x');

        $this->assertSame(500, $mine->fresh()->billed_cents);
        $this->assertSame(250, $theirs->fresh()->billed_cents, 'another client must not be touched');
        $this->assertSame(250, $mini->fresh()->billed_cents, 'gpt-x must not sweep up gpt-x-mini');
    }

    public function test_the_recost_endpoints_preview_then_apply(): void
    {
        $client = $this->client();
        $this->model();
        $this->usage($client, billed: 250);
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->postJson("/admin/clients/{$client->id}/recost/preview", ['provider' => 'openai', 'model' => 'gpt-x'])
            ->assertOk()->assertJson(['records' => 1, 'delta_cents' => 250, 'applied' => false]);
        $this->assertSame(100_000, $client->fresh()->balance_cents, 'preview writes nothing');

        $this->actingAs($admin)->post("/admin/clients/{$client->id}/recost", ['provider' => 'openai', 'model' => 'gpt-x'])
            ->assertRedirect();
        $this->assertSame(100_000 - 250, $client->fresh()->balance_cents);
        $this->assertDatabaseHas('audit_logs', ['action' => 'metering.recost', 'client_id' => $client->id]);
    }

    public function test_a_recost_never_leaks_the_model_to_the_client(): void
    {
        $client = $this->client();
        $this->model();
        $this->usage($client, billed: 250);
        $user = User::factory()->create(['client_id' => $client->id, 'role' => 'owner']);

        app(MeteringService::class)->recost($client->id, 'openai', 'gpt-x');

        $this->actingAs($user)->get('/console/billing')->assertInertia(function ($page) {
            $tx = $page->toArray()['props']['transactions'][0];
            $this->assertSame('Usage — inference', $tx['description']);
            $this->assertSame('', $tx['detail'], 'the internal "(re-costed)" note must not reach the client');
        });
    }
}
