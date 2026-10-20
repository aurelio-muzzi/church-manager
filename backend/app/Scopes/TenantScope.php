<?php

namespace App\Scopes;

use App\Services\TenantContext;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Scope;

class TenantScope implements Scope
{
    public function apply(Builder $builder, Model $model): void
    {
        $tenantContext = app(TenantContext::class);

        if ($tenantContext->isBypassingScope()) {
            return;
        }

        if ($tenantContext->hasTenant()) {
            $builder->where($model->getTable() . '.tenant_id', $tenantContext->getTenantId());
            return;
        }

        // Se o model exige tenant mas não há tenant ativo no contexto,
        // força resultado vazio para prevenir qualquer vazamento acidental entre tenants
        $builder->whereRaw('1 = 0');
    }
}
