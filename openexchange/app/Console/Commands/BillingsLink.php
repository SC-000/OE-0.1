<?php

namespace App\Console\Commands;

use App\Models\Client;
use App\Services\Billing\BillingsClient;
use Illuminate\Console\Command;
use Throwable;

/**
 * Ensure each client is linked to a billings customer (find-by-email or create).
 * Run after configuring billings to backfill existing clients, and to see the
 * exact billings response when linking fails.
 */
class BillingsLink extends Command
{
    protected $signature = 'oe:billings:link {--client= : only this client id}';

    protected $description = 'Link each client to a billings customer (find-by-email or create) and report the result.';

    public function handle(BillingsClient $billings): int
    {
        $clients = Client::query()
            ->when($this->option('client'), fn ($q, $id) => $q->whereKey($id))
            ->get();

        if ($clients->isEmpty()) {
            $this->warn('No clients found.');

            return self::SUCCESS;
        }

        $failed = 0;
        foreach ($clients as $client) {
            $email = $client->users()->first()?->email ?? '(no user)';
            try {
                $id = $billings->ensureCustomer($client);
                $this->line("  <fg=green>✓</> {$client->name} <fg=gray><{$email}></> → <fg=cyan>{$id}</>");
            } catch (Throwable $e) {
                $failed++;
                $this->line("  <fg=red>✗</> {$client->name} <fg=gray><{$email}></> — <fg=yellow>".mb_substr($e->getMessage(), 0, 200).'</>');
            }
        }

        $this->newLine();
        $this->line($failed === 0 ? '<fg=green;options=bold>All clients linked.</>' : "<fg=red;options=bold>{$failed} failed — see above.</>");

        return $failed === 0 ? self::SUCCESS : self::FAILURE;
    }
}
