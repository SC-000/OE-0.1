<?php

namespace App\Http\Controllers\Admin;

use App\Models\AccessKey;
use App\Models\Client;
use App\Models\ModelCatalog;
use App\Models\ProviderBackend;
use App\Models\ProviderKey;
use App\Models\UsageRecord;
use App\Services\Admin\AuditLogger;
use App\Services\Metering\MeteringService;
use App\Services\Providers\OpenAiDiscovery;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
use Inertia\Response;

/** Provider plumbing: our upstream creds, per-client attribution keys, discovery, metering. */
class PlatformController
{
    public function __construct(private AuditLogger $audit) {}

    public function index(): Response
    {
        $monthStart = now()->startOfMonth();

        $keys = ProviderKey::with('client')->orderByDesc('last_synced_at')->get()->map(function ($k) use ($monthStart) {
            $rows = UsageRecord::where('provider_key_id', $k->id)->where('period_start', '>=', $monthStart);
            $billed = (int) (clone $rows)->sum('billed_cents');
            $records = (clone $rows)->count();

            return [
                'id' => $k->id,
                'provider' => ModelCatalog::providerLabel($k->provider),
                'project' => $k->external_project_id ?: '—',
                'label' => $k->displayLabel(),
                'client' => $k->client?->name ?? '— unassigned',
                'client_id' => $k->client_id,
                'status' => $k->status !== 'active' ? 'disabled'
                    : ($k->last_synced_at === null ? 'pending' : ($records > 0 ? 'billing' : 'idle')),
                'revenue_cents' => $billed,
                'records' => $records,
                'synced' => $k->last_synced_at?->diffForHumans() ?? 'never',
            ];
        });

        // Discovered OpenAI projects, joined to whichever client owns each.
        $projects = Cache::get('oe.discovery.openai.projects', []);
        $usage = Cache::get('oe.discovery.openai.usage', []);
        $days = collect(range(29, 0))->map(fn ($i) => now()->subDays($i)->format('Y-m-d'))->all();
        $openaiKeys = ProviderKey::with('client')->where('provider', 'openai')->get()->keyBy('external_project_id');

        $discovery = collect($projects)->map(function ($p) use ($openaiKeys, $usage, $days) {
            $key = $openaiKeys->get($p['id']);
            $byDay = $usage[$p['id']] ?? [];
            $series = array_map(fn ($d) => (int) ($byDay[$d] ?? 0), $days);

            return [
                'id' => $p['id'], 'name' => $p['name'], 'status' => $p['status'],
                'assigned_client_id' => $key?->client_id, 'assigned_client' => $key?->client?->name,
                'label' => $key?->display_label ?? $key?->label, 'key_status' => $key?->status,
                'tokens' => array_sum($series), 'series' => $series,
            ];
        })->values();

        return Inertia::render('admin/platform', [
            'backends' => ProviderBackend::orderBy('provider')->orderBy('backend')->get()->map(fn ($b) => [
                'id' => $b->id, 'provider' => ModelCatalog::providerLabel($b->provider), 'backend' => $b->backend,
                'label' => $b->label, 'project' => $b->project_id ?: '—', 'region' => $b->region ?: '—', 'status' => $b->status,
            ]),
            'keys' => $keys,
            'discovery' => $discovery,
            'discoveredAt' => Cache::get('oe.discovery.openai.at'),
            'openaiReady' => (bool) config('openexchange.openai.admin_key'),
            'clientOptions' => Client::orderBy('name')->get(['id', 'name']),
            'accessKeys' => AccessKey::with('client:id,name')->orderByDesc('created_at')->get()->map(fn ($k) => [
                'id' => $k->id, 'name' => $k->name, 'frag' => $k->fragment(), 'status' => $k->status,
                'client' => $k->client?->name, 'client_id' => $k->client_id,
                'last_used' => $k->last_used_at?->diffForHumans() ?? 'never',
            ]),
            'lastPull' => Cache::get('oe.metering.last_run'),
            'lastCharges' => Cache::get('oe.charges.last_run'),
            'newAccessKey' => session('new_access_key'),
        ]);
    }

    public function storeBackend(Request $request): RedirectResponse
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
        $this->audit->log('backend.create', null, "Added {$data['provider']}/{$data['backend']} backend \"{$data['label']}\"");

        return back();
    }

    public function destroyBackend(ProviderBackend $backend): RedirectResponse
    {
        $label = $backend->label;
        $backend->delete();
        $this->audit->log('backend.delete', null, "Removed backend \"{$label}\"");

        return back();
    }

    public function storeKey(Request $request): RedirectResponse
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
        $this->audit->log('key.create', Client::find($data['client_id']), "Attached {$data['provider']} project {$data['external_project_id']}");

        return back();
    }

    public function discover(OpenAiDiscovery $discovery): RedirectResponse
    {
        try {
            Cache::put('oe.discovery.openai.projects', $discovery->projects(), now()->addHours(6));
            Cache::put('oe.discovery.openai.usage', $discovery->usageDaily(now()->subDays(29)->startOfDay()->toImmutable(), now()->toImmutable()), now()->addHours(6));
            Cache::put('oe.discovery.openai.at', now()->toDateTimeString(), now()->addHours(6));

            return back();
        } catch (\Throwable $e) {
            return back()->withErrors(['discover' => mb_substr($e->getMessage(), 0, 200)]);
        }
    }

    public function assignProject(Request $request): RedirectResponse
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

        $this->audit->log('key.assign', Client::find($data['client_id']), "Assigned {$data['provider']} project {$data['external_project_id']}");

        return back();
    }

    public function toggleProject(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'provider' => ['required', 'in:openai,google'],
            'external_project_id' => ['required', 'string', 'max:190'],
        ]);

        $key = ProviderKey::where('provider', $data['provider'])->where('external_project_id', $data['external_project_id'])->first();
        $key?->update(['status' => $key->status === 'active' ? 'disabled' : 'active']);

        if ($key) {
            $this->audit->log('key.toggle', $key->client, "Metering {$key->status} for {$key->external_project_id}");
        }

        return back();
    }

    /** Mint a gateway access key on a client's behalf. Shown once. */
    public function createAccessKey(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'client_id' => ['required', 'exists:clients,id'],
            'name' => ['required', 'string', 'max:60'],
        ]);

        $client = Client::query()->whereKey($data['client_id'])->firstOrFail();
        [$model, $secret] = AccessKey::generate($client, $data['name']);

        $this->audit->log('access_key.create', $client, "Issued gateway key \"{$model->name}\"");

        return back()->with('new_access_key', ['name' => $model->name, 'client' => $client->name, 'secret' => $secret]);
    }

    public function revokeAccessKey(AccessKey $accessKey): RedirectResponse
    {
        $accessKey->update(['status' => 'revoked']);
        $this->audit->log('access_key.revoke', $accessKey->client, "Revoked gateway key \"{$accessKey->name}\"");

        return back();
    }

    public function sync(Request $request): RedirectResponse
    {
        $data = $request->validate(['client_id' => ['nullable', 'exists:clients,id']]);
        Artisan::call('metering:pull', array_filter(['--client' => $data['client_id'] ?? null]));

        $this->audit->log('metering.pull', Client::find($data['client_id'] ?? 0), 'Ran usage pull');

        return back();
    }

    /** Re-price usage that metered at $0 because its model was unpriced at the time. */
    public function rebill(Request $request, MeteringService $metering): RedirectResponse
    {
        $data = $request->validate(['client_id' => ['nullable', 'exists:clients,id']]);
        $stats = $metering->rebill($data['client_id'] ?? null);

        $this->audit->log('metering.rebill', Client::find($data['client_id'] ?? 0), sprintf(
            'Re-billed %d record(s) for $%s', $stats['rebilled'], number_format($stats['billed_cents'] / 100, 2),
        ), $stats);

        return back()->with('rebill', $stats);
    }
}
