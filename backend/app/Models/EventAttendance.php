<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EventAttendance extends Model
{
    use HasFactory, BelongsToTenant;

    protected $attributes = [
        'check_in_type' => 'qr_code',
    ];

    protected $fillable = [
        'tenant_id',
        'event_id',
        'registration_id',
        'member_id',
        'visitor_id',
        'name',
        'check_in_type',
        'checked_in_at',
        'checked_in_by_user_id',
        'notes',
    ];

    protected $casts = [
        'checked_in_at' => 'datetime',
    ];

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->checked_in_at)) {
                $model->checked_in_at = now();
            }
        });
    }

    public function event(): BelongsTo
    {
        return $this->belongsTo(Event::class);
    }

    public function registration(): BelongsTo
    {
        return $this->belongsTo(EventRegistration::class, 'registration_id');
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(Member::class);
    }

    public function visitor(): BelongsTo
    {
        return $this->belongsTo(Visitor::class);
    }

    public function checkedInBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'checked_in_by_user_id');
    }
}
