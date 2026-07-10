<?php

namespace App\Http\Controllers\Admin;

use App\Models\Client;
use App\Models\ClientModelRate;
use App\Models\ModelCatalog;
use App\Services\Admin\AuditLogger;
use App\Services\Metering\RateResolver;
use App\Services\Metering\ResolvedRate;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

/**
 * The rate card. A row can be scoped at any level — global, one provider, one model,
 * one client, or one client+model — and priced either as a markup over provider cost
 * or as an absolute $/1M sell price.
 */
class RatesController
{
    public function __construct(private AuditLogger $audit) {}

    /** Create or replace a rate-card row at any scope. */
    public function upsert(Request $request): RedirectResponse
    {
        $data = $request->validate([
            'client_id' => ['nullable', 'exists:clients,id'],
            'provider' => ['nullable', 'string', 'max:40'],
            'model' => ['nullable', 'string', 'max:120'],
            'pricing_mode' => ['required', Rule::in(['markup', 'fixed'])],

            'markup_bps' => ['nullable', 'required_if:pricing_mode,markup', 'integer', 'min:0', 'max:1000000'],
            'input_usd_per_million' => ['nullable', 'required_if:pricing_mode,fixed', 'numeric', 'min:0', 'max:100000'],
            'output_usd_per_million' => ['nullable', 'required_if:pricing_mode,fixed', 'numeric', 'min:0', 'max:100000'],

            'per_request_fee_cents' => ['nullable', 'integer', 'min:0', 'max:100000'],
            'min_margin_bps' => ['nullable', 'integer', 'min:0', 'max:1000000'],
            'note' => ['nullable', 'string', 'max:160'],
        ]);

        // A model-scoped rate is meaningless without its provider — infer it.
        if (! empty($data['model']) && empty($data['provider'])) {
            $data['provider'] = ModelCatalog::where('model', $data['model'])->value('provider');
        }

        $fixed = $data['pricing_mode'] === 'fixed';

        $rate = ClientModelRate::updateOrCreate(
            [
                'client_id' => $data['client_id'] ?? null,
                'provider' => $data['provider'] ?? null,
                'model' => $data['model'] ?? null,
            ],
            [
                'pricing_mode' => $data['pricing_mode'],
                // Keep the unused mode's columns null so a row can never read as both.
                'markup_bps' => $fixed ? null : (int) $data['markup_bps'],
                'input_usd_per_million' => $fixed ? $data['input_usd_per_million'] : null,
                'output_usd_per_million' => $fixed ? $data['output_usd_per_million'] : null,
                'per_request_fee_cents' => (int) ($data['per_request_fee_cents'] ?? 0),
                'min_margin_bps' => $data['min_margin_bps'] ?? null,
                'note' => $data['note'] ?? null,
            ],
        );

        $this->audit->log('rate.upsert', $rate->client, $this->describe($rate), $rate->only([
            'id', 'client_id', 'provider', 'model', 'pricing_mode', 'markup_bps', 'input_usd_per_million', 'output_usd_per_million',
        ]));

        return back();
    }

    public function destroy(Request $request): RedirectResponse
    {
        $data = $request->validate(['id' => ['required', 'exists:client_model_rates,id']]);
        $rate = ClientModelRate::findOrFail($data['id']);
        $client = $rate->client;
        $summary = $this->describe($rate);
        $rate->delete();

        $this->audit->log('rate.delete', $client, $summary);

        return back();
    }

    /** The platform-wide default markup (the NULL/NULL/NULL row). */
    public function updateDefault(Request $request): RedirectResponse
    {
        $data = $request->validate(['markup_bps' => ['required', 'integer', 'min:0', 'max:1000000']]);

        ClientModelRate::updateOrCreate(
            ['client_id' => null, 'provider' => null, 'model' => null],
            ['pricing_mode' => 'markup', 'markup_bps' => $data['markup_bps']],
        );

        $this->audit->log('rate.default', null, 'Global default markup set to '.number_format($data['markup_bps'] / 100, 2).'%');

        return back();
    }

    /**
     * Price a hypothetical request against the live rate card. Lets the admin see
     * exactly what a client would be charged before committing a rate.
     */
    public function preview(Request $request, RateResolver $rates): JsonResponse
    {
        $data = $request->validate([
            'client_id' => ['required', 'exists:clients,id'],
            'provider' => ['required', 'string', 'max:40'],
            'model' => ['required', 'string', 'max:120'],
            'input_tokens' => ['required', 'integer', 'min:0', 'max:1000000000'],
            'output_tokens' => ['required', 'integer', 'min:0', 'max:1000000000'],
        ]);

        $client = Client::query()->whereKey($data['client_id'])->firstOrFail();
        $catalog = ModelCatalog::where('provider', $data['provider'])->where('model', $data['model'])->first();
        $cost = $catalog?->costCents((int) $data['input_tokens'], (int) $data['output_tokens']) ?? 0;

        $rate = $rates->resolve($client, $data['provider'], $data['model']);
        $billed = $rate->billedCents($cost, (int) $data['input_tokens'], (int) $data['output_tokens'], requests: 1);

        return response()->json([
            'provider_cost_cents' => $cost,
            'billed_cents' => $billed,
            'margin_cents' => $billed - $cost,
            'effective_markup_bps' => ResolvedRate::effectiveMarkupBps($cost, $billed),
            'rate' => ['mode' => $rate->mode, 'origin' => $rate->origin, 'label' => $rate->label()],
            'priced' => (bool) $catalog?->isPriced(),
        ]);
    }

    private function describe(ClientModelRate $rate): string
    {
        $scope = implode(' / ', array_filter([
            $rate->client_id ? 'client #'.$rate->client_id : 'all clients',
            $rate->provider ?: 'all providers',
            $rate->model ?: 'all models',
        ]));

        return $scope.' → '.ResolvedRate::fromRow($rate)->label();
    }
}
