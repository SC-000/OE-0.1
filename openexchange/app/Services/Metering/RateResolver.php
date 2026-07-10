<?php

namespace App\Services\Metering;

use App\Models\Client;
use App\Models\ClientModelRate;

/**
 * Resolves the rate card for a client+provider+model. Most-specific override wins:
 *
 *   client+model  >  client+provider  >  client  >  global+model  >  global+provider  >  global
 *
 * …falling back to the client's own default markup when no row matches at all.
 */
class RateResolver
{
    public function resolve(Client $client, string $provider, string $model): ResolvedRate
    {
        $row = $this->bestRow($client, $provider, $model);

        return $row
            ? ResolvedRate::fromRow($row)
            : ResolvedRate::markup($client->default_markup_bps, 'client_default');
    }

    /** Back-compat convenience: the markup only. Returns 0 for fixed-price rows. */
    public function markupBps(Client $client, string $provider, string $model): int
    {
        $rate = $this->resolve($client, $provider, $model);

        return $rate->mode === 'markup' ? (int) ($rate->markupBps ?? 0) : 0;
    }

    private function bestRow(Client $client, string $provider, string $model): ?ClientModelRate
    {
        $candidates = ClientModelRate::query()
            ->where(fn ($q) => $q->where('client_id', $client->id)->orWhereNull('client_id'))
            ->where(fn ($q) => $q->where('provider', $provider)->orWhereNull('provider'))
            ->where(fn ($q) => $q->where('model', $model)->orWhereNull('model'))
            ->get();

        $best = null;
        $bestScore = -1;
        foreach ($candidates as $c) {
            $score = $c->specificity();
            if ($score > $bestScore) {
                $bestScore = $score;
                $best = $c;
            }
        }

        return $best;
    }
}
