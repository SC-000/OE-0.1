<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ClientModelRate extends Model
{
    protected $guarded = [];
    protected $casts = ['markup_bps' => 'integer'];

    public function client(): BelongsTo { return $this->belongsTo(Client::class); }
}
