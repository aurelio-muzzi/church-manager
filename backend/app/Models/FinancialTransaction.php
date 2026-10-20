<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class FinancialTransaction extends Model
{
    use HasFactory, SoftDeletes, BelongsToTenant;

    protected $attributes = [
        'type' => 'income',
        'status' => 'confirmed',
        'reconciled' => false,
        'payment_method' => 'pix',
    ];

    protected $fillable = [
        'tenant_id',
        'congregation_id',
        'account_id',
        'category_id',
        'member_id',
        'type',
        'amount',
        'payment_method',
        'transaction_date',
        'description',
        'document_number',
        'status',
        'reconciled',
        'reconciled_at',
        'reconciled_by_user_id',
        'receipt_url',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'transaction_date' => 'date',
        'reconciled' => 'boolean',
        'reconciled_at' => 'datetime',
    ];

    public function account(): BelongsTo
    {
        return $this->belongsTo(FinancialAccount::class, 'account_id');
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(FinancialCategory::class, 'category_id');
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function congregation(): BelongsTo
    {
        return $this->belongsTo(Congregation::class);
    }

    public function reconciledBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reconciled_by_user_id');
    }

    public function reconcile(int $userId): void
    {
        $this->update([
            'reconciled' => true,
            'reconciled_at' => now(),
            'reconciled_by_user_id' => $userId,
        ]);
    }
}
