<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\PaymentMethod;
use App\Models\ProcessedWebhook;
use App\Models\TopUp;
use App\Models\User;
use App\Services\Billing\AutoTopupService;
use App\Services\Billing\BillingsClient;
use Illuminate\Http\Request;

/**
 * Inbound billings.systems webhooks. HMAC-verified and idempotent; the money
 * handlers (confirm/reverse top-up) are themselves idempotent, so at-least-once
 * delivery can never double-credit.
 */
class BillingsWebhookController
{
    public function __construct(
        private BillingsClient $billings,
        private AutoTopupService $topups,
    ) {}

    public function __invoke(Request $request)
    {
        $raw = $request->getContent();
        $signature = (string) $request->header('X-Billings-Signature', '');

        if (! $this->billings->verifyWebhookSignature($signature, $raw)) {
            return response()->json(['error' => 'invalid signature'], 400);
        }

        $payload = json_decode($raw, true) ?: [];
        $eventId = $payload['id'] ?? $payload['event_id'] ?? null;
        $type = (string) ($payload['type'] ?? $payload['event'] ?? '');
        if (! $eventId) {
            return response()->json(['error' => 'missing event id'], 422);
        }

        $record = ProcessedWebhook::firstOrCreate(
            ['event_id' => $eventId],
            ['source' => 'billings', 'type' => $type, 'payload' => $payload],
        );
        if ($record->processed_at) {
            return response()->json(['ok' => true, 'deduplicated' => true]);
        }

        $this->process($type, $payload);
        $record->update(['processed_at' => now()]);

        return response()->json(['ok' => true]);
    }

    private function process(string $type, array $payload): void
    {
        // Customer lifecycle — backfill the billings customer id onto the client.
        // Self-heals even when the create-customer API returned a 500 but the
        // customer was in fact created (billings still fires customer.created).
        if ($type === 'customer.created' || $type === 'customer.updated') {
            $this->linkCustomer($payload);

            return;
        }

        // A card was saved via the SetupWidget — persist it so it shows in billing.
        if ($type === 'payment_method.attached') {
            $this->linkPaymentMethod($payload);

            return;
        }

        $invoiceId = data_get($payload, 'data.invoice.id')
            ?? data_get($payload, 'data.invoice_id')
            ?? data_get($payload, 'data.id');
        if (! $invoiceId) {
            return;
        }
        $topup = TopUp::where('billings_invoice_id', $invoiceId)->first();
        if (! $topup) {
            return;
        }

        match ($type) {
            'payment.succeeded', 'invoice.paid' => $this->topups->confirmTopup($topup, data_get($payload, 'data.transaction.id')),
            'payment.failed' => $this->topups->markFailed($topup, (string) data_get($payload, 'data.reason', 'payment failed')),
            'charge.refunded', 'refund.processed' => $this->topups->reverseTopup($topup),
            default => null,
        };
    }

    /** Persist the billings customer id onto the matching client. */
    private function linkCustomer(array $payload): void
    {
        $customerId = (string) data_get($payload, 'data.id', '');
        if ($customerId === '') {
            return;
        }
        $externalRef = (string) data_get($payload, 'data.external_ref', '');
        $email = (string) data_get($payload, 'data.email', '');

        $client = null;
        if (str_starts_with($externalRef, 'client_')) {
            $client = Client::find((int) substr($externalRef, 7));
        }
        if (! $client && $email !== '') {
            $client = User::where('email', $email)->first()?->client;
        }
        if ($client && ! $client->billings_customer_id) {
            $client->update(['billings_customer_id' => $customerId]);
        }
    }

    /** Persist a saved card onto the client's billing account. */
    private function linkPaymentMethod(array $payload): void
    {
        $customerId = (string) data_get($payload, 'data.customer_id', '');
        $pmId = (string) data_get($payload, 'data.id', '');
        if ($customerId === '' || $pmId === '') {
            return;
        }
        $client = Client::where('billings_customer_id', $customerId)->first();
        if (! $client) {
            return;
        }

        $hasDefault = PaymentMethod::where('client_id', $client->id)->where('is_default', true)->exists();
        $makeDefault = (bool) data_get($payload, 'data.is_default', false) || ! $hasDefault;
        if ($makeDefault) {
            PaymentMethod::where('client_id', $client->id)->update(['is_default' => false]);
        }
        PaymentMethod::updateOrCreate(
            ['client_id' => $client->id, 'billings_pm_id' => $pmId],
            [
                'brand' => (string) data_get($payload, 'data.card_brand', 'card'),
                'last4' => (string) data_get($payload, 'data.last4', ''),
                'exp_month' => ((int) data_get($payload, 'data.expiry_month', 0)) ?: null,
                'exp_year' => ((int) data_get($payload, 'data.expiry_year', 0)) ?: null,
                'is_default' => $makeDefault,
            ],
        );
    }
}
