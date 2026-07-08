<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Client extends Model
{
    protected $guarded = [];

    /** Sane defaults so a freshly-built (unsaved) instance is always billable. */
    protected $attributes = [
        'status' => 'active',
        'balance_cents' => 0,
        'min_balance_cents' => 1000,
        'topup_amount_cents' => 5000,
        'auto_topup' => true,
        'default_markup_bps' => 2500,
        'debt_limit_cents' => 5000,
    ];

    protected $casts = [
        'auto_topup' => 'boolean',
        'balance_cents' => 'integer',
        'min_balance_cents' => 'integer',
        'topup_amount_cents' => 'integer',
        'default_markup_bps' => 'integer',
        'debt_limit_cents' => 'integer',
    ];

    public function users(): HasMany { return $this->hasMany(User::class); }
    public function providerKeys(): HasMany { return $this->hasMany(ProviderKey::class); }
    public function usageRecords(): HasMany { return $this->hasMany(UsageRecord::class); }
    public function ledger(): HasMany { return $this->hasMany(BalanceLedgerEntry::class); }
    public function topUps(): HasMany { return $this->hasMany(TopUp::class); }
    public function paymentMethods(): HasMany { return $this->hasMany(PaymentMethod::class); }
    public function rates(): HasMany { return $this->hasMany(ClientModelRate::class); }

    public function defaultPaymentMethod(): ?PaymentMethod
    {
        return $this->paymentMethods()->where('is_default', true)->first()
            ?? $this->paymentMethods()->latest()->first();
    }

    public function isLow(): bool
    {
        // Strictly below — a balance exactly at the minimum is fine, so an initial
        // top-up that lands on the minimum does not immediately trigger another.
        return $this->balance_cents < $this->min_balance_cents;
    }

    public function overDebtLimit(): bool
    {
        return $this->balance_cents < -abs($this->debt_limit_cents);
    }

    public function balanceDollars(): float
    {
        return round($this->balance_cents / 100, 2);
    }
}
