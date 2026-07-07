<?php

namespace App\Http\Controllers\Console;

use App\Models\AccessKey;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class SourcesController
{
    use ClientContext;

    public function index(Request $request): Response
    {
        $client = $this->client($request);
        $monthStart = now()->startOfMonth();

        $sources = AccessKey::where('client_id', $client->id)->where('status', 'active')->orderByDesc('id')->get()->map(function ($k) use ($client, $monthStart) {
            $rows = $client->usageRecords()->where('access_key_id', $k->id)->where('period_start', '>=', $monthStart);
            $spend = (int) (clone $rows)->sum('billed_cents');
            $tokens = (int) (clone $rows)->selectRaw('COALESCE(SUM(input_tokens+output_tokens),0) s')->value('s');

            return [
                'id' => $k->id,
                'label' => $k->name,
                'prefix' => $k->prefix,
                'spend' => '$'.number_format($spend / 100, 2),
                'tokens' => $tokens >= 1_000_000 ? number_format($tokens / 1_000_000, 2).'M' : number_format($tokens),
                'lastUsed' => $k->last_used_at?->diffForHumans() ?? 'never',
            ];
        });

        return Inertia::render('console/sources', [
            'sources' => $sources,
            'newKey' => session('new_access_key'),
        ]);
    }

    public function store(Request $request)
    {
        $client = $this->client($request);
        $data = $request->validate(['name' => ['required', 'string', 'max:60']]);
        [$model, $secret] = AccessKey::generate($client, $data['name']);

        return back()->with('new_access_key', ['name' => $model->name, 'secret' => $secret]);
    }

    public function updateLabel(Request $request, AccessKey $source)
    {
        abort_unless($source->client_id === $this->client($request)->id, 403);
        $data = $request->validate(['label' => ['required', 'string', 'max:60']]);
        $source->update(['name' => $data['label']]);

        return back();
    }

    public function revoke(Request $request, AccessKey $source)
    {
        abort_unless($source->client_id === $this->client($request)->id, 403);
        $source->update(['status' => 'revoked']);

        return back();
    }
}
