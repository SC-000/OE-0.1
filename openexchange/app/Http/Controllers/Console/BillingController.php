<?php

namespace App\Http\Controllers\Console;

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
            'description' => match ($e->type) {
                'topup_credit' => 'Auto top-up',
                'refund' => 'Refund',
                default => 'Usage — inference',
            },
            'detail' => $e->description ?? '',
            'amount' => ($e->amount_cents >= 0 ? '+' : '−').'$'.number_format(abs($e->amount_cents) / 100, 2),
            'type' => $e->amount_cents >= 0 ? 'credit' : 'debit',
        ]);

        return Inertia::render('console/billing', [
            'balance' => $client->balanceDollars(),
            'settings' => [
                'auto_topup' => $client->auto_topup,
                'min' => (int) ($client->min_balance_cents / 100),
                'topup' => (int) ($client->topup_amount_cents / 100),
            ],
            'card' => $card ? [
                'brand' => strtoupper($card->brand ?? 'CARD'),
                'last4' => $card->last4,
                'exp' => sprintf('%02d / %02d', $card->exp_month, $card->exp_year % 100),
            ] : null,
            'transactions' => $transactions,
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
    public function storeCard(Request $request)
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
        ]);
    }
}

