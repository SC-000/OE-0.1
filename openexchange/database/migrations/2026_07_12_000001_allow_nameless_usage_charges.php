<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * A usage charge may go nameless.
 *
 * The name is the line's *statement* label — the one thing about a charge the client
 * reads. A fee needs one or it is a mystery debit. A usage charge does not: it already
 * shows up as token usage against a real model, so a nameless one simply reads as
 * ordinary inference, which is often exactly what it is.
 *
 * Nullable, not empty-string: "" and NULL both render as nothing, and having two ways
 * to say the same thing is how one of them ends up printed on an invoice.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('charges', function (Blueprint $t) {
            $t->string('name')->nullable()->change();
        });
    }

    public function down(): void
    {
        // A NOT NULL column cannot hold the nameless rows this migration allowed.
        DB::table('charges')->whereNull('name')->update(['name' => 'Usage']);

        Schema::table('charges', function (Blueprint $t) {
            $t->string('name')->nullable(false)->change();
        });
    }
};
