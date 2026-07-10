<?php

namespace App\Services\Gateway;

use App\Models\AccessKey;
use App\Models\ModelCatalog;
use App\Models\ProviderBackend;
use App\Models\UsageRecord;
use App\Services\Billing\AutoTopupService;
use App\Services\Billing\BalanceService;
use App\Services\Metering\RateResolver;
use App\Services\Pricing\ModelRegistrar;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Throwable;

/**
 * The real-time gateway: proxy a chat request to the right upstream, read exact
 * token usage from the response, apply the client's rate card, debit their
 * balance, record usage, and auto-top-up if they've fallen low. Balance is
 * enforced BEFORE the upstream call (over the debt limit → refused).
 */
class GatewayService
{
    public function __construct(
        private RateResolver $rates,
        private BalanceService $balance,
        private AutoTopupService $topups,
        private OpenAiAdapter $openai,
        private GeminiAdapter $gemini,
        private ModelRegistrar $registrar,
    ) {}

    public function chat(AccessKey $key, array $payload): array
    {
        $client = $key->client;
        if ($client->status !== 'active') {
            throw new GatewayException('account_inactive', 'This account is not active.', 403);
        }
        if ($client->overDebtLimit()) {
            throw new GatewayException('insufficient_balance', 'Your balance is exhausted. Add credit or enable auto top-up to continue.', 402);
        }

        $requested = trim((string) ($payload['model'] ?? ''));
        if ($requested === '') {
            throw new GatewayException('invalid_request', 'A "model" is required.', 400);
        }
        $messages = $payload['messages'] ?? null;
        if (! is_array($messages) || $messages === []) {
            throw new GatewayException('invalid_request', 'A non-empty "messages" array is required.', 400);
        }

        // Optional backend selection: payload.backend or a "vertex/…" model prefix.
        $prefer = $payload['backend'] ?? null;
        $model = $requested;
        foreach (['vertex', 'aistudio', 'openai'] as $b) {
            if (str_starts_with($model, $b.'/')) {
                $prefer = $b;
                $model = substr($model, strlen($b) + 1);
            }
        }

        $catalog = ModelCatalog::where('model', $model)->where('active', true)->first();
        $provider = $catalog?->provider ?? (str_contains($model, 'gemini') ? 'google' : 'openai');

        // A model we've never seen must never bill $0 *and* stay invisible. Register it
        // (pricing it from the cached feed if possible) so it either bills correctly now,
        // or shows up unpriced in the admin catalogue and gets settled by auto-rebill.
        $catalog ??= $this->registrar->ensure($provider, $model);

        $backend = ProviderBackend::pick($provider, $prefer);
        if (! $backend) {
            throw new GatewayException('no_backend', "No active {$provider} backend is configured.", 503);
        }

        $adapter = $backend->provider === 'google' ? $this->gemini : $this->openai;

        $started = microtime(true);
        $result = $adapter->chat($backend, $model, $messages, [
            'temperature' => $payload['temperature'] ?? null,
            'max_tokens' => $payload['max_tokens'] ?? null,
        ]);
        $latencyMs = (int) round((microtime(true) - $started) * 1000);

        // Meter — exact tokens, the client's rate card, one atomic record + debit.
        $providerCost = $catalog ? $catalog->costCents($result->inputTokens, $result->outputTokens) : 0;
        // The gateway is the one place a true request count exists — so the per-request fee applies here.
        $billed = $this->rates->resolve($client, $provider, $model)
            ->billedCents($providerCost, $result->inputTokens, $result->outputTokens, requests: 1);
        $requestId = (string) Str::uuid();

        DB::transaction(function () use ($client, $key, $backend, $result, $model, $provider, $providerCost, $billed, $requestId) {
            UsageRecord::create([
                'client_id' => $client->id,
                'provider_key_id' => null,
                'access_key_id' => $key->id,
                'provider' => $provider,
                'model' => $model,
                'period_start' => now(),
                'period_end' => now(),
                'input_tokens' => $result->inputTokens,
                'output_tokens' => $result->outputTokens,
                'provider_cost_cents' => $providerCost,
                'billed_cents' => $billed,
                'source' => 'gateway',
                'request_id' => $requestId,
            ]);
            if ($billed > 0) {
                $this->balance->debit($client, $billed, 'usage_debit', "gateway {$provider}/{$model}", "req:{$requestId}", [
                    'tokens_in' => $result->inputTokens, 'tokens_out' => $result->outputTokens, 'backend' => $backend->backend,
                ]);
            }
        });

        $key->forceFill(['last_used_at' => now()])->save();

        // Best-effort auto top-up (rate-limited); never blocks the response on failure.
        try {
            if ($client->fresh()->isLow()) {
                $this->topups->maybeTopup($client->fresh());
            }
        } catch (Throwable $e) {
            report($e);
        }

        return [
            'id' => 'oxc_'.$requestId,
            'model' => $model,
            'provider' => $provider,
            'backend' => $backend->backend,
            'content' => $result->content,
            'usage' => ['input_tokens' => $result->inputTokens, 'output_tokens' => $result->outputTokens, 'billed_cents' => $billed],
            'latency_ms' => $latencyMs,
            'request_id' => $requestId,
        ];
    }
}
