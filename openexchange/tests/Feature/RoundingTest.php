<?php

namespace Tests\Feature;

use App\Models\AccessKey;
use App\Models\Client;
use App\Models\ClientModelRate;
use App\Models\ModelCatalog;
use App\Models\ProviderBackend;
use App\Models\ProviderKey;
use App\Models\UsageRecord;
use App\Services\Admin\CommercialMetrics;
use App\Services\Metering\MeteringService;
use App\Services\Metering\RateResolver;
use App\Services\Metering\ResolvedRate;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

/**
 * Money is computed in exact fractional cents and rounded UP exactly once, at the point
 * of charging. Rounding earlier is what let a 0.45c gpt-4o request bill $0: the cost
 * rounded to 0c, and 0c x any markup is still 0c.
 */
class RoundingTest extends TestCase
{
    use RefreshDatabase;

    private function client(int $markupBps = 2500): Client
    {
        return Client::create([
            'name' => 'Acme', 'slug' => 'acme-'.uniqid(), 'balance_cents' => 100_000,
            'default_markup_bps' => $markupBps, 'auto_topup' => false,
        ]);
    }

    /* ----------------------------------- ceilCents ----------------------------------- */

    public function test_any_real_fraction_of_a_penny_rounds_up(): void
    {
        $this->assertSame(1, ResolvedRate::ceilCents(0.01));
        $this->assertSame(1, ResolvedRate::ceilCents(0.45));
        $this->assertSame(1, ResolvedRate::ceilCents(0.999));
        $this->assertSame(2, ResolvedRate::ceilCents(1.0001));
        $this->assertSame(57, ResolvedRate::ceilCents(56.25));
    }

    public function test_an_exact_penny_does_not_round_up_to_the_next_one(): void
    {
        $this->assertSame(1, ResolvedRate::ceilCents(1.0));
        $this->assertSame(1250, ResolvedRate::ceilCents(1250.0));
    }

    /** ceil() alone would over-charge a penny on float dust. */
    public function test_float_dust_does_not_manufacture_a_penny(): void
    {
        $this->assertSame(1250, ResolvedRate::ceilCents(1250.0000000000002));
        $this->assertSame(1250, ResolvedRate::ceilCents(1249.9999999999998));
        $this->assertSame(0, ResolvedRate::ceilCents(0.0000000000000001));
    }

    public function test_nothing_costs_nothing(): void
    {
        $this->assertSame(0, ResolvedRate::ceilCents(0.0));
        $this->assertSame(0, ResolvedRate::ceilCents(-5.0));
    }

    /** One genuine micro-cent is still money, and money rounds up to a penny. */
    public function test_a_micro_cent_of_genuine_usage_still_costs_a_penny(): void
    {
        $this->assertSame(1, ResolvedRate::ceilCents(0.000001));
        $this->assertSame(0, ResolvedRate::ceilCents(0.0000004), 'below a micro-cent is dust, not revenue');
    }

    /* ------------------------------ the sub-cent leak -------------------------------- */

    public function test_a_small_gateway_request_no_longer_bills_zero(): void
    {
        Http::fake(['api.openai.com/*' => Http::response([
            'choices' => [['message' => ['content' => 'ok']]],
            'usage' => ['prompt_tokens' => 1_000, 'completion_tokens' => 200],
        ])]);
        ProviderBackend::create(['provider' => 'openai', 'backend' => 'openai', 'label' => 'p', 'secret' => 'sk', 'status' => 'active']);
        ModelCatalog::create(['provider' => 'openai', 'model' => 'gpt-4o', 'input_usd_per_million' => 2.50, 'output_usd_per_million' => 10.00, 'active' => true]);
        $client = $this->client();
        [, $plain] = AccessKey::generate($client, 'prod');

        // Exact cost = (1000/1M x $2.50) + (200/1M x $10) = $0.0045 = 0.45c.
        // Old: round(0.45) = 0c cost, 0c x 1.25 = 0c billed — a free request.
        // Now: 0.45c x 1.25 = 0.5625c, rounded up => 1c.
        $this->withToken($plain)->postJson('/v1/chat', ['model' => 'gpt-4o', 'messages' => [['role' => 'user', 'content' => 'hi']]])
            ->assertOk()->assertJsonPath('usage.billed_cents', 1);

        $this->assertSame(100_000 - 1, $client->fresh()->balance_cents);
    }

    public function test_markup_is_applied_before_rounding_not_after(): void
    {
        $rate = ResolvedRate::markup(2500);

        // 0.45c x 1.25 = 0.5625c -> 1c. If the basis were rounded to 0c first, this is 0c.
        $this->assertSame(1, $rate->billedCents(0.45, 1_000, 200));
    }

    public function test_a_sub_cent_cost_is_stored_exactly_not_rounded_away(): void
    {
        $m = ModelCatalog::create(['provider' => 'openai', 'model' => 'gpt-4o', 'input_usd_per_million' => 2.50, 'output_usd_per_million' => 10.00]);

        $this->assertEqualsWithDelta(0.45, $m->costCentsExact(1_000, 200), 1e-9);
        // costCents() is for DISPLAY only. Storing it would flatten 0.45c to 0c and
        // then `provider_cost_cents = 0` — the "no cost basis" sentinel — would lie.
        $this->assertSame(0, $m->costCents(1_000, 200), 'display rounds to nearest');
        $this->assertSame(0.0, $m->costCentsExact(0, 0), 'no tokens, no cost');
    }

    /** The sentinel must stay precise: a sub-cent cost is not "no cost basis". */
    public function test_a_sub_cent_cost_does_not_masquerade_as_an_unpriced_record(): void
    {
        Http::fake(['api.openai.com/*' => Http::response([
            'choices' => [['message' => ['content' => 'ok']]],
            'usage' => ['prompt_tokens' => 1_000, 'completion_tokens' => 200],
        ])]);
        ProviderBackend::create(['provider' => 'openai', 'backend' => 'openai', 'label' => 'p', 'secret' => 'sk', 'status' => 'active']);
        ModelCatalog::create(['provider' => 'openai', 'model' => 'gpt-4o', 'input_usd_per_million' => 2.50, 'output_usd_per_million' => 10.00, 'active' => true]);
        [, $plain] = AccessKey::generate($this->client(), 'prod');

        $this->withToken($plain)->postJson('/v1/chat', ['model' => 'gpt-4o', 'messages' => [['role' => 'user', 'content' => 'hi']]])->assertOk();

        $rec = UsageRecord::firstOrFail();
        $this->assertEqualsWithDelta(0.45, (float) $rec->provider_cost_cents, 1e-6, 'the exact sub-cent cost survives storage');
        // …so it is never picked up as "metered with no cost basis" and re-billed forever.
        $this->assertSame(0, app(MeteringService::class)->pendingRebillCount());
    }

    /** Margin must survive a workload where every request costs less than a penny. */
    public function test_margin_is_honest_on_a_fleet_of_sub_cent_requests(): void
    {
        $client = $this->client();
        $m = ModelCatalog::create(['provider' => 'openai', 'model' => 'gpt-4o', 'input_usd_per_million' => 2.50, 'output_usd_per_million' => 10.00]);

        // 1,000 requests, each costing 0.45c and billing 1c.
        for ($i = 0; $i < 1_000; $i++) {
            UsageRecord::create([
                'client_id' => $client->id, 'provider' => 'openai', 'model' => 'gpt-4o',
                'period_start' => now(), 'period_end' => now(),
                'input_tokens' => 1_000, 'output_tokens' => 200,
                'provider_cost_cents' => $m->costCentsExact(1_000, 200),
                'billed_cents' => 1, 'source' => 'gateway', 'request_id' => "r{$i}",
            ]);
        }

        $overview = app(CommercialMetrics::class)->overview();

        // Real: revenue 1000c, cost 450c, margin 550c. Truncating cost to 0c would claim
        // 100% margin; rounding it up to 1c each would claim 0%.
        $this->assertSame(1_000, $overview['revenue_cents']);
        $this->assertSame(450, $overview['cost_cents']);
        $this->assertSame(550, $overview['margin_cents']);
    }

    public function test_admin_pnl_series_includes_cost_and_hourly_ranges(): void
    {
        CarbonImmutable::setTestNow(CarbonImmutable::parse('2026-07-10 15:30:00'));

        try {
            $client = $this->client();
            $key = ProviderKey::create([
                'client_id' => $client->id,
                'provider' => 'openai',
                'label' => 'prod',
                'external_project_id' => 'proj',
                'external_key_id' => 'key',
            ]);

            foreach ([
                ['at' => '2026-07-10 14:10:00', 'cost' => 40.4, 'billed' => 100],
                ['at' => '2026-07-10 15:05:00', 'cost' => 25.2, 'billed' => 60],
            ] as $row) {
                $at = CarbonImmutable::parse($row['at']);
                UsageRecord::create([
                    'client_id' => $client->id,
                    'provider_key_id' => $key->id,
                    'provider' => 'openai',
                    'model' => 'gpt-4o',
                    'period_start' => $at,
                    'period_end' => $at->addMinutes(5),
                    'provider_cost_cents' => $row['cost'],
                    'billed_cents' => $row['billed'],
                    'source' => 'pull',
                ]);
            }

            $series = app(CommercialMetrics::class)->series('24h');
            $hour = array_search('2026-07-10 14:00', $series['labels'], true);

            $this->assertSame('24h', $series['range']);
            $this->assertSame('hour', $series['bucket']);
            $this->assertCount(24, $series['labels']);
            $this->assertNotFalse($hour);
            $this->assertSame(1.0, $series['revenue'][$hour]);
            $this->assertSame(0.4, $series['cost'][$hour]);
            $this->assertSame(0.6, $series['margin'][$hour]);

            $daily = app(CommercialMetrics::class)->series(30);
            $this->assertSame('30d', $daily['range']);
            $this->assertArrayHasKey('cost', $daily);
        } finally {
            CarbonImmutable::setTestNow();
        }
    }

    public function test_zero_tokens_are_never_charged(): void
    {
        Http::fake(['api.openai.com/*' => Http::response([
            'choices' => [['message' => ['content' => '']]],
            'usage' => ['prompt_tokens' => 0, 'completion_tokens' => 0],
        ])]);
        ProviderBackend::create(['provider' => 'openai', 'backend' => 'openai', 'label' => 'p', 'secret' => 'sk', 'status' => 'active']);
        ModelCatalog::create(['provider' => 'openai', 'model' => 'gpt-4o', 'input_usd_per_million' => 2.50, 'output_usd_per_million' => 10.00, 'active' => true]);
        $client = $this->client();
        [, $plain] = AccessKey::generate($client, 'prod');

        $this->withToken($plain)->postJson('/v1/chat', ['model' => 'gpt-4o', 'messages' => [['role' => 'user', 'content' => 'hi']]])
            ->assertOk()->assertJsonPath('usage.billed_cents', 0);

        $this->assertSame(100_000, $client->fresh()->balance_cents);
    }

    /* ------------------------------- invariants that hold ---------------------------- */

    public function test_we_never_bill_less_than_the_cost_we_recorded(): void
    {
        $client = $this->client(markupBps: 0); // worst case: zero markup
        $m = ModelCatalog::create(['provider' => 'openai', 'model' => 'gpt-4o', 'input_usd_per_million' => 2.50, 'output_usd_per_million' => 10.00]);
        $rate = app(RateResolver::class)->resolve($client, 'openai', 'gpt-4o');

        foreach ([[1, 0], [1, 1], [17, 3], [999, 1], [1_000, 200], [123_456, 7_890]] as [$in, $out]) {
            $billed = $rate->billedCents($m->chargeBasisCentsExact($in, $out), $in, $out, 1, $m->costCentsExact($in, $out));
            $this->assertGreaterThanOrEqual(
                $m->costCents($in, $out),
                $billed,
                "billed {$billed}c is below the recorded cost for {$in}/{$out} tokens",
            );
        }
    }

    public function test_a_fixed_sell_price_also_rounds_up(): void
    {
        $client = $this->client();
        ModelCatalog::create(['provider' => 'openai', 'model' => 'gpt-4o', 'input_usd_per_million' => 2.50, 'output_usd_per_million' => 10.00]);
        ClientModelRate::create([
            'client_id' => $client->id, 'provider' => 'openai', 'model' => 'gpt-4o',
            'pricing_mode' => 'fixed', 'input_usd_per_million' => 3.0, 'output_usd_per_million' => 12.0,
        ]);

        // (1000/1M x $3) + (200/1M x $12) = $0.0054 = 0.54c -> 1c.
        $rate = app(RateResolver::class)->resolve($client, 'openai', 'gpt-4o');
        $this->assertSame(1, $rate->billedCents(0.0, 1_000, 200));
    }

    public function test_the_margin_floor_also_rounds_up(): void
    {
        // floor = 0.45c x 1.5 = 0.675c -> 1c
        $rate = new ResolvedRate(mode: 'markup', markupBps: 0, minMarginBps: 5000);

        $this->assertSame(1, $rate->billedCents(0.45, 1_000, 200, 0, 0.45));
    }

    public function test_large_amounts_are_not_disturbed_by_the_rounding_guard(): void
    {
        $rate = ResolvedRate::markup(2500);

        // 1_000_000c ($10,000) exactly. Must not gain a stray penny.
        $this->assertSame(1_250_000, $rate->billedCents(1_000_000.0, 1_000_000_000, 0));
    }
}
