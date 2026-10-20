<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Models\Tenant;
use App\Models\User;
use App\Services\AuditService;
use App\Services\TenantContext;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function login(LoginRequest $request): JsonResponse
    {
        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['As credenciais fornecidas são inválidas.'],
            ]);
        }

        if ($user->status !== 'active') {
            return response()->json([
                'status' => 'error',
                'message' => 'Sua conta de usuário está desativada. Contate a administração.',
            ], 403);
        }

        $deviceName = $request->input('device_name', $request->userAgent() ?? 'web-client');
        $token = $user->createToken($deviceName)->plainTextToken;

        // Tenants associados
        $tenants = [];
        if ($user->isPlatformAdmin()) {
            $tenants = Tenant::where('status', 'active')
                ->select(['id', 'uuid', 'name', 'slug', 'status'])
                ->get()
                ->map(fn ($t) => [
                    'id' => $t->id,
                    'uuid' => $t->uuid,
                    'name' => $t->name,
                    'slug' => $t->slug,
                    'role' => 'platform_admin',
                    'status' => $t->status,
                ]);
        } else {
            $tenants = $user->tenants()
                ->where('tenants.status', 'active')
                ->wherePivot('status', 'active')
                ->select(['tenants.id', 'tenants.uuid', 'tenants.name', 'tenants.slug', 'tenants.status'])
                ->get()
                ->map(fn ($t) => [
                    'id' => $t->id,
                    'uuid' => $t->uuid,
                    'name' => $t->name,
                    'slug' => $t->slug,
                    'role' => $t->pivot->role,
                    'is_default' => (bool) $t->pivot->is_default,
                    'status' => $t->status,
                ]);
        }

        $defaultTenant = $user->defaultTenant() ?? ($tenants->first() ? Tenant::find($tenants->first()['id']) : null);

        AuditService::log('auth.login', $user, null, [
            'device' => $deviceName,
            'tenants_count' => count($tenants),
        ], $defaultTenant?->id, $user->id);

        return response()->json([
            'status' => 'success',
            'message' => 'Autenticação realizada com sucesso.',
            'data' => [
                'token' => $token,
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'is_platform_admin' => $user->isPlatformAdmin(),
                    'phone' => $user->phone,
                ],
                'active_tenant' => $defaultTenant ? [
                    'id' => $defaultTenant->id,
                    'uuid' => $defaultTenant->uuid,
                    'name' => $defaultTenant->name,
                    'slug' => $defaultTenant->slug,
                    'role' => $user->isPlatformAdmin() ? 'platform_admin' : $user->roleInTenant($defaultTenant->id),
                ] : null,
                'tenants' => $tenants,
            ],
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user) {
            AuditService::log('auth.logout', $user, null, null, null, $user->id);
            $user->currentAccessToken()->delete();
        }

        return response()->json([
            'status' => 'success',
            'message' => 'Sessão encerrada com sucesso.',
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();
        $tenantContext = app(TenantContext::class);
        $activeTenant = $tenantContext->getTenant() ?? $user->defaultTenant();

        $role = null;
        if ($user->isPlatformAdmin()) {
            $role = 'platform_admin';
        } elseif ($activeTenant) {
            $role = $user->roleInTenant($activeTenant->id);
        }

        return response()->json([
            'status' => 'success',
            'data' => [
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'is_platform_admin' => $user->isPlatformAdmin(),
                    'phone' => $user->phone,
                ],
                'active_tenant' => $activeTenant ? [
                    'id' => $activeTenant->id,
                    'uuid' => $activeTenant->uuid,
                    'name' => $activeTenant->name,
                    'slug' => $activeTenant->slug,
                    'timezone' => $activeTenant->timezone,
                    'role' => $role,
                    'status' => $activeTenant->status,
                ] : null,
            ],
        ]);
    }

    public function switchTenant(Request $request): JsonResponse
    {
        $request->validate([
            'tenant_id' => ['required', 'integer', 'exists:tenants,id'],
        ]);

        $user = $request->user();
        $tenantId = (int) $request->tenant_id;

        $tenant = Tenant::findOrFail($tenantId);

        if (!$user->isPlatformAdmin()) {
            $association = $user->tenantUsers()
                ->where('tenant_id', $tenantId)
                ->where('status', 'active')
                ->first();

            if (!$association) {
                return response()->json([
                    'status' => 'error',
                    'message' => 'Você não possui acesso a esta igreja.',
                ], 403);
            }
        }

        if ($tenant->isSuspended() && !$user->isPlatformAdmin()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Esta igreja está suspensa.',
            ], 403);
        }

        app(TenantContext::class)->setTenant($tenant);

        AuditService::log('auth.switch_tenant', $tenant, null, ['target_tenant_id' => $tenantId], $tenant->id, $user->id);

        return response()->json([
            'status' => 'success',
            'message' => "Igreja ativa alterada para {$tenant->name}.",
            'data' => [
                'active_tenant' => [
                    'id' => $tenant->id,
                    'uuid' => $tenant->uuid,
                    'name' => $tenant->name,
                    'slug' => $tenant->slug,
                    'role' => $user->isPlatformAdmin() ? 'platform_admin' : $user->roleInTenant($tenant->id),
                ],
            ],
        ]);
    }
}
