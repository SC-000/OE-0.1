<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('provider_keys', function (Blueprint $t) {
            // Friendly, client-facing name for a token/source (e.g. "Production app").
            $t->string('display_label')->nullable()->after('label');
        });
    }

    public function down(): void
    {
        Schema::table('provider_keys', function (Blueprint $t) {
            $t->dropColumn('display_label');
        });
    }
};
