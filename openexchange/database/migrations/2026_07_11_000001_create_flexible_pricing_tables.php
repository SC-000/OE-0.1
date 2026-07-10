<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('model_catalog', function (Blueprint $t) {
            // What the CLIENT sees instead of the raw model id (e.g. "OpenAI Premium").
            $t->string('display_alias')->nullable()->after('model');
            $t->string('tier')->nullable()->after('display_alias'); // premium | standard | lite
            $t->boolean('client_visible')->default(true)->after('active');

            // Provider cost basis. `price_source` records who set the live price:
            // manual (admin typed it) > official (provider API) > feed (OpenRouter) > seed.
            $t->decimal('cached_input_usd_per_million', 14, 6)->default(0)->after('output_usd_per_million');
            $t->string('price_source')->default('seed')->after('cached_input_usd_per_million');

            // Last observed feed price — kept even when the live price is manual, so we can
            // detect drift and raise a proposal without ever clobbering an admin's number.
            $t->decimal('feed_input_usd_per_million', 14, 6)->nullable();
            $t->decimal('feed_output_usd_per_million', 14, 6)->nullable();
            $t->string('feed_ref')->nullable(); // e.g. openai/gpt-4o
            $t->timestamp('feed_synced_at')->nullable();
            $t->timestamp('first_seen_at')->nullable();
        });

        Schema::table('client_model_rates', function (Blueprint $t) {
            // markup: billed = provider_cost * (1 + markup_bps/10000)
            // fixed:  billed = tokens * the absolute $/1M sell price below
            $t->string('pricing_mode')->default('markup')->after('model');
            $t->decimal('input_usd_per_million', 14, 6)->nullable()->after('pricing_mode');
            $t->decimal('output_usd_per_million', 14, 6)->nullable()->after('input_usd_per_million');
            $t->integer('per_request_fee_cents')->default(0);
            $t->integer('min_margin_bps')->nullable(); // floor: never bill below cost*(1+this)
            $t->string('note')->nullable();
        });

        // markup_bps is meaningless (and must be absent) when pricing_mode = fixed.
        Schema::table('client_model_rates', function (Blueprint $t) {
            $t->integer('markup_bps')->nullable()->change();
        });

        // A price CHANGE on an already-priced model never applies silently — it lands here.
        Schema::create('model_price_proposals', function (Blueprint $t) {
            $t->id();
            $t->foreignId('model_catalog_id')->constrained('model_catalog')->cascadeOnDelete();
            $t->decimal('current_input_usd_per_million', 14, 6);
            $t->decimal('current_output_usd_per_million', 14, 6);
            $t->decimal('proposed_input_usd_per_million', 14, 6);
            $t->decimal('proposed_output_usd_per_million', 14, 6);
            $t->string('source')->default('openrouter');
            $t->string('status')->default('pending'); // pending | accepted | rejected
            $t->foreignId('resolved_by')->nullable()->constrained('users')->nullOnDelete();
            $t->timestamp('resolved_at')->nullable();
            $t->timestamps();
            $t->index(['status', 'created_at']);
            $t->index('model_catalog_id');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('model_price_proposals');

        Schema::table('client_model_rates', function (Blueprint $t) {
            $t->dropColumn(['pricing_mode', 'input_usd_per_million', 'output_usd_per_million', 'per_request_fee_cents', 'min_margin_bps', 'note']);
        });

        Schema::table('model_catalog', function (Blueprint $t) {
            $t->dropColumn([
                'display_alias', 'tier', 'client_visible', 'cached_input_usd_per_million', 'price_source',
                'feed_input_usd_per_million', 'feed_output_usd_per_million', 'feed_ref', 'feed_synced_at', 'first_seen_at',
            ]);
        });
    }
};
