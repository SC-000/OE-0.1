<?php

namespace App\Services\Metering;

use App\Models\Client;
use App\Models\ClientModelRate;

/**
 * Resolves the markup (basis points) for a client+provider+model, most-specific
 * override wins, falling back to the client's default markup.
 */
class RateResolver
{
    public function markupBps(Client $client, string $provider, string $model): int
    {
        $candidates = ClientModelRate::query()
            ->where(fn ($q) => $q->where('client_id', $client->id)->orWhereNull('client_id'))
            ->where(fn ($q) => $q->where('provider', $provider)->orWhereNull('provider'))
            ->where(fn ($q) => $q->where('model', $model)->orWhereNull('model'))
            ->get();

        $best = null;
        $bestScore = -1;
        foreach ($candidates as $c) {
            $score = ($c->client_id ? 4 : 0) + ($c->provider ? 2 : 0) + ($c->model ? 1 : 0);
            if ($score > $bestScore) {
                $bestScore = $score;
                $best = $c;
            }
        }

        return $best?->markup_bps ?? $client->default_markup_bps;
    }
}
