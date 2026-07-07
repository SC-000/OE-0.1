<?php

namespace App\Services\Billing;

use App\Models\BalanceLedgerEntry;
use App\Models\Client;
use Illuminate\Support\Facades\DB;

/**
 * The single source of truth for balance movements. Every change locks the
 * client row, updates the balance, and writes an audit ledger entry atomically.
 */
class BalanceService
{
    /** Apply a signed movement (debits negative, credits positive). */
    public function apply(Client $client, int $signedCents, string $type, ?string $description = null, ?string $reference = null, array $meta = []): BalanceLedgerEntry
    {
        return DB::transaction(function () use ($client, $signedCents, $type, $description, $reference, $meta) {
            /** @var Client $locked */
            $locked = Client::whereKey($client->id)->lockForUpdate()->firstOrFail();
            $newBalance = $locked->balance_cents + $signedCents;
            $locked->update(['balance_cents' => $newBalance]);

            $entry = BalanceLedgerEntry::create([
                'client_id' => $locked->id,
                'type' => $type,
                'amount_cents' => $signedCents,
                'balance_after_cents' => $newBalance,
                'description' => $description,
                'reference' => $reference,
                'meta' => $meta ?: null,
            ]);

            $client->balance_cents = $newBalance; // keep the passed instance fresh

            return $entry;
        });
    }

    public function debit(Client $client, int $cents, string $type = 'usage_debit', ?string $description = null, ?string $reference = null, array $meta = []): BalanceLedgerEntry
    {
        return $this->apply($client, -abs($cents), $type, $description, $reference, $meta);
    }

    public function credit(Client $client, int $cents, string $type = 'topup_credit', ?string $description = null, ?string $reference = null, array $meta = []): BalanceLedgerEntry
    {
        return $this->apply($client, abs($cents), $type, $description, $reference, $meta);
    }
}
