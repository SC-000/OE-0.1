<?php

namespace App\Services\Providers;

use App\Models\ProviderKey;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Http;
use RuntimeException;

/**
 * Pulls Gemini token usage from Google Cloud Monitoring for a single GCP project
 * (one project per client). Sums the input/output token metrics grouped by model
 * over daily windows. Provider cost is derived from the model catalog downstream.
 */
class GoogleUsagePuller
{
    public function __construct(private GoogleAccessToken $auth) {}

    /** @return UsageBucket[] */
    public function pull(ProviderKey $key, CarbonImmutable $since, CarbonImmutable $until): array
    {
        $credentials = $this->credentials();
        $project = $key->external_project_id;
        if (! $project) {
            throw new RuntimeException("Google provider key #{$key->id} has no GCP project id.");
        }

        $token = $this->auth->forScope($credentials, 'https://www.googleapis.com/auth/monitoring.read');
        $base = rtrim((string) config('openexchange.google.monitoring_base'), '/');
        $modelLabel = (string) config('openexchange.google.model_label', 'model');

        $inputSeries = $this->timeSeries($base, $project, $token, (string) config('openexchange.google.input_token_metric'), $modelLabel, $since, $until);
        $outputSeries = $this->timeSeries($base, $project, $token, (string) config('openexchange.google.output_token_metric'), $modelLabel, $since, $until);

        // merge by model+window
        $merged = [];
        foreach ($inputSeries as $k => $row) {
            $merged[$k] = ['model' => $row['model'], 'start' => $row['start'], 'end' => $row['end'], 'in' => $row['value'], 'out' => 0];
        }
        foreach ($outputSeries as $k => $row) {
            if (! isset($merged[$k])) {
                $merged[$k] = ['model' => $row['model'], 'start' => $row['start'], 'end' => $row['end'], 'in' => 0, 'out' => 0];
            }
            $merged[$k]['out'] = $row['value'];
        }

        $buckets = [];
        foreach ($merged as $m) {
            if ($m['in'] === 0 && $m['out'] === 0) {
                continue;
            }
            $buckets[] = new UsageBucket(
                provider: 'google',
                model: $m['model'],
                periodStart: $m['start'],
                periodEnd: $m['end'],
                inputTokens: $m['in'],
                outputTokens: $m['out'],
            );
        }

        return $buckets;
    }

    /** @return array<string, array{model:string,start:CarbonImmutable,end:CarbonImmutable,value:int}> */
    private function timeSeries(string $base, string $project, string $token, string $metric, string $modelLabel, CarbonImmutable $since, CarbonImmutable $until): array
    {
        $res = Http::withToken($token)->acceptJson()->retry(2, 250)->get(
            $base."/v3/projects/{$project}/timeSeries",
            [
                'filter' => 'metric.type="'.$metric.'"',
                'interval.startTime' => $since->toIso8601ZuluString(),
                'interval.endTime' => $until->toIso8601ZuluString(),
                'aggregation.alignmentPeriod' => '86400s',
                'aggregation.perSeriesAligner' => 'ALIGN_SUM',
                'aggregation.groupByFields' => 'metric.label."'.$modelLabel.'"',
                'aggregation.crossSeriesReducer' => 'REDUCE_SUM',
            ]
        );

        if ($res->failed()) {
            throw new RuntimeException('Google Monitoring error '.$res->status().': '.$res->body());
        }

        $out = [];
        foreach ((array) $res->json('timeSeries', []) as $series) {
            $model = $series['metric']['labels'][$modelLabel] ?? 'gemini';
            foreach ((array) ($series['points'] ?? []) as $p) {
                $start = CarbonImmutable::parse($p['interval']['startTime'] ?? $since);
                $end = CarbonImmutable::parse($p['interval']['endTime'] ?? $until);
                $value = (int) ($p['value']['int64Value'] ?? $p['value']['doubleValue'] ?? 0);
                $k = $model.'|'.$start->toDateTimeString();
                $out[$k] = ['model' => $model, 'start' => $start, 'end' => $end, 'value' => ($out[$k]['value'] ?? 0) + $value];
            }
        }

        return $out;
    }

    private function credentials(): array
    {
        $raw = (string) config('openexchange.google.credentials');
        if ($raw === '') {
            throw new RuntimeException('GOOGLE_CREDENTIALS_JSON is not configured.');
        }
        if (! str_starts_with(trim($raw), '{')) {
            $raw = (string) file_get_contents($raw); // treat as a path
        }
        $creds = json_decode($raw, true);
        if (! is_array($creds)) {
            throw new RuntimeException('Google credentials could not be parsed as JSON.');
        }

        return $creds;
    }
}
