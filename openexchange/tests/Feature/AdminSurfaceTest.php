<?php

namespace Tests\Feature;

use App\Models\AccessKey;
use App\Models\Charge;
use App\Models\Client;
use App\Models\ClientModelRate;
use App\Models\ModelCatalog;
use App\Models\ModelPriceProposal;
use App\Models\ProviderBackend;
use App\Models\ProviderKey;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

/**
 * Drives EVERY admin route through the real HTTP stack and asserts it does what it
 * claims. The last test is a coverage guard: add an admin route without exercising it
 * here and the suite fails, so the portal can't quietly grow a broken button.
 */
class AdminSurfaceTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private Client $client;

    private ModelCatalog $model;

    protected function setUp(): void
    {
        parent::setUp();

        Http::preventStrayRequests();
        Http::fake([
            'openrouter.ai/*' => Http::response(['data' => [
                ['id' => 'openai/gpt-x', 'pricing' => ['prompt' => '0.000002', 'completion' => '0.000008']],
            ]]),
            '*' => Http::response([], 404),
        ]);

        $this->admin = User::factory()->create(['role' => 'admin', 'client_id' => null]);
        $this->client = Client::create(['name' => 'Acme', 'slug' => 'acme', 'balance_cents' => 100_000, 'default_markup_bps' => 2500]);
        $this->model = ModelCatalog::create(['provider' => 'openai', 'model' => 'gpt-x', 'input_usd_per_million' => 2.0, 'output_usd_per_million' => 8.0, 'active' => true]);
    }

    /** @return list<string> route names this test exercises */
    private const COVERED = [
        'admin.dashboard', 'admin.clients', 'admin.clients.store', 'admin.clients.show', 'admin.clients.update',
        'admin.clients.destroy', 'admin.clients.balance', 'admin.clients.staff.add', 'admin.clients.staff.remove',
        'admin.clients.staff.invite', 'admin.clients.impersonate',
        'admin.clients.recost', 'admin.clients.recost.preview',
        'admin.models', 'admin.models.store', 'admin.models.update', 'admin.models.presentation',
        'admin.models.price-from-feed', 'admin.models.rebill', 'admin.models.sync', 'admin.models.retier',
        'admin.proposals.accept', 'admin.proposals.reject',
        'admin.rates.upsert', 'admin.rates.delete', 'admin.rates.default', 'admin.rates.preview',
        'admin.charges.store', 'admin.charges.preview', 'admin.charges.update', 'admin.charges.destroy', 'admin.charges.run',
        'admin.platform', 'admin.backends.store', 'admin.backends.destroy', 'admin.keys.store',
        'admin.discover', 'admin.assign-project', 'admin.toggle-project',
        'admin.access-key.create', 'admin.access-key.revoke', 'admin.sync', 'admin.rebill',
        'admin.audit',
    ];

    /* ---------------------------------- read pages ---------------------------------- */

    public function test_every_admin_page_renders(): void
    {
        foreach ([
            'admin.dashboard' => '/admin',
            'admin.clients' => '/admin/clients',
            'admin.clients.show' => "/admin/clients/{$this->client->id}",
            'admin.models' => '/admin/models',
            'admin.platform' => '/admin/platform',
            'admin.audit' => '/admin/audit',
        ] as $name => $url) {
            $this->actingAs($this->admin)->get($url)->assertOk();
        }

        // The retired hybrid still redirects, so old bookmarks don't 404.
        $this->actingAs($this->admin)->get('/console/admin')->assertRedirect('/admin');
    }

    /* ------------------------------------ clients ----------------------------------- */

    public function test_client_lifecycle_actions(): void
    {
        // create
        $this->actingAs($this->admin)->post('/admin/clients', [
            'name' => 'Globex', 'owner_email' => 'own@globex.test', 'owner_name' => 'Owen', 'company' => 'Globex Ltd',
        ])->assertRedirect();
        $globex = Client::where('name', 'Globex')->firstOrFail();
        $this->assertDatabaseHas('users', ['email' => 'own@globex.test', 'role' => 'owner', 'client_id' => $globex->id]);

        // update — profile, terms and model visibility together
        $this->actingAs($this->admin)->patch("/admin/clients/{$globex->id}", [
            'name' => 'Globex Inc', 'company' => 'Globex Ltd', 'contact_email' => 'billing@globex.test', 'notes' => 'VIP',
            'status' => 'active', 'model_visibility' => 'exact', 'default_markup_bps' => 4000,
            'min_balance_cents' => 2000, 'topup_amount_cents' => 10000, 'debt_limit_cents' => 7000, 'auto_topup' => true,
        ])->assertRedirect();
        $globex->refresh();
        $this->assertSame('Globex Inc', $globex->name);
        $this->assertSame('exact', $globex->model_visibility);
        $this->assertSame(4000, $globex->default_markup_bps);

        // balance adjust (credit then debit)
        $this->actingAs($this->admin)->post("/admin/clients/{$globex->id}/balance", ['amount' => 25.50, 'reason' => 'goodwill']);
        $this->actingAs($this->admin)->post("/admin/clients/{$globex->id}/balance", ['amount' => -5, 'reason' => 'correction']);
        $this->assertSame(2050, $globex->fresh()->balance_cents);

        // staff add / invite / remove
        $this->actingAs($this->admin)->post("/admin/clients/{$globex->id}/staff", ['name' => 'Sam', 'email' => 'sam@globex.test', 'role' => 'member']);
        $sam = User::where('email', 'sam@globex.test')->firstOrFail();
        $this->actingAs($this->admin)->post("/admin/clients/{$globex->id}/staff/{$sam->id}/invite")->assertRedirect();
        $this->actingAs($this->admin)->delete("/admin/clients/{$globex->id}/staff/{$sam->id}")->assertRedirect();
        $this->assertDatabaseMissing('users', ['id' => $sam->id]);

        // re-cost: preview never writes, apply settles the difference
        $this->actingAs($this->admin)->postJson("/admin/clients/{$globex->id}/recost/preview", ['provider' => 'openai', 'model' => 'gpt-x'])
            ->assertOk()->assertJsonPath('applied', false);
        $this->actingAs($this->admin)->post("/admin/clients/{$globex->id}/recost", ['provider' => 'openai', 'model' => 'gpt-x'])
            ->assertRedirect();
        $this->assertSame('info', session('flash')['type'], 'no usage => explains itself rather than silently doing nothing');

        // impersonate + stop
        $this->actingAs($this->admin)->post("/admin/clients/{$globex->id}/impersonate")->assertRedirect('/console');
        $this->actingAs($this->admin)->post('/impersonate/stop')->assertRedirect('/admin');

        // destroy
        $this->actingAs($this->admin)->delete("/admin/clients/{$globex->id}")->assertRedirect('/admin/clients');
        $this->assertDatabaseMissing('clients', ['id' => $globex->id]);
    }

    public function test_a_staff_member_of_another_client_cannot_be_removed(): void
    {
        $other = Client::create(['name' => 'Other', 'slug' => 'other']);
        $victim = User::factory()->create(['client_id' => $other->id, 'role' => 'owner']);

        $this->actingAs($this->admin)->delete("/admin/clients/{$this->client->id}/staff/{$victim->id}")->assertNotFound();
        $this->assertDatabaseHas('users', ['id' => $victim->id]);
    }

    public function test_a_platform_admin_cannot_be_removed_as_client_staff(): void
    {
        $embedded = User::factory()->create(['client_id' => $this->client->id, 'role' => 'admin']);

        $this->actingAs($this->admin)->delete("/admin/clients/{$this->client->id}/staff/{$embedded->id}")->assertForbidden();
        $this->assertDatabaseHas('users', ['id' => $embedded->id]);
    }

    /* ------------------------------------ models ------------------------------------ */

    public function test_model_actions(): void
    {
        // store (new)
        $this->actingAs($this->admin)->post('/admin/models', ['provider' => 'openai', 'model' => 'gpt-new', 'input' => 1.0, 'output' => 3.0]);
        $this->assertDatabaseHas('model_catalog', ['model' => 'gpt-new', 'price_source' => 'manual']);

        // update cost basis + active
        $this->actingAs($this->admin)->patch("/admin/models/{$this->model->id}", ['input' => 3.0, 'output' => 9.0, 'active' => true]);
        $this->assertEquals(3.0, (float) $this->model->fresh()->input_usd_per_million);
        $this->assertSame('manual', $this->model->fresh()->price_source);

        // presentation: alias, tier, visibility
        $this->actingAs($this->admin)->patch("/admin/models/{$this->model->id}/presentation", [
            'display_alias' => 'Exchange Flagship', 'tier' => 'premium', 'client_visible' => false,
        ]);
        $this->assertSame('Exchange Flagship', $this->model->fresh()->display_alias);
        $this->assertFalse($this->model->fresh()->client_visible);

        // retier from price bands (clears nothing, just recomputes)
        $this->actingAs($this->admin)->post('/admin/models/retier')->assertRedirect();

        // rebill (nothing outstanding => informative, not an error)
        $this->actingAs($this->admin)->post("/admin/models/{$this->model->id}/rebill");
        $this->assertSame('info', session('flash')['type']);

        // sync against the faked feed
        $this->actingAs($this->admin)->post('/admin/models/sync')->assertRedirect();
        $this->assertSame('success', session('flash')['type']);
    }

    public function test_price_from_feed_uses_the_warm_cache(): void
    {
        $unpriced = ModelCatalog::create(['provider' => 'openai', 'model' => 'gpt-cold', 'input_usd_per_million' => 0, 'output_usd_per_million' => 0]);

        // No quote for gpt-cold => explains itself rather than silently doing nothing.
        $this->actingAs($this->admin)->post("/admin/models/{$unpriced->id}/price-from-feed");
        $this->assertSame('error', session('flash')['type']);
        $this->assertFalse($unpriced->fresh()->isPriced());
    }

    public function test_proposal_accept_and_reject(): void
    {
        $accept = ModelPriceProposal::create([
            'model_catalog_id' => $this->model->id,
            'current_input_usd_per_million' => 2.0, 'current_output_usd_per_million' => 8.0,
            'proposed_input_usd_per_million' => 2.5, 'proposed_output_usd_per_million' => 10.0,
            'source' => 'openrouter', 'status' => 'pending',
        ]);
        $this->actingAs($this->admin)->post("/admin/proposals/{$accept->id}/accept")->assertRedirect();
        $this->assertSame('accepted', $accept->fresh()->status);
        $this->assertEquals(10.0, (float) $this->model->fresh()->output_usd_per_million);

        $reject = ModelPriceProposal::create([
            'model_catalog_id' => $this->model->id,
            'current_input_usd_per_million' => 2.5, 'current_output_usd_per_million' => 10.0,
            'proposed_input_usd_per_million' => 9.9, 'proposed_output_usd_per_million' => 9.9,
            'source' => 'openrouter', 'status' => 'pending',
        ]);
        $this->actingAs($this->admin)->post("/admin/proposals/{$reject->id}/reject")->assertRedirect();
        $this->assertSame('rejected', $reject->fresh()->status);
        $this->assertEquals(10.0, (float) $this->model->fresh()->output_usd_per_million, 'a rejected price must not apply');
    }

    /* ------------------------------------- rates ------------------------------------ */

    public function test_rate_card_actions(): void
    {
        // global default
        $this->actingAs($this->admin)->post('/admin/rates/default', ['markup_bps' => 3000])->assertRedirect();
        $this->assertDatabaseHas('client_model_rates', ['client_id' => null, 'provider' => null, 'model' => null, 'markup_bps' => 3000]);

        // markup override, provider inferred from the model
        $this->actingAs($this->admin)->post('/admin/rates', [
            'client_id' => $this->client->id, 'model' => 'gpt-x', 'pricing_mode' => 'markup', 'markup_bps' => 5000,
        ])->assertRedirect();
        $rate = ClientModelRate::where('client_id', $this->client->id)->firstOrFail();
        $this->assertSame('openai', $rate->provider);

        // switch the same row to a fixed sell price with guards
        $this->actingAs($this->admin)->post('/admin/rates', [
            'client_id' => $this->client->id, 'provider' => 'openai', 'model' => 'gpt-x',
            'pricing_mode' => 'fixed', 'input_usd_per_million' => 4, 'output_usd_per_million' => 16,
            'per_request_fee_cents' => 2, 'min_margin_bps' => 1000, 'note' => 'Q3 deal',
        ])->assertRedirect();
        $rate->refresh();
        $this->assertSame('fixed', $rate->pricing_mode);
        $this->assertNull($rate->markup_bps, 'the unused mode must not leave a stale markup behind');
        $this->assertSame(2, $rate->per_request_fee_cents);

        // preview prices a hypothetical request against that row
        $this->actingAs($this->admin)->postJson('/admin/rates/preview', [
            'client_id' => $this->client->id, 'provider' => 'openai', 'model' => 'gpt-x',
            'input_tokens' => 1_000_000, 'output_tokens' => 1_000_000,
        ])->assertOk()->assertJsonPath('billed_cents', 2002); // $4 + $16 = 2000c + 2c fee

        // delete
        $this->actingAs($this->admin)->post('/admin/rates/delete', ['id' => $rate->id])->assertRedirect();
        $this->assertDatabaseMissing('client_model_rates', ['id' => $rate->id]);
    }

    public function test_a_fixed_rate_rejects_a_missing_sell_price(): void
    {
        $this->actingAs($this->admin)->post('/admin/rates', [
            'client_id' => $this->client->id, 'model' => 'gpt-x', 'pricing_mode' => 'fixed',
        ])->assertSessionHasErrors(['input_usd_per_million', 'output_usd_per_million']);
    }

    /* ------------------------------------ charges ----------------------------------- */

    public function test_charge_actions(): void
    {
        // recurring fee
        $this->actingAs($this->admin)->post('/admin/charges', [
            'client_id' => $this->client->id, 'kind' => 'fee', 'cadence' => 'monthly', 'name' => 'Platform fee', 'amount_cents' => 20_000,
        ])->assertRedirect();
        $charge = Charge::where('name', 'Platform fee')->firstOrFail();
        $this->assertSame(100_000, $this->client->fresh()->balance_cents, 'a recurring charge does not bill on creation');

        // bill it now
        $this->actingAs($this->admin)->post("/admin/charges/{$charge->id}/run")->assertRedirect();
        $this->assertSame(80_000, $this->client->fresh()->balance_cents);

        // second run in the same period is a no-op
        $this->actingAs($this->admin)->post("/admin/charges/{$charge->id}/run");
        $this->assertSame(80_000, $this->client->fresh()->balance_cents);

        // edit
        $this->actingAs($this->admin)->patch("/admin/charges/{$charge->id}", [
            'name' => 'Platform fee (2026)', 'amount_cents' => 25_000, 'active' => false, 'description' => null, 'ends_at' => null,
        ])->assertRedirect();
        $this->assertFalse($charge->fresh()->active);

        // the form quotes the charge before it is committed
        $this->actingAs($this->admin)->post('/admin/charges/preview', [
            'client_id' => $this->client->id,
            'provider' => 'openai', 'model' => 'gpt-x', 'input_tokens' => 1_000_000, 'output_tokens' => 0,
        ])->assertOk()->assertJson(['provider_cost_cents' => 200, 'billed_cents' => 250, 'margin_cents' => 50]);

        // one-off usage charge bills immediately and shows as token usage
        $this->actingAs($this->admin)->post('/admin/charges', [
            'client_id' => $this->client->id, 'kind' => 'usage', 'cadence' => 'once', 'name' => 'Batch backfill',
            'provider' => 'openai', 'model' => 'gpt-x', 'input_tokens' => 1_000_000, 'output_tokens' => 0,
        ])->assertRedirect();
        $this->assertDatabaseHas('usage_records', ['model' => 'gpt-x', 'source' => 'manual', 'billed_cents' => 250]); // $2 cost +25%

        // delete
        $this->actingAs($this->admin)->delete("/admin/charges/{$charge->id}")->assertRedirect();
        $this->assertDatabaseMissing('charges', ['id' => $charge->id]);
    }

    /* ------------------------------------ platform ---------------------------------- */

    public function test_platform_actions(): void
    {
        // backends
        $this->actingAs($this->admin)->post('/admin/platform/backends', [
            'provider' => 'openai', 'backend' => 'openai', 'label' => 'Primary', 'secret' => 'sk-test',
        ])->assertRedirect();
        $backend = ProviderBackend::where('label', 'Primary')->firstOrFail();

        // provider keys (per-client attribution)
        $this->actingAs($this->admin)->post('/admin/platform/keys', [
            'client_id' => $this->client->id, 'provider' => 'openai', 'label' => 'Acme prod',
            'secret' => 'sk-acme', 'external_project_id' => 'proj_a',
        ])->assertRedirect();
        $this->assertDatabaseHas('provider_keys', ['external_project_id' => 'proj_a', 'client_id' => $this->client->id]);

        // discovery has no admin key configured — must fail gracefully, not 500
        $this->actingAs($this->admin)->post('/admin/platform/discover')->assertRedirect();

        // assign + toggle a discovered project
        $this->actingAs($this->admin)->post('/admin/platform/assign-project', [
            'client_id' => $this->client->id, 'provider' => 'openai', 'external_project_id' => 'proj_b', 'label' => 'Staging',
        ])->assertRedirect();
        $key = ProviderKey::where('external_project_id', 'proj_b')->firstOrFail();
        $this->assertSame('active', $key->status);
        $this->actingAs($this->admin)->post('/admin/platform/toggle-project', ['provider' => 'openai', 'external_project_id' => 'proj_b']);
        $this->assertSame('disabled', $key->fresh()->status);

        // gateway access keys
        $this->actingAs($this->admin)->post('/admin/platform/access-keys', ['client_id' => $this->client->id, 'name' => 'Prod'])->assertRedirect();
        $accessKey = AccessKey::where('name', 'Prod')->firstOrFail();
        $this->assertNotNull(session('new_access_key'));
        $this->actingAs($this->admin)->delete("/admin/platform/access-keys/{$accessKey->id}")->assertRedirect();
        $this->assertSame('revoked', $accessKey->fresh()->status);

        // metering pull + global rebill
        $this->actingAs($this->admin)->post('/admin/platform/sync')->assertRedirect();
        $this->actingAs($this->admin)->post('/admin/platform/rebill')->assertRedirect();
        $this->assertSame('info', session('flash')['type']); // nothing outstanding

        // remove the backend
        $this->actingAs($this->admin)->delete("/admin/platform/backends/{$backend->id}")->assertRedirect();
        $this->assertDatabaseMissing('provider_backends', ['id' => $backend->id]);
    }

    /* ------------------------------------- gating ----------------------------------- */

    public function test_every_admin_route_is_closed_to_a_non_admin(): void
    {
        $owner = User::factory()->create(['role' => 'owner', 'client_id' => $this->client->id]);

        // Route-model binding runs BEFORE EnsureAdmin, so every parameter must resolve —
        // otherwise a 404 would masquerade as a passing authorisation check.
        $charge = Charge::create(['client_id' => $this->client->id, 'kind' => 'fee', 'cadence' => 'once', 'name' => 'x', 'amount_cents' => 1]);
        $proposal = ModelPriceProposal::create([
            'model_catalog_id' => $this->model->id,
            'current_input_usd_per_million' => 1, 'current_output_usd_per_million' => 1,
            'proposed_input_usd_per_million' => 2, 'proposed_output_usd_per_million' => 2,
            'source' => 'openrouter', 'status' => 'pending',
        ]);
        $backend = ProviderBackend::create(['provider' => 'openai', 'backend' => 'openai', 'label' => 'b', 'secret' => 's']);
        [$accessKey] = AccessKey::generate($this->client, 'k');

        $bindings = [
            '{client}' => (string) $this->client->id,
            '{model}' => (string) $this->model->id,
            '{charge}' => (string) $charge->id,
            '{proposal}' => (string) $proposal->id,
            '{user}' => (string) $owner->id,
            '{backend}' => (string) $backend->id,
            '{accessKey}' => (string) $accessKey->id,
        ];

        $checked = 0;
        foreach (Route::getRoutes() as $route) {
            if ($route->uri() !== 'admin' && ! str_starts_with($route->uri(), 'admin/')) {
                continue;
            }
            $method = collect($route->methods())->first(fn ($m) => $m !== 'HEAD');
            $uri = strtr($route->uri(), $bindings);

            $this->actingAs($owner)->call($method, '/'.$uri)
                ->assertForbidden(sprintf('%s /%s is reachable by a non-admin', $method, $uri));
            $checked++;
        }

        $this->assertGreaterThan(35, $checked, 'the admin surface should have been swept');
    }

    /** Coverage guard: a new admin route must be exercised above. */
    public function test_no_admin_route_is_left_unexercised(): void
    {
        $named = collect(Route::getRoutes())
            ->filter(fn ($r) => str_starts_with((string) $r->getName(), 'admin.'))
            ->map(fn ($r) => $r->getName())
            ->unique()->values();

        $missing = $named->diff(self::COVERED)->values()->all();

        $this->assertSame([], $missing, 'These admin routes have no test in AdminSurfaceTest: '.implode(', ', $missing));
    }
}
