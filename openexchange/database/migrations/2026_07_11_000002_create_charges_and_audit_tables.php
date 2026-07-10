<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('clients', function (Blueprint $t) {
            // How much model detail this client's portal reveals.
            // aliased (default) → "OpenAI Premium"; provider_only → "OpenAI"; exact → "gpt-5.4".
            $t->string('model_visibility')->default('aliased');
            $t->string('contact_email')->nullable();
            $t->string('company')->nullable();
            $t->text('notes')->nullable(); // internal, never shown to the client
        });

        Schema::table('users', function (Blueprint $t) {
            $t->timestamp('last_login_at')->nullable();
        });

        /**
         * A charge is anything billed to a client that isn't gateway/pull metered usage.
         *
         *  kind=fee   → a named line item on the ledger ("Platform fee").
         *  kind=usage → writes a real UsageRecord (admin supplies model + token counts), so it
         *               surfaces in the client's dashboard as AI/token usage. Always tagged
         *               source=manual with the creating admin, so provenance is auditable.
         *
         * cadence=once runs immediately; daily/monthly run from charges:run.
         */
        Schema::create('charges', function (Blueprint $t) {
            $t->id();
            $t->foreignId('client_id')->constrained()->cascadeOnDelete();
            $t->string('kind')->default('fee');      // fee | usage
            $t->string('cadence')->default('once');  // once | daily | monthly
            $t->string('name');
            $t->text('description')->nullable();

            // fee: signed — negative is a credit/discount. usage: optional flat override.
            $t->bigInteger('amount_cents')->default(0);

            // usage-shaped charge
            $t->string('provider')->nullable();
            $t->string('model')->nullable();
            $t->unsignedBigInteger('input_tokens')->default(0);
            $t->unsignedBigInteger('output_tokens')->default(0);

            $t->boolean('active')->default(true);
            $t->timestamp('starts_at')->nullable();
            $t->timestamp('ends_at')->nullable();
            $t->timestamp('last_run_at')->nullable();
            $t->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $t->timestamps();
            $t->index(['active', 'cadence']);
            $t->index(['client_id', 'active']);
        });

        // One row per charge per period — the idempotency guard for charges:run.
        Schema::create('charge_runs', function (Blueprint $t) {
            $t->id();
            $t->foreignId('charge_id')->constrained()->cascadeOnDelete();
            $t->string('period_key'); // 2026-07-11 (daily) | 2026-07 (monthly) | once
            $t->bigInteger('amount_cents');
            $t->foreignId('usage_record_id')->nullable()->constrained('usage_records')->nullOnDelete();
            $t->timestamps();
            $t->unique(['charge_id', 'period_key']);
        });

        Schema::create('audit_logs', function (Blueprint $t) {
            $t->id();
            $t->foreignId('user_id')->nullable()->constrained()->nullOnDelete();  // the actor
            $t->foreignId('client_id')->nullable()->constrained()->nullOnDelete(); // the subject account
            $t->string('action'); // impersonate.start | rate.update | price.accept | …
            $t->string('summary')->nullable();
            $t->json('meta')->nullable();
            $t->string('ip', 45)->nullable();
            $t->timestamps();
            $t->index(['action', 'created_at']);
            $t->index(['client_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
        Schema::dropIfExists('charge_runs');
        Schema::dropIfExists('charges');
        Schema::table('users', fn (Blueprint $t) => $t->dropColumn('last_login_at'));
        Schema::table('clients', fn (Blueprint $t) => $t->dropColumn(['model_visibility', 'contact_email', 'company', 'notes']));
    }
};
