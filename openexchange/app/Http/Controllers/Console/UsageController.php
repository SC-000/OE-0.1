<?php

namespace App\Http\Controllers\Console;

use App\Models\AccessKey;
use App\Models\ModelCatalog;
use App\Services\Metering\ModelPresenter;
use Carbon\CarbonImmutable;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

/**
 * The client's Usage page: where the money went, and whether each unit of work is
 * getting cheaper. Every model identity passes through ModelPresenter — this page must
 * never interpolate `usage_records.model`.
 */
class UsageController
{
    use ClientContext;

    public function __invoke(Request $request, ModelPresenter $presenter): Response
    {
        $client = $this->client($request);
        $now = CarbonImmutable::now();
        $monthStart = $now->startOfMonth();
        $mtd = fn () => $client->usageRecords()->where('period_start', '>=', $monthStart);
        $last30 = fn () => $client->usageRecords()->where('period_start', '>=', $now->subDays(29)->startOfDay());

        $tokens = (int) $mtd()->selectRaw('COALESCE(SUM(input_tokens+output_tokens),0) s')->value('s');
        $tokens30d = (int) $last30()->selectRaw('COALESCE(SUM(input_tokens+output_tokens),0) s')->value('s');
        $spend = (int) $mtd()->sum('billed_cents');
        $requests = $mtd()->count();

        $byProvider = $mtd()->selectRaw('provider, SUM(billed_cents) c')->groupBy('provider')->orderByDesc('c')->get()
            ->map(fn ($r) => ['label' => ModelCatalog::providerLabel($r->provider), 'value' => (int) $r->c])->values();

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
                'label' => $r['label'],
                'requests' => $r['reqs'],
                'tokens' => $r['toks'],
                'spend_cents' => $r['spend'],
                // What a thousand tokens of this actually cost them.
                'per_1k_cents' => $r['toks'] > 0 ? round($r['spend'] / ($r['toks'] / 1000), 4) : null,
                'share_pct' => $spend > 0 ? round($r['spend'] / $spend * 100, 1) : 0.0,
            ])->values();

        $bySource = AccessKey::where('client_id', $client->id)->get()->map(function ($k) use ($client, $monthStart) {
            $s = (int) $client->usageRecords()->where('access_key_id', $k->id)->where('period_start', '>=', $monthStart)->sum('billed_cents');

            return ['label' => $k->name, 'value' => round($s / 100, 2)];
        })->filter(fn ($r) => $r['value'] > 0)->sortByDesc('value')->values();

        return Inertia::render('console/usage', [
            'stats' => [
                'tokens' => $tokens,
                'tokens_30d' => $tokens30d,
                'requests' => $requests,
                'spend_cents' => $spend,
                'per_1k_cents' => $tokens > 0 ? round($spend / ($tokens / 1000), 4) : null,
            ],
            'daily' => $this->daily($client, $now, 30),
            'byProvider' => $byProvider,
            'bySource' => $bySource,
            'table' => $table,
            'activity' => $this->activity($client, $presenter, $request),
            'period' => ['label' => $now->format('F Y'), 'day' => $now->day, 'days' => $now->daysInMonth],
        ]);
    }

    /**
     * Daily spend AND daily unit cost. The second series is the one worth watching: if
     * $/1k tokens is trending down, the customer is getting more work per pound.
     *
     * @return array{labels:list<string>, spend:list<float>, per_1k:list<float|null>}
     */
    private function daily($client, CarbonImmutable $now, int $days): array
    {
        $from = $now->subDays($days - 1)->startOfDay();
        $rows = $client->usageRecords()->where('period_start', '>=', $from)
            ->selectRaw('date(period_start) d, SUM(billed_cents) c, SUM(input_tokens+output_tokens) t')
            ->groupBy('d')->get()->keyBy('d');

        $labels = [];
        $spend = [];
        $per1k = [];
        for ($i = 0; $i < $days; $i++) {
            $day = $from->addDays($i)->format('Y-m-d');
            $r = $rows->get($day);
            $cents = (int) ($r->c ?? 0);
            $toks = (int) ($r->t ?? 0);

            $labels[] = $day;
            $spend[] = round($cents / 100, 2);
            $per1k[] = $toks > 0 ? round($cents / ($toks / 1000), 4) : null;
        }

        return ['labels' => $labels, 'spend' => $spend, 'per_1k' => $per1k];
    }

    /**
     * The accrual log: each metered increment, newest first. Usage arrives as many small
     * amounts, and showing them as they land is the honest way to present that — a
     * running record the customer can reconcile, not a total that appears from nowhere.
     *
     * @return array<string, mixed>
     */
    private function activity($client, ModelPresenter $presenter, Request $request): array
    {
        $perPage = max(10, min(100, (int) $request->query('activity_per_page', 25)));
        $page = max(1, (int) $request->query('activity_page', 1));

        $paginator = $client->usageRecords()
            ->orderByDesc('updated_at')
            ->orderByDesc('id')
            ->paginate($perPage, ['*'], 'activity_page', $page)
            ->withQueryString();

        $items = $paginator->getCollection()
            ->map(function ($u) use ($client, $presenter) {
                $at = $this->activityTime($u);

                return [
                    'id' => (int) $u->id,
                    'at' => $at->format('M j, H:i'),
                    'ago' => $at->diffForHumans(short: true),
                    'label' => $presenter->label($client, $u->provider, $u->model),
                    'window' => $this->activityWindow($u),
                    'kind' => $this->activityKind($u),
                    'input_tokens' => (int) $u->input_tokens,
                    'output_tokens' => (int) $u->output_tokens,
                    'billed_cents' => (int) $u->billed_cents,
                    // Gateway rows are one request each; a pulled bucket aggregates a window.
                    'source' => $u->source === 'gateway' ? 'request' : ($u->source === 'manual' ? 'adjustment' : 'rollup'),
                ];
            });

        return [
            'items' => $items->all(),
            'page' => $paginator->currentPage(),
            'last_page' => $paginator->lastPage(),
            'per_page' => $paginator->perPage(),
            'total' => $paginator->total(),
            'from' => $paginator->firstItem(),
            'to' => $paginator->lastItem(),
        ];
    }

    private function activityKind($usage): string
    {
        if ($usage->source === 'gateway') {
            return 'Request';
        }

        if ($usage->source === 'manual') {
            return 'Adjustment';
        }

        $minutes = max(1, (int) $usage->period_start->diffInMinutes($usage->period_end));

        if ($minutes >= 1380 && $minutes <= 1500) {
            return 'Daily rollup';
        }

        if ($minutes < 60) {
            return "{$minutes}-min rollup";
        }

        if ($minutes % 60 === 0) {
            return ($minutes / 60).'h rollup';
        }

        return 'Provider rollup';
    }

    private function activityWindow($usage): string
    {
        if ($usage->source === 'gateway') {
            return 'Single request';
        }

        if ($usage->source === 'manual' || $usage->period_start->equalTo($usage->period_end)) {
            return 'Point adjustment';
        }

        if ($usage->period_start->isSameDay($usage->period_end)) {
            return $usage->period_start->format('M j, H:i').' - '.$usage->period_end->format('H:i');
        }

        return $usage->period_start->format('M j, H:i').' - '.$usage->period_end->format('M j, H:i');
    }

    private function activityTime($usage): CarbonImmutable
    {
        $time = $usage->source === 'pull'
            ? ($usage->updated_at ?? $usage->created_at ?? $usage->period_start)
            : $usage->period_start;

        return CarbonImmutable::parse($time);
    }
}
