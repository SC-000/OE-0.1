<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ChargeRun extends Model
{
    protected $guarded = [];

    protected $casts = ['amount_cents' => 'integer'];

    /** @return BelongsTo<Charge, $this> */
    public function charge(): BelongsTo
    {
        return $this->belongsTo(Charge::class);
    }

    /** @return BelongsTo<UsageRecord, $this> */
    public function usageRecord(): BelongsTo
    {
        return $this->belongsTo(UsageRecord::class);
    }
}
