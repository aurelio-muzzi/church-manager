<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class FinancialCategory extends Model
{
    use HasFactory, BelongsToTenant;

    protected $attributes = [
        'type' => 'income',
        'status' => 'active',
        'color' => '#10b981',
    ];

    protected $fillable = [
        'tenant_id',
        'parent_id',
        'name',
        'type',
        'color',
        'status',
    ];

    public function parent(): BelongsTo
    {
        return $this->belongsTo(FinancialCategory::class, 'parent_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(FinancialCategory::class, 'parent_id');
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(FinancialTransaction::class, 'category_id');
    }

    public function budgets(): HasMany
    {
        return $this->hasMany(FinancialBudget::class, 'category_id');
    }
}
