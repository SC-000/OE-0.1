<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Metered usage, idempotent per (key, model, window).
        Schema::create('usage_records', function (Blueprint $t) {
            $t->id();
            $t->foreignId('client_id')->constrained()->cascadeOnDelete();
            $t->foreignId('provider_key_id')->constrained()->cascadeOnDelete();
            $t->string('provider');
            $t->string('model');
            $t->timestamp('period_start');
            $t->timestamp('period_end');
            $t->unsignedBigInteger('input_tokens')->default(0);
            $t->unsignedBigInteger('output_tokens')->default(0);
            $t->bigInteger('provider_cost_cents')->default(0);
            $t->bigInteger('billed_cents')->default(0);
            $t->string('source')->default('pull');
            $t->timestamps();
            $t->unique(['provider_key_id', 'model', 'period_start', 'period_end'], 'usage_idem');
            $t->index(['client_id', 'period_start']);
        });

        Schema::create('balance_ledger', function (Blueprint $t) {
            $t->id();
            $t->foreignId('client_id')->constrained()->cascadeOnDelete();
            $t->string('type'); // usage_debit | topup_credit | adjustment | refund
            $t->bigInteger('amount_cents'); // signed: debit negative, credit positive
            $t->bigInteger('balance_after_cents');
            $t->string('description')->nullable();
            $t->string('reference')->nullable();
            $t->json('meta')->nullable();
            $t->timestamps();
            $t->index(['client_id', 'created_at']);
        });

        Schema::create('top_ups', function (Blueprint $t) {
            $t->id();
            $t->foreignId('client_id')->constrained()->cascadeOnDelete();
            $t->integer('amount_cents');
            $t->string('status')->default('pending'); // pending | succeeded | failed
            $t->string('trigger')->default('auto');   // auto | manual
            $t->string('billings_invoice_id')->nullable();
            $t->string('billings_transaction_id')->nullable();
            $t->string('failure_reason')->nullable();
            $t->timestamps();
            $t->index(['client_id', 'created_at']);
        });

        Schema::create('payment_methods', function (Blueprint $t) {
            $t->id();
            $t->foreignId('client_id')->constrained()->cascadeOnDelete();
            $t->string('billings_pm_id');
            $t->string('brand')->nullable();
            $t->string('last4')->nullable();
            $t->unsignedSmallInteger('exp_month')->nullable();
            $t->unsignedSmallInteger('exp_year')->nullable();
            $t->boolean('is_default')->default(false);
            $t->timestamps();
        });

        Schema::create('processed_webhooks', function (Blueprint $t) {
            $t->id();
            $t->string('source')->default('billings');
            $t->string('event_id')->unique();
            $t->string('type')->nullable();
            $t->json('payload')->nullable();
            $t->timestamp('processed_at')->nullable();
            $t->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('processed_webhooks');
        Schema::dropIfExists('payment_methods');
        Schema::dropIfExists('top_ups');
        Schema::dropIfExists('balance_ledger');
        Schema::dropIfExists('usage_records');
    }
};
