<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Member extends Model
{
    use HasFactory, SoftDeletes, BelongsToTenant;

    protected $attributes = [
        'membership_status' => 'active',
        'is_minor' => false,
    ];

    protected $fillable = [

        'tenant_id',
        'congregation_id',
        'user_id',
        'family_id',
        'family_role',
        'name',
        'email',
        'phone',
        'gender',
        'birth_date',
        'is_minor',
        'marital_status',
        'membership_status',
        'baptism_date',
        'admission_date',
        'admission_type',
        'address',
        'neighborhood',
        'city',
        'state',
        'postal_code',
        'emergency_contact_name',
        'emergency_contact_phone',
        'notes',
    ];

    protected $casts = [
        'birth_date' => 'date',
        'baptism_date' => 'date',
        'admission_date' => 'date',
        'is_minor' => 'boolean',
    ];

    protected static function boot(): void
    {
        parent::boot();

        static::saving(function ($model) {
            // Calcula automaticamente se é menor de idade (LGPD) a partir da data de nascimento
            if ($model->birth_date) {
                $age = Carbon::parse($model->birth_date)->age;
                $model->is_minor = ($age < 18);
            }
        });
    }

    public function congregation(): BelongsTo
    {
        return $this->belongsTo(Congregation::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function family(): BelongsTo
    {
        return $this->belongsTo(Family::class);
    }

    public function changeRequests(): HasMany
    {
        return $this->hasMany(MemberChangeRequest::class);
    }

    public function scopeActive($query)
    {
        return $query->where('membership_status', 'active');
    }
}
