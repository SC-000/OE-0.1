<?php

namespace App\Services\Admin;

use App\Models\Client;
use App\Models\ModelCatalog;
use App\Models\ModelPriceProposal;
use App\Models\TopUp;
use App\Models\UsageRecord;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;

/**
 * The numbers that tell you whether this business is working.
 *
 * Everything is derived from usage_records, which stores both what a line COST us
 * (provider_cost_cents) and what we BILLED for it (billed_cents). Margin is the gap.
 */
class CommercialMetrics
{
    private const SERIES_RANGES = [
        '24h' => ['label' => '24h', 'hours' => 24, 'bucket' => 'hour'],
        '7d' => ['label' => '7d', 'hours' => 168, 'bucket' => 'hour'],
        '30d' => ['label' => '30d', 'days' => 30, 'bucket' => 'day'],
        '90d' => ['label' => '90d', 'days' => 90, 'bucket' => 'day'],
    ];

    private CarbonImmutable $monthStart;

    public function __construct()
    {
        $this->monthStart = CarbonImmutable::now()->startOfMonth();
    }

    /** Headline P&L for the month to date, plus a run-rate projection. */
    public function overview(): array
    {
        $mtd = $this->totals($this->monthStart);
        $prev = $this->totals($this->monthStart->subMonth(), $this->monthStart);

        $dayOfMonth = max(1, CarbonImmutable::now()->day);
        $daysInMonth = CarbonImmutable::now()->daysInMonth;
        $projected = (int) round($mtd['revenue'] / $dayOfMonth * $daysInMonth);
        $projectedMargin = (int) round($mtd['margin'] / $dayOfMonth * $daysInMonth);

        return [
            'revenue_cents' => $mtd['revenue'],
            'cost_cents' => $mtd['cost'],
            'margin_cents' => $mtd['margin'],
            'margin_pct' => $this->pct($mtd['margin'], $mtd['revenue']),
            // What you actually realised, vs what the rate cards say you should.
            'effective_markup_pct' => $mtd['cost'] > 0 ? round(($mtd['margin'] / $mtd['cost']) * 100, 1) : null,
            'projected_revenue_cents' => $projected,
            'projected_margin_cents' => $projectedMargin,
            'revenue_delta_pct' => $this->delta($mtd['revenue'], $prev['revenue']),
            'margin_delta_pct' => $this->delta($mtd['margin'], $prev['margin']),
            'requests' => $mtd['requests'],
            'tokens' => $mtd['tokens'],
            // Blended sell price per 1k tokens — the number to quote in a sales call.
            'blended_per_1k' => $mtd['tokens'] > 0 ? round(($mtd['revenue'] / 100) / ($mtd['tokens'] / 1000), 4) : null,
        ];
    }

    /** Available time windows for the P&L chart. */
    public function seriesOptions(): array
    {
        $options = [];
        foreach (self::SERIES_RANGES as $value => $config) {
            $options[] = [
                'value' => $value,
                'label' => $config['label'],
                'granularity' => $config['bucket'] === 'hour' ? 'Hourly' : 'Daily',
            ];
        }

        return $options;
    }

    /** Revenue / cost / margin over a selectable time window. */
    public function series(string|int $range = '30d'): array
    {
        $range = $this->normalizeSeriesRange($range);
        $config = self::SERIES_RANGES[$range];
        $bucket = $config['bucket'];
        $buckets = $bucket === 'hour' ? $config['hours'] : $config['days'];
        $from = $bucket === 'hour'
            ? CarbonImmutable::now()->subHours($buckets - 1)->startOfHour()
            : CarbonImmutable::now()->subDays($buckets - 1)->startOfDay();

        $rows = UsageRecord::query()
            ->where('period_start', '>=', $from)
            ->selectRaw($this->seriesBucketExpression($bucket).' bucket, SUM(billed_cents) rev, SUM(provider_cost_cents) cost')
            ->groupBy('bucket')
            ->orderBy('bucket')
            ->get()
            ->keyBy('bucket');

        $revenue = [];
        $cost = [];
        $margin = [];
        $labels = [];
        for ($i = 0; $i < $buckets; $i++) {
            $at = $bucket === 'hour' ? $from->addHours($i) : $from->addDays($i);
            $label = $at->format($bucket === 'hour' ? 'Y-m-d H:00' : 'Y-m-d');
            $r = $rows->get($label);
            $rev = (int) ($r->rev ?? 0);
            $costCents = self::cents($r->cost ?? 0);

            $labels[] = $label;
            $revenue[] = round($rev / 100, 2);
            $cost[] = round($costCents / 100, 2);
            $margin[] = round(($rev - $costCents) / 100, 2);
        }

        return [
            'range' => $range,
            'bucket' => $bucket,
            'granularity' => $bucket === 'hour' ? 'hourly' : 'daily',
            'labels' => $labels,
            'revenue' => $revenue,
            'cost' => $cost,
            'margin' => $margin,
        ];
    }

    /**
     * Where you are losing money, ranked by how much.
     *
     * Three distinct failures, deliberately not merged — each has a different fix:
     *   unpriced    — the model has no cost basis, so it bills at $0. Fix: price it.
     *   below_cost  — you bill less than the provider charges you. Fix: the rate card.
     *   thin        — positive but under the floor you'd accept. Fix: the rate card.
     */
    public function marginLeaks(int $thinMarkupPct = 5): array
    {
        $rows = UsageRecord::query()
            ->where('period_start', '>=', $this->monthStart)
            ->selectRaw('provider, model, SUM(billed_cents) rev, SUM(provider_cost_cents) cost, SUM(input_tokens+output_tokens) toks, COUNT(*) n')
            ->groupBy('provider', 'model')
            ->havingRaw('SUM(input_tokens+output_tokens) > 0')
            ->get();

        $leaks = [];
        foreach ($rows as $r) {
            $rev = (int) $r->rev;
            $cost = self::cents($r->cost);
            $markup = $cost > 0 ? (($rev - $cost) / $cost) * 100 : null;

            $kind = match (true) {
                $cost === 0 && $rev === 0 => 'unpriced',
                $rev < $cost => 'below_cost',
                $markup !== null && $markup < $thinMarkupPct => 'thin',
                default => null,
            };
            if (! $kind) {
                continue;
            }

            $leaks[] = [
                'provider' => $r->provider,
                'model' => $r->model,
                'kind' => $kind,
                'revenue_cents' => $rev,
                'cost_cents' => $cost,
                'margin_cents' => $rev - $cost,
                'markup_pct' => $markup !== null ? round($markup, 1) : null,
                'tokens' => (int) $r->toks,
                'records' => (int) $r->n,
                // For unpriced models the exposure isn't the (zero) margin — it's the
                // revenue you never billed. Rank on that instead.
                'impact_cents' => $kind === 'unpriced' ? $this->wouldHaveBilled($r->provider, $r->model, (int) $r->toks) : $cost - $rev,
            ];
        }

        usort($leaks, fn ($a, $b) => $b['impact_cents'] <=> $a['impact_cents']);

        return $leaks;
    }

    /** Revenue + margin by model, most profitable first. */
    public function topModels(int $limit = 10): array
    {
        return UsageRecord::query()
            ->where('period_start', '>=', $this->monthStart)
            ->selectRaw('provider, model, SUM(billed_cents) rev, SUM(provider_cost_cents) cost, SUM(input_tokens+output_tokens) toks, COUNT(*) n')
            ->groupBy('provider', 'model')
            ->orderByRaw('SUM(billed_cents) - SUM(provider_cost_cents) DESC')
            ->limit($limit)->get()
            ->map(fn ($r) => [
                'provider' => $r->provider,
                'model' => $r->model,
                'revenue_cents' => (int) $r->rev,
                'cost_cents' => self::cents($r->cost),
                'margin_cents' => (int) $r->rev - self::cents($r->cost),
                'margin_pct' => $this->pct((int) $r->rev - self::cents($r->cost), (int) $r->rev),
                'tokens' => (int) $r->toks,
                'requests' => (int) $r->n,
            ])->all();
    }

    /** Revenue + margin by client, with each client's share of total revenue. */
    public function clientPerformance(): array
    {
        $rows = UsageRecord::query()
            ->where('period_start', '>=', $this->monthStart)
            ->selectRaw('client_id, SUM(billed_cents) rev, SUM(provider_cost_cents) cost')
            ->groupBy('client_id')->get()->keyBy('client_id');

        $total = max(1, (int) $rows->sum('rev'));

        return Client::orderBy('name')->get()->map(function ($c) use ($rows, $total) {
            $r = $rows->get($c->id);
            $rev = (int) ($r->rev ?? 0);
            $cost = self::cents($r->cost ?? 0);

            return [
                'id' => $c->id,
                'name' => $c->name,
                'revenue_cents' => $rev,
                'cost_cents' => $cost,
                'margin_cents' => $rev - $cost,
                'margin_pct' => $this->pct($rev - $cost, $rev),
                'share_pct' => round($rev / $total * 100, 1),
                'balance_cents' => $c->balance_cents,
                'markup_pct' => round($c->default_markup_bps / 100, 1),
            ];
        })->sortByDesc('revenue_cents')->values()->all();
    }

    /**
     * Accounts that will cost you money if left alone. Ordered by urgency:
     * already in debt > will go into debt (low, no way to top up) > no card at all.
     */
    public function collectionRisk(): array
    {
        $risks = [];

        foreach (Client::with('paymentMethods')->get() as $c) {
            $hasCard = $c->paymentMethods->isNotEmpty();

            $reason = match (true) {
                $c->balance_cents < 0 => 'in_debt',
                $c->isLow() && ! $c->auto_topup => 'low_no_autotopup',
                $c->isLow() && ! $hasCard => 'low_no_card',
                ! $hasCard && $c->status === 'active' => 'no_card',
                default => null,
            };
            if (! $reason) {
                continue;
            }

            $risks[] = [
                'id' => $c->id, 'name' => $c->name, 'reason' => $reason,
                'balance_cents' => $c->balance_cents, 'has_card' => $hasCard,
                'auto_topup' => (bool) $c->auto_topup,
                'exposure_cents' => max(0, -$c->balance_cents),
            ];
        }

        $order = ['in_debt' => 0, 'low_no_autotopup' => 1, 'low_no_card' => 2, 'no_card' => 3];
        usort($risks, fn ($a, $b) => [$order[$a['reason']], -$a['exposure_cents']] <=> [$order[$b['reason']], -$b['exposure_cents']]);

        return $risks;
    }

    /**
     * Clients whose last 7 days ran materially below the 7 before. The earliest
     * signal you get that an account is drifting — long before they cancel.
     */
    public function churnSignals(float $dropThreshold = 0.4): array
    {
        $now = CarbonImmutable::now();
        $recent = $this->spendByClient($now->subDays(7), $now);
        $prior = $this->spendByClient($now->subDays(14), $now->subDays(7));

        $out = [];
        foreach ($prior as $clientId => $before) {
            if ($before < 500) {
                continue; // too small to read anything into
            }
            $after = $recent[$clientId] ?? 0;
            $drop = 1 - ($after / $before);
            if ($drop < $dropThreshold) {
                continue;
            }

            $out[] = [
                'id' => $clientId,
                'name' => Client::find($clientId)?->name ?? '—',
                'prior_cents' => $before,
                'recent_cents' => $after,
                'drop_pct' => round($drop * 100, 1),
            ];
        }

        usort($out, fn ($a, $b) => $b['prior_cents'] <=> $a['prior_cents']);

        return $out;
    }

    /** Things needing a human decision, for the admin dashboard's action list. */
    public function attention(): array
    {
        return [
            'pending_proposals' => ModelPriceProposal::where('status', 'pending')->count(),
            'unpriced_models' => ModelCatalog::where('active', true)
                ->where('input_usd_per_million', 0)->where('output_usd_per_million', 0)->count(),
            'failed_topups_7d' => TopUp::where('status', 'failed')->where('created_at', '>=', CarbonImmutable::now()->subDays(7))->count(),
            'suspended_clients' => Client::where('status', 'suspended')->count(),
            'untiered_models' => ModelCatalog::where('active', true)->whereNull('tier')->count(),
        ];
    }

    /** @return array<int,int> client_id => billed cents */
    private function spendByClient(CarbonImmutable $from, CarbonImmutable $to): array
    {
        return UsageRecord::whereBetween('period_start', [$from, $to])
            ->selectRaw('client_id, SUM(billed_cents) c')->groupBy('client_id')
            ->pluck('c', 'client_id')->map(fn ($v) => (int) $v)->all();
    }

    private function totals(CarbonImmutable $from, ?CarbonImmutable $to = null): array
    {
        $q = UsageRecord::where('period_start', '>=', $from);
        if ($to) {
            $q->where('period_start', '<', $to);
        }

        $row = $q->selectRaw('COALESCE(SUM(billed_cents),0) rev, COALESCE(SUM(provider_cost_cents),0) cost, COALESCE(SUM(input_tokens+output_tokens),0) toks, COUNT(*) n')->first();

        return [
            'revenue' => (int) $row->rev,
            'cost' => self::cents($row->cost),
            'margin' => (int) $row->rev - self::cents($row->cost),
            'tokens' => (int) $row->toks,
            'requests' => (int) $row->n,
        ];
    }

    /** What an unpriced model's traffic would have billed at its catalogue price today. */
    private function wouldHaveBilled(string $provider, string $model, int $tokens): int
    {
        $catalog = ModelCatalog::where('provider', $provider)->where('model', $model)->first();
        if (! $catalog || ! $catalog->isPriced()) {
            return 0;
        }

        // Blended midpoint — we don't have the in/out split at this aggregation level.
        return (int) round(($tokens / 1_000_000) * ($catalog->blendedUsdPerMillion() / 2) * 100);
    }

    /**
     * `usage_records.provider_cost_cents` is DECIMAL(18,6), so SUM() comes back
     * fractional. Casting straight to int truncates 0.9c to 0c — round it.
     */
    private static function cents(mixed $value): int
    {
        return (int) round((float) $value);
    }

    private function normalizeSeriesRange(string|int $range): string
    {
        if (is_int($range)) {
            $range = $range.'d';
        }

        return array_key_exists($range, self::SERIES_RANGES) ? $range : '30d';
    }

    private function seriesBucketExpression(string $bucket): string
    {
        $driver = DB::connection()->getDriverName();

        return match ($driver) {
            'sqlite' => $bucket === 'hour'
                ? "strftime('%Y-%m-%d %H:00', period_start)"
                : 'date(period_start)',
            'pgsql' => $bucket === 'hour'
                ? "to_char(date_trunc('hour', period_start), 'YYYY-MM-DD HH24:00')"
                : "to_char(period_start::date, 'YYYY-MM-DD')",
            default => $bucket === 'hour'
                ? "DATE_FORMAT(period_start, '%Y-%m-%d %H:00')"
                : 'DATE(period_start)',
        };
    }

    private function pct(int $part, int $whole): ?float
    {
        return $whole > 0 ? round($part / $whole * 100, 1) : null;
    }

    private function delta(int $now, int $before): ?float
    {
        return $before > 0 ? round((($now - $before) / $before) * 100, 1) : null;
    }
}
