<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Visitor extends Model
{
    use HasFactory, SoftDeletes, BelongsToTenant;

    protected $attributes = [
        'status' => 'active',
    ];

    protected $fillable = [

        'tenant_id',
        'congregation_id',
        'name',
        'email',
        'phone',
        'first_visit_date',
        'how_met_church',
        'prayer_request',
        'converted_to_member_id',
        'converted_at',
        'status',
        'notes',
    ];

    protected $casts = [
        'first_visit_date' => 'date',
        'converted_at' => 'datetime',
    ];

    public function congregation(): BelongsTo
    {
        return $this->belongsTo(Congregation::class);
    }

    public function visits(): HasMany
    {
        return $this->hasMany(VisitorVisit::class);
    }

    public function convertedMember(): BelongsTo
    {
        return $this->belongsTo(Member::class, 'converted_to_member_id');
    }
}
