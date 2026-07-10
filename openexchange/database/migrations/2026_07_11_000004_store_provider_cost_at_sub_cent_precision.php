<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * `provider_cost_cents` was a bigint, so every sub-cent cost was forced to a whole cent.
 *
 * That is fine for `billed_cents` — money we charge really is an integer number of
 * pennies. It is wrong for what we PAY: a typical gateway request costs a fraction of a
 * cent, and rounding each one destroys the margin figures. Round to nearest and a fleet
 * of 0.45c requests records as $0 cost (margin looks like 100%); round up and the same
 * fleet records as 1c (margin looks like 0%). Neither is true.
 *
 * Widened to DECIMAL(18,6) — exact fractional cents, to a millionth of a penny:
 *   - every existing `SUM(provider_cost_cents)` aggregate keeps working, now exactly;
 *   - `provider_cost_cents = 0` becomes a PRECISE sentinel for "metered with no cost
 *     basis" again, because a real sub-cent cost is no longer flattened into it.
 *
 * The largest value that fits is ~$1e10, far beyond any single usage record.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('usage_records', function (Blueprint $t) {
            $t->decimal('provider_cost_cents', 18, 6)->default(0)->change();
        });
    }

    public function down(): void
    {
        Schema::table('usage_records', function (Blueprint $t) {
            $t->bigInteger('provider_cost_cents')->default(0)->change();
        });
    }
};
