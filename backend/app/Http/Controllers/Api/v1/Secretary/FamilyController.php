<?php

namespace App\Http\Controllers\Api\v1\Secretary;

use App\Http\Controllers\Controller;
use App\Models\Family;
use App\Models\Member;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FamilyController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Family::query()->with(['members:id,family_id,name,family_role,birth_date,is_minor']);

        if ($request->filled('search')) {
            $query->where('name', 'like', "%{$request->search}%");
        }

        $families = $query->orderBy('name')->get();

        return response()->json([
            'status' => 'success',
            'data' => $families,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'address' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:1000'],
            'members' => ['nullable', 'array'],
            'members.*.member_id' => ['required_with:members', 'integer', 'exists:members,id'],
            'members.*.family_role' => ['required_with:members', 'string', 'in:head,spouse,child,parent,other'],
        ]);

        $family = DB::transaction(function () use ($validated) {
            $family = Family::create([
                'name' => $validated['name'],
                'address' => $validated['address'] ?? null,
                'notes' => $validated['notes'] ?? null,
            ]);

            if (!empty($validated['members'])) {
                foreach ($validated['members'] as $m) {
                    Member::where('id', $m['member_id'])->update([
                        'family_id' => $family->id,
                        'family_role' => $m['family_role'],
                    ]);
                }
            }

            AuditService::log('family.created', $family, null, $family->toArray());

            return $family;
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Grupo familiar cadastrado com sucesso.',
            'data' => $family->load('members'),
        ], 201);
    }

    public function show(Family $family): JsonResponse
    {
        $family->load('members');

        return response()->json([
            'status' => 'success',
            'data' => $family,
        ]);
    }
}
