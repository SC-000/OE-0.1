<?php

namespace Tests\Feature;

use App\Models\Charge;
use App\Models\Client;
use App\Models\ClientModelRate;
use App\Models\ModelCatalog;
use App\Models\User;
use App\Services\Billing\ChargeService;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

class ChargesTest extends TestCase
{
    use RefreshDatabase;

    private function client(int $balance = 100_000): Client
    {
        return Client::create([
            'name' => 'Acme', 'slug' => 'acme', 'balance_cents' => $balance,
            'default_markup_bps' => 2500, 'auto_topup' => false,
        ]);
    }

    public function test_a_recurring_fee_debits_the_balance_and_names_the_ledger_line(): void
    {
        $client = $this->client();
        $charge = Charge::create(['client_id' => $client->id, 'kind' => 'fee', 'cadence' => 'daily', 'name' => 'Platform fee', 'amount_cents' => 500]);

        app(ChargeService::class)->apply($charge->load('client'));

        $this->assertSame(100_000 - 500, $client->fresh()->balance_cents);
        $this->assertDatabaseHas('balance_ledger', ['client_id' => $client->id, 'type' => 'fee', 'amount_cents' => -500, 'description' => 'Platform fee']);
    }

    public function test_a_negative_fee_is_a_credit(): void
    {
        $client = $this->client();
        $charge = Charge::create(['client_id' => $client->id, 'kind' => 'fee', 'cadence' => 'once', 'name' => 'Goodwill', 'amount_cents' => -2_500]);

        app(ChargeService::class)->apply($charge->load('client'));

        $this->assertSame(102_500, $client->fresh()->balance_cents);
        $this->assertDatabaseHas('balance_ledger', ['type' => 'credit', 'amount_cents' => 2_500]);
    }

    public function test_a_usage_charge_writes_a_real_usage_record_priced_off_the_rate_card(): void
    {
        $client = $this->client();
        ModelCatalog::create(['provider' => 'google', 'model' => 'gemini-2.5-flash', 'input_usd_per_million' => 0.30, 'output_usd_per_million' => 2.50]);

        $charge = Charge::create([
            'client_id' => $client->id, 'kind' => 'usage', 'cadence' => 'daily', 'name' => 'Nightly batch',
            'provider' => 'google', 'model' => 'gemini-2.5-flash', 'input_tokens' => 1_000_000, 'output_tokens' => 1_000_000,
        ]);

        app(ChargeService::class)->apply($charge->load('client'));

        // cost 280c, +25% => 350c
        $this->assertDatabaseHas('usage_records', [
            'client_id' => $client->id, 'model' => 'gemini-2.5-flash',
            'source' => 'manual', 'provider_cost_cents' => 280, 'billed_cents' => 350,
        ]);
        $this->assertSame(100_000 - 350, $client->fresh()->balance_cents);
        $this->assertDatabaseHas('charge_runs', ['charge_id' => $charge->id, 'amount_cents' => 350]);
    }

    public function test_a_usage_charge_can_pin_a_flat_amount_instead_of_the_rate_card(): void
    {
        $client = $this->client();
        ModelCatalog::create(['provider' => 'google', 'model' => 'gemini-2.5-flash', 'input_usd_per_million' => 0.30, 'output_usd_per_million' => 2.50]);

        $charge = Charge::create([
            'client_id' => $client->id, 'kind' => 'usage', 'cadence' => 'once', 'name' => 'Agreed batch price',
            'provider' => 'google', 'model' => 'gemini-2.5-flash', 'input_tokens' => 1_000_000, 'output_tokens' => 1_000_000,
            'amount_cents' => 1_000,
        ]);

        app(ChargeService::class)->apply($charge->load('client'));

        // Billed at the pinned price, but the true provider cost is still recorded for margin.
        $this->assertDatabaseHas('usage_records', ['billed_cents' => 1_000, 'provider_cost_cents' => 280]);
    }

    /**
     * The rate card, not the default markup. The default markup is only the fallback
     * when nothing more specific matches — a charge that ignored an override would bill
     * a rate the client never agreed to.
     *
     * Each case is priced two ways: quoted (what the admin is shown before committing)
     * and billed (what actually lands on the client). They must be the same number.
     *
     * @return iterable<string, array{array<string, mixed>, int}>
     */
    public static function rateCards(): iterable
    {
        // Cost for 1M in + 1M out = 280c. Charge-on basis = 340c. Default markup = +25%.
        yield 'client+model markup override beats the default markup' => [
            ['pricing_mode' => 'markup', 'markup_bps' => 1_000], 374, // basis 340 x 1.10
        ];
        yield 'fixed sell price ignores cost and markup entirely' => [
            ['pricing_mode' => 'fixed', 'input_usd_per_million' => 2.0, 'output_usd_per_million' => 20.0], 2_200,
        ];
        yield 'the margin floor lifts a markup that would sell too cheap' => [
            ['pricing_mode' => 'markup', 'markup_bps' => 0, 'min_margin_bps' => 5_000], 420, // floor: cost 280 x 1.50
        ];
    }

    /**
     * @param  array<string, mixed>  $card
     */
    #[DataProvider('rateCards')]
    public function test_a_usage_charge_is_quoted_and_billed_at_the_resolved_rate(array $card, int $expected): void
    {
        $client = $this->client();
        ModelCatalog::create([
            'provider' => 'google', 'model' => 'gemini-2.5-flash',
            'input_usd_per_million' => 0.30, 'output_usd_per_million' => 2.50,
            'base_input_usd_per_million' => 0.40, 'base_output_usd_per_million' => 3.00,
        ]);
        ClientModelRate::create($card + [
            'client_id' => $client->id, 'provider' => 'google', 'model' => 'gemini-2.5-flash',
        ]);

        $charge = Charge::create([
            'client_id' => $client->id, 'kind' => 'usage', 'cadence' => 'once', 'name' => 'Batch',
            'provider' => 'google', 'model' => 'gemini-2.5-flash',
            'input_tokens' => 1_000_000, 'output_tokens' => 1_000_000,
        ]);

        $service = app(ChargeService::class);

        // What the admin is shown on the form…
        $quote = $service->quoteUsage($client, 'google', 'gemini-2.5-flash', 1_000_000, 1_000_000);
        $this->assertSame($expected, $quote->billedCents);
        $this->assertSame('client_model', $quote->rate->origin);
        $this->assertNotSame(350, $quote->billedCents, 'the default markup on raw cost is the wrong answer');

        // …is exactly what the client is charged.
        $service->apply($charge->load('client'));
        $this->assertDatabaseHas('usage_records', ['billed_cents' => $expected, 'provider_cost_cents' => 280]);
        $this->assertSame(100_000 - $expected, $client->fresh()->balance_cents);
    }

    public function test_running_the_same_period_twice_bills_once(): void
    {
        $client = $this->client();
        $charge = Charge::create(['client_id' => $client->id, 'kind' => 'fee', 'cadence' => 'daily', 'name' => 'Daily fee', 'amount_cents' => 500]);
        $service = app(ChargeService::class);

        $this->assertNotNull($service->apply($charge->load('client')));
        $this->assertNull($service->apply($charge->fresh()->load('client')), 'second run in the same day is a no-op');

        $this->assertSame(100_000 - 500, $client->fresh()->balance_cents);
        $this->assertSame(1, $charge->runs()->count());
    }

    public function test_a_daily_charge_bills_again_the_next_day(): void
    {
        $client = $this->client();
        $charge = Charge::create(['client_id' => $client->id, 'kind' => 'fee', 'cadence' => 'daily', 'name' => 'Daily fee', 'amount_cents' => 500]);
        $service = app(ChargeService::class);

        $service->apply($charge->load('client'), CarbonImmutable::parse('2026-07-10 00:15'));
        $service->apply($charge->fresh()->load('client'), CarbonImmutable::parse('2026-07-11 00:15'));

        $this->assertSame(100_000 - 1_000, $client->fresh()->balance_cents);
        $this->assertSame(2, $charge->runs()->count());
    }

    public function test_a_monthly_charge_bills_once_per_calendar_month(): void
    {
        $client = $this->client();
        $charge = Charge::create(['client_id' => $client->id, 'kind' => 'fee', 'cadence' => 'monthly', 'name' => 'Subscription', 'amount_cents' => 20_000]);
        $service = app(ChargeService::class);

        $service->apply($charge->load('client'), CarbonImmutable::parse('2026-07-01'));
        $service->apply($charge->fresh()->load('client'), CarbonImmutable::parse('2026-07-28'));
        $service->apply($charge->fresh()->load('client'), CarbonImmutable::parse('2026-08-01'));

        $this->assertSame(2, $charge->runs()->count());
        $this->assertSame(100_000 - 40_000, $client->fresh()->balance_cents);
    }

    public function test_an_inactive_or_expired_charge_is_skipped_by_the_scheduler(): void
    {
        $client = $this->client();
        Charge::create(['client_id' => $client->id, 'kind' => 'fee', 'cadence' => 'daily', 'name' => 'Off', 'amount_cents' => 500, 'active' => false]);
        Charge::create(['client_id' => $client->id, 'kind' => 'fee', 'cadence' => 'daily', 'name' => 'Expired', 'amount_cents' => 500, 'ends_at' => CarbonImmutable::now()->subDay()]);
        Charge::create(['client_id' => $client->id, 'kind' => 'fee', 'cadence' => 'daily', 'name' => 'Future', 'amount_cents' => 500, 'starts_at' => CarbonImmutable::now()->addWeek()]);
        Charge::create(['client_id' => $client->id, 'kind' => 'fee', 'cadence' => 'daily', 'name' => 'Live', 'amount_cents' => 700]);

        $stats = app(ChargeService::class)->runDue();

        $this->assertSame(1, $stats['applied']);
        $this->assertSame(700, $stats['billed_cents']);
        $this->assertSame(100_000 - 700, $client->fresh()->balance_cents);
    }

    public function test_a_one_off_charge_bills_immediately_on_create(): void
    {
        $client = $this->client();
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->post('/admin/charges', [
            'client_id' => $client->id, 'kind' => 'fee', 'cadence' => 'once', 'name' => 'Setup fee', 'amount_cents' => 15_000,
        ])->assertRedirect();

        $this->assertSame(100_000 - 15_000, $client->fresh()->balance_cents);
        $this->assertDatabaseHas('audit_logs', ['action' => 'charge.create']);
    }

    public function test_a_usage_charge_with_no_tokens_and_no_amount_is_rejected(): void
    {
        $client = $this->client();
        $admin = User::factory()->create(['role' => 'admin']);

        $this->actingAs($admin)->post('/admin/charges', [
            'client_id' => $client->id, 'kind' => 'usage', 'cadence' => 'daily', 'name' => 'Nothing',
            'provider' => 'openai', 'model' => 'gpt-x', 'input_tokens' => 0, 'output_tokens' => 0,
        ])->assertStatus(422);

        $this->assertSame(0, Charge::count());
    }
}
