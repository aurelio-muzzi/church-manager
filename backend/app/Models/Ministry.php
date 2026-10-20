<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Ministry extends Model
{
    use HasFactory, SoftDeletes, BelongsToTenant;

    protected $attributes = [
        'status' => 'active',
        'color' => '#3b82f6',
    ];

    protected $fillable = [
        'tenant_id',
        'leader_member_id',
        'name',
        'slug',
        'description',
        'color',
        'status',
    ];

    protected static function boot(): void
    {
        parent::boot();

        static::creating(function ($model) {
            if (empty($model->slug)) {
                $model->slug = Str::slug($model->name);
            }
        });
    }

    public function leader(): BelongsTo
    {
        return $this->belongsTo(Member::class, 'leader_member_id');
    }

    public function roles(): HasMany
    {
        return $this->hasMany(MinistryRole::class);
    }

    public function volunteers(): HasMany
    {
        return $this->hasMany(MinistryVolunteer::class);
    }

    public function schedules(): HasMany
    {
        return $this->hasMany(Schedule::class);
    }

    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }
}
