<?php

namespace App\Http\Controllers\Api\v1\Secretary;

use App\Http\Controllers\Controller;
use App\Http\Requests\Secretary\StoreMemberRequest;
use App\Models\Member;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MemberController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Member::query()->with(['congregation:id,name', 'family:id,name']);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('membership_status', $request->status);
        }

        if ($request->filled('congregation_id')) {
            $query->where('congregation_id', $request->congregation_id);
        }

        if ($request->filled('is_minor')) {
            $query->where('is_minor', filter_var($request->is_minor, FILTER_VALIDATE_BOOLEAN));
        }

        $members = $query->latest()->paginate($request->integer('per_page', 15));

        return response()->json([
            'status' => 'success',
            'data' => $members,
        ]);
    }

    public function store(StoreMemberRequest $request): JsonResponse
    {
        $member = Member::create($request->validated());

        AuditService::log('member.created', $member, null, $member->toArray());

        return response()->json([
            'status' => 'success',
            'message' => 'Membro cadastrado com sucesso.',
            'data' => $member->load(['congregation', 'family']),
        ], 201);
    }

    public function show(Member $member): JsonResponse
    {
        $member->load(['congregation', 'family.members', 'changeRequests']);

        return response()->json([
            'status' => 'success',
            'data' => $member,
        ]);
    }

    public function update(StoreMemberRequest $request, Member $member): JsonResponse
    {
        $oldData = $member->toArray();
        $member->update($request->validated());

        AuditService::log('member.updated', $member, $oldData, $member->toArray());

        return response()->json([
            'status' => 'success',
            'message' => 'Cadastro do membro atualizado com sucesso.',
            'data' => $member->load(['congregation', 'family']),
        ]);
    }

    public function destroy(Member $member): JsonResponse
    {
        AuditService::log('member.deleted', $member, $member->toArray());
        $member->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Membro inativado/removido com sucesso.',
        ]);
    }
}
