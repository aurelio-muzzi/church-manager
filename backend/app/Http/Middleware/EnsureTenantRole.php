<?php

namespace App\Http\Middleware;

use App\Services\TenantContext;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureTenantRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();
        $tenant = app(TenantContext::class)->getTenant();

        if (!$user || !$tenant) {
            return response()->json([
                'status' => 'error',
                'message' => 'Contexto de autenticação ou tenant ausente.',
            ], 403);
        }

        if ($user->isPlatformAdmin()) {
            return $next($request);
        }

        if (!$user->hasRoleInTenant($tenant->id, $roles)) {
            return response()->json([
                'status' => 'error',
                'message' => 'Você não possui as permissões necessárias para esta operação na igreja ativa.',
                'required_roles' => $roles,
            ], 403);
        }

        return $next($request);
    }
}
