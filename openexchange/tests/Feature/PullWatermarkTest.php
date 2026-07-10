<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\ModelCatalog;
use App\Models\ProviderKey;
use App\Models\UsageRecord;
use App\Services\Metering\MeteringService;
use App\Services\Providers\UsageBucket;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

/**
 * `bucket_width=1d` means the CURRENT day's bucket is still OPEN: its `end_time` is
 * tomorrow's midnight, and its token totals grow all day. Two bugs fell out of that:
 *
 *   1. `ingest()` set `watermark_at` to the bucket's end (tomorrow), so the next pull
 *      sent `start_time > end_time` and OpenAI answered 400 "End time must be after
 *      start time." — the pull died after the first success.
 *
 *   2. The unique index (key, model, period_start, period_end) made every later pull of
 *      that same open bucket a "skip", so the rest of the day was NEVER billed.
 */
class PullWatermarkTest extends TestCase
{
    use RefreshDatabase;

    private function client(): Client
    {
        return Client::create([
            'name' => 'Acme', 'slug' => 'acme-'.uniqid(), 'balance_cents' => 1_000_000,
            'default_markup_bps' => 2500, 'auto_topup' => false,
        ]);
    }

    private function key(Client $client): ProviderKey
    {
        return ProviderKey::create([
            'client_id' => $client->id, 'provider' => 'openai', 'label' => 'prod',
            'secret' => 'sk-x', 'external_project_id' => 'proj_a', 'status' => 'active',
        ]);
    }

    /** A day bucket for "today": starts at midnight, ends at TOMORROW's midnight. */
    private function openDayBucket(int $in, int $out): UsageBucket
    {
        $today = CarbonImmutable::now()->startOfDay();

        return new UsageBucket('openai', 'gpt-4o', $today, $today->addDay(), $in, $out);
    }

    private function closedDayBucket(int $in, int $out): UsageBucket
    {
        $yesterday = CarbonImmutable::now()->startOfDay()->subDay();

        return new UsageBucket('openai', 'gpt-4o', $yesterday, $yesterday->addDay(), $in, $out);
    }

    private function priceModel(): void
    {
        ModelCatalog::create(['provider' => 'openai', 'model' => 'gpt-4o', 'input_usd_per_million' => 2.5, 'output_usd_per_million' => 10.0]);
    }

    /* ------------------------------- bug 1: the 400 -------------------------------- */

    public function test_the_watermark_never_runs_ahead_of_the_pull_window(): void
    {
        $client = $this->client();
        $key = $this->key($client);
        $this->priceModel();
        $until = CarbonImmutable::now();

        app(MeteringService::class)->ingest($key, [$this->openDayBucket(1_000_000, 0)], $until);

        $watermark = CarbonImmutable::parse($key->fresh()->watermark_at);
        $this->assertTrue(
            $watermark->lte($until),
            "watermark {$watermark} is in the future — the next pull would send start_time > end_time",
        );
    }

    public function test_an_open_bucket_leaves_the_watermark_at_its_start_so_it_is_re_pulled(): void
    {
        $client = $this->client();
        $key = $this->key($client);
        $this->priceModel();
        $today = CarbonImmutable::now()->startOfDay();

        app(MeteringService::class)->ingest($key, [
            $this->closedDayBucket(1_000_000, 0),  // yesterday: finished, safe to pass
            $this->openDayBucket(1_000_000, 0),    // today: still accumulating
        ], CarbonImmutable::now());

        // Must not advance past the start of the open bucket, or today's later usage is lost.
        $this->assertSame($today->toDateTimeString(), CarbonImmutable::parse($key->fresh()->watermark_at)->toDateTimeString());
    }

    public function test_a_future_watermark_self_heals_instead_of_400ing(): void
    {
        Http::fake(['api.openai.com/*' => Http::response(['data' => [], 'has_more' => false])]);
        config()->set('openexchange.openai.admin_key', 'sk-admin');

        $client = $this->client();
        $key = $this->key($client);
        // The exact state the bug left in production.
        $key->forceFill(['watermark_at' => CarbonImmutable::now()->addDay()])->save();

        $this->artisan('metering:pull')->assertSuccessful();

        $this->assertNull($key->fresh()->last_error, 'a stale future watermark must not produce a 400');
        Http::assertSent(function ($request) {
            parse_str(parse_url($request->url(), PHP_URL_QUERY) ?? '', $q);

            return isset($q['start_time'], $q['end_time']) && (int) $q['start_time'] < (int) $q['end_time'];
        });
    }

    /* --------------------- bug 2: the open bucket keeps growing --------------------- */

    public function test_a_growing_open_bucket_bills_the_difference_not_nothing(): void
    {
        $client = $this->client();
        $key = $this->key($client);
        $this->priceModel();
        $metering = app(MeteringService::class);

        // 10:00 — the day so far: 1M in. cost 250c, billed 313c (250 x 1.25, rounded up).
        $first = $metering->ingest($key, [$this->openDayBucket(1_000_000, 0)], CarbonImmutable::now());
        $this->assertSame(1, $first['metered']);
        $this->assertSame(313, $first['billed_cents']);

        // 16:00 — the SAME bucket, now 3M in. The extra 2M must bill.
        $second = $metering->ingest($key, [$this->openDayBucket(3_000_000, 0)], CarbonImmutable::now());

        $this->assertSame(1, $second['updated'], 'the open bucket grew and must re-meter');
        $this->assertSame(625, $second['billed_cents'], 'only the difference is billed');

        // One record, holding the day's cumulative totals.
        $this->assertDatabaseCount('usage_records', 1);
        $record = UsageRecord::firstOrFail();
        $this->assertSame(3_000_000, (int) $record->input_tokens);
        $this->assertSame(938, (int) $record->billed_cents); // 750c cost x 1.25

        // Debited once in total, not twice.
        $this->assertSame(1_000_000 - 938, $client->fresh()->balance_cents);
    }

    public function test_an_unchanged_bucket_is_still_skipped_and_never_double_bills(): void
    {
        $client = $this->client();
        $key = $this->key($client);
        $this->priceModel();
        $metering = app(MeteringService::class);
        $bucket = $this->closedDayBucket(1_000_000, 1_000_000);

        $metering->ingest($key, [$bucket], CarbonImmutable::now());
        $balance = $client->fresh()->balance_cents;

        $again = $metering->ingest($key, [$bucket], CarbonImmutable::now());

        $this->assertSame(0, $again['metered']);
        $this->assertSame(0, $again['updated']);
        $this->assertSame(1, $again['skipped']);
        $this->assertSame($balance, $client->fresh()->balance_cents);
        $this->assertDatabaseCount('usage_records', 1);
    }

    /** A provider correcting a bucket downwards must never silently credit or corrupt it. */
    public function test_a_shrinking_bucket_is_ignored(): void
    {
        $client = $this->client();
        $key = $this->key($client);
        $this->priceModel();
        $metering = app(MeteringService::class);

        $metering->ingest($key, [$this->openDayBucket(3_000_000, 0)], CarbonImmutable::now());
        $balance = $client->fresh()->balance_cents;

        $shrunk = $metering->ingest($key, [$this->openDayBucket(1_000_000, 0)], CarbonImmutable::now());

        $this->assertSame(0, $shrunk['updated']);
        $this->assertSame(1, $shrunk['skipped']);
        $this->assertSame(3_000_000, (int) UsageRecord::firstOrFail()->input_tokens);
        $this->assertSame($balance, $client->fresh()->balance_cents);
    }
}
