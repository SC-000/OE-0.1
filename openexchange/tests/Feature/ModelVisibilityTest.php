<?php

namespace Tests\Feature;

use App\Models\AccessKey;
use App\Models\Client;
use App\Models\ModelCatalog;
use App\Models\UsageRecord;
use App\Models\User;
use App\Services\Billing\BalanceService;
use App\Services\Metering\ModelPresenter;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ModelVisibilityTest extends TestCase
{
    use RefreshDatabase;

    private function client(string $visibility = 'aliased'): Client
    {
        return Client::create(['name' => 'Acme', 'slug' => 'acme-'.uniqid(), 'balance_cents' => 50_000, 'model_visibility' => $visibility]);
    }

    private function usage(Client $client, string $model, int $billed = 1_000, string $provider = 'openai'): UsageRecord
    {
        return UsageRecord::create([
            'client_id' => $client->id, 'provider' => $provider, 'model' => $model,
            'period_start' => now(), 'period_end' => now(),
            'input_tokens' => 1_000_000, 'output_tokens' => 500_000,
            'provider_cost_cents' => 500, 'billed_cents' => $billed, 'source' => 'gateway',
            'request_id' => uniqid(),
        ]);
    }

    public function test_aliased_is_the_default_for_a_new_client(): void
    {
        $client = Client::create(['name' => 'New', 'slug' => 'new']);
        $this->assertSame('aliased', $client->model_visibility);
    }

    public function test_presenter_hides_the_model_behind_a_tier_label(): void
    {
        ModelCatalog::create(['provider' => 'openai', 'model' => 'gpt-5.4', 'input_usd_per_million' => 10, 'output_usd_per_million' => 30, 'tier' => 'premium']);
        $presenter = app(ModelPresenter::class);

        $this->assertSame('OpenAI Premium', $presenter->label($this->client('aliased'), 'openai', 'gpt-5.4'));
        $this->assertSame('OpenAI', $presenter->label($this->client('provider_only'), 'openai', 'gpt-5.4'));
        $this->assertSame('gpt-5.4', $presenter->label($this->client('exact'), 'openai', 'gpt-5.4'));
    }

    public function test_a_dated_snapshot_inherits_the_base_models_alias(): void
    {
        ModelCatalog::create(['provider' => 'openai', 'model' => 'gpt-5.4', 'input_usd_per_million' => 10, 'output_usd_per_million' => 30, 'tier' => 'premium', 'display_alias' => 'Exchange Flagship']);

        $this->assertSame('Exchange Flagship', app(ModelPresenter::class)->label($this->client(), 'openai', 'gpt-5.4-2026-03-05'));
    }

    public function test_an_admin_alias_overrides_the_tier_label(): void
    {
        ModelCatalog::create(['provider' => 'openai', 'model' => 'gpt-5.4', 'input_usd_per_million' => 10, 'output_usd_per_million' => 30, 'tier' => 'premium', 'display_alias' => 'Exchange Flagship']);

        $this->assertSame('Exchange Flagship', app(ModelPresenter::class)->label($this->client(), 'openai', 'gpt-5.4'));
    }

    public function test_an_unknown_model_still_never_leaks_its_raw_id(): void
    {
        // Nothing in the catalogue — a model that appeared mid-month.
        $this->assertSame('OpenAI Standard', app(ModelPresenter::class)->label($this->client(), 'openai', 'gpt-brand-new'));
    }

    public function test_the_usage_page_merges_models_that_share_a_label(): void
    {
        $client = $this->client('aliased');
        foreach ([['gpt-5.4', 'premium'], ['gpt-5.5', 'premium']] as [$m, $tier]) {
            ModelCatalog::create(['provider' => 'openai', 'model' => $m, 'input_usd_per_million' => 10, 'output_usd_per_million' => 30, 'tier' => $tier]);
        }
        $this->usage($client, 'gpt-5.4', 1_000);
        $this->usage($client, 'gpt-5.5', 2_000);

        $user = User::factory()->create(['client_id' => $client->id, 'role' => 'owner']);

        $this->actingAs($user)->get('/console/usage')->assertInertia(function ($page) {
            $table = $page->toArray()['props']['table'];

            // One row, not two — the row count must not reveal how many models sit behind the tier.
            $this->assertCount(1, $table);
            $this->assertSame('OpenAI Premium', $table[0][0]);
            $this->assertSame('$30.00', $table[0][3]); // 1000c + 2000c merged
        });
    }

    public function test_the_dashboard_never_renders_the_raw_model_id(): void
    {
        $client = $this->client('aliased');
        ModelCatalog::create(['provider' => 'openai', 'model' => 'gpt-5.4', 'input_usd_per_million' => 10, 'output_usd_per_million' => 30, 'tier' => 'premium']);
        $this->usage($client, 'gpt-5.4');
        $user = User::factory()->create(['client_id' => $client->id, 'role' => 'owner']);

        $this->actingAs($user)->get('/console')->assertInertia(fn ($page) => $page->where('recent.0.model', 'OpenAI Premium'));
    }

    public function test_exact_visibility_shows_the_real_model_to_clients_who_are_allowed(): void
    {
        $client = $this->client('exact');
        ModelCatalog::create(['provider' => 'openai', 'model' => 'gpt-5.4', 'input_usd_per_million' => 10, 'output_usd_per_million' => 30, 'tier' => 'premium']);
        $this->usage($client, 'gpt-5.4');
        $user = User::factory()->create(['client_id' => $client->id, 'role' => 'owner']);

        $this->actingAs($user)->get('/console')->assertInertia(fn ($page) => $page->where('recent.0.model', 'gpt-5.4'));
    }

    /** Ledger descriptions are internal ("gateway openai/gpt-5.4") and must not surface. */
    public function test_the_billing_statement_does_not_leak_the_model_via_ledger_detail(): void
    {
        $client = $this->client('aliased');
        $user = User::factory()->create(['client_id' => $client->id, 'role' => 'owner']);

        app(BalanceService::class)->debit(
            $client, 250, 'usage_debit', 'gateway openai/gpt-5.4', 'req:abc', ['tokens_in' => 10],
        );

        $this->actingAs($user)->get('/console/billing')->assertInertia(function ($page) {
            $tx = $page->toArray()['props']['transactions'][0];
            $this->assertSame('Usage — inference', $tx['description']);
            $this->assertSame('', $tx['detail'], 'the raw model id must not reach the client');
        });
    }

    /** A charge-backed usage line carries an admin-authored name, which is safe to show. */
    public function test_a_charge_backed_usage_line_keeps_its_name_on_the_statement(): void
    {
        $client = $this->client('aliased');
        $user = User::factory()->create(['client_id' => $client->id, 'role' => 'owner']);

        app(BalanceService::class)->debit(
            $client, 250, 'usage_debit', 'Nightly batch', 'charge:1:2026-07-11', ['charge_id' => 1, 'kind' => 'usage'],
        );

        $this->actingAs($user)->get('/console/billing')->assertInertia(function ($page) {
            $this->assertSame('Nightly batch', $page->toArray()['props']['transactions'][0]['detail']);
        });
    }

    public function test_a_fee_is_not_labelled_as_inference_usage(): void
    {
        $client = $this->client();
        $user = User::factory()->create(['client_id' => $client->id, 'role' => 'owner']);

        app(BalanceService::class)->apply($client, -500, 'fee', 'Platform fee', 'charge:1:2026-07');

        $this->actingAs($user)->get('/console/billing')->assertInertia(fn ($page) => $page
            ->where('transactions.0.description', 'Platform fee'));
    }

    public function test_the_admin_sees_the_real_model_and_what_the_client_sees(): void
    {
        $client = $this->client('aliased');
        ModelCatalog::create(['provider' => 'openai', 'model' => 'gpt-5.4', 'input_usd_per_million' => 10, 'output_usd_per_million' => 30, 'tier' => 'premium']);
        $this->usage($client, 'gpt-5.4', 1_000);
        AccessKey::generate($client, 'Prod');
        $admin = User::factory()->create(['role' => 'admin', 'client_id' => null]);

        $this->actingAs($admin)->get("/admin/clients/{$client->id}")->assertOk()->assertInertia(fn ($page) => $page
            ->where('perModel.0.model', 'gpt-5.4')
            ->where('perModel.0.client_sees', 'OpenAI Premium')
            ->where('perModel.0.margin_cents', 500));
    }
}
