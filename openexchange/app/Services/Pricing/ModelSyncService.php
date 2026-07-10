<?php

namespace App\Services\Pricing;

use App\Models\ModelCatalog;
use App\Models\ModelPriceProposal;
use App\Models\ProviderBackend;
use Illuminate\Support\Facades\Http;

/**
 * Keeps the model catalogue current, without ever moving your cost basis behind your back.
 *
 *  1. Discover — list the models actually available in your OpenAI + Google accounts.
 *  2. Add      — anything new gets a catalogue row (tiered by price band).
 *  3. Price    — an UNPRICED model is priced straight from the feed, so a model that
 *                shows up mid-month can never silently bill at $0.
 *  4. Propose  — a price CHANGE on an already-priced model does NOT apply. It lands in
 *                the review queue, because a moving cost basis moves your margin.
 *  5. Settle   — pricing a model immediately re-bills the usage that already metered
 *                against it at $0 (see ModelPricingService), so nothing stays unbilled.
 */
class ModelSyncService
{
    /** Ignore sub-cent noise and float dust. */
    private const EPSILON = 0.000001;

    public function __construct(
        private PricingResolver $resolver,
        private ModelPricingService $pricing,
    ) {}

    /**
     * @param  bool|null  $importFeed  null (default) = import the feed catalogue for every
     *                                 provider we hold credentials for, so a model released
     *                                 today is in the system and priced before anyone calls
     *                                 it. true = all gateway providers. false = discovery only.
     * @return array{discovered:int,added:int,priced:int,proposed:int,unchanged:int,rebilled:int,rebilled_cents:int,errors:list<string>}
     */
    public function sync(?bool $importFeed = null, bool $freshQuotes = true): array
    {
        $stats = ['discovered' => 0, 'added' => 0, 'priced' => 0, 'proposed' => 0, 'unchanged' => 0, 'rebilled' => 0, 'rebilled_cents' => 0, 'errors' => []];

        try {
            $quotes = $this->resolver->quotes(fresh: $freshQuotes);
        } catch (\Throwable $e) {
            $quotes = [];
            $stats['errors'][] = 'pricing feed: '.$e->getMessage();
        }

        // 1 + 2 — discover from the providers themselves, then optionally from the feed.
        $ids = [];
        foreach ([['openai', fn () => $this->openaiModels()], ['google', fn () => $this->googleModels()]] as [$provider, $list]) {
            try {
                foreach ($list() as $id) {
                    if ($this->isChatModel($provider, $id)) {
                        $ids[] = [$provider, $id];
                    }
                }
            } catch (\Throwable $e) {
                $stats['errors'][] = "{$provider} discovery: ".$e->getMessage();
            }
        }
        // Import the feed's catalogue for every provider we actually hold credentials for,
        // so a model that ships today is in the system (and priced) before anyone calls it.
        // Explicit `--import-feed` forces it on; `--no-import-feed` forces it off.
        $feedProviders = $importFeed === false ? [] : ($importFeed === true ? ['openai', 'google'] : $this->servableProviders());

        foreach ($quotes as $q) {
            // Only price-bearing chat models from providers we could actually serve.
            if (in_array($q->provider, $feedProviders, true) && $q->isPriced() && $this->isChatModel($q->provider, $q->model)) {
                $ids[] = [$q->provider, $q->model];
            }
        }

        foreach ($ids as [$provider, $id]) {
            $stats['discovered']++;
            if (! ModelCatalog::where('provider', $provider)->where('model', $id)->exists()) {
                ModelCatalog::create([
                    'provider' => $provider, 'model' => $id,
                    'input_usd_per_million' => 0, 'output_usd_per_million' => 0,
                    'active' => true, 'client_visible' => true,
                    'price_source' => 'seed', 'first_seen_at' => now(),
                ]);
                $stats['added']++;
            }
        }

        // 3 + 4 — reconcile every catalogue row against the feed, including rows that
        // metering auto-created when it saw an unknown model in usage.
        foreach (ModelCatalog::cursor() as $model) {
            $quote = $this->resolver->quoteFor($quotes, $model->provider, $model->model);
            if (! $quote || ! $quote->isPriced()) {
                $stats['unchanged']++;

                continue;
            }

            // Always record what the feed says — even when we don't act on it. This is
            // what lets the admin see drift against a hand-set price.
            $model->forceFill([
                'feed_input_usd_per_million' => $quote->inputUsdPerMillion,
                'feed_output_usd_per_million' => $quote->outputUsdPerMillion,
                'feed_ref' => $quote->ref,
                'feed_synced_at' => now(),
                'first_seen_at' => $model->first_seen_at ?? now(),
            ]);

            if (! $model->isPriced()) {
                // Pricing it also settles any usage that already metered at $0 against it.
                $settled = $this->pricing->applyQuote($model, $quote);
                $stats['priced']++;
                $stats['rebilled'] += $settled['rebilled'];
                $stats['rebilled_cents'] += $settled['billed_cents'];

                continue;
            }

            $model->tier ??= ModelCatalog::tierFor($model->blendedUsdPerMillion());
            $model->save();

            if ($this->differs($model, $quote)) {
                if ($this->propose($model, $quote)) {
                    $stats['proposed']++;
                } else {
                    $stats['unchanged']++;
                }
            } else {
                $stats['unchanged']++;
            }
        }

        return $stats;
    }

    /**
     * Accept a proposal: move the cost basis, settle any $0 usage, close the row.
     *
     * @return array{rebilled:int, billed_cents:int, credited:int}
     */
    public function acceptProposal(ModelPriceProposal $proposal, ?int $userId = null): array
    {
        $settled = $this->pricing->applyPrice(
            $proposal->model,
            (float) $proposal->proposed_input_usd_per_million,
            (float) $proposal->proposed_output_usd_per_million,
            $proposal->source,
        );

        $proposal->forceFill(['status' => 'accepted', 'resolved_by' => $userId, 'resolved_at' => now()])->save();

        return $settled;
    }

    public function rejectProposal(ModelPriceProposal $proposal, ?int $userId = null): void
    {
        $proposal->forceFill(['status' => 'rejected', 'resolved_by' => $userId, 'resolved_at' => now()])->save();
    }

    private function differs(ModelCatalog $model, PriceQuote $quote): bool
    {
        return abs((float) $model->input_usd_per_million - $quote->inputUsdPerMillion) > self::EPSILON
            || abs((float) $model->output_usd_per_million - $quote->outputUsdPerMillion) > self::EPSILON;
    }

    /**
     * Raise (or refresh) the pending proposal for this model. Returns false when the
     * admin has already rejected exactly this price — we don't nag on every sync.
     */
    private function propose(ModelCatalog $model, PriceQuote $quote): bool
    {
        $alreadyRejected = ModelPriceProposal::where('model_catalog_id', $model->id)
            ->where('status', 'rejected')
            ->get()
            ->contains(fn ($p) => abs((float) $p->proposed_input_usd_per_million - $quote->inputUsdPerMillion) <= self::EPSILON
                && abs((float) $p->proposed_output_usd_per_million - $quote->outputUsdPerMillion) <= self::EPSILON);

        if ($alreadyRejected) {
            return false;
        }

        ModelPriceProposal::updateOrCreate(
            ['model_catalog_id' => $model->id, 'status' => 'pending'],
            [
                'current_input_usd_per_million' => $model->input_usd_per_million,
                'current_output_usd_per_million' => $model->output_usd_per_million,
                'proposed_input_usd_per_million' => $quote->inputUsdPerMillion,
                'proposed_output_usd_per_million' => $quote->outputUsdPerMillion,
                'source' => $quote->source,
            ],
        );

        return true;
    }

    /**
     * Providers we hold working credentials for. Importing the feed's whole catalogue for
     * a provider we can't call would list models the gateway would only 503 on.
     *
     * @return list<string>
     */
    private function servableProviders(): array
    {
        $providers = ProviderBackend::where('status', 'active')->distinct()->pluck('provider')->all();

        if (config('openexchange.openai.admin_key') && ! in_array('openai', $providers, true)) {
            $providers[] = 'openai';
        }

        return array_values(array_intersect($providers, ['openai', 'google']));
    }

    private function isChatModel(string $provider, string $id): bool
    {
        // ":free" / ":thinking" are OpenRouter serving variants, not model ids we resell.
        if (str_contains($id, ':')) {
            return false;
        }

        return match ($provider) {
            // gpt-oss-* are open-weight models OpenAI publishes but does not serve on its API.
            'openai' => (bool) preg_match('/^(gpt|o\d|chatgpt)/', $id)
                && ! str_starts_with($id, 'gpt-oss')
                && ! preg_match('/(audio|realtime|transcribe|tts|image|search|embedding|moderation)/', $id),
            'google' => str_contains($id, 'gemini') && ! str_contains($id, 'embedding'),
            default => true,
        };
    }

    /** @return list<string> */
    private function openaiModels(): array
    {
        $key = ProviderBackend::pick('openai')?->secret ?: config('openexchange.openai.admin_key');
        if (! $key) {
            return [];
        }
        $base = rtrim((string) config('openexchange.openai.base', 'https://api.openai.com'), '/');
        $res = Http::withToken($key)->timeout(20)->get($base.'/v1/models');

        return $res->successful() ? collect($res->json('data', []))->pluck('id')->filter()->values()->all() : [];
    }

    /** @return list<string> */
    private function googleModels(): array
    {
        $key = ProviderBackend::pick('google', 'aistudio')?->secret;
        if (! $key) {
            return [];
        }
        $res = Http::timeout(20)->get('https://generativelanguage.googleapis.com/v1beta/models', ['key' => $key, 'pageSize' => 200]);

        return $res->successful()
            ? collect($res->json('models', []))->pluck('name')->filter()->map(fn ($n) => str_replace('models/', '', (string) $n))->values()->all()
            : [];
    }
}
