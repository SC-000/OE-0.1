<?php

namespace App\Services\Billing;

use App\Models\Client;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;
use RuntimeException;

/**
 * Thin, typed wrapper over the billings.systems server REST API (Stripe-on-top).
 * All money is in integer cents. Never handles raw card data — cards are
 * tokenised in the browser via the SetupWidget (publishable key).
 */
class BillingsClient
{
    private function http(?string $idempotencyKey = null): PendingRequest
    {
        $token = config('openexchange.billings.token');
        if (! $token) {
            throw new RuntimeException('BILLINGS_TOKEN is not configured.');
        }

        $req = Http::withToken($token)
            ->baseUrl(rtrim((string) config('openexchange.billings.base'), '/').'/api/v1')
            ->acceptJson()
            ->timeout(20)
            ->retry(2, 300, throw: false);

        // billings.systems requires an Idempotency-Key on every mutating (POST)
        // request. A stable key also makes our internal retries safe from creating
        // duplicate customers or double-charging.
        return $idempotencyKey ? $req->withHeaders(['Idempotency-Key' => $idempotencyKey]) : $req;
    }

    private function data(\Illuminate\Http\Client\Response $res, string $ctx): array
    {
        if ($res->failed()) {
            throw new RuntimeException("billings.systems {$ctx} failed ({$res->status()}): ".$res->body());
        }

        return (array) ($res->json('data') ?? $res->json());
    }

    /** Ensure the client has a billings customer, persisting the id. */
    public function ensureCustomer(Client $client): string
    {
        if ($client->billings_customer_id) {
            return $client->billings_customer_id;
        }

        // Search by our external_ref, then create. Only accept a result whose
        // external_ref actually matches this client — some billings responses ignore
        // the filter and return other customers, which must never be cross-linked.
        $ref = 'client_'.$client->id;
        $search = $this->http()->get('/customers', ['external_ref' => $ref]);
        $existing = null;
        if ($search->ok()) {
            $data = $search->json('data');
            $rows = is_array($data) ? (array_is_list($data) ? $data : [$data]) : [];
            foreach ($rows as $c) {
                if (is_array($c) && ($c['external_ref'] ?? null) === $ref) {
                    $existing = $c['id'] ?? null;
                    break;
                }
            }
        }

        if (! $existing) {
            $created = $this->data($this->http('cust_client_'.$client->id)->post('/customers', [
                'name' => $client->name,
                'email' => $client->users()->first()?->email ?? "client{$client->id}@openexchange.local",
                'external_ref' => 'client_'.$client->id,
            ]), 'create customer');
            $existing = $created['id'] ?? null;
        }

        if (! $existing) {
            throw new RuntimeException('billings.systems returned no customer id.');
        }

        $client->update(['billings_customer_id' => $existing]);

        return $existing;
    }

    public function createInvoice(string $customerId, int $amountCents, string $description, ?string $idempotencyKey = null): array
    {
        return $this->data($this->http($idempotencyKey ?? (string) Str::uuid())->post('/invoices', [
            'customer_id' => $customerId,
            'currency' => config('openexchange.billings.currency', 'USD'),
            'line_items' => [[
                'description' => $description,
                'amount' => $amountCents,
                'quantity' => 1,
            ]],
        ]), 'create invoice');
    }

    public function finalizeInvoice(string $invoiceId): array
    {
        return $this->data($this->http("finalize_{$invoiceId}")->post("/invoices/{$invoiceId}/finalize"), 'finalize invoice');
    }

    public function payWithDefault(string $invoiceId): array
    {
        return $this->data($this->http("pay_{$invoiceId}")->post("/invoices/{$invoiceId}/pay-with-default"), 'pay invoice');
    }

    /** @return array<int, array<string, mixed>> */
    public function listPaymentMethods(string $customerId): array
    {
        $res = $this->http()->get("/customers/{$customerId}/payment-methods");

        return $res->ok() ? (array) $res->json('data', []) : [];
    }

    /** Verify an inbound webhook HMAC. Returns true when the signature matches. */
    public function verifyWebhookSignature(string $signatureHeader, string $rawBody): bool
    {
        $secret = (string) config('openexchange.billings.webhook_secret');
        if ($secret === '' || $signatureHeader === '') {
            return false;
        }

        // header format: "t=<ts>,v1=<hex>"
        $parts = [];
        foreach (explode(',', $signatureHeader) as $seg) {
            [$k, $v] = array_pad(explode('=', trim($seg), 2), 2, '');
            $parts[$k] = $v;
        }
        $timestamp = $parts['t'] ?? '';
        $provided = $parts['v1'] ?? '';
        if ($timestamp === '' || $provided === '') {
            return false;
        }

        $expected = hash_hmac('sha256', $timestamp.'.'.$rawBody, $secret);

        return hash_equals($expected, $provided);
    }
}
