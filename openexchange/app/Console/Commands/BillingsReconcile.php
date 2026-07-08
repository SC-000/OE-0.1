<?php

namespace App\Console\Commands;

use App\Models\TopUp;
use App\Services\Billing\AutoTopupService;
use App\Services\Billing\BillingsClient;
use Illuminate\Console\Command;
use Throwable;

/**
 * Reconcile OE top-ups against billings. If a top-up's invoice is paid in
 * billings but OE never recorded the credit (webhook miss, request timeout), this
 * credits it — exactly once (confirmTopup is idempotent). Safe to run repeatedly.
 */
class BillingsReconcile extends Command
{
    protected $signature = 'oe:billings:reconcile {--client= : only this client id}';

    protected $description = 'Credit any top-up whose invoice is paid in billings but was not recorded in OE.';

    public function handle(BillingsClient $billings, AutoTopupService $topups): int
    {
        $unsettled = TopUp::query()
            ->whereIn('status', ['pending', 'failed'])
            ->whereNotNull('billings_invoice_id')
            ->when($this->option('client'), fn ($q, $id) => $q->where('client_id', $id))
            ->get();

        if ($unsettled->isEmpty()) {
            $this->info('Nothing to reconcile — every top-up is settled.');

            return self::SUCCESS;
        }

        $credited = 0;
        foreach ($unsettled as $topup) {
            try {
                $invoice = $billings->getInvoice((string) $topup->billings_invoice_id);
                $status = (string) data_get($invoice, 'status');
                if ($status === 'paid') {
                    $topups->confirmTopup($topup->fresh(), (string) data_get($invoice, 'transactions.0.id'));
                    if ($topup->fresh()->status === 'succeeded') {
                        $credited++;
                        $this->line("  <fg=green>✓</> credited top-up #{$topup->id} — invoice paid in billings");
                    }
                } else {
                    $this->line("  <fg=gray>·</> top-up #{$topup->id} — invoice status: ".($status ?: 'unknown').' (no credit)');
                }
            } catch (Throwable $e) {
                $this->line("  <fg=red>✗</> top-up #{$topup->id} — ".mb_substr($e->getMessage(), 0, 160));
            }
        }

        $this->newLine();
        $this->info("Reconciled — credited {$credited} previously-missed top-up(s).");

        return self::SUCCESS;
    }
}
