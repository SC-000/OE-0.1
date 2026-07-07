<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UsageRecord extends Model
{
    protected $guarded = [];

    protected $casts = [
        'period_start' => 'datetime',
        'period_end' => 'datetime',
        'input_tokens' => 'integer',
        'output_tokens' => 'integer',
        'provider_cost_cents' => 'integer',
        'billed_cents' => 'integer',
    ];

    public function client(): BelongsTo { return $this->belongsTo(Client::class); }
    public function providerKey(): BelongsTo { return $this->belongsTo(ProviderKey::class); }
}
