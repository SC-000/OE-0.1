<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\ModelCatalog;
use App\Models\ProviderKey;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

/**
 * A usage pull can fail loudly (no credentials) or quietly (a project id that doesn't
 * exist upstream returns an EMPTY result, not an error). Both used to be invisible:
 * "Pull now" returned `back()` with no flash at all. Neither may be silent again.
 */
class UsagePullDiagnosticsTest extends TestCase
{
    use RefreshDatabase;

    private User $admin;

    private Client $client;

    protected function setUp(): void
    {
        parent::setUp();
        Cache::forget('oe.metering.last_run');
        Cache::forget('oe.discovery.openai.projects');
        Cache::forget('oe.discovery.openai.at');

        $this->admin = User::factory()->create(['role' => 'admin', 'client_id' => null]);
        $this->client = Client::create(['name' => 'Acme', 'slug' => 'acme', 'balance_cents' => 50_000, 'auto_topup' => false]);
    }

    private function key(string $project = 'proj_real'): ProviderKey
    {
        return ProviderKey::create([
            'client_id' => $this->client->id, 'provider' => 'openai', 'label' => 'prod',
            'secret' => 'sk-x', 'external_project_id' => $project, 'status' => 'active',
        ]);
    }

    /* ------------------------------- loud failure ---------------------------------- */

    public function test_a_missing_credential_is_reported_not_swallowed(): void
    {
        config()->set('openexchange.openai.admin_key', null);
        $key = $this->key();

        $this->actingAs($this->admin)->post('/admin/platform/sync')->assertRedirect();

        $this->assertSame('error', session('flash')['type']);
        $this->assertStringContainsString('OPENAI_ADMIN_KEY', session('flash')['message']);

        // The key remembers why, so the operator can see it without reading logs.
        $this->assertStringContainsString('OPENAI_ADMIN_KEY', $key->fresh()->last_error);
        $this->assertNotNull($key->fresh()->last_error_at);
    }

    public function test_the_platform_page_warns_when_credentials_are_missing(): void
    {
        config()->set('openexchange.openai.admin_key', null);
        config()->set('openexchange.google.credentials', null);

        $this->actingAs($this->admin)->get('/admin/platform')->assertInertia(fn ($page) => $page
            ->where('credentials.openai_admin_key', false)
            ->where('credentials.google_credentials', false));
    }

    /* ------------------------------- quiet failure --------------------------------- */

    /** The exact shape of "discovery sees usage, the client is never billed". */
    public function test_a_project_id_that_does_not_exist_upstream_is_flagged(): void
    {
        Cache::put('oe.discovery.openai.projects', [['id' => 'proj_real_abc', 'name' => 'Prod', 'status' => 'active']], now()->addHour());
        Cache::put('oe.discovery.openai.at', now()->toDateTimeString(), now()->addHour());

        $this->key('proj_placeholder'); // never existed in the OpenAI org

        $this->actingAs($this->admin)->get('/admin/platform')->assertInertia(function ($page) {
            $key = $page->toArray()['props']['keys'][0];
            $this->assertTrue($key['unknown_project']);
            $this->assertSame('unknown_project', $key['status']);
        });
    }

    public function test_a_project_id_that_does_exist_is_not_flagged(): void
    {
        Cache::put('oe.discovery.openai.projects', [['id' => 'proj_real', 'name' => 'Prod', 'status' => 'active']], now()->addHour());
        Cache::put('oe.discovery.openai.at', now()->toDateTimeString(), now()->addHour());

        $this->key('proj_real');

        $this->actingAs($this->admin)->get('/admin/platform')->assertInertia(function ($page) {
            $this->assertFalse($page->toArray()['props']['keys'][0]['unknown_project']);
        });
    }

    public function test_a_pull_that_returns_nothing_says_so_rather_than_claiming_success(): void
    {
        config()->set('openexchange.openai.admin_key', 'sk-admin');
        // The OpenAI usage API answers an unknown project with an empty bucket list.
        Http::fake(['api.openai.com/*' => Http::response(['data' => []])]);
        $key = $this->key('proj_placeholder');

        $this->actingAs($this->admin)->post('/admin/platform/sync')->assertRedirect();

        $flash = session('flash');
        $this->assertSame('info', $flash['type']);
        $this->assertStringContainsString('Nothing new to meter', $flash['message']);
        $this->assertStringContainsString('project id exists upstream', $flash['message']);

        $key->refresh();
        $this->assertNull($key->last_error, 'an empty result is not an error');
        $this->assertSame(0, $key->last_pull_records, 'but it IS recorded as having returned nothing');
    }

    public function test_a_successful_pull_reports_what_it_billed(): void
    {
        config()->set('openexchange.openai.admin_key', 'sk-admin');
        ModelCatalog::create(['provider' => 'openai', 'model' => 'gpt-4o', 'input_usd_per_million' => 2.5, 'output_usd_per_million' => 10.0]);
        Http::fake(['api.openai.com/*' => Http::response([
            'data' => [[
                'start_time' => now()->subHour()->timestamp,
                'end_time' => now()->timestamp,
                'results' => [['input_tokens' => 1_000_000, 'output_tokens' => 1_000_000, 'model' => 'gpt-4o']],
            ]],
            'has_more' => false,
        ])]);
        $this->key();

        $this->actingAs($this->admin)->post('/admin/platform/sync');

        $flash = session('flash');
        $this->assertSame('success', $flash['type']);
        $this->assertStringContainsString('metered', $flash['message']);
    }

    public function test_with_no_keys_at_all_the_button_explains_itself(): void
    {
        $this->actingAs($this->admin)->post('/admin/platform/sync')->assertRedirect();

        $this->assertSame('info', session('flash')['type']);
        $this->assertStringContainsString('No active provider keys', session('flash')['message']);
    }

    public function test_the_run_summary_is_recorded_for_the_admin_to_see(): void
    {
        config()->set('openexchange.openai.admin_key', null);
        $this->key();

        $this->actingAs($this->admin)->post('/admin/platform/sync');

        $run = Cache::get('oe.metering.last_run');
        $this->assertSame(1, $run['keys']);
        $this->assertSame(1, $run['failed']);
        $this->assertNotEmpty($run['errors']);
        $this->assertDatabaseHas('audit_logs', ['action' => 'metering.pull']);
    }
}
