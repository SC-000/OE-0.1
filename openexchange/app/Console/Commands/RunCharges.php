<?php

namespace App\Console\Commands;

use App\Services\Billing\ChargeService;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;

class RunCharges extends Command
{
    protected $signature = 'charges:run';

    protected $description = 'Apply recurring daily/monthly charges (idempotent — one billing per charge per period)';

    public function handle(ChargeService $charges): int
    {
        $stats = $charges->runDue();

        Cache::put('oe.charges.last_run', ['at' => now()->toDateTimeString()] + $stats, now()->addDays(7));

        $this->info(sprintf(
            'applied=%d skipped=%d billed=$%s',
            $stats['applied'], $stats['skipped'], number_format($stats['billed_cents'] / 100, 2),
        ));

        return self::SUCCESS;
    }
}
