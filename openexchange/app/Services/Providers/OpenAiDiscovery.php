<?php

namespace App\Services\Providers;

use Carbon\CarbonImmutable;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use RuntimeException;

/**
 * Discovers the projects (and their key counts + usage) that already exist in your
 * OpenAI organization via the Admin API, so an admin can assign them to clients
 * instead of hand-entering keys. Auth is the single org Admin key.
 */
class OpenAiDiscovery
{
    private function http(): PendingRequest
    {
        $key = config('openexchange.openai.admin_key');
        if (! $key) {
            throw new RuntimeException('OPENAI_ADMIN_KEY is not configured — add an organization admin key to discover projects.');
        }

        return Http::withToken($key)->acceptJson()->timeout(30)->retry(2, 300, throw: false);
    }

    private function base(): string
    {
        return rtrim((string) config('openexchange.openai.base', 'https://api.openai.com'), '/');
    }

    /** Every project in the org. @return list<array{id:string,name:string,status:string,created:?int}> */
    public function projects(): array
    {
        $out = [];
        $after = null;
        $guard = 0;
        do {
            $res = $this->http()->get($this->base().'/v1/organization/projects', array_filter([
                'limit' => 100,
                'after' => $after,
            ], fn ($v) => $v !== null));
            if ($res->failed()) {
                throw new RuntimeException('OpenAI projects API '.$res->status().': '.mb_substr($res->body(), 0, 200));
            }
            foreach ((array) $res->json('data', []) as $p) {
                $out[] = [
                    'id' => (string) ($p['id'] ?? ''),
                    'name' => (string) ($p['name'] ?? $p['id'] ?? ''),
                    'status' => (string) ($p['status'] ?? 'active'),
                    'created' => isset($p['created_at']) ? (int) $p['created_at'] : null,
                ];
            }
            $after = $res->json('has_more') ? $res->json('last_id') : null;
        } while ($after && ++$guard < 50);

        return $out;
    }

    /** Number of active API keys in a project (best-effort — never throws). */
    public function apiKeyCount(string $projectId): int
    {
        try {
            $res = $this->http()->get($this->base()."/v1/organization/projects/{$projectId}/api_keys", ['limit' => 100]);

            return $res->ok() ? count((array) $res->json('data', [])) : 0;
        } catch (\Throwable) {
            return 0;
        }
    }

    /**
     * Token usage per project over a window (best-effort — returns [] on API error).
     * @return array<string,array{input:int,output:int}> keyed by project_id
     */
    public function usageByProject(CarbonImmutable $since, CarbonImmutable $until): array
    {
        $out = [];
        $page = null;
        $guard = 0;
        do {
            $res = $this->http()->get($this->base().'/v1/organization/usage/completions', array_filter([
                'start_time' => $since->getTimestamp(),
                'end_time' => $until->getTimestamp(),
                'bucket_width' => '1d',
                'group_by' => ['project_id'],
                'limit' => 31,
                'page' => $page,
            ], fn ($v) => $v !== null));
            if ($res->failed()) {
                break;
            }
            foreach ((array) $res->json('data', []) as $bucket) {
                foreach ((array) ($bucket['results'] ?? []) as $r) {
                    $pid = (string) ($r['project_id'] ?? 'unknown');
                    $out[$pid] ??= ['input' => 0, 'output' => 0];
                    $out[$pid]['input'] += (int) ($r['input_tokens'] ?? 0);
                    $out[$pid]['output'] += (int) ($r['output_tokens'] ?? 0);
                }
            }
            $page = $res->json('has_more') ? $res->json('next_page') : null;
        } while ($page && ++$guard < 50);

        return $out;
    }

    /**
     * Daily token totals per project over a window (for usage-over-time sparklines).
     * @return array<string,array<string,int>> project_id => [ 'YYYY-MM-DD' => tokens ]
     */
    public function usageDaily(CarbonImmutable $since, CarbonImmutable $until): array
    {
        $series = [];
        $page = null;
        $guard = 0;
        do {
            $res = $this->http()->get($this->base().'/v1/organization/usage/completions', array_filter([
                'start_time' => $since->getTimestamp(),
                'end_time' => $until->getTimestamp(),
                'bucket_width' => '1d',
                'group_by' => ['project_id'],
                'limit' => 31,
                'page' => $page,
            ], fn ($v) => $v !== null));
            if ($res->failed()) {
                break;
            }
            foreach ((array) $res->json('data', []) as $bucket) {
                $day = CarbonImmutable::createFromTimestamp((int) ($bucket['start_time'] ?? $since->getTimestamp()))->format('Y-m-d');
                foreach ((array) ($bucket['results'] ?? []) as $r) {
                    $pid = (string) ($r['project_id'] ?? 'unknown');
                    $tok = (int) ($r['input_tokens'] ?? 0) + (int) ($r['output_tokens'] ?? 0);
                    $series[$pid][$day] = ($series[$pid][$day] ?? 0) + $tok;
                }
            }
            $page = $res->json('has_more') ? $res->json('next_page') : null;
        } while ($page && ++$guard < 50);

        return $series;
    }
}
