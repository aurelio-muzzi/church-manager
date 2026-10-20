<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class FinancialAccount extends Model
{
    use HasFactory, SoftDeletes, BelongsToTenant;

    protected $attributes = [
        'type' => 'checking',
        'status' => 'active',
        'initial_balance' => 0.00,
        'current_balance' => 0.00,
    ];

    protected $fillable = [
        'tenant_id',
        'congregation_id',
        'name',
        'type',
        'bank_name',
        'agency',
        'account_number',
        'initial_balance',
        'current_balance',
        'status',
    ];

    protected $casts = [
        'initial_balance' => 'decimal:2',
        'current_balance' => 'decimal:2',
    ];

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function ($model) {
            if ($model->current_balance === 0.00 && $model->initial_balance > 0) {
                $model->current_balance = $model->initial_balance;
            }
        });
    }

    public function congregation(): BelongsTo
    {
        return $this->belongsTo(Congregation::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(FinancialTransaction::class, 'account_id');
    }

    public function deposit(float $amount): void
    {
        $this->increment('current_balance', $amount);
    }

    public function withdraw(float $amount): void
    {
        $this->decrement('current_balance', $amount);
    }
}
