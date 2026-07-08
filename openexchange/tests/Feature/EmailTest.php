<?php

namespace Tests\Feature;

use App\Mail\LowBalanceMail;
use App\Mail\PasswordResetMail;
use App\Mail\TopUpFailedMail;
use App\Mail\TopUpReceiptMail;
use App\Models\Client;
use App\Models\User;
use App\Notifications\ResetPasswordNotification;
use App\Services\Billing\AutoTopupService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class EmailTest extends TestCase
{
    use RefreshDatabase;

    private function clientWithUser(array $opts = []): Client
    {
        $client = Client::create(array_merge([
            'name' => 'Acme', 'slug' => 'acme-'.uniqid(), 'balance_cents' => 500,
            'min_balance_cents' => 1000, 'topup_amount_cents' => 5000, 'auto_topup' => true, 'default_markup_bps' => 2500,
        ], $opts));
        User::factory()->create(['client_id' => $client->id, 'role' => 'owner']);

        return $client;
    }

    private function fakeBillings(bool $paySucceeds): void
    {
        Config::set('openexchange.billings.token', 'srv-token');
        Config::set('openexchange.billings.base', 'https://billings.test');
        Http::fake([
            'billings.test/api/v1/customers*' => Http::response(['data' => ['id' => 'cus_1']]),
            'billings.test/api/v1/invoices/*/finalize' => Http::response(['data' => ['id' => 'inv_1']]),
            'billings.test/api/v1/invoices/*/pay-with-default' => $paySucceeds
                ? Http::response(['data' => ['transaction' => ['id' => 'txn_1']]])
                : Http::response('card_declined', 402),
            'billings.test/api/v1/invoices' => Http::response(['data' => ['id' => 'inv_1']]),
        ]);
    }

    public function test_failed_topup_emails_the_client(): void
    {
        Mail::fake();
        $this->fakeBillings(paySucceeds: false);
        $client = $this->clientWithUser();

        app(AutoTopupService::class)->maybeTopup($client);

        Mail::assertSent(TopUpFailedMail::class);
    }

    public function test_successful_topup_emails_a_receipt(): void
    {
        Mail::fake();
        $this->fakeBillings(paySucceeds: true);
        $client = $this->clientWithUser();

        app(AutoTopupService::class)->maybeTopup($client);

        Mail::assertSent(TopUpReceiptMail::class);
    }

    public function test_low_balance_emails_when_auto_topup_is_off(): void
    {
        Mail::fake();
        $client = $this->clientWithUser(['auto_topup' => false]);

        app(AutoTopupService::class)->maybeTopup($client);

        Mail::assertSent(LowBalanceMail::class);
    }

    public function test_password_reset_sends_branded_notification(): void
    {
        Notification::fake();
        $user = User::factory()->create();

        $user->sendPasswordResetNotification('reset-token-123');

        Notification::assertSentTo($user, ResetPasswordNotification::class);
    }

    public function test_branded_emails_render(): void
    {
        $client = $this->clientWithUser();

        $failed = (new TopUpFailedMail($client, 'Your card was declined.'))->render();
        $this->assertStringContainsString('open', $failed);
        $this->assertStringContainsString('Update payment method', $failed);
        $this->assertStringContainsString('#33c13e', $failed); // brand green present

        $reset = (new PasswordResetMail('https://openexchange.ai/reset-password/tok'))->render();
        $this->assertStringContainsString('Reset password', $reset);
        $this->assertStringContainsString('https://openexchange.ai/reset-password/tok', $reset);
    }
}
