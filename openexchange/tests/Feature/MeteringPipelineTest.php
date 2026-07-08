<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\ModelCatalog;
use App\Models\ProviderKey;
use App\Models\TopUp;
use App\Services\Billing\AutoTopupService;
use App\Services\Metering\MeteringService;
use App\Services\Providers\GoogleUsagePuller;
use App\Services\Providers\OpenAiUsagePuller;
use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Relations\Relation;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class MeteringPipelineTest extends TestCase
{
    use RefreshDatabase;

    private function client(array $opts = []): Client
    {
        return Client::create(array_merge([
            'name' => 'Acme', 'slug' => 'acme-'.uniqid(), 'balance_cents' => 10000,
            'min_balance_cents' => 1000, 'topup_amount_cents' => 5000, 'auto_topup' => true, 'default_markup_bps' => 2500,
        ], $opts));
    }

    public function test_openai_pull_meters_and_debits_idempotently(): void
    {
        Config::set('openexchange.openai.admin_key', 'sk-admin');
        Config::set('openexchange.openai.base', 'https://api.openai.test');
        Http::fake(['api.openai.test/*' => Http::response([
            'data' => [[
                'start_time' => now()->subDay()->timestamp,
                'end_time' => now()->timestamp,
                'results' => [[
                    'model' => 'gpt-4o', 'input_tokens' => 1_000_000, 'output_tokens' => 1_000_000, 'project_id' => 'proj_acme',
                ]],
            ]],
            'has_more' => false,
        ])]);

        $client = $this->client();
        ModelCatalog::create(['provider' => 'openai', 'model' => 'gpt-4o', 'input_usd_per_million' => 2.5, 'output_usd_per_million' => 10.0]);
        $key = ProviderKey::create(['client_id' => $client->id, 'provider' => 'openai', 'label' => 'prod', 'external_project_id' => 'proj_acme', 'status' => 'active']);

        $buckets = app(OpenAiUsagePuller::class)->pull($key, CarbonImmutable::now()->subDays(2), CarbonImmutable::now());
        $this->assertCount(1, $buckets);

        $summary = app(MeteringService::class)->ingest($key, $buckets);

        // provider cost = 2.5 + 10 = $12.50 = 1250c; billed = 1250 * 1.25 = 1563c
        $this->assertSame(1, $summary['metered']);
        $this->assertSame(1563, $summary['billed_cents']);
        $this->assertDatabaseHas('usage_records', ['provider' => 'openai', 'model' => 'gpt-4o', 'billed_cents' => 1563]);
        $this->assertSame(10000 - 1563, $client->fresh()->balance_cents);

        // re-ingest the same window → skipped, no double debit
        $again = app(MeteringService::class)->ingest($key, $buckets);
        $this->assertSame(0, $again['metered']);
        $this->assertSame(1, $again['skipped']);
        $this->assertSame(10000 - 1563, $client->fresh()->balance_cents);
        $this->assertDatabaseCount('usage_records', 1);
    }

    public function test_google_monitoring_pull_parses_token_metrics(): void
    {
        openssl_pkey_export(openssl_pkey_new(['private_key_bits' => 2048, 'private_key_type' => OPENSSL_KEYTYPE_RSA]), $priv);
        Config::set('openexchange.google.credentials', json_encode([
            'client_email' => 'svc@proj.iam.gserviceaccount.com', 'private_key' => $priv, 'token_uri' => 'https://oauth2.googleapis.test/token',
        ]));
        Config::set('openexchange.google.monitoring_base', 'https://monitoring.googleapis.test');
        Config::set('openexchange.google.input_token_metric', 'generativelanguage.googleapis.com/model/input_token_count');
        Config::set('openexchange.google.output_token_metric', 'generativelanguage.googleapis.com/model/output_token_count');

        Http::fake([
            'oauth2.googleapis.test/*' => Http::response(['access_token' => 'ya29.test', 'expires_in' => 3600]),
            'monitoring.googleapis.test/*' => function ($request) {
                $val = str_contains($request->url(), 'input_token') ? 500000 : 200000;

                return Http::response(['timeSeries' => [[
                    'metric' => ['labels' => ['model' => 'gemini-2.5-flash']],
                    'points' => [['interval' => ['startTime' => '2026-07-06T00:00:00Z', 'endTime' => '2026-07-07T00:00:00Z'], 'value' => ['int64Value' => (string) $val]]],
                ]]]);
            },
        ]);

        $client = $this->client();
        ModelCatalog::create(['provider' => 'google', 'model' => 'gemini-2.5-flash', 'input_usd_per_million' => 0.075, 'output_usd_per_million' => 0.30]);
        $key = ProviderKey::create(['client_id' => $client->id, 'provider' => 'google', 'label' => 'gemini', 'external_project_id' => 'gcp-acme', 'status' => 'active']);

        $buckets = app(GoogleUsagePuller::class)->pull($key, CarbonImmutable::parse('2026-07-06'), CarbonImmutable::parse('2026-07-07'));

        $this->assertCount(1, $buckets);
        $this->assertSame('gemini-2.5-flash', $buckets[0]->model);
        $this->assertSame(500000, $buckets[0]->inputTokens);
        $this->assertSame(200000, $buckets[0]->outputTokens);

        app(MeteringService::class)->ingest($key, $buckets);
        $this->assertDatabaseHas('usage_records', ['provider' => 'google', 'model' => 'gemini-2.5-flash', 'input_tokens' => 500000]);
    }

    public function test_auto_topup_charges_card_and_credits_balance_once(): void
    {
        Config::set('openexchange.billings.token', 'srv-token');
        Config::set('openexchange.billings.base', 'https://billings.test');
        Http::fake([
            'billings.test/api/v1/customers*' => Http::response(['data' => ['id' => 'cus_1']]),
            'billings.test/api/v1/invoices/*/finalize' => Http::response(['data' => ['id' => 'inv_1']]),
            'billings.test/api/v1/invoices/*/pay-with-default' => Http::response(['data' => ['transaction' => ['id' => 'txn_1']]]),
            'billings.test/api/v1/invoices' => Http::response(['data' => ['id' => 'inv_1']]),
        ]);

        $client = $this->client(['balance_cents' => 500]); // below the $10 minimum
        $topup = app(AutoTopupService::class)->maybeTopup($client);

        $this->assertNotNull($topup);
        $this->assertSame('succeeded', $topup->status);
        $this->assertSame(500 + 5000, $client->fresh()->balance_cents);
        $this->assertDatabaseHas('balance_ledger', ['type' => 'topup_credit', 'amount_cents' => 5000]);

        // confirming the same top-up again must not double-credit
        app(AutoTopupService::class)->confirmTopup($topup->fresh(), 'txn_1');
        $this->assertSame(500 + 5000, $client->fresh()->balance_cents);
    }

    public function test_auto_topup_is_rate_limited(): void
    {
        Config::set('openexchange.billings.token', 'srv-token');
        Config::set('openexchange.billings.base', 'https://billings.test');
        Http::fake([
            'billings.test/api/v1/customers*' => Http::response(['data' => ['id' => 'cus_1']]),
            'billings.test/api/v1/invoices/*/finalize' => Http::response(['data' => ['id' => 'inv_1']]),
            'billings.test/api/v1/invoices/*/pay-with-default' => Http::response(['data' => ['transaction' => ['id' => 'txn_1']]]),
            'billings.test/api/v1/invoices' => Http::response(['data' => ['id' => 'inv_1']]),
        ]);

        // still below minimum even after a top-up, so only the rate-limit stops a second charge
        $client = $this->client(['balance_cents' => 500, 'topup_amount_cents' => 100]);
        app(AutoTopupService::class)->maybeTopup($client);
        $second = app(AutoTopupService::class)->maybeTopup($client->fresh());

        $this->assertNull($second);
        $this->assertSame(1, TopUp::where('client_id', $client->id)->count());
    }

    public function test_webhook_verifies_signature_and_credits_idempotently(): void
    {
        Config::set('openexchange.billings.webhook_secret', 'whsec_test');
        $client = $this->client(['balance_cents' => 0]);
        $topup = TopUp::create(['client_id' => $client->id, 'amount_cents' => 5000, 'status' => 'pending', 'trigger' => 'auto', 'billings_invoice_id' => 'inv_x']);

        $payload = ['id' => 'evt_1', 'type' => 'payment.succeeded', 'data' => ['invoice' => ['id' => 'inv_x'], 'transaction' => ['id' => 'txn_x']]];
        $raw = json_encode($payload);
        $ts = (string) time();
        $sig = 't='.$ts.',v1='.hash_hmac('sha256', $ts.'.'.$raw, 'whsec_test');

        $ok = $this->call('POST', '/webhooks/billings', [], [], [], ['HTTP_X_BILLINGS_SIGNATURE' => $sig, 'CONTENT_TYPE' => 'application/json'], $raw);
        $ok->assertOk();
        $this->assertSame('succeeded', $topup->fresh()->status);
        $this->assertSame(5000, $client->fresh()->balance_cents);

        // duplicate delivery → deduplicated, no double credit
        $dup = $this->call('POST', '/webhooks/billings', [], [], [], ['HTTP_X_BILLINGS_SIGNATURE' => $sig, 'CONTENT_TYPE' => 'application/json'], $raw);
        $dup->assertOk()->assertJson(['deduplicated' => true]);
        $this->assertSame(5000, $client->fresh()->balance_cents);

        // bad signature → rejected
        $this->call('POST', '/webhooks/billings', [], [], [], ['HTTP_X_BILLINGS_SIGNATURE' => 't=1,v1=deadbeef', 'CONTENT_TYPE' => 'application/json'], $raw)
            ->assertStatus(400);
    }

    protected function setUp(): void
    {
        parent::setUp();
        Relation::morphMap([]); // no-op; keeps static analysers happy
    }
}
