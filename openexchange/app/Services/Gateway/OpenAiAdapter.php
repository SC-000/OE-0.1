<?php

namespace App\Services\Gateway;

use App\Models\ProviderBackend;
use Illuminate\Support\Facades\Http;

class OpenAiAdapter implements ModelAdapter
{
    public function chat(ProviderBackend $backend, string $model, array $messages, array $options = []): AdapterResult
    {
        $base = rtrim((string) config('openexchange.openai.base', 'https://api.openai.com'), '/');

        $res = Http::withToken((string) $backend->secret)->acceptJson()->timeout(60)->post($base.'/v1/chat/completions', array_filter([
            'model' => $model,
            'messages' => $messages,
            'temperature' => $options['temperature'] ?? null,
            'max_tokens' => $options['max_tokens'] ?? null,
        ], fn ($v) => $v !== null));

        if ($res->failed()) {
            throw new GatewayException('upstream_error', 'OpenAI upstream error: '.$res->body(), 502);
        }
        $j = $res->json();

        return new AdapterResult(
            content: (string) (data_get($j, 'choices.0.message.content') ?? ''),
            inputTokens: (int) data_get($j, 'usage.prompt_tokens', 0),
            outputTokens: (int) data_get($j, 'usage.completion_tokens', 0),
            model: (string) data_get($j, 'model', $model),
            raw: (array) $j,
        );
    }
}
