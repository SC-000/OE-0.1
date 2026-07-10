<?php

namespace Tests\Feature;

use App\Models\AccessKey;
use App\Models\Client;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SmokeTest extends TestCase
{
    use RefreshDatabase;

    public function test_marketing_pages_load(): void
    {
        $pages = ['/', '/pricing', '/markets', '/developers', '/whitepaper', '/company',
            '/products/ai-router', '/products/hyperquay', '/products/exchange',
            '/products/openexchange', '/products/data', '/products/services',
            '/blog', '/blog/why-ai-needs-an-exchange', '/blog/best-execution-for-llm-requests'];
        foreach ($pages as $url) {
            $this->get($url)->assertOk();
        }
    }

    public function test_console_requires_authentication(): void
    {
        $this->get('/console')->assertRedirect('/login');
    }

    public function test_billing_account_pages_load_for_a_client_user(): void
    {
        $client = Client::create(['name' => 'Acme', 'slug' => 'acme']);
        $user = User::factory()->create(['client_id' => $client->id, 'role' => 'owner']);

        foreach (['/console', '/console/usage', '/console/sources', '/console/billing', '/console/billing/add-card'] as $url) {
            $this->actingAs($user)->get($url)->assertOk();
        }
    }

    public function test_client_can_create_and_label_a_source(): void
    {
        $client = Client::create(['name' => 'Acme', 'slug' => 'acme']);
        $user = User::factory()->create(['client_id' => $client->id, 'role' => 'owner']);

        $this->actingAs($user)->post('/console/sources', ['name' => 'Batch jobs']);
        $key = AccessKey::where('client_id', $client->id)->first();
        $this->assertNotNull($key);

        $this->actingAs($user)->post("/console/sources/{$key->id}/label", ['label' => 'Production app']);
        $this->assertSame('Production app', $key->fresh()->name);
    }

    public function test_admin_pages_are_gated(): void
    {
        Client::create(['name' => 'Acme', 'slug' => 'acme']);
        $owner = User::factory()->create(['role' => 'owner']);
        $this->actingAs($owner)->get('/admin')->assertForbidden();

        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin)->get('/admin')->assertOk();
    }

    /** Every admin page resolves a real Inertia component and renders with an empty database. */
    public function test_admin_pages_render(): void
    {
        $client = Client::create(['name' => 'Acme', 'slug' => 'acme']);
        $admin = User::factory()->create(['role' => 'admin', 'client_id' => null]);

        foreach (['/admin', '/admin/clients', "/admin/clients/{$client->id}", '/admin/models', '/admin/platform', '/admin/audit'] as $page) {
            $this->actingAs($admin)->get($page)->assertOk();
        }
    }

    /**
     * The old bug: an admin opening /console silently got whichever client happened
     * to be first in the table, which is what made the portal read as a hybrid.
     */
    public function test_an_admin_without_a_client_is_sent_to_the_admin_portal(): void
    {
        Client::create(['name' => 'Acme', 'slug' => 'acme']);
        $admin = User::factory()->create(['role' => 'admin', 'client_id' => null]);

        $this->actingAs($admin)->get('/console')->assertRedirect('/admin');
    }
}
