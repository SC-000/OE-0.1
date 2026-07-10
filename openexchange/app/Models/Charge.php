<?php

namespace App\Models;

use Carbon\CarbonImmutable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * A non-metered billing line: either a named fee, or a usage-shaped charge that
 * materialises as a real UsageRecord in the client's dashboard.
 */
class Charge extends Model
{
    protected $guarded = [];

    protected $casts = [
        'amount_cents' => 'integer',
        'input_tokens' => 'integer',
        'output_tokens' => 'integer',
        'active' => 'boolean',
        'starts_at' => 'datetime',
        'ends_at' => 'datetime',
        'last_run_at' => 'datetime',
    ];

    /** @return BelongsTo<Client, $this> */
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    /** @return BelongsTo<User, $this> */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /** @return HasMany<ChargeRun, $this> */
    public function runs(): HasMany
    {
        return $this->hasMany(ChargeRun::class);
    }

    public function isUsage(): bool
    {
        return $this->kind === 'usage';
    }

    public function isRecurring(): bool
    {
        return in_array($this->cadence, ['daily', 'monthly'], true);
    }

    /** The idempotency key for the period `$at` falls in. */
    public function periodKey(\DateTimeInterface $at): string
    {
        return match ($this->cadence) {
            'daily' => CarbonImmutable::instance($at)->format('Y-m-d'),
            'monthly' => CarbonImmutable::instance($at)->format('Y-m'),
            default => 'once',
        };
    }

    /** Is this charge live for the given moment? */
    public function dueAt(\DateTimeInterface $at): bool
    {
        if (! $this->active) {
            return false;
        }
        if ($this->starts_at && $this->starts_at->gt($at)) {
            return false;
        }
        if ($this->ends_at && $this->ends_at->lt($at)) {
            return false;
        }

        return true;
    }
}
