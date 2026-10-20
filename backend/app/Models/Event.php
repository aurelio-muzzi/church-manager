<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Event extends Model
{
    use HasFactory, SoftDeletes, BelongsToTenant;

    protected $attributes = [
        'type' => 'service',
        'status' => 'published',
        'requires_registration' => false,
        'is_free' => true,
        'price' => 0.00,
    ];

    protected $fillable = [
        'tenant_id',
        'congregation_id',
        'ministry_id',
        'title',
        'slug',
        'type',
        'description',
        'location',
        'banner_url',
        'start_date',
        'end_date',
        'start_time',
        'end_time',
        'max_capacity',
        'requires_registration',
        'is_free',
        'price',
        'status',
    ];

    protected $casts = [
        'start_date' => 'date',
        'end_date' => 'date',
        'requires_registration' => 'boolean',
        'is_free' => 'boolean',
        'price' => 'decimal:2',
        'max_capacity' => 'integer',
    ];

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->slug)) {
                $model->slug = Str::slug($model->title);
            }
        });
    }

    public function congregation(): BelongsTo
    {
        return $this->belongsTo(Congregation::class);
    }

    public function ministry(): BelongsTo
    {
        return $this->belongsTo(Ministry::class);
    }

    public function registrations(): HasMany
    {
        return $this->hasMany(EventRegistration::class);
    }

    public function attendances(): HasMany
    {
        return $this->hasMany(EventAttendance::class);
    }

    public function scopePublished($query)
    {
        return $query->where('status', 'published');
    }

    public function isCapacityFull(): bool
    {
        if (!$this->max_capacity) {
            return false;
        }

        return $this->registrations()->where('status', 'confirmed')->count() >= $this->max_capacity;
    }
}
