<?php

namespace App\Console\Commands;

use App\Services\Pricing\ModelSyncService;
use Illuminate\Console\Command;

class SyncModels extends Command
{
    protected $signature = 'models:sync {--import-feed : also import feed models for providers we gateway, even without provider API creds}';

    protected $description = 'Discover new models, auto-price unpriced ones, and queue price changes for review';

    public function handle(ModelSyncService $sync): int
    {
        $stats = $sync->sync(importFeed: (bool) $this->option('import-feed'));

        foreach ($stats['errors'] as $error) {
            $this->warn($error);
        }

        $this->info(sprintf(
            'discovered=%d added=%d auto-priced=%d proposed=%d unchanged=%d',
            $stats['discovered'], $stats['added'], $stats['priced'], $stats['proposed'], $stats['unchanged'],
        ));

        if ($stats['rebilled'] > 0) {
            $this->info(sprintf(
                'settled %d usage record(s) that had metered at $0 — net $%s',
                $stats['rebilled'], number_format($stats['rebilled_cents'] / 100, 2),
            ));
        }

        if ($stats['proposed'] > 0) {
            $this->comment("{$stats['proposed']} price change(s) awaiting review at /admin/models.");
        }

        // Discovery failing shouldn't fail the schedule — pricing still ran.
        return self::SUCCESS;
    }
}
