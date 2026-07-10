<?php

namespace App\Http\Controllers\Admin;

use App\Models\Charge;
use App\Models\Client;
use App\Services\Admin\AuditLogger;
use App\Services\Billing\ChargeService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ChargesController
{
    public function __construct(
        private ChargeService $charges,
        private AuditLogger $audit,
    ) {}

    public function store(Request $request): RedirectResponse
    {
        $data = $this->validated($request);
        $client = Client::query()->whereKey($data['client_id'])->firstOrFail();

        $charge = Charge::create($data + ['created_by' => $request->user()->id]);

        $this->audit->log('charge.create', $client, $this->describe($charge), $charge->only([
            'id', 'kind', 'cadence', 'name', 'amount_cents', 'model', 'input_tokens', 'output_tokens',
        ]));

        // A one-off is an instruction to bill now, not a schedule.
        if ($charge->cadence === 'once') {
            $this->charges->apply($charge->load('client'));
        }

        return back();
    }

    public function update(Request $request, Charge $charge): RedirectResponse
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:500'],
            'amount_cents' => ['required', 'integer', 'min:-10000000', 'max:10000000'],
            'active' => ['required', 'boolean'],
            'ends_at' => ['nullable', 'date'],
        ]);

        $charge->update($data);
        $this->audit->log('charge.update', $charge->client, $this->describe($charge));

        return back();
    }

    public function destroy(Charge $charge): RedirectResponse
    {
        $client = $charge->client;
        $summary = $this->describe($charge);
        $charge->delete(); // charge_runs cascade; the ledger entries they wrote stay put

        $this->audit->log('charge.delete', $client, $summary);

        return back();
    }

    /** Bill a recurring charge immediately for the current period (idempotent). */
    public function runNow(Charge $charge): RedirectResponse
    {
        $run = $this->charges->apply($charge->load('client'));

        $this->audit->log(
            'charge.run',
            $charge->client,
            $run ? $this->describe($charge).' — billed now' : $this->describe($charge).' — already billed this period',
        );

        return back()->with('charge_run', $run
            ? "Billed {$charge->name}."
            : "{$charge->name} was already billed for this period.");
    }

    /** @return array<string, mixed> */
    private function validated(Request $request): array
    {
        $data = $request->validate([
            'client_id' => ['required', 'exists:clients,id'],
            'kind' => ['required', Rule::in(['fee', 'usage'])],
            'cadence' => ['required', Rule::in(['once', 'daily', 'monthly'])],
            'name' => ['required', 'string', 'max:120'],
            'description' => ['nullable', 'string', 'max:500'],

            // fee: signed — negative is a credit. usage: 0 means "price it off the rate card".
            'amount_cents' => ['required_if:kind,fee', 'integer', 'min:-10000000', 'max:10000000'],

            'provider' => ['nullable', 'required_if:kind,usage', 'string', 'max:40'],
            'model' => ['nullable', 'required_if:kind,usage', 'string', 'max:120'],
            'input_tokens' => ['nullable', 'integer', 'min:0', 'max:1000000000'],
            'output_tokens' => ['nullable', 'integer', 'min:0', 'max:1000000000'],

            'starts_at' => ['nullable', 'date'],
            'ends_at' => ['nullable', 'date', 'after:starts_at'],
        ]);

        $data['amount_cents'] = (int) ($data['amount_cents'] ?? 0);
        $data['input_tokens'] = (int) ($data['input_tokens'] ?? 0);
        $data['output_tokens'] = (int) ($data['output_tokens'] ?? 0);
        $data['active'] = true;

        // A usage charge with no tokens and no flat amount would bill $0 forever.
        if ($data['kind'] === 'usage' && $data['amount_cents'] === 0 && $data['input_tokens'] + $data['output_tokens'] === 0) {
            abort(422, 'A usage charge needs either token counts or a flat amount.');
        }

        return $data;
    }

    private function describe(Charge $charge): string
    {
        if ($charge->isUsage()) {
            return sprintf(
                '%s (%s usage: %s, %s in / %s out tokens)',
                $charge->name, $charge->cadence, $charge->model,
                number_format($charge->input_tokens), number_format($charge->output_tokens),
            );
        }

        $verb = $charge->amount_cents >= 0 ? 'fee' : 'credit';

        return sprintf('%s (%s %s: $%s)', $charge->name, $charge->cadence, $verb, number_format(abs($charge->amount_cents) / 100, 2));
    }
}
