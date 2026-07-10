<?php

namespace App\Http\Controllers\Admin;

use App\Models\ClientModelRate;
use App\Models\ModelCatalog;
use App\Models\ModelPriceProposal;
use App\Models\UsageRecord;
use App\Services\Admin\AuditLogger;
use App\Services\Metering\ResolvedRate;
use App\Services\Pricing\ModelSyncService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ModelsController
{
    public function __construct(private AuditLogger $audit) {}

    public function index(): Response
    {
        $monthStart = now()->startOfMonth();

        // MTD volume + realised margin per model, so pricing decisions are made next
        // to the traffic they affect rather than in the abstract.
        $usage = UsageRecord::where('period_start', '>=', $monthStart)
            ->selectRaw('provider, model, SUM(billed_cents) rev, SUM(provider_cost_cents) cost, SUM(input_tokens+output_tokens) toks, COUNT(*) n')
            ->groupBy('provider', 'model')->get()->keyBy(fn ($r) => $r->provider.'|'.$r->model);

        $overrides = ClientModelRate::whereNull('client_id')->whereNotNull('model')->get()->keyBy(fn ($r) => $r->provider.'|'.$r->model);

        $catalog = ModelCatalog::orderBy('provider')->orderBy('model')->get()->map(function ($m) use ($usage, $overrides) {
            $u = $usage->get($m->provider.'|'.$m->model);
            $ov = $overrides->get($m->provider.'|'.$m->model);
            $rev = (int) ($u->rev ?? 0);
            $cost = (int) ($u->cost ?? 0);

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

        $model = ModelCatalog::updateOrCreate(
            ['provider' => $data['provider'], 'model' => $data['model']],
            [
                'input_usd_per_million' => $data['input'],
                'output_usd_per_million' => $data['output'],
                'active' => true,
                'price_source' => 'manual',
                'tier' => ModelCatalog::tierFor((float) $data['input'] + (float) $data['output']),
                'first_seen_at' => now(),
            ],
        );

        $this->audit->log('model.store', null, "Priced {$model->provider}/{$model->model} at \${$data['input']}/\${$data['output']} per 1M");

        return back();
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

        $model->update([
            'input_usd_per_million' => $data['input'],
            'output_usd_per_million' => $data['output'],
            'active' => $data['active'],
            'price_source' => $changed ? 'manual' : $model->price_source,
            'tier' => $model->tier ?: ModelCatalog::tierFor((float) $data['input'] + (float) $data['output']),
        ]);

        if ($changed) {
            $this->audit->log('model.reprice', null, "{$model->provider}/{$model->model} cost basis set to \${$data['input']}/\${$data['output']} per 1M");
        }

        return back();
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

        return back();
    }

    public function sync(Request $request, ModelSyncService $sync): RedirectResponse
    {
        try {
            $stats = $sync->sync(importFeed: $request->boolean('import_feed'));
        } catch (\Throwable $e) {
            return back()->withErrors(['sync' => mb_substr($e->getMessage(), 0, 200)]);
        }

        $this->audit->log('model.sync', null, sprintf(
            'added=%d auto-priced=%d proposed=%d', $stats['added'], $stats['priced'], $stats['proposed'],
        ), $stats);

        return back()->with('sync', $stats);
    }

    public function acceptProposal(ModelPriceProposal $proposal, ModelSyncService $sync, Request $request): RedirectResponse
    {
        $summary = "{$proposal->model->provider}/{$proposal->model->model} cost basis → \${$proposal->proposed_input_usd_per_million}/\${$proposal->proposed_output_usd_per_million} ({$proposal->deltaPct()}%)";
        $sync->acceptProposal($proposal, $request->user()->id);
        $this->audit->log('price.accept', null, $summary);

        return back();
    }

    public function rejectProposal(ModelPriceProposal $proposal, ModelSyncService $sync, Request $request): RedirectResponse
    {
        $summary = "Rejected feed price for {$proposal->model->provider}/{$proposal->model->model}";
        $sync->rejectProposal($proposal, $request->user()->id);
        $this->audit->log('price.reject', null, $summary);

        return back();
    }
}
