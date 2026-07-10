<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class AccessKey extends Model
{
    protected $guarded = [];

    protected $casts = ['last_used_at' => 'datetime'];

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    /** Create a key; returns [model, plaintext]. The plaintext is shown once. */
    public static function generate(Client $client, string $name): array
    {
        $secret = 'oxk_live_'.Str::random(40);
        $model = static::create([
            'client_id' => $client->id,
            'name' => $name,
            'prefix' => substr($secret, 0, 16),
            'key_hash' => hash('sha256', $secret),
            'status' => 'active',
        ]);

        return [$model, $secret];
    }

    /** Resolve an active key from a presented bearer token. */
    public static function resolve(string $token): ?self
    {
        if (! str_starts_with($token, 'oxk_')) {
            return null;
        }

        return static::where('key_hash', hash('sha256', $token))->where('status', 'active')->first();
    }

    public function fragment(): string
    {
        return $this->prefix.'…'.substr($this->key_hash, -4);
    }
}
