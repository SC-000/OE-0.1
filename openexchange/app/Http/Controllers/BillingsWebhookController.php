<?php

namespace App\Http\Controllers;

use App\Models\ProcessedWebhook;
use App\Models\TopUp;
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
}
