<?php

namespace Tests\Feature;

use App\Actions\Fortify\CreateNewUser;
use App\Mail\WelcomeMail;
use App\Models\Client;
use App\Models\ModelCatalog;
use App\Models\User;
use App\Notifications\ResetPasswordNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class AccountTest extends TestCase
{
    use RefreshDatabase;

    public function test_signup_creates_its_own_billing_account(): void
    {
        Mail::fake();

        $user = app(CreateNewUser::class)->create([
            'name' => 'Casey Owner',
            'email' => 'casey@example.com',
            'password' => 'Str0ng-Passw0rd!',
            'password_confirmation' => 'Str0ng-Passw0rd!',
        ]);

        $this->assertNotNull($user->client_id);
        $this->assertSame('owner', $user->role);
        $this->assertDatabaseHas('clients', ['id' => $user->client_id]);
        Mail::assertSent(WelcomeMail::class, fn ($m) => $m->hasTo('casey@example.com'));
    }

    public function test_admin_creating_a_client_provisions_an_owner_login(): void
    {
        Notification::fake();
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->post('/console/admin/clients', [
            'name' => 'Northwind',
            'owner_name' => 'Owen Ward',
            'owner_email' => 'owen@northwind.test',
        ]);

        $this->assertDatabaseHas('clients', ['name' => 'Northwind']);
        $owner = User::where('email', 'owen@northwind.test')->first();
        $this->assertNotNull($owner);
        $this->assertSame('owner', $owner->role);
        $this->assertNotNull($owner->client_id);
        Notification::assertSentTo($owner, ResetPasswordNotification::class);
    }

    public function test_admin_can_adjust_a_client_balance(): void
    {
        $client = Client::create(['name' => 'X', 'slug' => 'x', 'balance_cents' => 1000]);
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->post('/console/admin/balance', ['client_id' => $client->id, 'amount' => 25.50, 'reason' => 'goodwill credit']);

        $this->assertSame(1000 + 2550, $client->fresh()->balance_cents);
        $this->assertDatabaseHas('balance_ledger', ['client_id' => $client->id, 'type' => 'adjustment']);
    }

    public function test_admin_can_create_a_gateway_key_for_a_client(): void
    {
        $client = Client::create(['name' => 'X', 'slug' => 'x']);
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->post('/console/admin/access-key', ['client_id' => $client->id, 'name' => 'Prod']);

        $this->assertDatabaseHas('access_keys', ['client_id' => $client->id, 'name' => 'Prod', 'status' => 'active']);
    }

    public function test_admin_can_add_usage_manually_and_debit_the_balance(): void
    {
        $client = Client::create(['name' => 'X', 'slug' => 'x', 'balance_cents' => 100000, 'default_markup_bps' => 2500]);
        ModelCatalog::create(['provider' => 'google', 'model' => 'gemini-2.5-flash', 'input_usd_per_million' => 0.30, 'output_usd_per_million' => 2.50]);
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->post('/console/admin/usage', ['client_id' => $client->id, 'model' => 'gemini-2.5-flash', 'input_tokens' => 1_000_000, 'output_tokens' => 1_000_000]);

        // provider cost 0.30 + 2.50 = $2.80 = 280c; billed = 280 * 1.25 = 350c
        $this->assertDatabaseHas('usage_records', ['client_id' => $client->id, 'model' => 'gemini-2.5-flash', 'source' => 'manual', 'billed_cents' => 350]);
        $this->assertSame(100000 - 350, $client->fresh()->balance_cents);
    }

    public function test_owner_can_save_a_payment_method(): void
    {
        $client = Client::create(['name' => 'X', 'slug' => 'x']);
        $user = User::factory()->create(['client_id' => $client->id, 'role' => 'owner']);

        $this->actingAs($user)->post('/console/billing/card', [
            'payment_method_id' => 'pm_test_ab', 'brand' => 'visa', 'last4' => '4242', 'exp_month' => 8, 'exp_year' => 2028,
        ]);

        $this->assertDatabaseHas('payment_methods', ['client_id' => $client->id, 'billings_pm_id' => 'pm_test_ab', 'is_default' => true]);
    }

    public function test_an_owner_without_a_client_self_heals(): void
    {
        $user = User::factory()->create(['role' => 'owner', 'client_id' => null]);

        $this->actingAs($user)->get('/console')->assertOk();

        $this->assertNotNull($user->fresh()->client_id);
        $this->assertSame(1, Client::count());
    }
}
