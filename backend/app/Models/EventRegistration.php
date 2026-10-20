<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class EventRegistration extends Model
{
    use HasFactory, SoftDeletes, BelongsToTenant;

    protected $attributes = [
        'status' => 'confirmed',
    ];

    protected $fillable = [
        'tenant_id',
        'event_id',
        'member_id',
        'name',
        'email',
        'phone',
        'qr_code_token',
        'status',
        'registered_at',
        'notes',
    ];

    protected $casts = [
        'registered_at' => 'datetime',
    ];

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->qr_code_token)) {
                $model->qr_code_token = 'EVT-' . strtoupper(Str::random(12));
            }
            if (empty($model->registered_at)) {
                $model->registered_at = now();
            }
        });
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function attendance(): HasOne
    {
        return $this->hasOne(EventAttendance::class, 'registration_id');
    }
}
