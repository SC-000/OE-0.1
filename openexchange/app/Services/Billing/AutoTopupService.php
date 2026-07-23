<?php

namespace App\Services\Billing;

use App\Mail\LowBalanceMail;
use App\Mail\TopUpFailedMail;
use App\Mail\TopUpReceiptMail;
use App\Models\Client;
use App\Models\TopUp;
use Illuminate\Contracts\Mail\Mailable;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
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

    /**
     * Why a client would or wouldn't be topped up right now.
     *
     * Pure: acquires no lock and writes nothing, so `oe:autopay --dry-run` can ask
     * "why is this client not being charged?" without consuming the rate-limit slot
     * it is reporting on. maybeTopup() re-acquires the lock atomically before charging.
     */
    public function evaluate(Client $client): array
    {
        $maxPerDay = (int) config('openexchange.metering.autotopup_max_per_day', 3);
        // The per-day cap is a runaway-CHARGE guard, so it counts money that actually
        // left the card — successful charges only. A declining card must never be able
        // to burn through the day's allowance with failures and stop retrying.
        $todayCount = TopUp::where('client_id', $client->id)
            ->where('trigger', 'auto')
            ->where('status', 'succeeded')
            ->whereDate('created_at', today())
            ->count();

        // The current failure streak: consecutive failed auto top-ups since the last
        // SUCCESSFUL top-up of any kind (a manual top-up or a good auto charge resets
        // it). This is what the exponential backoff is measured against.
        $lastSuccessAt = TopUp::where('client_id', $client->id)
            ->where('status', 'succeeded')
            ->max('created_at');
        $failuresQuery = TopUp::where('client_id', $client->id)
            ->where('trigger', 'auto')
            ->where('status', 'failed')
            ->when($lastSuccessAt, fn ($q) => $q->where('created_at', '>', $lastSuccessAt));
        $failures = (int) (clone $failuresQuery)->count();
        $lastFailureAt = (clone $failuresQuery)->max('created_at');

        $context = [
            'client_id' => $client->id,
            'balance_cents' => (int) $client->balance_cents,
            'min_balance_cents' => (int) $client->min_balance_cents,
            'auto_topup' => (bool) $client->auto_topup,
            'auto_today' => $todayCount,
            'max_per_day' => $maxPerDay,
            'failures' => $failures,
        ];

        $skip = fn (string $reason, string $detail) => $context + [
            'eligible' => false, 'reason' => $reason, 'detail' => $detail,
        ];

        if (! $client->isLow()) {
            return $skip('not_low', "balance {$client->balance_cents}c >= minimum {$client->min_balance_cents}c");
        }
        if (! $client->auto_topup) {
            return $skip('auto_topup_off', 'auto top-up is disabled for this client');
        }
        // A max of 0 (or less) disables the per-day guard rail entirely.
        if ($maxPerDay > 0 && $todayCount >= $maxPerDay) {
            return $skip('daily_cap', "{$todayCount} successful auto top-up(s) today >= cap {$maxPerDay}");
        }
        // Exponential backoff after failures — aggressive first (hourly), then widening.
        // It never gives up: the schedule's last step repeats forever, so a bad card is
        // retried at a steady cadence rather than being abandoned.
        if ($failures > 0 && $lastFailureAt) {
            $wait = $this->backoffMinutes($failures);
            $nextAt = Carbon::parse($lastFailureAt)->addMinutes($wait);
            if ($nextAt->isFuture()) {
                return $skip('backoff', "failure #{$failures}: next retry {$nextAt->toDateTimeString()} ({$wait}m after last failure)");
            }
        }
        if (Cache::has("autotopup:lock:{$client->id}")) {
            $interval = (int) config('openexchange.metering.autotopup_min_interval_minutes', 15);

            return $skip('rate_limited', "attempted within the last {$interval} minute(s)");
        }
        // Reported, deliberately NOT enforced: a missing card still goes through to
        // billings so the attempt is recorded as a failed top-up. Silently skipping it
        // here would hide a real, actionable problem from the admin's attempt log.
        $detail = $client->defaultPaymentMethod() ? 'will attempt' : 'will attempt — but no card on file';

        return $context + ['eligible' => true, 'reason' => 'eligible', 'detail' => $detail];
    }

    /**
     * Minutes to wait before the next attempt after N consecutive failures. Reads the
     * configured schedule (hourly at first, then widening) and — crucially — clamps to
     * its LAST entry for any higher failure count, so retries slow down but never stop.
     */
    private function backoffMinutes(int $failures): int
    {
        $schedule = array_values(array_filter(
            array_map('intval', (array) config('openexchange.metering.autotopup_backoff_minutes', [60, 60, 360, 720, 1440])),
            fn (int $m) => $m > 0,
        ));
        if ($schedule === []) {
            $schedule = [60];
        }

        $index = min(max($failures, 1), count($schedule)) - 1;

        return $schedule[$index];
    }

    /** Top up if enabled, low, and within the guard rails. */
    public function maybeTopup(Client $client): ?TopUp
    {
        $client->refresh();

        // Every skip is logged with its reason. A silent return here is indistinguishable
        // from "auto top-up is broken", which is exactly the hole this fills.
        $decision = $this->evaluate($client);
        if (! $decision['eligible']) {
            Log::info('autotopup.skipped', $decision);

            if ($decision['reason'] === 'auto_topup_off') {
                $this->maybeLowBalanceEmail($client);
            }

            return null;
        }

        $interval = (int) config('openexchange.metering.autotopup_min_interval_minutes', 15);
        // Rate-limit key is acquired HERE (in the attempt branch) — never re-fires in a
        // loop, and a client blocked by another guard no longer burns its lock slot.
        if (! Cache::add("autotopup:lock:{$client->id}", 1, now()->addMinutes($interval))) {
            Log::info('autotopup.skipped', $decision + ['reason' => 'rate_limited', 'detail' => 'lost lock race']);

            return null;
        }

        Log::info('autotopup.attempting', $decision);

        return $this->topup($client, 'auto');
    }

    /** Perform a top-up. HTTP is outside any DB transaction. */
    public function topup(Client $client, string $trigger = 'auto'): TopUp
    {
        // Cover any negative balance in one charge, plus the configured buffer — so a
        // balance that's gone below zero (e.g. a big single request) is fully cleared,
        // not chipped away $topup at a time (which can never catch up).
        $deficit = max(0, -(int) $client->balance_cents);
        $amount = max(100, (int) $client->topup_amount_cents + $deficit);
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
            Log::info('autotopup.charged', [
                'client_id' => $client->id, 'topup_id' => $topup->id,
                'amount_cents' => $amount, 'trigger' => $trigger, 'invoice' => $invoiceId,
            ]);
        } catch (Throwable $e) {
            $topup->update(['status' => 'failed', 'failure_reason' => mb_substr($e->getMessage(), 0, 250)]);
            Log::error('autotopup.failed', [
                'client_id' => $client->id, 'topup_id' => $topup->id,
                'amount_cents' => $amount, 'trigger' => $trigger,
                'error' => mb_substr($e->getMessage(), 0, 250),
            ]);
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
