<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'is_platform_admin',
        'phone',
        'status',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_platform_admin' => 'boolean',
        ];
    }

    public function tenantUsers(): HasMany
    {
        return $this->hasMany(TenantUser::class);
    }

    public function tenants(): BelongsToMany
    {
        return $this->belongsToMany(Tenant::class, 'tenant_users')
            ->withPivot(['role', 'is_default', 'status'])
            ->withTimestamps();
    }

    public function isPlatformAdmin(): bool
    {
        return (bool) $this->is_platform_admin;
    }

    public function roleInTenant(int $tenantId): ?string
    {
        $tenantUser = $this->tenantUsers()->where('tenant_id', $tenantId)->first();
        return $tenantUser?->role;
    }

    public function hasRoleInTenant(int $tenantId, string|array $roles): bool
    {
        if ($this->isPlatformAdmin()) {
            return true;
        }

        $role = $this->roleInTenant($tenantId);
        if (!$role) {
            return false;
        }

        if (is_array($roles)) {
            return in_array($role, $roles, true);
        }

        return $role === $roles;
    }

    public function defaultTenant(): ?Tenant
    {
        $defaultTenantUser = $this->tenantUsers()
            ->where('is_default', true)
            ->where('status', 'active')
            ->first();

        if ($defaultTenantUser) {
            return $defaultTenantUser->tenant;
        }

        $firstTenantUser = $this->tenantUsers()
            ->where('status', 'active')
            ->first();

        return $firstTenantUser?->tenant;
    }
}
