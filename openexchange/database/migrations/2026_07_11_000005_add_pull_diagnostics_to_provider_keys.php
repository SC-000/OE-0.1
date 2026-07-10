<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * A usage pull can fail in two ways, and both used to be invisible in the admin:
 *
 *   loudly   — no credentials, upstream 401/500. Threw, got logged to the console,
 *              and the "Pull now" button returned `back()` with no flash at all.
 *   quietly  — the key's `external_project_id` doesn't exist upstream. OpenAI returns
 *              an EMPTY result, not an error, so the pull "succeeds" having billed
 *              nothing. This is why discovery can show usage that never reaches a client.
 *
 * These columns make both states visible on the key itself.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('provider_keys', function (Blueprint $t) {
            $t->text('last_error')->nullable()->after('watermark_at');
            $t->timestamp('last_error_at')->nullable()->after('last_error');
            // Buckets returned by the last successful pull. 0 with no error = the
            // project id almost certainly doesn't match anything upstream.
            $t->unsignedInteger('last_pull_records')->nullable()->after('last_error_at');
        });
    }

    public function down(): void
    {
        Schema::table('provider_keys', function (Blueprint $t) {
            $t->dropColumn(['last_error', 'last_error_at', 'last_pull_records']);
        });
    }
};
