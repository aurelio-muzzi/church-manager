<?php

namespace App\Http\Controllers\Api\v1\Ministry;

use App\Http\Controllers\Controller;
use App\Http\Requests\Ministry\StoreMinistryRequest;
use App\Models\Ministry;
use App\Models\MinistryRole;
use App\Models\MinistryVolunteer;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class MinistryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Ministry::query()->with([
            'leader:id,name,email,phone',
            'roles:id,ministry_id,name',
        ])->withCount('volunteers');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('description', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $ministries = $query->orderBy('name')->get();

        return response()->json([
            'status' => 'success',
            'data' => $ministries,
        ]);
    }

    public function store(StoreMinistryRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $ministry = DB::transaction(function () use ($validated) {
            $slug = $validated['slug'] ?? Str::slug($validated['name']);
            if (Ministry::where('slug', $slug)->exists()) {
                $slug .= '-' . Str::random(4);
            }

            $ministry = Ministry::create([
                'name' => $validated['name'],
                'slug' => $slug,
                'description' => $validated['description'] ?? null,
                'leader_member_id' => $validated['leader_member_id'] ?? null,
                'color' => $validated['color'] ?? '#3b82f6',
                'status' => $validated['status'] ?? 'active',
            ]);

            // Cadastra as funções iniciais se fornecidas
            if (!empty($validated['roles'])) {
                foreach ($validated['roles'] as $r) {
                    MinistryRole::create([
                        'ministry_id' => $ministry->id,
                        'name' => $r['name'],
                        'description' => $r['description'] ?? null,
                    ]);
                }
            }

            AuditService::log('ministry.created', $ministry, null, $ministry->toArray());

            return $ministry;
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Ministério criado com sucesso.',
            'data' => $ministry->load(['leader', 'roles']),
        ], 201);
    }

    public function show(Ministry $ministry): JsonResponse
    {
        $ministry->load([
            'leader:id,name,email,phone',
            'roles',
            'volunteers.member:id,name,email,phone',
            'volunteers.role:id,name',
            'schedules' => function ($q) {
                $q->latest('date')->take(5);
            },
        ]);

        return response()->json([
            'status' => 'success',
            'data' => $ministry,
        ]);
    }

    public function update(StoreMinistryRequest $request, Ministry $ministry): JsonResponse
    {
        $oldData = $ministry->toArray();
        $ministry->update($request->validated());

        AuditService::log('ministry.updated', $ministry, $oldData, $ministry->toArray());

        return response()->json([
            'status' => 'success',
            'message' => 'Ministério atualizado com sucesso.',
            'data' => $ministry->load(['leader', 'roles']),
        ]);
    }

    public function destroy(Ministry $ministry): JsonResponse
    {
        AuditService::log('ministry.deleted', $ministry, $ministry->toArray());
        $ministry->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Ministério removido com sucesso.',
        ]);
    }

    public function addVolunteer(Request $request, Ministry $ministry): JsonResponse
    {
        $validated = $request->validate([
            'member_id' => ['required', 'integer', 'exists:members,id'],
            'ministry_role_id' => ['nullable', 'integer', 'exists:ministry_roles,id'],
            'notes' => ['nullable', 'string', 'max:500'],
        ]);

        $volunteer = MinistryVolunteer::firstOrCreate(
            [
                'ministry_id' => $ministry->id,
                'member_id' => $validated['member_id'],
                'ministry_role_id' => $validated['ministry_role_id'] ?? null,
            ],
            [
                'joined_at' => now()->toDateString(),
                'status' => 'active',
                'notes' => $validated['notes'] ?? null,
            ]
        );

        return response()->json([
            'status' => 'success',
            'message' => 'Voluntário associado ao ministério com sucesso.',
            'data' => $volunteer->load(['member', 'role']),
        ], 201);
    }

    public function removeVolunteer(Ministry $ministry, MinistryVolunteer $ministryVolunteer): JsonResponse
    {
        $ministryVolunteer->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Voluntário desassociado com sucesso.',
        ]);
    }
}
