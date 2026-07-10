<?php

namespace App\Services\Providers;

use App\Models\ProviderKey;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Http;
use RuntimeException;

/**
 * Pulls token usage from the OpenAI Organization Usage API, scoped to a single
 * project (one project per client → clean per-client attribution).
 * Requires an organization Admin key (config openexchange.openai.admin_key).
 *
 * @see https://platform.openai.com/docs/api-reference/usage
 */
class OpenAiUsagePuller
{
    /** @return UsageBucket[] */
    public function pull(ProviderKey $key, CarbonImmutable $since, CarbonImmutable $until): array
    {
        // An inverted or empty window is a caller bug, not something to ask the provider
        // about — it answers 400 and the whole pull fails.
        if ($since->gte($until)) {
            return [];
        }

        $adminKey = config('openexchange.openai.admin_key');
        if (! $adminKey) {
            throw new RuntimeException('OPENAI_ADMIN_KEY is not configured.');
        }
        $base = rtrim((string) config('openexchange.openai.base'), '/');

        $buckets = [];
        $page = null;
        $guard = 0;

        do {
            $params = array_filter([
                'start_time' => $since->getTimestamp(),
                'end_time' => $until->getTimestamp(),
                'bucket_width' => '1d',
                'group_by' => ['model'],
                'project_ids' => $key->external_project_id ? [$key->external_project_id] : null,
                'limit' => 31,
                'page' => $page,
            ], fn ($v) => $v !== null);

            $res = Http::withToken($adminKey)
                ->acceptJson()
                ->retry(2, 250)
                ->get($base.'/v1/organization/usage/completions', $params);

            if ($res->failed()) {
                throw new RuntimeException('OpenAI usage API error '.$res->status().': '.$res->body());
            }

            foreach ((array) $res->json('data', []) as $bucket) {
                $start = CarbonImmutable::createFromTimestamp($bucket['start_time'] ?? $since->getTimestamp());
                $end = CarbonImmutable::createFromTimestamp($bucket['end_time'] ?? $until->getTimestamp());
                foreach ((array) ($bucket['results'] ?? []) as $r) {
                    $input = (int) ($r['input_tokens'] ?? 0);
                    $output = (int) ($r['output_tokens'] ?? 0);
                    if ($input === 0 && $output === 0) {
                        continue;
                    }
                    $buckets[] = new UsageBucket(
                        provider: 'openai',
                        model: (string) ($r['model'] ?? 'unknown'),
                        periodStart: $start,
                        periodEnd: $end,
                        inputTokens: $input,
                        outputTokens: $output,
                    );
                }
            }

            $page = $res->json('has_more') ? $res->json('next_page') : null;
        } while ($page && ++$guard < 50);

        return $buckets;
    }
}
