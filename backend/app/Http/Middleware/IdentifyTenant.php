<?php

namespace App\Http\Middleware;

use App\Models\Tenant;
use App\Services\TenantContext;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class IdentifyTenant
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'status' => 'error',
                'message' => 'Autenticação necessária para acessar recursos do tenant.',
            ], 401);
        }

        $tenantContext = app(TenantContext::class);
        $requestedTenantId = $request->header('X-Tenant-ID');

        $tenant = null;

        if ($user->isPlatformAdmin()) {
            // Platform admin pode especificar um tenant para suporte ou visualização autorizada
            if ($requestedTenantId) {
                $tenant = Tenant::find($requestedTenantId);
            } else {
                $tenant = $user->defaultTenant() ?? Tenant::first();
            }
        } else {
            // Usuário normal: validação estrita da associação
            if ($requestedTenantId) {
                $hasAssociation = $user->tenantUsers()
                    ->where('tenant_id', $requestedTenantId)
                    ->where('status', 'active')
                    ->exists();

                if (!$hasAssociation) {
                    return response()->json([
                        'status' => 'error',
                        'message' => 'Você não possui permissão para acessar esta igreja.',
                    ], 403);
                }

                $tenant = Tenant::find($requestedTenantId);
            } else {
                $tenant = $user->defaultTenant();
            }
        }

        if (!$tenant) {
            return response()->json([
                'status' => 'error',
                'message' => 'Nenhuma igreja ativa encontrada para este usuário.',
            ], 403);
        }

        // Validação de suspensão do tenant
        if ($tenant->isSuspended() && !$user->isPlatformAdmin()) {
            return response()->json([
                'status' => 'error',
                'message' => 'O acesso desta igreja está suspenso.',
                'reason' => $tenant->suspension_reason,
            ], 403);
        }

        $tenantContext->setTenant($tenant);

        $response = $next($request);

        // Adiciona header de tenant ativo na resposta
        $response->headers->set('X-Tenant-ID', (string) $tenant->id);
        $response->headers->set('X-Tenant-Name', $tenant->name);

        return $response;
    }
}
