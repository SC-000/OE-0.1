<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\User;
use App\Services\Billing\BillingsClient;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
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
}
