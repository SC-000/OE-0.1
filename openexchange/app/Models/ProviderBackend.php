<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Open Exchange's own upstream provider credentials — what the gateway calls with.
 * backend: 'openai' | 'aistudio' (Gemini Developer API) | 'vertex' (Vertex AI).
 */
class ProviderBackend extends Model
{
    protected $guarded = [];
    protected $casts = ['secret' => 'encrypted'];
    protected $hidden = ['secret'];

    /** Pick the best active backend for a provider, optionally preferring one type. */
    public static function pick(string $provider, ?string $prefer = null): ?self
    {
        $q = static::where('provider', $provider)->where('status', 'active');
        if ($prefer) {
            $found = (clone $q)->where('backend', $prefer)->first();
            if ($found) {
                return $found;
            }
        }

        return $q->orderBy('id')->first();
    }
}
