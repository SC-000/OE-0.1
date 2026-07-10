<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * A pending change to a model's provider-cost basis, discovered by the pricing feed.
 * Nothing here affects billing until an admin accepts it.
 */
class ModelPriceProposal extends Model
{
    protected $guarded = [];

    protected $casts = [
        'current_input_usd_per_million' => 'decimal:6',
        'current_output_usd_per_million' => 'decimal:6',
        'proposed_input_usd_per_million' => 'decimal:6',
        'proposed_output_usd_per_million' => 'decimal:6',
        'resolved_at' => 'datetime',
    ];

    /** @return BelongsTo<ModelCatalog, $this> */
    public function model(): BelongsTo
    {
        return $this->belongsTo(ModelCatalog::class, 'model_catalog_id');
    }

    /** @return BelongsTo<User, $this> */
    public function resolver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'resolved_by');
    }

    /** Signed % change in the blended (in+out) cost basis — what your margin actually feels. */
    public function deltaPct(): float
    {
        $before = (float) $this->current_input_usd_per_million + (float) $this->current_output_usd_per_million;
        $after = (float) $this->proposed_input_usd_per_million + (float) $this->proposed_output_usd_per_million;
        if ($before <= 0.0) {
            return $after > 0.0 ? 100.0 : 0.0;
        }

        return round((($after - $before) / $before) * 100, 1);
    }
}
