<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MinistryVolunteer extends Model
{
    use HasFactory, BelongsToTenant;

    protected $attributes = [
        'status' => 'active',
    ];

    protected $fillable = [
        'tenant_id',
        'ministry_id',
        'member_id',
        'ministry_role_id',
        'status',
        'joined_at',
        'notes',
    ];

    protected $casts = [
        'joined_at' => 'date',
    ];

    public function ministry(): BelongsTo
    {
        return $this->belongsTo(Ministry::class);
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function role(): BelongsTo
    {
        return $this->belongsTo(MinistryRole::class, 'ministry_role_id');
    }
}
