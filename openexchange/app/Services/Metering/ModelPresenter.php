<?php

namespace App\Services\Metering;

use App\Models\Client;
use App\Models\ModelCatalog;

/**
 * The single gate between raw model ids and anything a client can see.
 *
 * Client portals must never interpolate `usage_records.model` directly — route it
 * through here. Per-client `model_visibility` decides the disclosure level:
 *
 *   aliased       (default) "OpenAI Premium"   — tier label, or the admin's own alias
 *   provider_only           "OpenAI"           — provider only, no tier
 *   exact                   "gpt-5.4"          — the real model id
 */
class ModelPresenter
{
    /** @var array<string, ModelCatalog>|null */
    private ?array $catalog = null;

    public function label(Client $client, string $provider, string $model): string
    {
        $visibility = $client->model_visibility ?: 'aliased';

        if ($visibility === 'exact') {
            return $model;
        }
        if ($visibility === 'provider_only') {
            return ModelCatalog::providerLabel($provider);
        }

        $row = $this->lookup($provider, $model);

        return $row
            ? $row->clientLabel()
            : ModelCatalog::providerLabel($provider).' '.ModelCatalog::tierLabel(null);
    }

    /**
     * Collapse a set of per-model rows into what the client should see. Two models
     * that both present as "OpenAI Premium" must merge into one line — otherwise the
     * duplicate rows leak exactly the model count we're hiding.
     *
     * @param  iterable<array{provider:string,model:string}&array<string,mixed>>  $rows
     * @param  list<string>  $sumKeys  numeric keys to add together when rows merge
     * @return list<array<string,mixed>>
     */
    public function group(Client $client, iterable $rows, array $sumKeys): array
    {
        $out = [];
        foreach ($rows as $row) {
            $label = $this->label($client, $row['provider'], $row['model']);
            if (! isset($out[$label])) {
                $out[$label] = array_merge($row, ['label' => $label]);
                unset($out[$label]['model'], $out[$label]['provider']);

                continue;
            }
            foreach ($sumKeys as $k) {
                $out[$label][$k] = ($out[$label][$k] ?? 0) + ($row[$k] ?? 0);
            }
        }

        return array_values($out);
    }

    private function lookup(string $provider, string $model): ?ModelCatalog
    {
        $this->catalog ??= ModelCatalog::all()->keyBy(fn ($m) => $m->provider.'|'.$m->model)->all();

        if ($row = $this->catalog[$provider.'|'.$model] ?? null) {
            return $row;
        }

        // Dated snapshots (…-2026-03-05) inherit their base model's alias.
        $base = preg_replace('/-\d{4}-\d{2}-\d{2}$/', '', $model);

        return $this->catalog[$provider.'|'.$base] ?? null;
    }
}
