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

        // Project ids Discover actually found upstream. A key pointing at anything else
        // will pull an EMPTY result forever — the provider returns no error for an
        // unknown project, which is why usage can be visible in Discover and never billed.
        $knownProjects = collect(Cache::get('oe.discovery.openai.projects', []))->pluck('id')->all();
        $discoveryRan = Cache::get('oe.discovery.openai.at') !== null;

        $keys = ProviderKey::with('client')->orderByDesc('last_synced_at')->get()->map(function ($k) use ($monthStart, $knownProjects, $discoveryRan) {
            $rows = UsageRecord::where('provider_key_id', $k->id)->where('period_start', '>=', $monthStart);
            $billed = (int) (clone $rows)->sum('billed_cents');
            $records = (clone $rows)->count();

            $unknownProject = $discoveryRan
                && $k->provider === 'openai'
                && $k->external_project_id
                && ! in_array($k->external_project_id, $knownProjects, true);

            return [
                'id' => $k->id,
                'provider' => ModelCatalog::providerLabel($k->provider),
                'project' => $k->external_project_id ?: '—',
                'label' => $k->displayLabel(),
                'client' => $k->client?->name ?? '— unassigned',
                'client_id' => $k->client_id,
                'status' => match (true) {
                    $k->status !== 'active' => 'disabled',
                    $k->last_error !== null => 'error',
                    $unknownProject => 'unknown_project',
                    $k->last_synced_at === null => 'pending',
                    $records > 0 => 'billing',
                    ($k->last_pull_records ?? null) === 0 => 'no_data',
                    default => 'idle',
                },
                'revenue_cents' => $billed,
                'records' => $records,
                'synced' => $k->last_synced_at?->diffForHumans() ?? 'never',
                'last_error' => $k->last_error,
                'last_pull_records' => $k->last_pull_records,
                'unknown_project' => $unknownProject,
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
            // Without these the pull cannot authenticate and will never bill anything.
            'credentials' => [
                'openai_admin_key' => (bool) config('openexchange.openai.admin_key'),
                'google_credentials' => (bool) config('openexchange.google.credentials'),
            ],
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

    /**
     * Run the usage pull now, and SAY what happened. This used to `return back()` with
     * no flash, so a pull that failed on missing credentials — or one that succeeded
     * while matching nothing upstream — was indistinguishable from a pull that worked.
     */
    public function sync(Request $request, MeteringService $metering): RedirectResponse
    {
        $data = $request->validate(['client_id' => ['nullable', 'exists:clients,id']]);
        Artisan::call('metering:pull', array_filter(['--client' => $data['client_id'] ?? null]));

        $run = Cache::get('oe.metering.last_run', []);
        $this->audit->log('metering.pull', Client::find($data['client_id'] ?? 0), sprintf(
            'Ran usage pull: %d key(s), %d metered, %d failed',
            $run['keys'] ?? 0, $run['metered'] ?? 0, $run['failed'] ?? 0,
        ), $run);

        return back()->with('flash', $this->pullMessage($run, $metering));
    }

    /** @param  array<string, mixed>  $run */
    private function pullMessage(array $run, MeteringService $metering): array
    {
        $keys = (int) ($run['keys'] ?? 0);
        $metered = (int) ($run['metered'] ?? 0);
        $failed = (int) ($run['failed'] ?? 0);
        $empty = (int) ($run['empty'] ?? 0);
        $billed = (int) ($run['billed_cents'] ?? 0);

        if ($keys === 0) {
            return ['type' => 'info', 'message' => 'No active provider keys to pull from. Attach one under Attribution, or assign a discovered project.'];
        }

        if ($failed > 0) {
            $first = $run['errors'][0] ?? 'unknown error';

            return ['type' => 'error', 'message' => "{$failed} of {$keys} key(s) failed. {$first}"];
        }

        if ($metered === 0) {
            // The pull worked; upstream just had nothing for these project ids. That is
            // almost always a project id that doesn't exist in the provider account.
            $hint = $empty > 0
                ? " {$empty} key(s) returned no data — check their project id exists upstream (run Discover)."
                : '';

            return ['type' => 'info', 'message' => "Pull completed. Nothing new to meter.{$hint}"];
        }

        $outstanding = $metering->pendingRebillCount();
        $note = $outstanding > 0 ? " {$outstanding} record(s) are still unpriced — see Models & pricing." : '';

        return ['type' => 'success', 'message' => sprintf(
            'Pulled %d key(s): %d record(s) metered, $%s billed.%s',
            $keys, $metered, number_format($billed / 100, 2), $note,
        )];
    }

    /** Re-price every usage record still missing a cost basis, across all models. */
    public function rebill(Request $request, MeteringService $metering): RedirectResponse
    {
        $data = $request->validate(['client_id' => ['nullable', 'exists:clients,id']]);
        $stats = $metering->rebill($data['client_id'] ?? null);

        $this->audit->log('metering.rebill', Client::find($data['client_id'] ?? 0), sprintf(
            'Re-billed %d record(s) — net $%s', $stats['rebilled'], number_format($stats['billed_cents'] / 100, 2),
        ), $stats);

        if ($stats['rebilled'] === 0) {
            $outstanding = $metering->pendingRebillCount();

            return back()->with('flash', ['type' => 'info', 'message' => $outstanding > 0
                ? "{$outstanding} usage record(s) still have no cost basis, but their models are unpriced. Price them under Models & pricing first."
                : 'Nothing to re-bill — every usage record already has a cost basis.']);
        }

        $net = $stats['billed_cents'];

        return back()->with('flash', ['type' => 'success', 'message' => sprintf(
            'Re-billed %d usage record(s) — %s $%s.',
            $stats['rebilled'], $net >= 0 ? 'billed' : 'credited back', number_format(abs($net) / 100, 2),
        )]);
    }
}
