<?php

namespace App\Http\Controllers\Console;

use App\Models\ModelCatalog;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController
{
    use ClientContext;

    public function __invoke(Request $request): Response
    {
        $client = $this->client($request);
        $monthStart = now()->startOfMonth();

        $mtd = fn () => $client->usageRecords()->where('period_start', '>=', $monthStart);
        $spendMtd = (int) $mtd()->sum('billed_cents');
        $tokensMtd = (int) $mtd()->selectRaw('COALESCE(SUM(input_tokens + output_tokens),0) s')->value('s');
        $requests = (int) $mtd()->count();

        // Run-rate projection + a "normal range" vs the client's own trailing average.
        $daysElapsed = max(1, now()->day);
        $projected = (int) round($spendMtd / $daysElapsed * now()->daysInMonth);
        $trailing = (int) $client->usageRecords()->where('period_start', '>=', now()->subDays(30))->sum('billed_cents');

        [$rangeStatus, $rangeNote] = $this->range($projected, $trailing);
        $blended = $tokensMtd > 0 ? '$'.number_format(($spendMtd / 100) / ($tokensMtd / 1000), 4) : '—';

        $sources = \App\Models\AccessKey::where('client_id', $client->id)->where('status', 'active')->get()->map(function ($k) use ($monthStart, $client) {
            $usage = (int) $client->usageRecords()->where('access_key_id', $k->id)->where('period_start', '>=', $monthStart)->sum('billed_cents');

            return ['label' => $k->name, 'provider' => 'Gateway', 'usage' => '$'.number_format($usage / 100, 2), 'usageCents' => $usage];
        })->sortByDesc('usageCents')->take(4)->values();

        $recent = $client->usageRecords()->orderByDesc('period_start')->limit(5)->get()->map(fn ($u) => [
            'model' => $u->model, 'provider' => ucfirst($u->provider),
            'tokens' => number_format($u->input_tokens + $u->output_tokens),
            'billed' => $this->money($u->billed_cents), 'date' => $u->period_start->format('M j'),
        ]);

        return Inertia::render('console/overview', [
            'account' => [
                'name' => $client->name,
                // Stable, non-sequential account code (derived from the id, not the id itself).
                'id' => 'OX-'.(10000 + (int) (hexdec(substr(md5('ox:'.$client->id), 0, 6)) % 90000)),
                'type' => 'Metered · pay-as-you-go',
                'since' => $client->created_at?->format('M Y') ?? now()->format('M Y'),
            ],
            'balance' => $this->money($client->balance_cents),
            'balanceCents' => $client->balance_cents,
            'lowThreshold' => $this->money($client->min_balance_cents),
            'autoTopup' => (bool) $client->auto_topup,
            'value' => [
                'spendMtd' => $this->money($spendMtd),
                'projected' => $this->money($projected),
                'requests' => number_format($requests),
                'tokens' => $tokensMtd >= 1_000_000 ? number_format($tokensMtd / 1_000_000, 2).'M' : number_format($tokensMtd),
                'blendedRate' => $blended,
                'modelsAvailable' => ModelCatalog::where('active', true)->count(),
                'providers' => (int) $client->providerKeys()->distinct('provider')->count('provider'),
                'uptime' => '99.98%',
            ],
            'range' => ['status' => $rangeStatus, 'note' => $rangeNote, 'projected' => $this->money($projected), 'typical' => $this->money($trailing)],
            'sources' => $sources,
            'recent' => $recent,
        ]);
    }

    /** @return array{0:string,1:string} */
    private function range(int $projected, int $trailing): array
    {
        if ($trailing < 500) {
            return ['baseline', 'We’re still establishing your baseline — a normal-range indicator appears after a few days of usage.'];
        }
        $ratio = $projected / max(1, $trailing);
        if ($ratio > 1.25) {
            return ['high', 'Projected spend is running above your recent average — worth a glance, but nothing unusual for a busy month.'];
        }
        if ($ratio < 0.75) {
            return ['low', 'Projected spend is below your recent average this month.'];
        }

        return ['normal', 'Your projected spend is right in line with your typical usage. Everything looks healthy.'];
    }
}
