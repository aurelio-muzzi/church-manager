<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FinancialBudget extends Model
{
    use HasFactory, BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'category_id',
        'year',
        'month',
        'planned_amount',
        'notes',
    ];

    protected $casts = [
        'year' => 'integer',
        'month' => 'integer',
        'planned_amount' => 'decimal:2',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(FinancialCategory::class, 'category_id');
    }
}
