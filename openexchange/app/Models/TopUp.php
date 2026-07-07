<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TopUp extends Model
{
    protected $guarded = [];
    protected $casts = ['amount_cents' => 'integer'];

    public function client(): BelongsTo { return $this->belongsTo(Client::class); }
}
