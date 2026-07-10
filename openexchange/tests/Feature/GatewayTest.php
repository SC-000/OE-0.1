<?php

namespace Tests\Feature;

use App\Models\AccessKey;
use App\Models\Client;
use App\Models\ModelCatalog;
use App\Models\ProviderBackend;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class GatewayTest extends TestCase
{
    use RefreshDatabase;

    /** @return array{0:Client,1:string} */
    private function client(int $balance = 10000): array
    {
        $client = Client::create([
            'name' => 'Acme', 'slug' => 'acme-'.uniqid(), 'balance_cents' => $balance,
            'default_markup_bps' => 2500, 'auto_topup' => false,
        ]);
        [, $plain] = AccessKey::generate($client, 'prod');

        return [$client, $plain];
    }

    private function geminiResponse(): array
    {
        return [
            'candidates' => [['content' => ['parts' => [['text' => 'Hello from Gemini.']]]]],
            'usageMetadata' => ['promptTokenCount' => 2_000_000, 'candidatesTokenCount' => 1_000_000, 'totalTokenCount' => 3_000_000],
        ];
    }

    public function test_gemini_via_ai_studio_meters_and_debits(): void
    {
        Http::fake(['generativelanguage.googleapis.com/*' => Http::response($this->geminiResponse())]);
        ModelCatalog::create(['provider' => 'google', 'model' => 'gemini-2.5-flash', 'input_usd_per_million' => 0.075, 'output_usd_per_million' => 0.30]);
        ProviderBackend::create(['provider' => 'google', 'backend' => 'aistudio', 'label' => 'gemini', 'secret' => 'AIza-test', 'status' => 'active']);
        [$client, $plain] = $this->client();

        $res = $this->withToken($plain)->postJson('/v1/chat', ['model' => 'gemini-2.5-flash', 'messages' => [['role' => 'user', 'content' => 'hi']]]);

        $res->assertOk()
            ->assertJsonPath('backend', 'aistudio')
            ->assertJsonPath('usage.input_tokens', 2_000_000)
            // cost 45c x 1.25 = 56.25c, rounded UP to the penny we actually charge.
            ->assertJsonPath('usage.billed_cents', 57);
        $res->assertHeader('X-OX-Backend', 'aistudio');
        $this->assertSame(10000 - 57, $client->fresh()->balance_cents);
        $this->assertDatabaseHas('usage_records', ['source' => 'gateway', 'model' => 'gemini-2.5-flash', 'billed_cents' => 57]);
    }

    public function test_gemini_via_vertex_meters_and_debits(): void
    {
        openssl_pkey_export(openssl_pkey_new(['private_key_bits' => 2048, 'private_key_type' => OPENSSL_KEYTYPE_RSA]), $priv);
        $sa = json_encode(['client_email' => 'svc@p.iam.gserviceaccount.com', 'private_key' => $priv, 'token_uri' => 'https://oauth2.googleapis.test/token']);
        Http::fake([
            'oauth2.googleapis.test/*' => Http::response(['access_token' => 'ya29.test', 'expires_in' => 3600]),
            '*aiplatform.googleapis.com/*' => Http::response($this->geminiResponse()),
        ]);
        ModelCatalog::create(['provider' => 'google', 'model' => 'gemini-2.5-flash', 'input_usd_per_million' => 0.075, 'output_usd_per_million' => 0.30]);
        ProviderBackend::create(['provider' => 'google', 'backend' => 'vertex', 'label' => 'vertex', 'secret' => $sa, 'project_id' => 'proj', 'region' => 'us-central1', 'status' => 'active']);
        [$client, $plain] = $this->client();

        $res = $this->withToken($plain)->postJson('/v1/chat', ['model' => 'gemini-2.5-flash', 'messages' => [['role' => 'user', 'content' => 'hi']]]);

        $res->assertOk()->assertJsonPath('backend', 'vertex')->assertJsonPath('usage.input_tokens', 2_000_000);
        $this->assertSame(10000 - 57, $client->fresh()->balance_cents); // 56.25c rounds up
    }

    public function test_openai_via_gateway_meters_and_debits(): void
    {
        Http::fake(['api.openai.com/*' => Http::response([
            'model' => 'gpt-4o',
            'choices' => [['message' => ['role' => 'assistant', 'content' => 'Hi!']]],
            'usage' => ['prompt_tokens' => 2_000_000, 'completion_tokens' => 1_000_000],
        ])]);
        ModelCatalog::create(['provider' => 'openai', 'model' => 'gpt-4o', 'input_usd_per_million' => 2.5, 'output_usd_per_million' => 10.0]);
        ProviderBackend::create(['provider' => 'openai', 'backend' => 'openai', 'label' => 'openai', 'secret' => 'sk-oe', 'status' => 'active']);
        [$client, $plain] = $this->client();

        $res = $this->withToken($plain)->postJson('/v1/chat', ['model' => 'gpt-4o', 'messages' => [['role' => 'user', 'content' => 'hi']]]);

        $res->assertOk()->assertJsonPath('usage.billed_cents', 1875); // cost 1500c * 1.25
        $this->assertSame(10000 - 1875, $client->fresh()->balance_cents);
    }

    public function test_gateway_refuses_when_over_debt_limit(): void
    {
        Http::fake();
        ModelCatalog::create(['provider' => 'google', 'model' => 'gemini-2.5-flash', 'input_usd_per_million' => 0.075, 'output_usd_per_million' => 0.30]);
        ProviderBackend::create(['provider' => 'google', 'backend' => 'aistudio', 'label' => 'g', 'secret' => 'AIza', 'status' => 'active']);
        [, $plain] = $this->client(balance: -6000); // debt limit default 5000

        $this->withToken($plain)->postJson('/v1/chat', ['model' => 'gemini-2.5-flash', 'messages' => [['role' => 'user', 'content' => 'hi']]])
            ->assertStatus(402)->assertJsonPath('error.code', 'insufficient_balance');
        Http::assertNothingSent();
    }

    public function test_gateway_requires_a_valid_key(): void
    {
        $this->postJson('/v1/chat', ['model' => 'gpt-4o', 'messages' => []])->assertStatus(401);
        $this->withToken('oxk_live_bogus')->postJson('/v1/chat', ['model' => 'gpt-4o', 'messages' => []])->assertStatus(401);
    }
}
