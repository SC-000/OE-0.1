<?php

namespace App\Http\Controllers\Admin;

use App\Models\Charge;
use App\Models\Client;
use App\Services\Admin\AuditLogger;
use App\Services\Billing\ChargeService;
use Illuminate\Http\JsonResponse;
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

    /**
     * A partial patch: only the fields actually sent are touched, so the name can be
     * renamed or cleared on its own without restating the whole charge.
     *
     * Renaming is forward-only. The ledger lines this charge has already written keep
     * the name they were billed under — a statement the client has already read is a
     * record of what happened, not a draft.
     */
    public function update(Request $request, Charge $charge): RedirectResponse
    {
        $data = $request->validate([
            // A usage charge may be nameless; a fee may not — its name is the only thing
            // telling the client what the debit is for.
            'name' => ['sometimes', $charge->isUsage() ? 'nullable' : 'required', 'string', 'max:120'],
            'description' => ['sometimes', 'nullable', 'string', 'max:500'],
            'amount_cents' => ['sometimes', 'integer', 'min:-10000000', 'max:10000000'],
            'active' => ['sometimes', 'boolean'],
            'ends_at' => ['sometimes', 'nullable', 'date'],
        ]);

        if (array_key_exists('name', $data)) {
            $data['name'] = $this->normalizeName($data['name']);
        }

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

    /**
     * What a usage charge would bill, before the admin commits to it. Priced by
     * ChargeService itself, so the quote on the form is the charge, not an estimate
     * of it.
     */
    public function preview(Request $request): JsonResponse
    {
        $data = $request->validate([
            'client_id' => ['required', 'exists:clients,id'],
            'provider' => ['required', 'string', 'max:40'],
            'model' => ['required', 'string', 'max:120'],
            'input_tokens' => ['nullable', 'integer', 'min:0', 'max:1000000000'],
            'output_tokens' => ['nullable', 'integer', 'min:0', 'max:1000000000'],
            'amount_cents' => ['nullable', 'integer', 'min:0', 'max:10000000'],
        ]);

        $client = Client::query()->whereKey($data['client_id'])->firstOrFail();

        return response()->json($this->charges->quoteUsage(
            $client,
            $data['provider'],
            $data['model'],
            (int) ($data['input_tokens'] ?? 0),
            (int) ($data['output_tokens'] ?? 0),
            (int) ($data['amount_cents'] ?? 0),
        )->toArray());
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

        $name = $charge->displayName();

        return back()->with('charge_run', $run
            ? "Billed {$name}."
            : "{$name} was already billed for this period.");
    }

    /** @return array<string, mixed> */
    private function validated(Request $request): array
    {
        $data = $request->validate([
            'client_id' => ['required', 'exists:clients,id'],
            'kind' => ['required', Rule::in(['fee', 'usage'])],
            'cadence' => ['required', Rule::in(['once', 'daily', 'monthly'])],
            // A fee must be named or the client cannot tell what they are paying for.
            // A usage charge need not be: unnamed, it reads as plain inference, which is
            // what it is.
            'name' => ['required_if:kind,fee', 'nullable', 'string', 'max:120'],
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

        $data['name'] = $this->normalizeName($data['name'] ?? null);
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

    /**
     * A cleared field means "no name", not an empty name. Whitespace is not a label, and
     * "" would print as a blank detail line where NULL prints as nothing at all.
     */
    private function normalizeName(?string $name): ?string
    {
        $name = trim((string) $name);

        return $name === '' ? null : $name;
    }

    private function describe(Charge $charge): string
    {
        $name = $charge->name ?: 'Unnamed';

        if ($charge->isUsage()) {
            return sprintf(
                '%s (%s usage: %s, %s in / %s out tokens)',
                $name, $charge->cadence, $charge->model,
                number_format($charge->input_tokens), number_format($charge->output_tokens),
            );
        }

        $verb = $charge->amount_cents >= 0 ? 'fee' : 'credit';

        return sprintf('%s (%s %s: $%s)', $name, $charge->cadence, $verb, number_format(abs($charge->amount_cents) / 100, 2));
    }
}
