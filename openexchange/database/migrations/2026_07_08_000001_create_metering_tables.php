<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clients', function (Blueprint $t) {
            $t->id();
            $t->string('name');
            $t->string('slug')->unique();
            $t->string('status')->default('active'); // active | suspended
            $t->bigInteger('balance_cents')->default(0); // prepaid balance; may go negative (debt)
            $t->integer('min_balance_cents')->default(1000);   // auto top-up trigger
            $t->integer('topup_amount_cents')->default(5000);  // auto top-up amount
            $t->boolean('auto_topup')->default(true);
            $t->integer('default_markup_bps')->default(2500);  // 25.00%
            $t->integer('debt_limit_cents')->default(5000);
            $t->string('billings_customer_id')->nullable();
            $t->timestamps();
        });

        Schema::create('provider_keys', function (Blueprint $t) {
            $t->id();
            $t->foreignId('client_id')->constrained()->cascadeOnDelete();
            $t->string('provider'); // openai | google
            $t->string('label');
            $t->text('secret')->nullable();          // encrypted (the provider API key)
            $t->string('external_project_id')->nullable(); // OpenAI project_id / GCP project id
            $t->string('external_key_id')->nullable();     // OpenAI api_key_id (optional)
            $t->string('status')->default('active');       // active | disabled
            $t->timestamp('last_synced_at')->nullable();
            $t->timestamp('watermark_at')->nullable();     // last successfully-metered period end
            $t->timestamps();
            $t->index(['provider', 'external_project_id']);
        });

        Schema::create('model_catalog', function (Blueprint $t) {
            $t->id();
            $t->string('provider');
            $t->string('model');
            $t->decimal('input_usd_per_million', 14, 6)->default(0);
            $t->decimal('output_usd_per_million', 14, 6)->default(0);
            $t->boolean('active')->default(true);
            $t->timestamps();
            $t->unique(['provider', 'model']);
        });

        // Markup overrides; NULL client = platform default, NULL model = whole provider.
        Schema::create('client_model_rates', function (Blueprint $t) {
            $t->id();
            $t->foreignId('client_id')->nullable()->constrained()->cascadeOnDelete();
            $t->string('provider')->nullable();
            $t->string('model')->nullable();
            $t->integer('markup_bps'); // basis points over provider cost
            $t->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('client_model_rates');
        Schema::dropIfExists('model_catalog');
        Schema::dropIfExists('provider_keys');
        Schema::dropIfExists('clients');
    }
};
