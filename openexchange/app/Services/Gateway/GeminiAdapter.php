<?php

namespace App\Services\Gateway;

use App\Models\ProviderBackend;
use App\Services\Providers\GoogleAccessToken;
use Illuminate\Support\Facades\Http;

/**
 * One adapter, both Gemini surfaces — AI Studio (Gemini Developer API, key auth)
 * and Vertex AI (IAM/OAuth). Same request/response shape; token counts come from
 * `usageMetadata`, so metering is exact regardless of backend.
 */
class GeminiAdapter implements ModelAdapter
{
    public function __construct(private GoogleAccessToken $auth) {}

    public function chat(ProviderBackend $backend, string $model, array $messages, array $options = []): AdapterResult
    {
        [$system, $contents] = $this->toGemini($messages);
        $body = array_filter([
            'contents' => $contents,
            'systemInstruction' => $system ? ['parts' => [['text' => $system]]] : null,
            'generationConfig' => array_filter([
                'temperature' => $options['temperature'] ?? null,
                'maxOutputTokens' => $options['max_tokens'] ?? null,
            ], fn ($v) => $v !== null) ?: null,
        ], fn ($v) => $v !== null);

        if ($backend->backend === 'vertex') {
            $creds = json_decode((string) $backend->secret, true) ?: [];
            $token = $this->auth->forScope($creds, 'https://www.googleapis.com/auth/cloud-platform');
            $region = $backend->region ?: 'us-central1';
            $url = "https://{$region}-aiplatform.googleapis.com/v1/projects/{$backend->project_id}/locations/{$region}/publishers/google/models/{$model}:generateContent";
            $req = Http::withToken($token);
        } else { // aistudio
            $url = 'https://generativelanguage.googleapis.com/v1beta/models/'.$model.':generateContent?key='.urlencode((string) $backend->secret);
            $req = Http::acceptJson();
        }

        $res = $req->acceptJson()->timeout(60)->post($url, $body);
        if ($res->failed()) {
            throw new GatewayException('upstream_error', 'Gemini upstream error: '.$res->body(), 502);
        }
        $j = $res->json();

        $content = collect(data_get($j, 'candidates.0.content.parts', []))->pluck('text')->filter()->implode('');
        $input = (int) data_get($j, 'usageMetadata.promptTokenCount', 0);
        $output = (int) data_get($j, 'usageMetadata.candidatesTokenCount', 0);
        if ($output === 0) {
            $output = max(0, (int) data_get($j, 'usageMetadata.totalTokenCount', 0) - $input);
        }

        return new AdapterResult(content: $content, inputTokens: $input, outputTokens: $output, model: $model, raw: (array) $j);
    }

    /** @return array{0:?string,1:array<int,array<string,mixed>>} */
    private function toGemini(array $messages): array
    {
        $system = null;
        $contents = [];
        foreach ($messages as $m) {
            $role = $m['role'] ?? 'user';
            $text = (string) ($m['content'] ?? '');
            if ($role === 'system') {
                $system = trim(($system ? $system."\n" : '').$text);

                continue;
            }
            $contents[] = ['role' => $role === 'assistant' ? 'model' : 'user', 'parts' => [['text' => $text]]];
        }

        return [$system, $contents];
    }
}
