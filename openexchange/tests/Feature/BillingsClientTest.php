<?php

namespace Tests\Feature;

use App\Models\Client;
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
        Http::fake([
            '*/customers*' => Http::response(['data' => ['id' => 'cus_1']], 200),
            '*/invoices' => Http::response(['data' => ['id' => 'inv_1']], 200),
        ]);

        $client = Client::create(['name' => 'X', 'slug' => 'x']);
        $billings = app(BillingsClient::class);
        $billings->ensureCustomer($client);
        $billings->createInvoice('cus_1', 5000, 'Top-up', 'topup_9');

        // Every POST (create customer, create invoice) must carry the header.
        Http::assertSent(fn ($r) => $r->method() === 'POST' && str_contains($r->url(), '/customers') && $r->hasHeader('Idempotency-Key'));
        Http::assertSent(fn ($r) => $r->method() === 'POST' && str_contains($r->url(), '/invoices') && $r->hasHeader('Idempotency-Key'));
    }
}
