<?php

namespace App\Http\Controllers\Console;

use App\Models\TopUp;
use App\Services\Billing\AutoTopupService;
use App\Services\Billing\BillingsClient;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class BillingController
{
    use ClientContext;

    public function index(Request $request): Response
    {
        $client = $this->client($request);
        $card = $client->defaultPaymentMethod();

        $transactions = $client->ledger()->latest()->limit(12)->get()->map(fn ($e) => [
            'date' => $e->created_at->format('M j, Y'),
            // A fee is not inference. Label each line as what it actually is — the
            // charge's own name for fees and credits, generic wording for usage.
            'description' => match ($e->type) {
                'topup_credit' => 'Auto top-up',
                'refund' => 'Refund',
                'fee' => $e->description ?: 'Platform fee',
                'credit' => $e->description ?: 'Credit',
                'adjustment' => $e->description ?: 'Account adjustment',
                default => 'Usage — inference',
            },
            // Usage ledger descriptions are internal ("gateway openai/gpt-5.4") and would
            // leak the raw model id. Only charge-backed lines carry an admin-authored name.
            'detail' => $e->type === 'usage_debit' && ! isset($e->meta['charge_id']) ? '' : ($e->description ?? ''),
            'amount' => ($e->amount_cents >= 0 ? '+' : '−').'$'.number_format(abs($e->amount_cents) / 100, 2),
            'type' => $e->amount_cents >= 0 ? 'credit' : 'debit',
        ]);

        $brandLabel = $card ? strtoupper($card->brand ?? 'CARD') : null;
        $methodLabel = $card ? trim($brandLabel.' •••• '.$card->last4) : null;

        // Every prepaid top-up on the account, newest first — each one is a receiptable
        // payment. The card shown is the current default; we don't retain a per-top-up
        // snapshot, so treat it as "card on file" rather than a historical fact.
        $topups = $client->topUps()->latest()->limit(60)->get()->map(fn ($t) => [
            'id' => (int) $t->id,
            // A long, random-looking receipt number that stays stable for a given
            // top-up: derived from its immutable id, so the same payment always
            // resolves to the same number rather than changing on every reload.
            'receipt_no' => 'OX-'.substr(preg_replace('/\D/', '', hash('sha256', 'ox-receipt:'.$t->id)).'000000000000', 0, 12),
            'date' => $t->created_at->format('M j, Y'),
            'time' => $t->created_at->format('H:i').' UTC',
            'amount' => '$'.number_format($t->amount_cents / 100, 2),
            'amount_cents' => (int) $t->amount_cents,
            'status' => $t->status,
            'trigger' => $t->trigger,
            'method' => $methodLabel,
            'reference' => $t->billings_transaction_id ?: ($t->billings_invoice_id ?: null),
        ])->values();

        return Inertia::render('console/billing', [
            'balance' => $client->balanceDollars(),
            'settings' => [
                'auto_topup' => $client->auto_topup,
                'min' => (int) ($client->min_balance_cents / 100),
                'topup' => (int) ($client->topup_amount_cents / 100),
            ],
            'card' => $card ? [
                'brand' => $brandLabel,
                'last4' => $card->last4,
                'exp' => sprintf('%02d / %02d', $card->exp_month, $card->exp_year % 100),
            ] : null,
            'account' => [
                'name' => $client->company ?: $client->name,
                'email' => $client->primaryEmail(),
            ],
            'topups' => $topups,
            'transactions' => $transactions,
            'topping' => TopUp::where('client_id', $client->id)->where('status', 'pending')->exists(),
            'publishableKey' => config('openexchange.billings.publishable'),
        ]);
    }

    public function updateSettings(Request $request)
    {
        $data = $request->validate([
            'auto_topup' => ['required', 'boolean'],
            'min' => ['required', 'integer', 'min:5', 'max:1000'],
            'topup' => ['required', 'integer', 'min:10', 'max:5000'],
        ]);

        $this->client($request)->update([
            'auto_topup' => $data['auto_topup'],
            'min_balance_cents' => $data['min'] * 100,
            'topup_amount_cents' => $data['topup'] * 100,
        ]);

        return back();
    }

    public function topup(Request $request, AutoTopupService $topups)
    {
        $topups->topup($this->client($request), 'manual');

        return back();
    }

    /** Persist a payment method after the billings.systems SetupWidget tokenises a card. */
    public function storeCard(Request $request, AutoTopupService $topups)
    {
        $data = $request->validate([
            'payment_method_id' => ['required', 'string', 'max:120'],
            'brand' => ['nullable', 'string', 'max:40'],
            'last4' => ['nullable', 'string', 'max:4'],
            'exp_month' => ['nullable', 'integer', 'min:1', 'max:12'],
            'exp_year' => ['nullable', 'integer', 'min:2024', 'max:2100'],
        ]);

        $client = $this->client($request);
        $client->paymentMethods()->update(['is_default' => false]);
        $client->paymentMethods()->create([
            'billings_pm_id' => $data['payment_method_id'],
            'brand' => $data['brand'] ?? 'card',
            'last4' => $data['last4'] ?? null,
            'exp_month' => $data['exp_month'] ?? null,
            'exp_year' => $data['exp_year'] ?? null,
            'is_default' => true,
        ]);

        // Fund the prepaid balance immediately so the account is ready to use.
        // Charges the client's top-up amount once, only when live and below minimum.
        $client->refresh();
        $live = config('openexchange.billings.token') && config('openexchange.billings.publishable') && $client->billings_customer_id;
        if ($live && $client->balance_cents < $client->min_balance_cents) {
            try {
                $topups->topup($client, 'initial');
            } catch (Throwable $e) {
                report($e);
            }
        }

        return back();
    }

    /** Add-card screen — provides the SetupWidget key + customer when billings is configured. */
    public function addCard(Request $request, BillingsClient $billings): Response
    {
        $client = $this->client($request);
        $customerId = $client->billings_customer_id;

        if (! $customerId && config('openexchange.billings.token') && config('openexchange.billings.publishable')) {
            try {
                $customerId = $billings->ensureCustomer($client);
            } catch (Throwable $e) {
                report($e);
            }
        }

        return Inertia::render('console/add-card', [
            'publishableKey' => config('openexchange.billings.publishable'),
            'customerId' => $customerId,
            'widgetBase' => rtrim((string) config('openexchange.billings.base'), '/'),
            'hasToken' => (bool) config('openexchange.billings.token'),
            'topupAmount' => (int) round($client->topup_amount_cents / 100),
        ]);
    }
}
