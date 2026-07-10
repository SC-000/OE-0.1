<?php

namespace App\Console\Commands;

use App\Services\Pricing\ModelSyncService;
use Illuminate\Console\Command;

class SyncModels extends Command
{
    protected $signature = 'models:sync
        {--import-feed : import the feed catalogue for every gateway provider, even without creds}
        {--no-import-feed : provider API discovery only}';

    protected $description = 'Discover new models, auto-price unpriced ones, re-bill $0 usage, and queue price changes for review';

    public function handle(ModelSyncService $sync): int
    {
        // Default (neither flag): import the feed for providers we hold credentials for.
        $importFeed = match (true) {
            (bool) $this->option('import-feed') => true,
            (bool) $this->option('no-import-feed') => false,
            default => null,
        };

        $stats = $sync->sync(importFeed: $importFeed);

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
