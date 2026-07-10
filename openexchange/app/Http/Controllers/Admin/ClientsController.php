<?php

namespace App\Http\Controllers\Admin;

use App\Models\AccessKey;
use App\Models\AuditLog;
use App\Models\Charge;
use App\Models\Client;
use App\Models\ClientModelRate;
use App\Models\ModelCatalog;
use App\Models\TopUp;
use App\Models\UsageRecord;
use App\Models\User;
use App\Services\Admin\AuditLogger;
use App\Services\Billing\BalanceService;
use App\Services\Metering\MeteringService;
use App\Services\Metering\ModelPresenter;
use App\Services\Metering\RateResolver;
use App\Services\Metering\ResolvedRate;
use App\Services\Pricing\ModelRegistrar;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class ClientsController
{
    public function __construct(private AuditLogger $audit) {}

    public function index(): Response
    {
        $monthStart = now()->startOfMonth();

        $usage = UsageRecord::where('period_start', '>=', $monthStart)
            ->selectRaw('client_id, SUM(billed_cents) rev, SUM(provider_cost_cents) cost')
            ->groupBy('client_id')->get()->keyBy('client_id');

        $staff = User::selectRaw('client_id, COUNT(*) n')->whereNotNull('client_id')->groupBy('client_id')->pluck('n', 'client_id');

        $clients = Client::with('paymentMethods')->orderBy('name')->get()->map(function ($c) use ($usage, $staff) {
            $u = $usage->get($c->id);
            $rev = (int) ($u->rev ?? 0);
            $cost = (int) round((float) ($u->cost ?? 0));

            return [
                'id' => $c->id,
                'name' => $c->name,
                'email' => $c->primaryEmail(),
                'company' => $c->company,
                'status' => $c->status,
                'health' => $this->health($c),
                'balance_cents' => $c->balance_cents,
                'revenue_cents' => $rev,
                'margin_cents' => $rev - $cost,
                'margin_pct' => $rev > 0 ? round(($rev - $cost) / $rev * 100, 1) : null,
                'markup_pct' => round($c->default_markup_bps / 100, 1),
                'auto_topup' => (bool) $c->auto_topup,
                'has_card' => $c->paymentMethods->isNotEmpty(),
                'staff' => (int) ($staff[$c->id] ?? 0),
                'visibility' => $c->model_visibility,
                'since' => $c->created_at?->format('M Y'),
            ];
        });

        return Inertia::render('admin/clients', ['clients' => $clients]);
    }

    /** Everything about one account, on one page. */
    public function show(Client $client, ModelPresenter $presenter, RateResolver $rates): Response
    {
        $monthStart = now()->startOfMonth();

        // Per-model usage with true margin — the view the client never sees.
        $perModel = UsageRecord::where('client_id', $client->id)
            ->where('period_start', '>=', $monthStart)
            ->selectRaw('provider, model, SUM(billed_cents) rev, SUM(provider_cost_cents) cost, SUM(input_tokens) tin, SUM(output_tokens) tout, COUNT(*) n')
            ->groupBy('provider', 'model')
            ->orderByDesc('rev')->get()
            ->map(function ($r) use ($client, $presenter, $rates) {
                $rev = (int) $r->rev;
                $cost = (int) round((float) $r->cost);
                $rate = $rates->resolve($client, $r->provider, $r->model);

                return [
                    'provider' => $r->provider,
                    'provider_label' => ModelCatalog::providerLabel($r->provider),
                    'model' => $r->model,
                    // Exactly what this client's own portal renders for this model.
                    'client_sees' => $presenter->label($client, $r->provider, $r->model),
                    'input_tokens' => (int) $r->tin,
                    'output_tokens' => (int) $r->tout,
                    'tokens' => (int) $r->tin + (int) $r->tout,
                    'requests' => (int) $r->n,
                    'revenue_cents' => $rev,
                    'cost_cents' => $cost,
                    'margin_cents' => $rev - $cost,
                    'effective_markup_bps' => ResolvedRate::effectiveMarkupBps($cost, $rev),
                    'rate_label' => $rate->label(),
                    'rate_origin' => $rate->origin,
                ];
            })->all();

        $rates = ClientModelRate::where('client_id', $client->id)->get()->map(fn ($r) => [
            'id' => $r->id, 'provider' => $r->provider, 'model' => $r->model,
            'mode' => $r->pricing_mode, 'label' => ResolvedRate::fromRow($r)->label(),
            'markup_bps' => $r->markup_bps, 'note' => $r->note,
            'per_request_fee_cents' => $r->per_request_fee_cents,
            'min_margin_bps' => $r->min_margin_bps,
        ])->all();

        $revenue = array_sum(array_column($perModel, 'revenue_cents'));
        $cost = array_sum(array_column($perModel, 'cost_cents'));

        return Inertia::render('admin/client', [
            'client' => [
                'id' => $client->id,
                'name' => $client->name,
                'slug' => $client->slug,
                'company' => $client->company,
                'contact_email' => $client->contact_email,
                'notes' => $client->notes,
                'status' => $client->status,
                'since' => $client->created_at?->format('M j, Y'),
                'balance_cents' => $client->balance_cents,
                'markup_bps' => $client->default_markup_bps,
                'min_cents' => $client->min_balance_cents,
                'topup_cents' => $client->topup_amount_cents,
                'debt_limit_cents' => $client->debt_limit_cents,
                'auto_topup' => (bool) $client->auto_topup,
                'model_visibility' => $client->model_visibility,
                'billings_customer_id' => $client->billings_customer_id,
            ],
            'summary' => [
                'revenue_cents' => $revenue,
                'cost_cents' => $cost,
                'margin_cents' => $revenue - $cost,
                'margin_pct' => $revenue > 0 ? round(($revenue - $cost) / $revenue * 100, 1) : null,
                'requests' => array_sum(array_column($perModel, 'requests')),
                'tokens' => array_sum(array_column($perModel, 'tokens')),
            ],
            'staff' => $client->users()->orderBy('id')->get()->map(fn ($u) => [
                'id' => $u->id, 'name' => $u->name, 'email' => $u->email, 'role' => $u->role,
                'verified' => $u->email_verified_at !== null,
                'last_login' => $u->last_login_at?->diffForHumans() ?? 'never',
                'joined' => $u->created_at?->format('M j, Y'),
            ]),
            'perModel' => $perModel,
            'rates' => $rates,
            'charges' => Charge::where('client_id', $client->id)->latest()->get()->map(fn ($c) => [
                'id' => $c->id, 'kind' => $c->kind, 'cadence' => $c->cadence, 'name' => $c->name,
                'amount_cents' => $c->amount_cents, 'model' => $c->model, 'provider' => $c->provider,
                'input_tokens' => $c->input_tokens, 'output_tokens' => $c->output_tokens,
                'active' => (bool) $c->active, 'last_run' => $c->last_run_at?->diffForHumans(),
                'runs' => $c->runs()->count(),
            ]),
            'ledger' => $client->ledger()->latest()->limit(25)->get()->map(fn ($e) => [
                'date' => $e->created_at->format('M j, H:i'), 'type' => $e->type,
                'desc' => $e->description, 'amount_cents' => $e->amount_cents,
                'balance_after_cents' => $e->balance_after_cents,
            ]),
            'topUps' => TopUp::where('client_id', $client->id)->latest()->limit(10)->get()->map(fn ($t) => [
                'date' => $t->created_at->format('M j, Y'), 'amount_cents' => $t->amount_cents,
                'status' => $t->status, 'trigger' => $t->trigger, 'reason' => $t->failure_reason,
            ]),
            'cards' => $client->paymentMethods()->get()->map(fn ($p) => [
                'brand' => strtoupper($p->brand ?? 'CARD'), 'last4' => $p->last4,
                'exp' => sprintf('%02d/%02d', $p->exp_month, $p->exp_year % 100), 'default' => (bool) $p->is_default,
            ]),
            'accessKeys' => AccessKey::where('client_id', $client->id)->orderByDesc('created_at')->get()->map(fn ($k) => [
                'id' => $k->id, 'name' => $k->name, 'frag' => $k->fragment(), 'status' => $k->status,
                'last_used' => $k->last_used_at?->diffForHumans() ?? 'never',
            ]),
            'sources' => $client->providerKeys()->get()->map(function ($k) use ($monthStart) {
                $u = (int) UsageRecord::where('provider_key_id', $k->id)->where('period_start', '>=', $monthStart)->sum('billed_cents');

                return [
                    'id' => $k->id, 'provider' => ModelCatalog::providerLabel($k->provider),
                    'project' => $k->external_project_id, 'label' => $k->displayLabel(),
                    'status' => $k->status, 'revenue_cents' => $u,
                    'synced' => $k->last_synced_at?->diffForHumans() ?? 'never',
                ];
            }),
            'audit' => AuditLog::with('user:id,name')->where('client_id', $client->id)->latest()->limit(20)->get()->map(fn ($l) => [
                'at' => $l->created_at->format('M j, H:i'), 'action' => $l->action,
                'actor' => $l->user?->name ?? 'system', 'summary' => $l->summary,
            ]),
            'catalog' => ModelCatalog::where('active', true)->orderBy('provider')->orderBy('model')
                ->get(['id', 'provider', 'model', 'input_usd_per_million', 'output_usd_per_million'])
                ->map(fn ($m) => [
                    'provider' => $m->provider, 'model' => $m->model,
                    'in' => (float) $m->input_usd_per_million, 'out' => (float) $m->output_usd_per_million,
                ]),
            'rateGrid' => $this->rateGrid($client, $rates),
            'newKey' => session('new_access_key'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'owner_email' => ['required', 'email', 'max:190', 'unique:users,email'],
            'owner_name' => ['nullable', 'string', 'max:120'],
            'company' => ['nullable', 'string', 'max:160'],
        ]);

        $client = DB::transaction(function () use ($data) {
            $client = Client::create([
                'name' => $data['name'],
                'company' => $data['company'] ?? null,
                'contact_email' => $data['owner_email'],
                'slug' => Str::slug($data['name']).'-'.Str::lower(Str::random(5)),
            ]);

            User::create([
                'name' => $data['owner_name'] ?: $data['name'],
                'email' => $data['owner_email'],
                'password' => Hash::make(Str::random(40)),
                'email_verified_at' => now(),
                'client_id' => $client->id,
                'role' => 'owner',
            ]);

            return $client;
        });

        Password::sendResetLink(['email' => $data['owner_email']]);
        $this->audit->log('client.create', $client, "Created {$client->name}; invite sent to {$data['owner_email']}");

        return back();
    }

    /** Profile + billing settings + how much model detail this client is shown. */
    public function update(Request $request, Client $client): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'company' => ['nullable', 'string', 'max:160'],
            'contact_email' => ['nullable', 'email', 'max:190'],
            'notes' => ['nullable', 'string', 'max:2000'],
            'status' => ['required', Rule::in(['active', 'suspended'])],
            'model_visibility' => ['required', Rule::in(['aliased', 'provider_only', 'exact'])],
            'default_markup_bps' => ['required', 'integer', 'min:0', 'max:1000000'],
            'min_balance_cents' => ['required', 'integer', 'min:0', 'max:10000000'],
            'topup_amount_cents' => ['required', 'integer', 'min:100', 'max:10000000'],
            'debt_limit_cents' => ['required', 'integer', 'min:0', 'max:10000000'],
            'auto_topup' => ['required', 'boolean'],
        ]);

        $before = $client->only(array_keys($data));
        $client->update($data);

        $changed = array_keys(array_diff_assoc(
            array_map(fn ($v) => is_bool($v) ? (int) $v : $v, $data),
            array_map(fn ($v) => is_bool($v) ? (int) $v : $v, $before),
        ));

        if ($changed) {
            $this->audit->log('client.update', $client, 'Updated '.implode(', ', $changed), ['before' => $before, 'after' => $data]);
        }

        return back();
    }

    public function destroy(Client $client): RedirectResponse
    {
        $name = $client->name;

        DB::transaction(function () use ($client) {
            User::where('client_id', $client->id)->delete();
            $client->delete(); // FKs cascade
        });

        $this->audit->log('client.delete', null, "Deleted client {$name} and all of its data");

        return redirect('/admin/clients');
    }

    public function adjustBalance(Request $request, Client $client, BalanceService $balance): RedirectResponse
    {
        $data = $request->validate([
            'amount' => ['required', 'numeric', 'not_in:0', 'min:-100000', 'max:100000'],
            'reason' => ['nullable', 'string', 'max:160'],
        ]);

        $cents = (int) round($data['amount'] * 100);
        $balance->apply($client, $cents, 'adjustment', $data['reason'] ?: 'Admin adjustment', 'admin:'.now()->timestamp);

        $this->audit->log('balance.adjust', $client, sprintf(
            '%s $%s — %s', $cents > 0 ? 'Credited' : 'Debited', number_format(abs($cents) / 100, 2), $data['reason'] ?: 'no reason given',
        ));

        return back();
    }

    /** Add a staff login to this client's account. */
    public function addStaff(Request $request, Client $client): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email', 'max:190', 'unique:users,email'],
            'role' => ['required', Rule::in(['owner', 'member'])],
        ]);

        User::create($data + [
            'password' => Hash::make(Str::random(40)),
            'email_verified_at' => now(),
            'client_id' => $client->id,
        ]);

        Password::sendResetLink(['email' => $data['email']]);
        $this->audit->log('client.staff.add', $client, "Added {$data['email']} as {$data['role']}");

        return back();
    }

    public function removeStaff(Client $client, User $user): RedirectResponse
    {
        abort_unless($user->client_id === $client->id, 404);
        abort_if($user->isAdmin(), 403, 'Platform admins cannot be removed from a client.');

        $email = $user->email;
        $user->delete();
        $this->audit->log('client.staff.remove', $client, "Removed {$email}");

        return back();
    }

    public function resendInvite(Client $client, User $user): RedirectResponse
    {
        abort_unless($user->client_id === $client->id, 404);

        Password::sendResetLink(['email' => $user->email]);
        $this->audit->log('client.staff.invite', $client, "Re-sent set-password email to {$user->email}");

        return back();
    }

    /**
     * Every model laid out for this client: the two prices, the rate that actually applies
     * (inherited or overridden), what it sells for, and what this client has spent on it.
     *
     * @param  Collection<int, ClientModelRate>  $rates
     * @return list<array<string, mixed>>
     */
    private function rateGrid(Client $client, $rates): array
    {
        $resolver = app(RateResolver::class);
        $monthStart = now()->startOfMonth();

        // This client's MTD usage, folded onto the base model (dated snapshots share a price).
        $usage = [];
        $rows = UsageRecord::where('client_id', $client->id)
            ->where('period_start', '>=', $monthStart)
            ->selectRaw('provider, model, COUNT(*) n, SUM(input_tokens+output_tokens) toks, SUM(billed_cents) rev, SUM(provider_cost_cents) cost')
            ->groupBy('provider', 'model')->get();
        foreach ($rows as $r) {
            $key = $r->provider.'|'.ModelRegistrar::baseModel($r->model);
            foreach (['n', 'toks', 'rev'] as $f) {
                $usage[$key][$f] = ($usage[$key][$f] ?? 0) + (int) $r->{$f};
            }
            // Cost is fractional cents — fold it as a float or sub-cent costs vanish.
            $usage[$key]['cost'] = ($usage[$key]['cost'] ?? 0.0) + (float) $r->cost;
        }

        $overrides = collect($rates)->filter(fn ($r) => $r['model'] !== null)->keyBy(fn ($r) => $r['provider'].'|'.$r['model']);

        return ModelCatalog::where('active', true)->orderBy('provider')->orderBy('model')->get()
            ->map(function ($m) use ($client, $resolver, $usage, $overrides) {
                $key = $m->provider.'|'.$m->model;
                $u = $usage[$key] ?? null;
                $override = $overrides->get($key);
                $rate = $resolver->resolve($client, $m->provider, $m->model);

                $rev = (int) ($u['rev'] ?? 0);
                $cost = (int) round((float) ($u['cost'] ?? 0));

                // What one million in + one million out would bill this client today.
                $costPerM = $m->costCents(1_000_000, 1_000_000);
                $sellPerM = $rate->billedCents(
                    $m->chargeBasisCentsExact(1_000_000, 1_000_000), 1_000_000, 1_000_000, 0, $m->costCentsExact(1_000_000, 1_000_000),
                );

                return [
                    'id' => $m->id,
                    'provider' => $m->provider,
                    'provider_label' => ModelCatalog::providerLabel($m->provider),
                    'model' => $m->model,
                    'tier' => $m->tier,
                    'priced' => $m->isPriced(),

                    'cost_in' => (float) $m->input_usd_per_million,
                    'cost_out' => (float) $m->output_usd_per_million,
                    'base_in' => $m->baseInput(),
                    'base_out' => $m->baseOutput(),

                    // The rate in force, and whether it is this client's own or inherited.
                    'mode' => $rate->mode,
                    'markup_bps' => $rate->markupBps,
                    'rate_label' => $rate->label(),
                    'rate_origin' => $rate->origin,
                    'inherited' => $override === null,
                    'override_id' => $override['id'] ?? null,
                    'note' => $override['note'] ?? null,

                    // Per 1M-in + 1M-out, so a rate change is legible in dollars.
                    'cost_per_m_cents' => $costPerM,
                    'sell_per_m_cents' => $sellPerM,
                    'margin_per_m_cents' => $sellPerM - $costPerM,

                    'usage_records' => (int) ($u['n'] ?? 0),
                    'usage_tokens' => (int) ($u['toks'] ?? 0),
                    'revenue_cents' => $rev,
                    'usage_cost_cents' => $cost,
                    'margin_cents' => $rev - $cost,
                ];
            })->values()->all();
    }

    /**
     * Preview a re-cost: what would this client's usage of one model bill at today's
     * price and rate? Never writes. The admin sees the delta before committing.
     */
    public function recostPreview(Request $request, Client $client, MeteringService $metering): JsonResponse
    {
        $data = $request->validate([
            'provider' => ['required', 'string', 'max:40'],
            'model' => ['required', 'string', 'max:120'],
        ]);

        return response()->json($metering->recost($client->id, $data['provider'], $data['model'], dryRun: true));
    }

    /**
     * Re-bill this client's usage of one model at the CURRENT real cost, charge-on price
     * and rate card, settling the difference.
     *
     * The client's statement shows the corrected usage and a balance movement — as it
     * must, because money cannot move invisibly. What they never see is the model id, or
     * that a re-price happened: the ledger line reads "Usage — inference" like any other.
     */
    public function recost(Request $request, Client $client, MeteringService $metering): RedirectResponse
    {
        $data = $request->validate([
            'provider' => ['required', 'string', 'max:40'],
            'model' => ['required', 'string', 'max:120'],
        ]);

        $result = $metering->recost($client->id, $data['provider'], $data['model']);

        if ($result['records'] === 0) {
            return back()->with('flash', ['type' => 'info', 'message' => "No usage of {$data['model']} to re-cost for {$client->name}."]);
        }

        $delta = $result['delta_cents'];
        $this->audit->log('metering.recost', $client, sprintf(
            'Re-costed %d record(s) of %s/%s — $%s to $%s (net %s$%s)',
            $result['records'], $data['provider'], $data['model'],
            number_format($result['was_cents'] / 100, 2), number_format($result['now_cents'] / 100, 2),
            $delta >= 0 ? '+' : '-', number_format(abs($delta) / 100, 2),
        ), $result + $data);

        if ($delta === 0) {
            return back()->with('flash', ['type' => 'info', 'message' => "{$data['model']} was already billed at the current rate - nothing changed."]);
        }

        return back()->with('flash', ['type' => 'success', 'message' => sprintf(
            'Re-costed %d record(s) of %s - %s $%s.',
            $result['records'], $data['model'],
            $delta > 0 ? 'billed a further' : 'credited back', number_format(abs($delta) / 100, 2),
        )]);
    }

    /** Coarse account health for the clients list. */
    private function health(Client $client): string
    {
        return match (true) {
            $client->status === 'suspended' => 'suspended',
            $client->balance_cents < 0 => 'debt',
            $client->isLow() => 'low',
            default => 'healthy',
        };
    }
}
