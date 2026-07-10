<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaymentMethod extends Model
{
    protected $guarded = [];

    protected $casts = ['is_default' => 'boolean', 'exp_month' => 'integer', 'exp_year' => 'integer'];

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }
}
