<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Schedule extends Model
{
    use HasFactory, SoftDeletes, BelongsToTenant;

    protected $attributes = [
        'status' => 'published',
    ];

    protected $fillable = [
        'tenant_id',
        'ministry_id',
        'congregation_id',
        'title',
        'date',
        'start_time',
        'end_time',
        'notes',
        'status',
    ];

    protected $casts = [
        'date' => 'date',
    ];

    public function ministry(): BelongsTo
    {
        return $this->belongsTo(Ministry::class);
    }

    public function congregation(): BelongsTo
    {
        return $this->belongsTo(Congregation::class);
    }

    public function volunteers(): HasMany
    {
        return $this->hasMany(ScheduleVolunteer::class);
    }
}
