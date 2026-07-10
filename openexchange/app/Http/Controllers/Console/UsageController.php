<?php

namespace App\Http\Controllers\Console;

use App\Models\AccessKey;
use App\Models\ModelCatalog;
use App\Services\Metering\ModelPresenter;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class UsageController
{
    use ClientContext;

    public function __invoke(Request $request, ModelPresenter $presenter): Response
    {
        $client = $this->client($request);
        $monthStart = now()->startOfMonth();
        $mtd = fn () => $client->usageRecords()->where('period_start', '>=', $monthStart);

        $tokens = (int) $mtd()->selectRaw('COALESCE(SUM(input_tokens+output_tokens),0) s')->value('s');
        $spend = (int) $mtd()->sum('billed_cents');
        $requests = $mtd()->count();

        $byProvider = $mtd()->selectRaw('provider, SUM(billed_cents) c')->groupBy('provider')->orderByDesc('c')->get()
            ->map(fn ($r) => ['label' => ModelCatalog::providerLabel($r->provider), 'value' => (int) $r->c])->values();

        $daily = $client->usageRecords()->where('period_start', '>=', now()->subDays(30))
            ->selectRaw('date(period_start) d, SUM(billed_cents) c')->groupBy('d')->orderBy('d')->pluck('c', 'd');
        $dailySpend = array_values(array_map(fn ($c) => round($c / 100, 2), $daily->toArray())) ?: [0];

        // Client-facing breakdown at whatever granularity this client is entitled to.
        // Rows that present under the same label are merged — otherwise the row COUNT
        // leaks the number of distinct models behind a tier.
        $rows = $mtd()->selectRaw('provider, model, COUNT(*) reqs, SUM(input_tokens+output_tokens) toks, SUM(billed_cents) spend')
            ->groupBy('provider', 'model')->get()
            ->map(fn ($r) => ['provider' => $r->provider, 'model' => $r->model, 'reqs' => (int) $r->reqs, 'toks' => (int) $r->toks, 'spend' => (int) $r->spend])
            ->all();

        $table = collect($presenter->group($client, $rows, ['reqs', 'toks', 'spend']))
            ->sortByDesc('spend')
            ->map(fn ($r) => [
                $r['label'], number_format($r['reqs']),
                number_format($r['toks'] / 1_000_000, 2).'M',
                $this->money($r['spend']),
            ])->values();

        $bySource = AccessKey::where('client_id', $client->id)->get()->map(function ($k) use ($client, $monthStart) {
            $s = (int) $client->usageRecords()->where('access_key_id', $k->id)->where('period_start', '>=', $monthStart)->sum('billed_cents');

            return ['label' => $k->name, 'value' => round($s / 100, 2)];
        })->filter(fn ($r) => $r['value'] > 0)->sortByDesc('value')->values();

        return Inertia::render('console/usage', [
            'stats' => [
                'tokens' => number_format($tokens / 1_000_000, 2).'M',
                'requests' => number_format($requests),
                'spend' => $this->money($spend),
                'avg' => $requests ? '$'.number_format(($spend / 100) / $requests, 4) : '$0',
            ],
            'dailySpend' => $dailySpend,
            'byProvider' => $byProvider,
            'bySource' => $bySource,
            'table' => $table,
        ]);
    }
}
