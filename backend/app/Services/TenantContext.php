<?php

namespace App\Services;

use App\Models\Tenant;

class TenantContext
{
    protected ?Tenant $tenant = null;
    protected bool $bypassScope = false;

    public function setTenant(?Tenant $tenant): void
    {
        $this->tenant = $tenant;
    }

    public function getTenant(): ?Tenant
    {
        return $this->tenant;
    }

    public function getTenantId(): ?int
    {
        return $this->tenant?->id;
    }

    public function hasTenant(): bool
    {
        return $this->tenant !== null;
    }

    public function clear(): void
    {
        $this->tenant = null;
        $this->bypassScope = false;
    }

    public function setBypassScope(bool $bypass): void
    {
        $this->bypassScope = $bypass;
    }

    public function isBypassingScope(): bool
    {
        return $this->bypassScope;
    }

    public function runWithTenant(Tenant $tenant, callable $callback): mixed
    {
        $previous = $this->tenant;
        $this->setTenant($tenant);

        try {
            return $callback($tenant);
        } finally {
            $this->setTenant($previous);
        }
    }

    public function withoutTenantScope(callable $callback): mixed
    {
        $previous = $this->bypassScope;
        $this->bypassScope = true;

        try {
            return $callback();
        } finally {
            $this->bypassScope = $previous;
        }
    }
}
