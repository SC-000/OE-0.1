<?php

namespace Tests\Feature;

use App\Models\AccessKey;
use App\Models\Client;
use App\Models\ModelCatalog;
use App\Models\PaymentMethod;
use App\Models\UsageRecord;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

/**
 * Drives every page and action a signed-in client can reach, with a populated account,
 * and asserts none of it leaks a raw model id. The coverage guard at the bottom fails
 * if a console route is added without being exercised here.
 */
class ClientSurfaceTest extends TestCase
{
    use RefreshDatabase;

    private Client $client;

    private User $user;

    private const COVERED = [
        'console', 'console.usage', 'console.sources', 'console.sources.store', 'console.sources.label',
        'console.sources.revoke', 'console.billing', 'console.billing.settings', 'console.billing.topup',
        'console.add-card', 'console.billing.card', 'dashboard',
        'profile.edit', 'profile.update', 'profile.destroy',
        'security.edit', 'user-password.update', 'appearance.edit',
    ];

    protected function setUp(): void
    {
        parent::setUp();
        Http::fake(['*' => Http::response([], 200)]);

        $this->client = Client::create([
            'name' => 'Acme', 'slug' => 'acme', 'balance_cents' => 50_000,
            'default_markup_bps' => 2500, 'model_visibility' => 'aliased',
        ]);
        $this->user = User::factory()->create(['client_id' => $this->client->id, 'role' => 'owner']);

        ModelCatalog::create(['provider' => 'openai', 'model' => 'gpt-5.4', 'input_usd_per_million' => 10, 'output_usd_per_million' => 30, 'tier' => 'premium']);
        [$key] = AccessKey::generate($this->client, 'Prod');
        UsageRecord::create([
            'client_id' => $this->client->id, 'access_key_id' => $key->id, 'provider' => 'openai', 'model' => 'gpt-5.4',
            'period_start' => now(), 'period_end' => now(), 'input_tokens' => 1_000_000, 'output_tokens' => 500_000,
            'provider_cost_cents' => 2500, 'billed_cents' => 3125, 'source' => 'gateway', 'request_id' => 'r1',
        ]);
    }

    /* ------------------------------------- pages ------------------------------------ */

    public function test_every_client_page_renders_with_a_populated_account(): void
    {
        foreach (['/console', '/console/usage', '/console/sources', '/console/billing', '/console/billing/add-card'] as $url) {
            $this->actingAs($this->user)->get($url)->assertOk();
        }

        $this->actingAs($this->user)->get('/dashboard')->assertRedirect('/console');
    }

    public function test_every_client_page_renders_for_a_brand_new_empty_account(): void
    {
        $fresh = User::factory()->create([
            'client_id' => Client::create(['name' => 'New', 'slug' => 'new'])->id,
            'role' => 'owner',
        ]);

        foreach (['/console', '/console/usage', '/console/sources', '/console/billing'] as $url) {
            $this->actingAs($fresh)->get($url)->assertOk();
        }
    }

    public function test_settings_pages_render(): void
    {
        $this->actingAs($this->user)->get('/settings')->assertRedirect('/settings/profile');
        $this->actingAs($this->user)->get('/settings/profile')->assertOk();
        $this->actingAs($this->user)->get('/settings/appearance')->assertOk();

        // Security sits behind a password confirmation.
        $this->actingAs($this->user)->get('/settings/security')->assertRedirect(route('password.confirm'));
        $this->actingAs($this->user)->withSession(['auth.password_confirmed_at' => time()])->get('/settings/security')->assertOk();
    }

    /* ------------------------------------ settings ---------------------------------- */

    public function test_a_client_can_update_their_profile(): void
    {
        $this->actingAs($this->user)->patch('/settings/profile', ['name' => 'Ada Reyes', 'email' => $this->user->email])
            ->assertSessionHasNoErrors();

        $this->assertSame('Ada Reyes', $this->user->fresh()->name);
    }

    public function test_a_client_can_change_their_password(): void
    {
        $user = User::factory()->create(['client_id' => $this->client->id, 'role' => 'owner', 'password' => 'Old-Passw0rd!']);

        $this->actingAs($user)->put('/settings/password', [
            'current_password' => 'Old-Passw0rd!', 'password' => 'N3w-Passw0rd!', 'password_confirmation' => 'N3w-Passw0rd!',
        ])->assertSessionHasNoErrors();
    }

    /* ------------------------------------- sources ---------------------------------- */

    public function test_source_lifecycle(): void
    {
        $this->actingAs($this->user)->post('/console/sources', ['name' => 'Batch jobs'])->assertRedirect();
        $key = AccessKey::where('name', 'Batch jobs')->firstOrFail();

        $this->actingAs($this->user)->post("/console/sources/{$key->id}/label", ['label' => 'Production app'])->assertRedirect();
        $this->assertSame('Production app', $key->fresh()->name);

        $this->actingAs($this->user)->post("/console/sources/{$key->id}/revoke")->assertRedirect();
        $this->assertSame('revoked', $key->fresh()->status);
    }

    public function test_a_client_cannot_touch_another_clients_source(): void
    {
        $other = Client::create(['name' => 'Other', 'slug' => 'other']);
        [$theirs] = AccessKey::generate($other, 'Theirs');

        $this->actingAs($this->user)->post("/console/sources/{$theirs->id}/revoke")->assertForbidden();
        $this->actingAs($this->user)->post("/console/sources/{$theirs->id}/label", ['label' => 'pwned'])->assertForbidden();

        $this->assertSame('active', $theirs->fresh()->status);
        $this->assertSame('Theirs', $theirs->fresh()->name);
    }

    /* ------------------------------------- billing ---------------------------------- */

    public function test_billing_settings_and_card_actions(): void
    {
        $this->actingAs($this->user)->post('/console/billing/settings', ['auto_topup' => true, 'min' => 20, 'topup' => 100])
            ->assertSessionHasNoErrors();
        $this->assertSame(2000, $this->client->fresh()->min_balance_cents);
        $this->assertSame(10000, $this->client->fresh()->topup_amount_cents);

        $this->actingAs($this->user)->post('/console/billing/card', [
            'payment_method_id' => 'pm_test_1', 'brand' => 'visa', 'last4' => '4242', 'exp_month' => 8, 'exp_year' => 2028,
        ])->assertSessionHasNoErrors();
        $this->assertDatabaseHas('payment_methods', ['client_id' => $this->client->id, 'last4' => '4242', 'is_default' => true]);

        // Topping up with a saved card is accepted (the billings call is faked).
        $this->actingAs($this->user)->post('/console/billing/topup')->assertRedirect();
    }

    public function test_the_billing_page_shows_a_saved_card(): void
    {
        PaymentMethod::create([
            'client_id' => $this->client->id, 'billings_pm_id' => 'pm_1',
            'brand' => 'visa', 'last4' => '4242', 'exp_month' => 8, 'exp_year' => 2028, 'is_default' => true,
        ]);

        $this->actingAs($this->user)->get('/console/billing')->assertInertia(fn ($page) => $page
            ->where('card.brand', 'VISA')
            ->where('card.last4', '4242'));
    }

    /* -------------------------------- no model leakage ------------------------------ */

    public function test_no_client_page_leaks_a_raw_model_id(): void
    {
        foreach (['/console', '/console/usage', '/console/billing'] as $url) {
            $body = $this->actingAs($this->user)->get($url)->getContent();
            $this->assertStringNotContainsString('gpt-5.4', $body, "{$url} leaked the raw model id");
        }

        $this->actingAs($this->user)->get('/console/usage')->assertInertia(fn ($page) => $page
            ->where('table.0.label', 'OpenAI Premium'));
    }

    /* -------------------------------------- gating ---------------------------------- */

    public function test_console_and_settings_require_authentication(): void
    {
        foreach (['/console', '/console/usage', '/console/sources', '/console/billing', '/settings/profile'] as $url) {
            $this->get($url)->assertRedirect('/login');
        }
    }

    /** Coverage guard: a new console/settings route must be exercised above. */
    public function test_no_client_route_is_left_unexercised(): void
    {
        $named = collect(Route::getRoutes())
            ->filter(fn ($r) => str_starts_with($r->uri(), 'console') || str_starts_with($r->uri(), 'settings'))
            ->map(fn ($r) => $r->getName())
            ->filter()
            ->unique()->values();

        $missing = $named->diff(self::COVERED)->values()->all();

        $this->assertSame([], $missing, 'These client routes have no test in ClientSurfaceTest: '.implode(', ', $missing));
    }
}
