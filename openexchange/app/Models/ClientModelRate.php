<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * A rate-card row. NULL client = platform default; NULL model = whole provider;
 * NULL provider+model = the global default. Most specific wins (see RateResolver).
 */
class ClientModelRate extends Model
{
    protected $guarded = [];

    protected $attributes = [
        'pricing_mode' => 'markup',
        'per_request_fee_cents' => 0,
    ];

    protected $casts = [
        'markup_bps' => 'integer',
        'per_request_fee_cents' => 'integer',
        'min_margin_bps' => 'integer',
        'input_usd_per_million' => 'decimal:6',
        'output_usd_per_million' => 'decimal:6',
    ];

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    /** How specific this row is — higher beats lower. */
    public function specificity(): int
    {
        return ($this->client_id ? 4 : 0) + ($this->provider ? 2 : 0) + ($this->model ? 1 : 0);
    }
}
