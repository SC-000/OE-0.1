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
 * The client's Overview.
 *
 * The design brief here is trust, not persuasion. A customer who can predict their bill
 * spends more, and keeps spending; a customer who feels the number was made to look
 * small churns the moment they do the arithmetic. So: the balance is prominent, the
 * projection is honest about being an estimate, and the one genuinely persuasive figure
 * — unit cost falling over time — is computed from real usage, not asserted.
 *
 * Nothing on this page is invented. (The previous version hard-coded "99.98% uptime".)
 */
class DashboardController
{
    use ClientContext;

    public function __invoke(Request $request, ModelPresenter $presenter): Response
    {
        $client = $this->client($request);
        $now = CarbonImmutable::now();
        $monthStart = $now->startOfMonth();

        $mtd = fn () => $client->usageRecords()->where('period_start', '>=', $monthStart);
        $spendMtd = (int) $mtd()->sum('billed_cents');
        $tokensMtd = (int) $mtd()->selectRaw('COALESCE(SUM(input_tokens + output_tokens),0) s')->value('s');
        $requests = (int) $mtd()->count();

        // Last full calendar month, for an honest month-on-month comparison.
        $lastMonthStart = $monthStart->subMonth();
        $lastMonth = $client->usageRecords()->whereBetween('period_start', [$lastMonthStart, $monthStart]);
        $spendLast = (int) (clone $lastMonth)->sum('billed_cents');
        $tokensLast = (int) (clone $lastMonth)->selectRaw('COALESCE(SUM(input_tokens + output_tokens),0) s')->value('s');

        $daysElapsed = max(1, $now->day);
        $projected = (int) round($spendMtd / $daysElapsed * $now->daysInMonth);

        // Runway: the question every prepaid customer actually has. Based on the last 14
        // days of real spend, not the month-to-date average, so a quiet start to the
        // month doesn't flatter it.
        $burn = (int) $client->usageRecords()->where('period_start', '>=', $now->subDays(14))->sum('billed_cents');
        $dailyBurn = $burn / 14;
        $runwayDays = $dailyBurn > 0 ? (int) floor(max(0, $client->balance_cents) / $dailyBurn) : null;

        $hasCard = $client->paymentMethods()->exists();

        return Inertia::render('console/overview', [
            'account' => [
                'name' => $client->name,
                // Stable, non-sequential account code (derived from the id, not the id itself).
                'id' => 'OX-'.(10000 + (int) (hexdec(substr(md5('ox:'.$client->id), 0, 6)) % 90000)),
                'type' => 'Metered · pay-as-you-go',
                'since' => $client->created_at?->format('M Y') ?? $now->format('M Y'),
            ],

            'balance' => [
                'cents' => $client->balance_cents,
                'low_threshold_cents' => $client->min_balance_cents,
                'topup_cents' => $client->topup_amount_cents,
                'auto_topup' => (bool) $client->auto_topup,
                'has_card' => $hasCard,
                'runway_days' => $runwayDays,
                'daily_burn_cents' => (int) round($dailyBurn),
            ],

            'spend' => [
                'mtd_cents' => $spendMtd,
                'projected_cents' => $projected,
                'last_month_cents' => $spendLast,
                'delta_pct' => $this->delta($projected, $spendLast),
                'days_elapsed' => $daysElapsed,
                'days_in_month' => $now->daysInMonth,
                'requests' => $requests,
                'tokens' => $tokensMtd,
            ],

            // The one honest growth lever: show the unit cost, and whether it is falling.
            // If it isn't, we say so rather than hiding the comparison.
            'efficiency' => [
                'per_1k_cents' => $this->per1k($spendMtd, $tokensMtd),
                'per_1k_last_month_cents' => $this->per1k($spendLast, $tokensLast),
                'delta_pct' => $this->delta((int) round($this->per1k($spendMtd, $tokensMtd) ?? 0), (int) round($this->per1k($spendLast, $tokensLast) ?? 0)),
                'models_available' => ModelCatalog::where('active', true)->where('client_visible', true)->count(),
                'providers' => ModelCatalog::where('active', true)->distinct()->count('provider'),
            ],

            'daily' => $this->dailySeries($client, $now, 30),
            'alerts' => $this->alerts($client, $projected, $runwayDays, $hasCard),
            'sources' => $this->sources($client, $monthStart, $spendMtd),

            // Every metered line, most recent first — the running record of what accrued.
            'recent' => $client->usageRecords()->orderByDesc('period_start')->limit(8)->get()->map(fn ($u) => [
                // Never render `$u->model` straight out — ModelPresenter decides how much
                // of the model identity this client is entitled to see.
                'model' => $presenter->label($client, $u->provider, $u->model),
                'provider' => ModelCatalog::providerLabel($u->provider),
                'tokens' => (int) ($u->input_tokens + $u->output_tokens),
                'billed_cents' => (int) $u->billed_cents,
                'at' => $u->period_start->diffForHumans(short: true),
            ]),
        ]);
    }

    /** @return list<array{date:string, cents:int}> */
    private function dailySeries($client, CarbonImmutable $now, int $days): array
    {
        $from = $now->subDays($days - 1)->startOfDay();
        $rows = $client->usageRecords()->where('period_start', '>=', $from)
            ->selectRaw('date(period_start) d, SUM(billed_cents) c')
            ->groupBy('d')->pluck('c', 'd');

        $out = [];
        for ($i = 0; $i < $days; $i++) {
            $day = $from->addDays($i)->format('Y-m-d');
            $out[] = ['date' => $day, 'cents' => (int) ($rows[$day] ?? 0)];
        }

        return $out;
    }

    /** @return list<array<string, mixed>> */
    private function sources($client, CarbonImmutable $monthStart, int $total): array
    {
        return AccessKey::where('client_id', $client->id)->where('status', 'active')->get()
            ->map(function ($k) use ($client, $monthStart, $total) {
                $spend = (int) $client->usageRecords()->where('access_key_id', $k->id)->where('period_start', '>=', $monthStart)->sum('billed_cents');

                return [
                    'label' => $k->name,
                    'spend_cents' => $spend,
                    'share_pct' => $total > 0 ? round($spend / $total * 100, 1) : 0.0,
                ];
            })->sortByDesc('spend_cents')->take(5)->values()->all();
    }

    /**
     * Things the customer should act on, stated plainly. No urgency theatre — an account
     * that is fine says so, and an account about to stop working says exactly why.
     *
     * @return list<array{tone:string, title:string, body:string}>
     */
    private function alerts($client, int $projected, ?int $runwayDays, bool $hasCard): array
    {
        $alerts = [];

        if ($client->balance_cents < 0) {
            $alerts[] = [
                'tone' => 'danger',
                'title' => 'Your balance is negative',
                'body' => 'Requests keep working until you reach your credit limit. Add funds to avoid interruption.',
            ];
        }

        if (! $hasCard) {
            $alerts[] = [
                'tone' => $client->auto_topup ? 'danger' : 'warning',
                'title' => 'No payment method on file',
                'body' => $client->auto_topup
                    ? 'Auto top-up is on but has no card to charge, so it cannot run.'
                    : 'Add a card to enable auto top-up and avoid running out mid-request.',
            ];
        } elseif (! $client->auto_topup && $runwayDays !== null && $runwayDays <= 7) {
            $alerts[] = [
                'tone' => 'warning',
                'title' => $runwayDays === 0 ? 'Your balance runs out today' : "About {$runwayDays} days of balance left",
                'body' => 'Auto top-up is off, so requests will stop when the balance is exhausted.',
            ];
        }

        if ($client->auto_topup && $hasCard && $projected > $client->balance_cents) {
            $alerts[] = [
                'tone' => 'info',
                'title' => 'Auto top-up will run this month',
                'body' => sprintf(
                    'At your current rate you will pass your $%s minimum and we will add $%s automatically.',
                    number_format($client->min_balance_cents / 100, 2),
                    number_format($client->topup_amount_cents / 100, 2),
                ),
            ];
        }

        return $alerts;
    }

    /** Cents per 1,000 tokens. Null when there's nothing to divide. */
    private function per1k(int $cents, int $tokens): ?float
    {
        return $tokens > 0 ? round($cents / ($tokens / 1000), 4) : null;
    }

    private function delta(int $now, int $before): ?float
    {
        return $before > 0 ? round((($now - $before) / $before) * 100, 1) : null;
    }
}
