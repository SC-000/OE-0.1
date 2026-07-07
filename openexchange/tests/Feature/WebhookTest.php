<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class WebhookTest extends TestCase
{
    use RefreshDatabase;

    public function test_customer_created_webhook_backfills_the_billings_customer_id(): void
    {
        config(['openexchange.billings.webhook_secret' => 'whsec_test']);
        $client = Client::create(['name' => 'Acme', 'slug' => 'acme']);
        User::factory()->create(['client_id' => $client->id, 'email' => 'owner@acme.test']);

        $body = json_encode([
            'id' => 'evt_cust_1',
            'type' => 'customer.created',
            'data' => ['id' => 'cus_ABC', 'email' => 'owner@acme.test', 'external_ref' => 'cus_stripe_xyz'],
        ]);
        $ts = '1700000000';
        $sig = 't='.$ts.',v1='.hash_hmac('sha256', $ts.'.'.$body, 'whsec_test');

        $this->call('POST', '/webhooks/billings', [], [], [], [
            'HTTP_X_BILLINGS_SIGNATURE' => $sig,
            'CONTENT_TYPE' => 'application/json',
        ], $body)->assertOk();

        $this->assertSame('cus_ABC', $client->fresh()->billings_customer_id);
    }

    public function test_payment_method_attached_webhook_saves_the_card(): void
    {
        config(['openexchange.billings.webhook_secret' => 'whsec_test']);
        $client = Client::create(['name' => 'Acme', 'slug' => 'acme', 'billings_customer_id' => 'cus_ABC']);

        $body = json_encode([
            'id' => 'evt_pm_1',
            'type' => 'payment_method.attached',
            'data' => ['id' => 'pm_1', 'customer_id' => 'cus_ABC', 'last4' => '4242', 'card_brand' => 'visa', 'expiry_month' => 12, 'expiry_year' => 2030, 'is_default' => false],
        ]);
        $ts = '1700000000';
        $sig = 't='.$ts.',v1='.hash_hmac('sha256', $ts.'.'.$body, 'whsec_test');

        $this->call('POST', '/webhooks/billings', [], [], [], [
            'HTTP_X_BILLINGS_SIGNATURE' => $sig,
            'CONTENT_TYPE' => 'application/json',
        ], $body)->assertOk();

        $this->assertDatabaseHas('payment_methods', [
            'client_id' => $client->id, 'billings_pm_id' => 'pm_1', 'brand' => 'visa', 'last4' => '4242', 'is_default' => true,
        ]);
    }
}
