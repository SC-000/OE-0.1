<?php

namespace App\Console\Commands;

use App\Models\Client;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;

/**
 * Deployment self-check. Run `php artisan oe:doctor` on the server to see exactly
 * which piece of the billings / mail / app config is missing or stale.
 */
class Doctor extends Command
{
    protected $signature = 'oe:doctor {--mail= : send a test email to this address to verify SMTP}';

    protected $description = 'Check the Open Exchange deployment: APP_KEY, config cache, billings, mail.';

    public function handle(): int
    {
        $ok = true;
        $pass = fn (string $l, string $d = '') => $this->line("  <fg=green>✓</> {$l}".($d ? " <fg=gray>— {$d}</>" : ''));
        $warn = fn (string $l, string $d = '') => $this->line("  <fg=yellow>!</> {$l}".($d ? " <fg=gray>— {$d}</>" : ''));
        $fail = function (string $l, string $d = '') use (&$ok) {
            $ok = false;
            $this->line("  <fg=red>✗</> {$l}".($d ? " <fg=yellow>— {$d}</>" : ''));
        };

        $this->newLine();
        $this->info('Open Exchange — deployment doctor');
        $this->newLine();

        config('app.key') ? $pass('APP_KEY set') : $fail('APP_KEY missing', 'php artisan key:generate --force');

        if (file_exists($this->laravel->getCachedConfigPath())) {
            $warn('Config is CACHED', 'if you changed .env recently: php artisan config:clear (then re-cache)');
        } else {
            $pass('Config not cached', 'reads live .env');
        }

        $token = (string) config('openexchange.billings.token');
        $pub = (string) config('openexchange.billings.publishable');
        $whsec = (string) config('openexchange.billings.webhook_secret');
        $base = rtrim((string) config('openexchange.billings.base'), '/');

        $token ? $pass('BILLINGS_TOKEN set') : $fail('BILLINGS_TOKEN missing');
        $pub ? $pass('BILLINGS_PUBLISHABLE set', 'the card widget needs this') : $fail('BILLINGS_PUBLISHABLE missing', 'zero-scope publishable token — without it the add-card screen stays in test mode');
        $whsec ? $pass('BILLINGS_WEBHOOK_SECRET set') : $warn('BILLINGS_WEBHOOK_SECRET missing', 'inbound webhooks will be rejected');

        if ($token) {
            try {
                $res = Http::withToken($token)->acceptJson()->timeout(10)->get("{$base}/api/v1/ping");
                $res->ok()
                    ? $pass('billings reachable', 'user: '.((string) ($res->json('user.email') ?? $res->json('user.id') ?? 'ok')))
                    : $fail('billings ping failed', "HTTP {$res->status()}: ".mb_substr($res->body(), 0, 120));
            } catch (\Throwable $e) {
                $fail('billings unreachable', mb_substr($e->getMessage(), 0, 120));
            }
        }

        $mailer = (string) config('mail.default');
        $host = (string) config('mail.mailers.smtp.host');
        $port = config('mail.mailers.smtp.port');
        $user = (string) config('mail.mailers.smtp.username');
        $scheme = (string) config('mail.mailers.smtp.scheme');
        $from = (string) config('mail.from.address');
        $this->line("  <fg=cyan>i</> mail: {$mailer} · {$host}:{$port} · user ".($user !== '' ? "set ({$user})" : '<fg=yellow>MISSING</>').' · from '.($from ?: '<fg=yellow>MISSING</>'));
        if ($scheme === 'ssl') {
            $fail('MAIL_SCHEME=ssl is invalid', 'ZeptoMail on 587: leave MAIL_SCHEME empty (STARTTLS). For 465 use smtps.');
        } elseif ($scheme !== '' && (int) $port === 587) {
            $warn("MAIL_SCHEME={$scheme} on port 587", 'leave MAIL_SCHEME empty so STARTTLS is negotiated');
        } else {
            $pass('Mail scheme ok', $scheme ?: '(auto — STARTTLS on 587)');
        }

        // Live SMTP test — actually send an email.
        if ($to = $this->option('mail')) {
            try {
                Mail::raw('Open Exchange SMTP test — if you can read this, outbound mail works.', fn ($m) => $m->to($to)->subject('Open Exchange — mail test'));
                $pass('Test email sent', "to {$to} via {$mailer}");
            } catch (\Throwable $e) {
                $fail('Test email failed', mb_substr($e->getMessage(), 0, 220));
            }
        }

        $clients = Client::query()->count();
        $linked = Client::whereNotNull('billings_customer_id')->count();
        $this->line("  <fg=cyan>i</> clients: {$clients}, linked to a billings customer: {$linked}");
        if ($clients > 0 && $linked === 0) {
            $warn('No client has a billings customer id', 'add-card stays in test mode until a customer is linked (fix webhook + POST /customers)');
        }

        $this->newLine();
        $this->line($ok ? '<fg=green;options=bold>All critical checks passed.</>' : '<fg=red;options=bold>Some checks failed — fix the ✗ items above.</>');
        $this->newLine();

        return $ok ? self::SUCCESS : self::FAILURE;
    }
}
