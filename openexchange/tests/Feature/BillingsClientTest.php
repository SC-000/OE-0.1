<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\User;
use App\Services\Billing\AutoTopupService;
use App\Services\Billing\BillingsClient;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Tests\TestCase;

class BillingsClientTest extends TestCase
{
    use RefreshDatabase;

    public function test_mutating_requests_send_an_idempotency_key(): void
    {
        config(['openexchange.billings.token' => 'test_token', 'openexchange.billings.base' => 'https://billings.test']);
        Http::fake(function ($request) {
            if (str_contains($request->url(), '/invoices')) {
                return Http::response(['data' => ['id' => 'inv_1']], 200);
            }
            // Email search returns none → forces the create POST this test checks.
            if ($request->method() === 'GET') {
                return Http::response(['data' => ['data' => []]], 200);
            }

            return Http::response(['data' => ['id' => 'cus_1']], 201);
        });

        $client = Client::create(['name' => 'X', 'slug' => 'x']);
        $billings = app(BillingsClient::class);
        $billings->ensureCustomer($client);
        $billings->createInvoice('cus_1', 5000, 'Top-up', 'topup_9');

        // Every POST (create customer, create invoice) must carry the header.
        Http::assertSent(fn ($r) => $r->method() === 'POST' && str_contains($r->url(), '/customers') && $r->hasHeader('Idempotency-Key'));
        Http::assertSent(fn ($r) => $r->method() === 'POST' && str_contains($r->url(), '/invoices') && $r->hasHeader('Idempotency-Key'));
    }

    public function test_ensure_customer_recovers_an_existing_customer_by_email(): void
    {
        config(['openexchange.billings.token' => 'test_token', 'openexchange.billings.base' => 'https://billings.test']);
        $client = Client::create(['name' => 'X', 'slug' => 'x']);
        User::factory()->create(['client_id' => $client->id, 'email' => 'owner@x.test']);
        // billings returns a paginated list: data.data[]
        Http::fake([
            '*/customers*' => Http::response(['data' => ['data' => [['id' => 'cus_existing', 'email' => 'owner@x.test']], 'total' => 1]], 200),
        ]);

        $id = app(BillingsClient::class)->ensureCustomer($client);

        $this->assertSame('cus_existing', $id);
        $this->assertSame('cus_existing', $client->fresh()->billings_customer_id);
        // It recovered via email search — no duplicate create.
        Http::assertNotSent(fn ($r) => $r->method() === 'POST' && str_contains($r->url(), '/customers'));
    }

    public function test_saving_a_card_funds_the_balance_when_below_minimum(): void
    {
        config(['openexchange.billings.token' => 't', 'openexchange.billings.publishable' => 'p', 'openexchange.billings.base' => 'https://billings.test']);
        Mail::fake();
        $client = Client::create([
            'name' => 'X', 'slug' => 'x', 'balance_cents' => 0, 'min_balance_cents' => 1000,
            'topup_amount_cents' => 1000, 'billings_customer_id' => 'cus_1', 'auto_topup' => true,
        ]);
        $user = User::factory()->create(['client_id' => $client->id, 'role' => 'owner']);
        Http::fake([
            '*/invoices/*/finalize' => Http::response(['data' => ['id' => 'inv_1']], 200),
            '*/invoices/*/pay-with-default' => Http::response(['data' => ['transaction' => ['id' => 'txn_1']]], 200),
            '*/invoices' => Http::response(['data' => ['id' => 'inv_1']], 201),
        ]);

        $this->actingAs($user)->post('/console/billing/card', [
            'payment_method_id' => 'pm_1', 'brand' => 'visa', 'last4' => '4242', 'exp_month' => 12, 'exp_year' => 2030,
        ]);

        // Adding a card charged the $10 top-up and funded the balance.
        $this->assertSame(1000, $client->fresh()->balance_cents);
    }

    public function test_topup_clears_a_negative_balance_in_one_charge(): void
    {
        config(['openexchange.billings.token' => 't', 'openexchange.billings.publishable' => 'p', 'openexchange.billings.base' => 'https://billings.test']);
        Mail::fake();
        $client = Client::create([
            'name' => 'X', 'slug' => 'x', 'balance_cents' => -22191, 'min_balance_cents' => 1000,
            'topup_amount_cents' => 1000, 'billings_customer_id' => 'cus_1', 'auto_topup' => true,
        ]);
        User::factory()->create(['client_id' => $client->id, 'role' => 'owner']);
        Http::fake([
            '*/invoices/*/finalize' => Http::response(['data' => ['id' => 'inv_1']], 200),
            '*/invoices/*/pay-with-default' => Http::response(['data' => ['transaction' => ['id' => 'txn_1']]], 200),
            '*/invoices' => Http::response(['data' => ['id' => 'inv_1']], 201),
        ]);

        app(AutoTopupService::class)->topup($client, 'manual');

        // deficit 22191 + topup 1000 = 23191 charged; balance -22191 + 23191 = 1000.
        $this->assertSame(1000, $client->fresh()->balance_cents);
        Http::assertSent(fn ($r) => $r->method() === 'POST' && str_ends_with((string) parse_url($r->url(), PHP_URL_PATH), '/invoices') && (int) data_get($r->data(), 'items.0.unit_amount') === 23191);
    }
}
