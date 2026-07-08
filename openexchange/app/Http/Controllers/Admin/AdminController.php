<?php

namespace App\Http\Controllers\Admin;

use App\Models\AccessKey;
use App\Models\Client;
use App\Models\ClientModelRate;
use App\Models\ModelCatalog;
use App\Models\ProviderBackend;
use App\Models\ProviderKey;
use App\Models\UsageRecord;
use App\Models\User;
use App\Services\Billing\BalanceService;
use App\Services\Metering\RateResolver;
use App\Services\Providers\OpenAiDiscovery;
use App\Services\Providers\ProviderModelSync;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class AdminController
{
    public function index(): Response
    {
        $monthStart = now()->startOfMonth();
        $mtd = UsageRecord::where('period_start', '>=', $monthStart);
        $metered = (int) (clone $mtd)->sum('billed_cents');
        $cost = (int) (clone $mtd)->sum('provider_cost_cents');

        $clients = Client::withSum(['usageRecords as usage_mtd' => fn ($q) => $q->where('period_start', '>=', $monthStart)], 'billed_cents')
            ->orderBy('name')->get()->map(fn ($c) => [
                'id' => $c->id,
                'client' => $c->name,
                'balance' => '$'.number_format($c->balance_cents / 100, 2),
                'balance_cents' => $c->balance_cents,
                'usage' => '$'.number_format(($c->usage_mtd ?? 0) / 100, 2),
                'markup' => '+'.number_format($c->default_markup_bps / 100, 0).'%',
                'markup_bps' => $c->default_markup_bps,
                'min_cents' => $c->min_balance_cents,
                'topup_cents' => $c->topup_amount_cents,
                'auto_topup' => (bool) $c->auto_topup,
                'account_status' => $c->status,
                'status' => $c->status === 'suspended' ? 'suspended' : ($c->balance_cents <= $c->min_balance_cents ? 'low' : 'active'),
            ]);

        $keys = ProviderKey::with('client')->orderByDesc('last_synced_at')->get()->map(function ($k) use ($monthStart) {
            $usage = (int) UsageRecord::where('provider_key_id', $k->id)->where('period_start', '>=', $monthStart)->sum('billed_cents');

            return [
                'provider' => ucfirst($k->provider),
                'frag' => $k->fragment(),
                'client' => $k->client?->name ?? '—',
                'usage' => '$'.number_format($usage / 100, 2),
                'sync' => $k->last_synced_at?->diffForHumans() ?? 'never',
            ];
        });

        $globalMarkup = ClientModelRate::whereNull('client_id')->whereNull('provider')->whereNull('model')->value('markup_bps')
            ?? (Client::value('default_markup_bps') ?? 2500);

        $rateModels = ModelCatalog::where('active', true)->orderByDesc('output_usd_per_million')->limit(6)->get()->map(fn ($m) => [
            'model' => $m->model,
            'provider' => ucfirst($m->provider),
            'cost' => (float) $m->output_usd_per_million,
        ]);

        // Discovered OpenAI projects (cached; refreshed via the Discover action),
        // joined to whichever client each is assigned to via ProviderKey.
        $discProjects = Cache::get('oe.discovery.openai.projects', []);
        $discUsage = Cache::get('oe.discovery.openai.usage', []); // project_id => [day => tokens]
        $days = [];
        for ($i = 29; $i >= 0; $i--) {
            $days[] = now()->subDays($i)->format('Y-m-d');
        }
        $openaiKeys = ProviderKey::with('client')->where('provider', 'openai')->get()->keyBy('external_project_id');
        $discovery = collect($discProjects)->map(function ($p) use ($openaiKeys, $discUsage, $days) {
            $key = $openaiKeys->get($p['id']);
            $byDay = $discUsage[$p['id']] ?? [];
            $series = array_map(fn ($d) => (int) ($byDay[$d] ?? 0), $days);

            return [
                'id' => $p['id'],
                'name' => $p['name'],
                'status' => $p['status'],
                'assigned_client_id' => $key?->client_id,
                'assigned_client' => $key?->client?->name,
                'label' => $key?->display_label ?? $key?->label,
                'key_status' => $key?->status,
                'tokens' => array_sum($series),
                'series' => $series,
            ];
        })->values();

        // Full editable model catalogue (prices + per-model markup override + active).
        $overrides = ClientModelRate::whereNull('client_id')->whereNotNull('model')->get()->keyBy(fn ($r) => $r->provider.'|'.$r->model);
        $catalog = ModelCatalog::orderBy('provider')->orderBy('model')->get()->map(function ($m) use ($overrides) {
            $ov = $overrides->get($m->provider.'|'.$m->model);

            return [
                'id' => $m->id, 'model' => $m->model, 'provider' => $m->provider,
                'in' => (float) $m->input_usd_per_million, 'out' => (float) $m->output_usd_per_million,
                'active' => (bool) $m->active, 'markup_bps' => $ov?->markup_bps,
            ];
        });

        // Models seen in usage this month with NO catalogue price → they bill $0.
        $catalogModels = ModelCatalog::pluck('model')->all();
        $unpricedModels = UsageRecord::where('period_start', '>=', $monthStart)
            ->whereNotIn('model', $catalogModels)->distinct()->orderBy('model')->limit(20)->pluck('model');

        // Gateway access keys grouped by client (for the Manage panel: list + revoke).
        $accessKeys = AccessKey::orderByDesc('created_at')->get()->groupBy('client_id')->map(fn ($grp) => $grp->map(fn ($k) => [
            'id' => $k->id, 'name' => $k->name, 'frag' => $k->fragment(), 'status' => $k->status,
            'last_used' => $k->last_used_at?->diffForHumans() ?? 'never',
        ])->values());

        // Per-client, per-model markup overrides (for the Manage panel).
        $clientRates = ClientModelRate::whereNotNull('client_id')->get()->groupBy('client_id')->map(fn ($grp) => $grp->map(fn ($r) => [
            'id' => $r->id, 'provider' => $r->provider, 'model' => $r->model, 'markup_bps' => $r->markup_bps,
        ])->values());

        return Inertia::render('console/admin', [
            'stats' => [
                'clients' => Client::count(),
                'keys' => ProviderKey::count(),
                'metered' => '$'.number_format($metered / 100 / 1000, 1).'k',
                'margin' => '$'.number_format(($metered - $cost) / 100 / 1000, 1).'k',
            ],
            'clients' => $clients,
            'keys' => $keys,
            'rateModels' => $rateModels,
            'markupBps' => (int) $globalMarkup,
            'clientOptions' => Client::orderBy('name')->get(['id', 'name']),
            'backends' => ProviderBackend::orderBy('provider')->orderBy('backend')->get()->map(fn ($b) => [
                'provider' => ucfirst($b->provider), 'backend' => $b->backend, 'label' => $b->label,
                'project' => $b->project_id ?: '—', 'region' => $b->region ?: '—', 'status' => $b->status,
            ]),
            'discovery' => $discovery,
            'discoveredAt' => Cache::get('oe.discovery.openai.at'),
            'openaiReady' => (bool) config('openexchange.openai.admin_key'),
            'catalog' => $catalog,
            'unpricedModels' => $unpricedModels,
            'accessKeys' => $accessKeys,
            'clientRates' => $clientRates,
            'newAccessKey' => session('new_access_key'),
        ]);
    }

    /** Full-screen manage page for a single client. */
    public function manageClient(Client $client): Response
    {
        $monthStart = now()->startOfMonth();
        $usageMtd = (int) $client->usageRecords()->where('period_start', '>=', $monthStart)->sum('billed_cents');

        return Inertia::render('console/admin-client', [
            'client' => [
                'id' => $client->id, 'name' => $client->name, 'status' => $client->status,
                'balance' => '$'.number_format($client->balance_cents / 100, 2), 'balance_cents' => $client->balance_cents,
                'usage_mtd' => '$'.number_format($usageMtd / 100, 2),
                'markup_bps' => $client->default_markup_bps, 'min_cents' => $client->min_balance_cents,
                'topup_cents' => $client->topup_amount_cents, 'auto_topup' => (bool) $client->auto_topup,
            ],
            'catalog' => ModelCatalog::where('active', true)->orderBy('provider')->orderBy('model')->get()->map(fn ($m) => [
                'model' => $m->model, 'provider' => $m->provider,
                'in' => (float) $m->input_usd_per_million, 'out' => (float) $m->output_usd_per_million,
            ]),
            'accessKeys' => AccessKey::where('client_id', $client->id)->orderByDesc('created_at')->get()->map(fn ($k) => [
                'id' => $k->id, 'name' => $k->name, 'frag' => $k->fragment(), 'status' => $k->status,
                'last_used' => $k->last_used_at?->diffForHumans() ?? 'never',
            ]),
            'rates' => ClientModelRate::where('client_id', $client->id)->get()->map(fn ($r) => [
                'id' => $r->id, 'provider' => $r->provider, 'model' => $r->model, 'markup_bps' => $r->markup_bps,
            ]),
            'ledger' => $client->ledger()->latest()->limit(10)->get()->map(fn ($e) => [
                'date' => $e->created_at->format('M j, H:i'), 'type' => $e->type, 'desc' => $e->description,
                'amount' => ($e->amount_cents >= 0 ? '+' : '−').'$'.number_format(abs($e->amount_cents) / 100, 2),
                'credit' => $e->amount_cents >= 0,
            ]),
            'projects' => $client->providerKeys()->get()->map(function ($k) use ($monthStart) {
                $u = (int) UsageRecord::where('provider_key_id', $k->id)->where('period_start', '>=', $monthStart)->sum('billed_cents');

                return ['provider' => ucfirst($k->provider), 'project' => $k->external_project_id, 'label' => $k->displayLabel(), 'status' => $k->status, 'usage' => '$'.number_format($u / 100, 2)];
            }),
            'newKey' => session('new_access_key'),
        ]);
    }

    /** Create a gateway access key on a client's behalf (shown once). */
    public function createAccessKey(Request $request)
    {
        $data = $request->validate([
            'client_id' => ['required', 'exists:clients,id'],
            'name' => ['required', 'string', 'max:60'],
        ]);
        $client = Client::findOrFail($data['client_id']);
        [$model, $secret] = AccessKey::generate($client, $data['name']);

        return back()->with('new_access_key', ['name' => $model->name, 'client' => $client->name, 'secret' => $secret]);
    }

    /** Manually record usage for a client (backfill / off-platform) and debit their balance. */
    public function addUsage(Request $request, RateResolver $rates, BalanceService $balance)
    {
        $data = $request->validate([
            'client_id' => ['required', 'exists:clients,id'],
            'model' => ['required', 'string', 'max:120'],
            'input_tokens' => ['required', 'integer', 'min:0', 'max:1000000000'],
            'output_tokens' => ['required', 'integer', 'min:0', 'max:1000000000'],
        ]);
        $client = Client::findOrFail($data['client_id']);
        $catalog = ModelCatalog::where('model', $data['model'])->first();
        $provider = $catalog?->provider ?? 'openai';
        $providerCost = $catalog ? $catalog->costCents((int) $data['input_tokens'], (int) $data['output_tokens']) : 0;
        $billed = (int) round($providerCost * (1 + $rates->markupBps($client, $provider, $data['model']) / 10000));
        $rid = (string) Str::uuid();

        DB::transaction(function () use ($client, $data, $provider, $providerCost, $billed, $rid, $balance) {
            UsageRecord::create([
                'client_id' => $client->id, 'provider_key_id' => null, 'access_key_id' => null,
                'provider' => $provider, 'model' => $data['model'], 'period_start' => now(), 'period_end' => now(),
                'input_tokens' => (int) $data['input_tokens'], 'output_tokens' => (int) $data['output_tokens'],
                'provider_cost_cents' => $providerCost, 'billed_cents' => $billed, 'source' => 'manual', 'request_id' => $rid,
            ]);
            if ($billed > 0) {
                $balance->debit($client, $billed, 'usage_debit', "manual {$provider}/{$data['model']}", "manual:{$rid}", ['tokens_in' => (int) $data['input_tokens'], 'tokens_out' => (int) $data['output_tokens']]);
            }
        });

        return back();
    }

    public function storeBackend(Request $request)
    {
        $data = $request->validate([
            'provider' => ['required', 'in:openai,google'],
            'backend' => ['required', 'in:openai,aistudio,vertex'],
            'label' => ['required', 'string', 'max:120'],
            'secret' => ['required', 'string'],
            'project_id' => ['nullable', 'string', 'max:120'],
            'region' => ['nullable', 'string', 'max:60'],
        ]);
        ProviderBackend::create($data + ['status' => 'active']);

        return back();
    }

    public function storeClient(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'owner_email' => ['required', 'email', 'max:190', 'unique:users,email'],
            'owner_name' => ['nullable', 'string', 'max:120'],
        ]);

        $client = Client::create([
            'name' => $data['name'],
            'slug' => Str::slug($data['name']).'-'.Str::lower(Str::random(5)),
        ]);

        // Create the owner login; they set their password via the branded email.
        User::create([
            'name' => $data['owner_name'] ?: $data['name'],
            'email' => $data['owner_email'],
            'password' => Hash::make(Str::random(40)),
            'email_verified_at' => now(),
            'client_id' => $client->id,
            'role' => 'owner',
        ]);

        Password::sendResetLink(['email' => $data['owner_email']]);

        return back();
    }

    public function storeKey(Request $request)
    {
        $data = $request->validate([
            'client_id' => ['required', 'exists:clients,id'],
            'provider' => ['required', 'in:openai,google'],
            'label' => ['required', 'string', 'max:120'],
            'secret' => ['required', 'string'],
            'external_project_id' => ['required', 'string', 'max:120'],
            'external_key_id' => ['nullable', 'string', 'max:120'],
        ]);
        ProviderKey::create($data + ['status' => 'active']);

        return back();
    }

    public function updateRate(Request $request)
    {
        $data = $request->validate(['markup_bps' => ['required', 'integer', 'min:0', 'max:100000']]);
        ClientModelRate::updateOrCreate(
            ['client_id' => null, 'provider' => null, 'model' => null],
            ['markup_bps' => $data['markup_bps']],
        );

        return back();
    }

    public function sync(Request $request)
    {
        $data = $request->validate(['client_id' => ['nullable', 'exists:clients,id']]);
        Artisan::call('metering:pull', array_filter(['--client' => $data['client_id'] ?? null]));

        return back();
    }

    /** Manually credit or debit a client's prepaid balance. */
    public function adjustBalance(Request $request, BalanceService $balance)
    {
        $data = $request->validate([
            'client_id' => ['required', 'exists:clients,id'],
            'amount' => ['required', 'numeric', 'not_in:0'],
            'reason' => ['nullable', 'string', 'max:160'],
        ]);
        $client = Client::findOrFail($data['client_id']);
        $cents = (int) round($data['amount'] * 100);
        $balance->apply($client, $cents, 'adjustment', $data['reason'] ?: 'Admin adjustment', 'admin:'.now()->timestamp);

        return back();
    }

    /** Edit a client's billing settings (markup, thresholds, status). */
    public function updateClient(Request $request)
    {
        $data = $request->validate([
            'client_id' => ['required', 'exists:clients,id'],
            'default_markup_bps' => ['required', 'integer', 'min:0', 'max:100000'],
            'min_balance_cents' => ['required', 'integer', 'min:0', 'max:10000000'],
            'topup_amount_cents' => ['required', 'integer', 'min:100', 'max:10000000'],
            'auto_topup' => ['required', 'boolean'],
            'status' => ['required', 'in:active,suspended'],
        ]);
        Client::whereKey($data['client_id'])->update(collect($data)->except('client_id')->all());

        return back();
    }

    /** Per-model markup override (platform-wide default for that model). */
    public function updateModelRate(Request $request)
    {
        $data = $request->validate([
            'provider' => ['required', 'string', 'max:40'],
            'model' => ['required', 'string', 'max:120'],
            'markup_bps' => ['required', 'integer', 'min:0', 'max:100000'],
        ]);
        ClientModelRate::updateOrCreate(
            ['client_id' => null, 'provider' => $data['provider'], 'model' => $data['model']],
            ['markup_bps' => $data['markup_bps']],
        );

        return back();
    }

    /** Refresh the list of OpenAI org projects + their usage (cached for the admin view). */
    public function discover(OpenAiDiscovery $discovery)
    {
        try {
            $projects = $discovery->projects();
            $series = $discovery->usageDaily(now()->subDays(29)->startOfDay()->toImmutable(), now()->toImmutable());
            Cache::put('oe.discovery.openai.projects', $projects, now()->addHours(6));
            Cache::put('oe.discovery.openai.usage', $series, now()->addHours(6));
            Cache::put('oe.discovery.openai.at', now()->toDateTimeString(), now()->addHours(6));

            return back();
        } catch (\Throwable $e) {
            return back()->withErrors(['discover' => mb_substr($e->getMessage(), 0, 200)]);
        }
    }

    /** Assign (or re-assign) a discovered project to a client so its usage is metered + billed. */
    public function assignProject(Request $request)
    {
        $data = $request->validate([
            'client_id' => ['required', 'exists:clients,id'],
            'provider' => ['required', 'in:openai,google'],
            'external_project_id' => ['required', 'string', 'max:190'],
            'label' => ['nullable', 'string', 'max:120'],
        ]);
        $label = $data['label'] ?: $data['external_project_id'];
        ProviderKey::updateOrCreate(
            ['provider' => $data['provider'], 'external_project_id' => $data['external_project_id']],
            ['client_id' => $data['client_id'], 'label' => $label, 'display_label' => $label, 'status' => 'active'],
        );

        return back();
    }

    /** Enable/disable metering for an assigned project (keeps its usage history). */
    public function toggleProject(Request $request)
    {
        $data = $request->validate([
            'provider' => ['required', 'in:openai,google'],
            'external_project_id' => ['required', 'string', 'max:190'],
        ]);
        $key = ProviderKey::where('provider', $data['provider'])->where('external_project_id', $data['external_project_id'])->first();
        $key?->update(['status' => $key->status === 'active' ? 'disabled' : 'active']);

        return back();
    }

    /** Permanently delete a client and everything owned by it (users, keys, usage, ledger). */
    public function destroyClient(Request $request)
    {
        $data = $request->validate(['client_id' => ['required', 'exists:clients,id']]);
        $client = Client::findOrFail($data['client_id']);

        DB::transaction(function () use ($client) {
            User::where('client_id', $client->id)->delete();
            $client->delete(); // FKs cascade: provider_keys, usage_records, ledger, top_ups, payment_methods, access_keys
        });

        return back();
    }

    /** Add or re-price a model in the catalogue (input/output $ per 1M tokens). */
    public function storeModel(Request $request)
    {
        $data = $request->validate([
            'provider' => ['required', 'string', 'max:40'],
            'model' => ['required', 'string', 'max:120'],
            'input' => ['required', 'numeric', 'min:0', 'max:100000'],
            'output' => ['required', 'numeric', 'min:0', 'max:100000'],
        ]);
        ModelCatalog::updateOrCreate(
            ['provider' => $data['provider'], 'model' => $data['model']],
            ['input_usd_per_million' => $data['input'], 'output_usd_per_million' => $data['output'], 'active' => true],
        );

        return back();
    }

    /** Edit a catalogue model's prices / active flag. */
    public function updateModel(Request $request)
    {
        $data = $request->validate([
            'id' => ['required', 'exists:model_catalog,id'],
            'input' => ['required', 'numeric', 'min:0', 'max:100000'],
            'output' => ['required', 'numeric', 'min:0', 'max:100000'],
            'active' => ['required', 'boolean'],
        ]);
        ModelCatalog::whereKey($data['id'])->update([
            'input_usd_per_million' => $data['input'],
            'output_usd_per_million' => $data['output'],
            'active' => $data['active'],
        ]);

        return back();
    }

    /** Revoke a client's gateway access key. */
    public function revokeAccessKey(Request $request)
    {
        $data = $request->validate(['access_key_id' => ['required', 'exists:access_keys,id']]);
        AccessKey::whereKey($data['access_key_id'])->update(['status' => 'revoked']);

        return back();
    }

    /** Set a per-client, per-model markup override (most specific — beats the client default). */
    public function updateClientModelRate(Request $request)
    {
        $data = $request->validate([
            'client_id' => ['required', 'exists:clients,id'],
            'provider' => ['required', 'string', 'max:40'],
            'model' => ['required', 'string', 'max:120'],
            'markup_bps' => ['required', 'integer', 'min:0', 'max:100000'],
        ]);
        ClientModelRate::updateOrCreate(
            ['client_id' => $data['client_id'], 'provider' => $data['provider'], 'model' => $data['model']],
            ['markup_bps' => $data['markup_bps']],
        );

        return back();
    }

    /** Remove a per-client, per-model markup override (falls back to the client default). */
    public function deleteClientModelRate(Request $request)
    {
        $data = $request->validate(['id' => ['required', 'exists:client_model_rates,id']]);
        ClientModelRate::whereKey($data['id'])->delete();

        return back();
    }

    /** Auto-discover models from OpenAI + Google and add any missing to the catalogue. */
    public function syncModels(ProviderModelSync $sync)
    {
        try {
            $sync->sync();

            return back();
        } catch (\Throwable $e) {
            return back()->withErrors(['sync' => mb_substr($e->getMessage(), 0, 200)]);
        }
    }
}
