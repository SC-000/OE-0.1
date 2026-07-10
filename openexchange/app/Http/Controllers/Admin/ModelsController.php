<?php

namespace App\Http\Controllers\Admin;

use App\Models\ClientModelRate;
use App\Models\ModelCatalog;
use App\Models\ModelPriceProposal;
use App\Models\UsageRecord;
use App\Services\Admin\AuditLogger;
use App\Services\Metering\ResolvedRate;
use App\Services\Pricing\ModelPricingService;
use App\Services\Pricing\ModelRegistrar;
use App\Services\Pricing\ModelSyncService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ModelsController
{
    public function __construct(
        private AuditLogger $audit,
        private ModelPricingService $pricing,
    ) {}

    public function index(): Response
    {
        $monthStart = now()->startOfMonth();

        // MTD volume + realised margin per model, so pricing decisions are made next
        // to the traffic they affect rather than in the abstract.
        $usage = UsageRecord::where('period_start', '>=', $monthStart)
            ->selectRaw('provider, model, SUM(billed_cents) rev, SUM(provider_cost_cents) cost, SUM(input_tokens+output_tokens) toks, COUNT(*) n')
            ->groupBy('provider', 'model')->get()->keyBy(fn ($r) => $r->provider.'|'.$r->model);

        $overrides = ClientModelRate::whereNull('client_id')->whereNotNull('model')->get()->keyBy(fn ($r) => $r->provider.'|'.$r->model);

        // Usage that metered with NO cost basis — the money currently on the floor.
        // Aggregated onto the BASE model, because dated snapshots re-bill with their parent.
        $outstanding = [];
        $rows = UsageRecord::where('provider_cost_cents', 0)
            ->whereRaw('(input_tokens + output_tokens) > 0')
            ->selectRaw('provider, model, COUNT(*) n, SUM(input_tokens) tin, SUM(output_tokens) tout, SUM(billed_cents) billed')
            ->groupBy('provider', 'model')->get();
        foreach ($rows as $r) {
            $key = $r->provider.'|'.ModelRegistrar::baseModel($r->model);
            $outstanding[$key]['n'] = ($outstanding[$key]['n'] ?? 0) + (int) $r->n;
            $outstanding[$key]['tin'] = ($outstanding[$key]['tin'] ?? 0) + (int) $r->tin;
            $outstanding[$key]['tout'] = ($outstanding[$key]['tout'] ?? 0) + (int) $r->tout;
            $outstanding[$key]['billed'] = ($outstanding[$key]['billed'] ?? 0) + (int) $r->billed;
        }

        $catalog = ModelCatalog::orderBy('provider')->orderBy('model')->get()->map(function ($m) use ($usage, $overrides, $outstanding) {
            $u = $usage->get($m->provider.'|'.$m->model);
            $ov = $overrides->get($m->provider.'|'.$m->model);
            $rev = (int) ($u->rev ?? 0);
            $cost = (int) ($u->cost ?? 0);
            $pending = $outstanding[$m->provider.'|'.$m->model] ?? null;

            // What this model's unbilled usage would cost us at the current price — the
            // floor on what re-billing recovers (revenue is that plus each client's markup).
            $recoverable = $pending && $m->isPriced() ? $m->costCents((int) $pending['tin'], (int) $pending['tout']) : 0;

            return [
                'id' => $m->id,
                'provider' => $m->provider,
                'provider_label' => ModelCatalog::providerLabel($m->provider),
                'model' => $m->model,
                'alias' => $m->display_alias,
                'client_label' => $m->clientLabel(),
                'tier' => $m->tier,
                'in' => (float) $m->input_usd_per_million,
                'out' => (float) $m->output_usd_per_million,
                'active' => (bool) $m->active,
                'client_visible' => (bool) $m->client_visible,
                'price_source' => $m->price_source,
                'feed_in' => $m->feed_input_usd_per_million !== null ? (float) $m->feed_input_usd_per_million : null,
                'feed_out' => $m->feed_output_usd_per_million !== null ? (float) $m->feed_output_usd_per_million : null,
                'feed_synced_at' => $m->feed_synced_at?->diffForHumans(),
                'priced' => $m->isPriced(),
                'first_seen' => $m->first_seen_at?->format('M j, Y'),
                'rate' => $ov ? ResolvedRate::fromRow($ov)->label() : null,
                'rate_id' => $ov?->id,
                'revenue_cents' => $rev,
                'cost_cents' => $cost,
                'margin_cents' => $rev - $cost,
                'markup_pct' => $cost > 0 ? round((($rev - $cost) / $cost) * 100, 1) : null,
                'tokens' => (int) ($u->toks ?? 0),
                'requests' => (int) ($u->n ?? 0),

                // Usage sitting with no cost basis, waiting on a price + re-bill.
                'unbilled_records' => (int) ($pending['n'] ?? 0),
                'unbilled_tokens' => (int) (($pending['tin'] ?? 0) + ($pending['tout'] ?? 0)),
                'recoverable_cents' => $recoverable,
                'has_feed_price' => $m->feed_input_usd_per_million !== null,
            ];
        });

        $proposals = ModelPriceProposal::with('model')->where('status', 'pending')->latest()->get()->map(fn ($p) => [
            'id' => $p->id,
            'provider' => $p->model->provider,
            'model' => $p->model->model,
            'current_in' => (float) $p->current_input_usd_per_million,
            'current_out' => (float) $p->current_output_usd_per_million,
            'proposed_in' => (float) $p->proposed_input_usd_per_million,
            'proposed_out' => (float) $p->proposed_output_usd_per_million,
            'delta_pct' => $p->deltaPct(),
            'source' => $p->source,
            'at' => $p->created_at->diffForHumans(),
            // A cost rise with a markup rate card silently eats margin; a cost fall is free money.
            'impact' => $p->deltaPct() > 0 ? 'cost_up' : 'cost_down',
        ]);

        return Inertia::render('admin/models', [
            'catalog' => $catalog,
            'proposals' => $proposals,
            'tiers' => ['premium', 'standard', 'lite'],
            'providers' => ModelCatalog::distinct()->orderBy('provider')->pluck('provider'),
            'lastSync' => ModelCatalog::max('feed_synced_at'),
            'feedSource' => 'openrouter',
            // The headline the admin must not be able to miss.
            'exposure' => [
                'unpriced_models' => $catalog->where('priced', false)->where('unbilled_records', '>', 0)->count(),
                'unbilled_records' => (int) $catalog->sum('unbilled_records'),
                'recoverable_cents' => (int) $catalog->sum('recoverable_cents'),
                'ready_to_rebill' => $catalog->where('priced', true)->where('unbilled_records', '>', 0)->count(),
            ],
        ]);
    }

    /** Add a model by hand (or re-price one). An admin price outranks every feed. */
    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'provider' => ['required', 'string', 'max:40'],
            'model' => ['required', 'string', 'max:120'],
            'input' => ['required', 'numeric', 'min:0', 'max:100000'],
            'output' => ['required', 'numeric', 'min:0', 'max:100000'],
        ]);

        $model = ModelCatalog::firstOrNew(['provider' => $data['provider'], 'model' => $data['model']]);
        $model->active = true;

        // Setting a price also settles any usage that already metered against it at $0.
        $settled = $this->pricing->setManualPrice($model, (float) $data['input'], (float) $data['output']);

        $this->audit->log('model.store', null, "Priced {$model->provider}/{$model->model} at \${$data['input']}/\${$data['output']} per 1M");
        $this->auditRebill($model, $settled);

        return back()->with('flash', $this->pricedMessage($model, $settled));
    }

    /** Pull this model's price straight from the feed, then settle its unbilled usage. */
    public function priceFromFeed(ModelCatalog $model, ModelRegistrar $registrar): RedirectResponse
    {
        if (! $registrar->priceFromCachedFeed($model)) {
            return back()->with('flash', [
                'type' => 'error',
                'message' => "No feed price for {$model->model}. Run “Sync now” to refresh the feed, or set the price by hand.",
            ]);
        }

        $settled = $this->pricing->settle($model->refresh());

        $this->audit->log('model.price_from_feed', null, sprintf(
            '%s/%s priced from feed at $%s/$%s per 1M',
            $model->provider, $model->model, $model->input_usd_per_million, $model->output_usd_per_million,
        ));
        $this->auditRebill($model, $settled);

        return back()->with('flash', $this->pricedMessage($model, $settled));
    }

    /** Re-bill this model's usage that metered without a cost basis. */
    public function rebill(ModelCatalog $model): RedirectResponse
    {
        if (! $model->isPriced()) {
            return back()->with('flash', ['type' => 'error', 'message' => "{$model->model} has no price yet — nothing to re-bill it at."]);
        }

        $settled = $this->pricing->settle($model);
        $this->auditRebill($model, $settled);

        return back()->with('flash', $settled['rebilled'] > 0
            ? ['type' => 'success', 'message' => $this->settledText($settled)]
            : ['type' => 'info', 'message' => "Nothing outstanding for {$model->model} — all of its usage already has a cost basis."]);
    }

    /** Edit cost basis + availability. Marks the price as manual so sync won't touch it. */
    public function update(Request $request, ModelCatalog $model): RedirectResponse
    {
        $data = $request->validate([
            'input' => ['required', 'numeric', 'min:0', 'max:100000'],
            'output' => ['required', 'numeric', 'min:0', 'max:100000'],
            'active' => ['required', 'boolean'],
        ]);

        $changed = abs((float) $model->input_usd_per_million - (float) $data['input']) > 1e-9
            || abs((float) $model->output_usd_per_million - (float) $data['output']) > 1e-9;

        $model->active = (bool) $data['active'];

        if (! $changed) {
            $model->save();

            return back();
        }

        $settled = $this->pricing->setManualPrice($model, (float) $data['input'], (float) $data['output']);

        $this->audit->log('model.reprice', null, "{$model->provider}/{$model->model} cost basis set to \${$data['input']}/\${$data['output']} per 1M");
        $this->auditRebill($model, $settled);

        return back()->with('flash', $this->pricedMessage($model, $settled));
    }

    /** Control what the client is told this model is. */
    public function presentation(Request $request, ModelCatalog $model): RedirectResponse
    {
        $data = $request->validate([
            'display_alias' => ['nullable', 'string', 'max:60'],
            'tier' => ['nullable', Rule::in(['premium', 'standard', 'lite'])],
            'client_visible' => ['required', 'boolean'],
        ]);

        $model->update($data);
        $this->audit->log('model.presentation', null, "{$model->provider}/{$model->model} shown to clients as \"{$model->clientLabel()}\"");

        return back();
    }

    /** Re-tier every model from its current price band (after a bulk re-price). */
    public function retier(): RedirectResponse
    {
        $n = 0;
        foreach (ModelCatalog::cursor() as $m) {
            if (! $m->isPriced()) {
                continue;
            }
            $tier = ModelCatalog::tierFor($m->blendedUsdPerMillion());
            if ($m->tier !== $tier) {
                $m->forceFill(['tier' => $tier])->save();
                $n++;
            }
        }

        $this->audit->log('model.retier', null, "Re-tiered {$n} model(s) from their price bands");

        return back()->with('flash', ['type' => 'success', 'message' => "Re-tiered {$n} model(s) from their price bands."]);
    }

    public function sync(Request $request, ModelSyncService $sync): RedirectResponse
    {
        try {
            $stats = $sync->sync(importFeed: $request->boolean('import_feed'));
        } catch (\Throwable $e) {
            return back()->with('flash', ['type' => 'error', 'message' => 'Sync failed: '.mb_substr($e->getMessage(), 0, 160)]);
        }

        $this->audit->log('model.sync', null, sprintf(
            'added=%d auto-priced=%d proposed=%d rebilled=%d', $stats['added'], $stats['priced'], $stats['proposed'], $stats['rebilled'],
        ), $stats);

        $parts = [sprintf('%d new, %d auto-priced, %d change(s) to review.', $stats['added'], $stats['priced'], $stats['proposed'])];
        if ($stats['rebilled'] > 0) {
            $parts[] = sprintf('Settled %d usage record(s) that had metered at $0 — net $%s.', $stats['rebilled'], number_format($stats['rebilled_cents'] / 100, 2));
        }
        if ($stats['errors'] !== []) {
            $parts[] = 'Warnings: '.implode('; ', $stats['errors']);
        }

        return back()->with('flash', ['type' => $stats['errors'] === [] ? 'success' : 'info', 'message' => implode(' ', $parts)]);
    }

    public function acceptProposal(ModelPriceProposal $proposal, ModelSyncService $sync, Request $request): RedirectResponse
    {
        $model = $proposal->model;
        $summary = "{$model->provider}/{$model->model} cost basis → \${$proposal->proposed_input_usd_per_million}/\${$proposal->proposed_output_usd_per_million} ({$proposal->deltaPct()}%)";

        // Accepting also re-bills anything that metered against this model without a cost basis.
        $settled = $sync->acceptProposal($proposal, $request->user()->id);

        $this->audit->log('price.accept', null, $summary);
        $this->auditRebill($model, $settled);

        return back()->with('flash', $this->pricedMessage($model->fresh(), $settled));
    }

    public function rejectProposal(ModelPriceProposal $proposal, ModelSyncService $sync, Request $request): RedirectResponse
    {
        $model = $proposal->model;
        $sync->rejectProposal($proposal, $request->user()->id);
        $this->audit->log('price.reject', null, "Rejected feed price for {$model->provider}/{$model->model}");

        return back()->with('flash', [
            'type' => 'info',
            'message' => "Kept your price for {$model->model}. This exact feed price won't be proposed again.",
        ]);
    }

    /** @param  array{rebilled:int,billed_cents:int,credited:int}  $settled */
    private function auditRebill(ModelCatalog $model, array $settled): void
    {
        if ($settled['rebilled'] === 0) {
            return;
        }

        $this->audit->log('metering.rebill', null, sprintf(
            'Auto re-billed %d record(s) for %s/%s — net $%s',
            $settled['rebilled'], $model->provider, $model->model, number_format($settled['billed_cents'] / 100, 2),
        ), $settled);
    }

    /** @param  array{rebilled:int,billed_cents:int,credited:int}  $settled */
    private function pricedMessage(ModelCatalog $model, array $settled): array
    {
        $base = sprintf('%s priced at $%s / $%s per 1M.', $model->model, $model->input_usd_per_million, $model->output_usd_per_million);

        return [
            'type' => 'success',
            'message' => $settled['rebilled'] > 0 ? $base.' '.$this->settledText($settled) : $base,
        ];
    }

    /** @param  array{rebilled:int,billed_cents:int,credited:int}  $settled */
    private function settledText(array $settled): string
    {
        $net = $settled['billed_cents'];
        $amount = '$'.number_format(abs($net) / 100, 2);
        $verb = $net >= 0 ? 'billed' : 'credited back';

        $text = "Re-billed {$settled['rebilled']} usage record(s) that had no cost basis — {$verb} {$amount}.";
        if ($settled['credited'] > 0 && $net >= 0) {
            $text .= " {$settled['credited']} line(s) were refunded.";
        }

        return $text;
    }
}
