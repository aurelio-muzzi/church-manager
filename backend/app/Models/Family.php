<?php

namespace App\Models;

use App\Traits\BelongsToTenant;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Family extends Model
{
    use HasFactory, SoftDeletes, BelongsToTenant;

    protected $fillable = [
        'tenant_id',
        'name',
        'address',
        'notes',
    ];

    public function members(): HasMany
    {
        return $this->hasMany(Member::class);
    }

    public function headOfFamily()
    {
        return $this->hasOne(Member::class)->where('family_role', 'head');
    }
}
