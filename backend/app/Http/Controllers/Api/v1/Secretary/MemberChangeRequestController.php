<?php

namespace App\Http\Controllers\Api\v1\Secretary;

use App\Http\Controllers\Controller;
use App\Http\Requests\Secretary\ReviewChangeRequestRequest;
use App\Models\Member;
use App\Models\MemberChangeRequest;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MemberChangeRequestController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = MemberChangeRequest::query()->with([
            'member:id,name,email,phone',
            'requestedBy:id,name,email',
            'reviewedBy:id,name,email',
        ]);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $requests = $query->latest()->paginate($request->integer('per_page', 15));

        return response()->json([
            'status' => 'success',
            'data' => $requests,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $user = $request->user();

        // Localiza o membro correspondente ao usuário logado
        $member = Member::where('user_id', $user->id)->first();

        if (!$member) {
            return response()->json([
                'status' => 'error',
                'message' => 'Nenhum cadastro de membro associado ao seu usuário nesta congregação.',
            ], 404);
        }

        $validated = $request->validate([
            'proposed_changes' => ['required', 'array', 'min:1'],
            'proposed_changes.phone' => ['nullable', 'string', 'max:30'],
            'proposed_changes.email' => ['nullable', 'email', 'max:255'],
            'proposed_changes.address' => ['nullable', 'string', 'max:255'],
            'proposed_changes.neighborhood' => ['nullable', 'string', 'max:100'],
            'proposed_changes.city' => ['nullable', 'string', 'max:100'],
            'proposed_changes.state' => ['nullable', 'string', 'size:2'],
            'proposed_changes.postal_code' => ['nullable', 'string', 'max:10'],
            'proposed_changes.emergency_contact_name' => ['nullable', 'string', 'max:255'],
            'proposed_changes.emergency_contact_phone' => ['nullable', 'string', 'max:30'],
        ]);

        // Captura os valores originais correspondentes
        $originalData = [];
        foreach (array_keys($validated['proposed_changes']) as $key) {
            $originalData[$key] = $member->{$key};
        }

        $changeRequest = MemberChangeRequest::create([
            'member_id' => $member->id,
            'requested_by_user_id' => $user->id,
            'status' => 'pending',
            'proposed_changes' => $validated['proposed_changes'],
            'original_data' => $originalData,
        ]);

        AuditService::log('member_change_request.submitted', $changeRequest, null, [
            'member_id' => $member->id,
            'changes' => $validated['proposed_changes'],
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Solicitação de alteração cadastral enviada para análise da secretaria.',
            'data' => $changeRequest,
        ], 201);
    }

    public function review(ReviewChangeRequestRequest $request, MemberChangeRequest $changeRequest): JsonResponse
    {
        if (!$changeRequest->isPending()) {
            return response()->json([
                'status' => 'error',
                'message' => "Esta solicitação já foi analisada anteriormente com o status '{$changeRequest->status}'.",
            ], 422);
        }

        $action = $request->action; // approve ou reject
        $reviewer = $request->user();

        DB::transaction(function () use ($changeRequest, $action, $request, $reviewer) {
            if ($action === 'approve') {
                $member = $changeRequest->member;
                $oldMemberData = $member->toArray();

                // Aplica somente os campos permitidos no cadastro oficial do membro
                $allowedFields = [
                    'phone', 'email', 'address', 'neighborhood', 'city',
                    'state', 'postal_code', 'emergency_contact_name', 'emergency_contact_phone'
                ];

                $fieldsToUpdate = array_intersect_key(
                    $changeRequest->proposed_changes,
                    array_flip($allowedFields)
                );

                $member->update($fieldsToUpdate);

                $changeRequest->update([
                    'status' => 'approved',
                    'reviewed_by_user_id' => $reviewer->id,
                    'review_notes' => $request->review_notes ?? 'Aprovado pela secretaria.',
                    'reviewed_at' => now(),
                ]);

                AuditService::log(
                    'member_change_request.approved',
                    $changeRequest,
                    $oldMemberData,
                    $member->toArray()
                );
            } else {
                $changeRequest->update([
                    'status' => 'rejected',
                    'reviewed_by_user_id' => $reviewer->id,
                    'review_notes' => $request->review_notes ?? 'Rejeitado pela secretaria.',
                    'reviewed_at' => now(),
                ]);

                AuditService::log('member_change_request.rejected', $changeRequest, null, [
                    'reason' => $request->review_notes,
                ]);
            }
        });

        return response()->json([
            'status' => 'success',
            'message' => $action === 'approve' ? 'Solicitação aprovada e cadastro atualizado.' : 'Solicitação rejeitada.',
            'data' => $changeRequest->fresh(['member', 'reviewedBy']),
        ]);
    }
}
