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

        $email = $client->users()->first()?->email ?? "client{$client->id}@openexchange.local";
        $ref = 'client_'.$client->id;

        // billings enforces email uniqueness, so find an existing customer by email
        // first (external_ref is not preserved on their side), then create if none.
        $existing = $this->findCustomerByEmail($email);

        if (! $existing) {
            $res = $this->http('cust_client_'.$client->id)->post('/customers', [
                'name' => $client->name,
                'email' => $email,
                'external_ref' => $ref,
                'metadata' => ['client_id' => $client->id],
            ]);
            if ($res->successful()) {
                $existing = (string) (data_get($res->json(), 'data.id') ?? data_get($res->json(), 'id') ?? '');
            } elseif ($res->status() === 422) {
                // Already exists (prior attempt / race) — recover it by email.
                $existing = $this->findCustomerByEmail($email);
            } else {
                throw new RuntimeException("billings.systems create customer failed ({$res->status()}): ".$res->body());
            }
        }

        if (! $existing) {
            throw new RuntimeException('billings.systems returned no customer id.');
        }

        $client->update(['billings_customer_id' => $existing]);

        return $existing;
    }

    /** Find an existing customer id by email (billings enforces email uniqueness). */
    private function findCustomerByEmail(string $email): ?string
    {
        $res = $this->http()->get('/customers', ['email' => $email]);
        if (! $res->successful()) {
            return null;
        }
        $rows = $this->rows($res->json('data'));

        // Exact (case-insensitive) email match first.
        foreach ($rows as $c) {
            if (is_array($c) && ! empty($c['id']) && strcasecmp((string) ($c['email'] ?? ''), $email) === 0) {
                return (string) $c['id'];
            }
        }
        // The ?email= filter already scopes the result set — take the first with an id.
        foreach ($rows as $c) {
            if (is_array($c) && ! empty($c['id'])) {
                return (string) $c['id'];
            }
        }

        return null;
    }

    /**
     * Normalise a billings list response into an array of rows. `data` may be a
     * flat list, or a Laravel paginator wrapper ({ data: [...], total, ... }).
     */
    private function rows(mixed $data): array
    {
        if (! is_array($data)) {
            return [];
        }
        if (array_is_list($data)) {
            return $data;
        }
        if (isset($data['data']) && is_array($data['data'])) {
            return array_is_list($data['data']) ? $data['data'] : [$data['data']];
        }

        return [$data];
    }

    public function createInvoice(string $customerId, int $amountCents, string $description, ?string $idempotencyKey = null): array
    {
        // Schema per billings master doc §5.2: items[].unit_amount (cents),
        // lowercase currency, a required due_date, and auto_bill so the charge
        // can be triggered immediately after finalize.
        return $this->data($this->http($idempotencyKey ?? (string) Str::uuid())->post('/invoices', [
            'customer_id' => $customerId,
            'currency' => strtolower((string) config('openexchange.billings.currency', 'USD')),
            'due_date' => now()->toDateString(),
            'status' => 'draft',
            'auto_bill' => true,
            'items' => [[
                'description' => $description,
                'quantity' => 1,
                'unit_amount' => $amountCents,
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

    /** Trigger autobill on an invoice immediately — finalizes + charges the default card in one call. */
    public function processAutopay(string $invoiceId): array
    {
        return $this->data($this->http("autopay_{$invoiceId}")->post("/invoices/{$invoiceId}/process-autopay"), 'process autopay');
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
