<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BalanceLedgerEntry extends Model
{
    protected $table = 'balance_ledger';

    protected $guarded = [];

    protected $casts = [
        'amount_cents' => 'integer',
        'balance_after_cents' => 'integer',
        'meta' => 'array',
    ];

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }
}
