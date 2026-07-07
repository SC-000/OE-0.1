<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProviderKey extends Model
{
    protected $guarded = [];

    protected $casts = [
        'secret' => 'encrypted', // provider API key encrypted at rest
        'last_synced_at' => 'datetime',
        'watermark_at' => 'datetime',
    ];

    protected $hidden = ['secret'];

    public function client(): BelongsTo { return $this->belongsTo(Client::class); }

    /** The client-facing name for this token/source. */
    public function displayLabel(): string
    {
        return $this->display_label ?: $this->label;
    }

    /** Masked fragment for display, never the full key. */
    public function fragment(): string
    {
        $s = (string) ($this->attributes['external_key_id'] ?? '');
        if ($this->provider === 'google') {
            return 'AIza••••'.substr($s ?: str_repeat('0', 4), -4);
        }
        return 'sk-••••'.substr($s ?: str_repeat('0', 4), -4);
    }
}
