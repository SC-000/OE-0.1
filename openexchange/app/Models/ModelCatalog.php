<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ModelCatalog extends Model
{
    protected $table = 'model_catalog';
    protected $guarded = [];

    protected $casts = [
        'input_usd_per_million' => 'decimal:6',
        'output_usd_per_million' => 'decimal:6',
        'active' => 'boolean',
    ];

    /** Provider cost in integer cents for the given token counts. */
    public function costCents(int $inputTokens, int $outputTokens): int
    {
        $usd = ($inputTokens / 1_000_000) * (float) $this->input_usd_per_million
            + ($outputTokens / 1_000_000) * (float) $this->output_usd_per_million;

        return (int) round($usd * 100);
    }
}
