<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Client-facing gateway tokens — these ARE the labelled "sources".
        Schema::create('access_keys', function (Blueprint $t) {
            $t->id();
            $t->foreignId('client_id')->constrained()->cascadeOnDelete();
            $t->string('name');
            $t->string('prefix', 24);           // shown to the user (e.g. oxk_live_a1b2)
            $t->string('key_hash')->unique();   // sha-256 of the full key
            $t->timestamp('last_used_at')->nullable();
            $t->string('status')->default('active'); // active | revoked
            $t->timestamps();
            $t->index(['client_id', 'status']);
        });

        // Open Exchange's own upstream provider credentials (what the gateway calls with).
        Schema::create('provider_backends', function (Blueprint $t) {
            $t->id();
            $t->string('provider');            // openai | google
            $t->string('backend');             // openai | aistudio | vertex
            $t->string('label');
            $t->text('secret')->nullable();    // encrypted: API key or service-account JSON
            $t->string('project_id')->nullable();  // Vertex: GCP project
            $t->string('region')->nullable();      // Vertex: e.g. us-central1
            $t->string('status')->default('active');
            $t->timestamps();
            $t->index(['provider', 'backend', 'status']);
        });

        Schema::table('usage_records', function (Blueprint $t) {
            $t->foreignId('provider_key_id')->nullable()->change();
            $t->foreignId('access_key_id')->nullable()->after('provider_key_id')->constrained()->nullOnDelete();
            $t->string('request_id')->nullable()->after('source');
        });
    }

    public function down(): void
    {
        Schema::table('usage_records', function (Blueprint $t) {
            $t->dropConstrainedForeignId('access_key_id');
            $t->dropColumn('request_id');
        });
        Schema::dropIfExists('provider_backends');
        Schema::dropIfExists('access_keys');
    }
};
