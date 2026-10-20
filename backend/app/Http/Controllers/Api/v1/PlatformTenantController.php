<?php

namespace App\Http\Controllers\Api\v1;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTenantRequest;
use App\Models\Tenant;
use App\Models\TenantUser;
use App\Models\User;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class PlatformTenantController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Tenant::query()->withCount('tenantUsers');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('slug', 'like', "%{$search}%")
                  ->orWhere('document_number', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $tenants = $query->latest()->paginate($request->integer('per_page', 15));

        return response()->json([
            'status' => 'success',
            'data' => $tenants,
        ]);
    }

    public function store(StoreTenantRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $tenant = DB::transaction(function () use ($validated, $request) {
            // 1. Cria a Igreja / Tenant
            $slug = $validated['slug'] ?? Str::slug($validated['name']);
            // Garantir slug único
            if (Tenant::where('slug', $slug)->exists()) {
                $slug .= '-' . Str::random(4);
            }

            $tenant = Tenant::create([
                'name' => $validated['name'],
                'slug' => $slug,
                'document_number' => $validated['document_number'] ?? null,
                'email' => $validated['email'] ?? null,
                'phone' => $validated['phone'] ?? null,
                'timezone' => $validated['timezone'] ?? 'America/Manaus',
                'status' => 'active',
            ]);

            // 2. Cria ou localiza o Administrador Inicial da Igreja
            $adminUser = User::where('email', $validated['admin_email'])->first();

            if (!$adminUser) {
                $adminUser = User::create([
                    'name' => $validated['admin_name'],
                    'email' => $validated['admin_email'],
                    'password' => Hash::make($validated['admin_password']),
                    'phone' => $validated['admin_phone'] ?? null,
                    'is_platform_admin' => false,
                    'status' => 'active',
                ]);
            }

            // 3. Associa o usuário ao Tenant com a role 'church_admin'
            TenantUser::create([
                'tenant_id' => $tenant->id,
                'user_id' => $adminUser->id,
                'role' => 'church_admin',
                'is_default' => true,
                'status' => 'active',
            ]);

            // 4. Registra Auditoria
            AuditService::log(
                'tenant.created',
                $tenant,
                null,
                [
                    'name' => $tenant->name,
                    'slug' => $tenant->slug,
                    'admin_user_id' => $adminUser->id,
                    'admin_email' => $adminUser->email,
                ],
                $tenant->id,
                $request->user()?->id
            );

            return $tenant;
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Igreja e administrador inicial criados com sucesso.',
            'data' => $tenant->load('tenantUsers.user'),
        ], 201);
    }

    public function show(Tenant $tenant): JsonResponse
    {
        $tenant->load(['tenantUsers.user']);

        return response()->json([
            'status' => 'success',
            'data' => $tenant,
        ]);
    }

    public function updateStatus(Request $request, Tenant $tenant): JsonResponse
    {
        $request->validate([
            'status' => ['required', 'in:active,suspended'],
            'reason' => ['required_if:status,suspended', 'nullable', 'string', 'max:500'],
        ], [
            'reason.required_if' => 'O motivo é obrigatório para suspensão da organização.',
        ]);

        $oldStatus = $tenant->status;
        $newStatus = $request->status;

        if ($oldStatus === $newStatus) {
            return response()->json([
                'status' => 'success',
                'message' => "A igreja já se encontra no status '{$newStatus}'.",
                'data' => $tenant,
            ]);
        }

        if ($newStatus === 'suspended') {
            $tenant->suspend($request->reason);
        } else {
            $tenant->activate();
        }

        AuditService::log(
            'tenant.status_updated',
            $tenant,
            ['status' => $oldStatus],
            ['status' => $newStatus, 'reason' => $request->reason],
            $tenant->id,
            $request->user()?->id
        );

        return response()->json([
            'status' => 'success',
            'message' => $newStatus === 'suspended' ? 'Igreja suspensa com sucesso.' : 'Igreja reativada com sucesso.',
            'data' => $tenant,
        ]);
    }
}
