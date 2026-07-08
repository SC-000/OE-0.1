<?php

namespace App\Services\Billing;

use App\Mail\LowBalanceMail;
use App\Mail\TopUpFailedMail;
use App\Mail\TopUpReceiptMail;
use App\Models\Client;
use App\Models\TopUp;
use Illuminate\Contracts\Mail\Mailable;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Throwable;

/**
 * Prepaid balance auto top-up. Bounded by design:
 *  - rate-limited (min interval between attempts, key set in THIS branch),
 *  - capped per day,
 *  - HTTP calls happen OUTSIDE any balance transaction,
 *  - the balance is credited only after payment succeeds, exactly once.
 */
class AutoTopupService
{
    public function __construct(
        private BillingsClient $billings,
        private BalanceService $balance,
    ) {}

    /** Top up if enabled, low, and within the guard rails. */
    public function maybeTopup(Client $client): ?TopUp
    {
        $client->refresh();
        if (! $client->isLow()) {
            return null;
        }
        if (! $client->auto_topup) {
            $this->maybeLowBalanceEmail($client);

            return null;
        }

        $interval = (int) config('openexchange.metering.autotopup_min_interval_minutes', 15);
        // Rate-limit key is set HERE (in the attempt branch) — never re-fires in a loop.
        if (! Cache::add("autotopup:lock:{$client->id}", 1, now()->addMinutes($interval))) {
            return null;
        }

        $maxPerDay = (int) config('openexchange.metering.autotopup_max_per_day', 3);
        $todayCount = TopUp::where('client_id', $client->id)
            ->where('trigger', 'auto')
            ->whereDate('created_at', today())
            ->count();
        if ($todayCount >= $maxPerDay) {
            return null;
        }

        return $this->topup($client, 'auto');
    }

    /** Perform a top-up. HTTP is outside any DB transaction. */
    public function topup(Client $client, string $trigger = 'auto'): TopUp
    {
        $amount = max(100, (int) $client->topup_amount_cents);
        $topup = TopUp::create([
            'client_id' => $client->id,
            'amount_cents' => $amount,
            'status' => 'pending',
            'trigger' => $trigger,
        ]);

        try {
            $customerId = $this->billings->ensureCustomer($client);
            $invoice = $this->billings->createInvoice($customerId, $amount, 'Open Exchange balance top-up', "topup_{$topup->id}");
            $invoiceId = (string) ($invoice['id'] ?? '');
            $topup->update(['billings_invoice_id' => $invoiceId]);

            // Finalize (draft → pending) so it's payable, then charge the default card now.
            $this->billings->finalizeInvoice($invoiceId);
            $payment = $this->billings->payWithDefault($invoiceId);

            $this->confirmTopup($topup->fresh(), data_get($payment, 'transaction.id') ?? data_get($payment, 'id'));
        } catch (Throwable $e) {
            $topup->update(['status' => 'failed', 'failure_reason' => mb_substr($e->getMessage(), 0, 250)]);
            report($e);
            $this->notifyClient($client->fresh(), new TopUpFailedMail($client->fresh(), $topup->fresh()->failure_reason ?? 'Payment declined'));
        }

        return $topup->fresh();
    }

    /** Credit the balance for a paid top-up — exactly once (sync OR webhook). */
    public function confirmTopup(TopUp $topup, ?string $transactionId = null): void
    {
        $credited = DB::transaction(function () use ($topup, $transactionId) {
            /** @var TopUp|null $t */
            $t = TopUp::whereKey($topup->id)->lockForUpdate()->first();
            if (! $t || $t->status === 'succeeded') {
                return false; // idempotent
            }
            $t->update(['status' => 'succeeded', 'billings_transaction_id' => $transactionId]);

            $client = Client::findOrFail($t->client_id);
            $this->balance->credit(
                $client,
                $t->amount_cents,
                'topup_credit',
                ucfirst($t->trigger).' top-up',
                "topup:{$t->id}",
                ['invoice' => $t->billings_invoice_id],
            );

            return true;
        });

        if ($credited) {
            $fresh = $topup->fresh()->load('client');
            if ($fresh->client) {
                $this->notifyClient($fresh->client->fresh(), new TopUpReceiptMail($fresh->client->fresh(), $fresh));
            }
        }
    }

    public function markFailed(TopUp $topup, string $reason): void
    {
        if ($topup->status === 'pending') {
            $topup->update(['status' => 'failed', 'failure_reason' => mb_substr($reason, 0, 250)]);
            $topup->loadMissing('client');
            if ($topup->client) {
                $this->notifyClient($topup->client, new TopUpFailedMail($topup->client, $reason));
            }
        }
    }

    /** Reverse a top-up credit when a payment is refunded. */
    public function reverseTopup(TopUp $topup): void
    {
        DB::transaction(function () use ($topup) {
            $t = TopUp::whereKey($topup->id)->lockForUpdate()->first();
            if (! $t || $t->status !== 'succeeded') {
                return;
            }
            $t->update(['status' => 'refunded']);
            $client = Client::findOrFail($t->client_id);
            $this->balance->debit($client, $t->amount_cents, 'refund', 'Top-up refunded', "topup:{$t->id}");
        });
    }

    /** Email all of a client's users; failures are logged, never fatal. */
    private function notifyClient(Client $client, Mailable $mail): void
    {
        try {
            $emails = $client->users()->pluck('email')->filter()->values()->all();
            if ($emails === []) {
                return;
            }
            Mail::to($emails)->send($mail);
        } catch (Throwable $e) {
            report($e);
        }
    }

    /** Low-balance nudge (auto top-up off), at most once per day per client. */
    private function maybeLowBalanceEmail(Client $client): void
    {
        if (Cache::add("lowbal:notified:{$client->id}", 1, now()->addDay())) {
            $this->notifyClient($client, new LowBalanceMail($client));
        }
    }
}
