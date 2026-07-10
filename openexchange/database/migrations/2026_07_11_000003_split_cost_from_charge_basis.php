<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * A model has TWO prices, and conflating them hid margin:
 *
 *   real cost      (input/output_usd_per_million)  — what the provider charges US.
 *                                                    Auto-fetched from the feed.
 *                                                    Recorded on every usage record as
 *                                                    provider_cost_cents. Margin is
 *                                                    measured against this, and only this.
 *
 *   charge-on price (base_*_usd_per_million)       — the number markup % and rate-card
 *                                                    overrides are applied ON TOP OF.
 *                                                    NULL means "same as real cost", which
 *                                                    is exactly the old behaviour.
 *
 * Setting a charge-on price above real cost is margin you earn before any markup shows up
 * in the markup column — so the admin UI must always show both, side by side.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('model_catalog', function (Blueprint $t) {
            $t->decimal('base_input_usd_per_million', 14, 6)->nullable()->after('output_usd_per_million');
            $t->decimal('base_output_usd_per_million', 14, 6)->nullable()->after('base_input_usd_per_million');
        });
    }

    public function down(): void
    {
        Schema::table('model_catalog', function (Blueprint $t) {
            $t->dropColumn(['base_input_usd_per_million', 'base_output_usd_per_million']);
        });
    }
};
