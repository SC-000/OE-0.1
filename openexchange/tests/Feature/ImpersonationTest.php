<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ImpersonationTest extends TestCase
{
    use RefreshDatabase;

    private function client(string $name = 'Acme'): Client
    {
        return Client::create(['name' => $name, 'slug' => strtolower($name), 'balance_cents' => 5_000]);
    }

    public function test_an_admin_can_view_a_clients_console_and_sees_their_data(): void
    {
        $client = $this->client();
        $admin = User::factory()->create(['role' => 'admin', 'client_id' => null]);

        $this->actingAs($admin)->post("/admin/clients/{$client->id}/impersonate")->assertRedirect('/console');

        $this->actingAs($admin)->get('/console')
            ->assertOk()
            ->assertInertia(fn ($page) => $page
                ->where('impersonation.client.name', 'Acme')
                ->where('account.name', 'Acme'));

        $this->assertDatabaseHas('audit_logs', ['action' => 'impersonate.start', 'user_id' => $admin->id, 'client_id' => $client->id]);
    }

    public function test_impersonation_is_a_client_context_swap_not_an_auth_swap(): void
    {
        $client = $this->client();
        $admin = User::factory()->create(['role' => 'admin', 'client_id' => null]);

        $this->actingAs($admin)->post("/admin/clients/{$client->id}/impersonate");

        // The signed-in user is still the admin — audit trails keep naming the real person.
        $this->actingAs($admin)->get('/console')
            ->assertInertia(fn ($page) => $page->where('auth.user.id', $admin->id)->where('auth.user.role', 'admin'));
    }

    public function test_a_non_admin_cannot_impersonate(): void
    {
        $client = $this->client();
        $owner = User::factory()->create(['role' => 'owner', 'client_id' => $this->client('Other')->id]);

        $this->actingAs($owner)->post("/admin/clients/{$client->id}/impersonate")->assertForbidden();
        $this->assertDatabaseMissing('audit_logs', ['action' => 'impersonate.start']);
    }

    public function test_billing_mutations_are_blocked_while_impersonating(): void
    {
        $client = $this->client();
        $admin = User::factory()->create(['role' => 'admin', 'client_id' => null]);
        $this->actingAs($admin)->post("/admin/clients/{$client->id}/impersonate");

        $this->actingAs($admin)
            ->from('/console/billing')
            ->post('/console/billing/settings', ['auto_topup' => true, 'min' => 50, 'topup' => 100])
            ->assertRedirect('/console/billing')
            ->assertSessionHasErrors('impersonation');

        // Untouched.
        $this->assertTrue($client->fresh()->auto_topup);
        $this->assertSame(1000, $client->fresh()->min_balance_cents);
    }

    public function test_topping_up_a_clients_card_is_blocked_while_impersonating(): void
    {
        $client = $this->client();
        $admin = User::factory()->create(['role' => 'admin', 'client_id' => null]);
        $this->actingAs($admin)->post("/admin/clients/{$client->id}/impersonate");

        $this->actingAs($admin)->from('/console/billing')->post('/console/billing/topup', ['amount' => 50])
            ->assertSessionHasErrors('impersonation');

        $this->assertDatabaseCount('top_ups', 0);
    }

    public function test_changing_a_password_is_blocked_while_impersonating(): void
    {
        $client = $this->client();
        $admin = User::factory()->create(['role' => 'admin', 'client_id' => null]);
        $this->actingAs($admin)->post("/admin/clients/{$client->id}/impersonate");

        $this->actingAs($admin)->from('/settings/security')->put('/settings/password', [
            'current_password' => 'password', 'password' => 'N3w-Passw0rd!', 'password_confirmation' => 'N3w-Passw0rd!',
        ])->assertSessionHasErrors('impersonation');
    }

    public function test_read_only_console_pages_still_render_while_impersonating(): void
    {
        $client = $this->client();
        $admin = User::factory()->create(['role' => 'admin', 'client_id' => null]);
        $this->actingAs($admin)->post("/admin/clients/{$client->id}/impersonate");

        $this->actingAs($admin)->get('/console/usage')->assertOk();
        $this->actingAs($admin)->get('/console/billing')->assertOk();
        $this->actingAs($admin)->get('/console/sources')->assertOk();
    }

    public function test_stopping_impersonation_clears_the_context_and_is_audited(): void
    {
        $client = $this->client();
        $admin = User::factory()->create(['role' => 'admin', 'client_id' => null]);
        $this->actingAs($admin)->post("/admin/clients/{$client->id}/impersonate");

        $this->actingAs($admin)->post('/impersonate/stop')->assertRedirect('/admin');

        $this->assertDatabaseHas('audit_logs', ['action' => 'impersonate.stop', 'client_id' => $client->id]);
        // Back to having no client context, so /console bounces them home.
        $this->actingAs($admin)->get('/console')->assertRedirect('/admin');
    }

    public function test_impersonating_a_deleted_client_self_heals_rather_than_500ing(): void
    {
        $client = $this->client();
        $admin = User::factory()->create(['role' => 'admin', 'client_id' => null]);
        $this->actingAs($admin)->post("/admin/clients/{$client->id}/impersonate");

        $client->delete();

        $this->actingAs($admin)->get('/console')->assertRedirect('/admin');
    }
}
