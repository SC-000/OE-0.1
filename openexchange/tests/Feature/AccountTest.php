<?php

namespace Tests\Feature;

use App\Actions\Fortify\CreateNewUser;
use App\Models\Client;
use App\Models\User;
use App\Notifications\ResetPasswordNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class AccountTest extends TestCase
{
    use RefreshDatabase;

    public function test_signup_creates_its_own_billing_account(): void
    {
        $user = app(CreateNewUser::class)->create([
            'name' => 'Casey Owner',
            'email' => 'casey@example.com',
            'password' => 'Str0ng-Passw0rd!',
            'password_confirmation' => 'Str0ng-Passw0rd!',
        ]);

        $this->assertNotNull($user->client_id);
        $this->assertSame('owner', $user->role);
        $this->assertDatabaseHas('clients', ['id' => $user->client_id]);
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

    public function test_an_owner_without_a_client_self_heals(): void
    {
        $user = User::factory()->create(['role' => 'owner', 'client_id' => null]);

        $this->actingAs($user)->get('/console')->assertOk();

        $this->assertNotNull($user->fresh()->client_id);
        $this->assertSame(1, Client::count());
    }
}
