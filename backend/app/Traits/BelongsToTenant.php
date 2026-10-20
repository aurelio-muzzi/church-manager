<?php

namespace App\Traits;

use App\Models\Tenant;
use App\Scopes\TenantScope;
use App\Services\TenantContext;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Symfony\Component\HttpKernel\Exception\UnauthorizedHttpException;

trait BelongsToTenant
{
    public static function bootBelongsToTenant(): void
    {
        static::addGlobalScope(new TenantScope());

        static::creating(function ($model) {
            $tenantContext = app(TenantContext::class);

            if (!$tenantContext->isBypassingScope()) {
                $activeTenantId = $tenantContext->getTenantId();
                if (!$activeTenantId) {
                    throw new UnauthorizedHttpException('Tenant context is required to create resources.');
                }
                // Garante que o tenant_id é SEMPRE o do contexto autenticado, ignorando qualquer tentativa de injeção externa
                $model->tenant_id = $activeTenantId;
            }
        });
    }

    public function tenant(): BelongsTo
    {
        return $this->belongsTo(Tenant::class);
    }
}
