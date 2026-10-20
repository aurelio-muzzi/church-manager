<?php

namespace App\Http\Controllers\Api\v1\Secretary;

use App\Http\Controllers\Controller;
use App\Http\Requests\Secretary\StoreVisitorRequest;
use App\Models\Member;
use App\Models\Visitor;
use App\Models\VisitorVisit;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class VisitorController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Visitor::query()->with(['congregation:id,name', 'visits'])->withCount('visits');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('phone', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('congregation_id')) {
            $query->where('congregation_id', $request->congregation_id);
        }

        $visitors = $query->latest()->paginate($request->integer('per_page', 15));

        return response()->json([
            'status' => 'success',
            'data' => $visitors,
        ]);
    }

    public function store(StoreVisitorRequest $request): JsonResponse
    {
        $visitor = DB::transaction(function () use ($request) {
            $visitor = Visitor::create($request->validated());

            // Registra automaticamente a primeira visita
            VisitorVisit::create([
                'visitor_id' => $visitor->id,
                'congregation_id' => $visitor->congregation_id,
                'visited_at' => $visitor->first_visit_date ?? now()->toDateString(),
                'service_type' => 'Primeira Visita',
                'notes' => $visitor->notes,
            ]);

            AuditService::log('visitor.created', $visitor, null, $visitor->toArray());

            return $visitor;
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Visitante cadastrado com sucesso.',
            'data' => $visitor->load(['congregation', 'visits']),
        ], 201);
    }

    public function recordVisit(Request $request, Visitor $visitor): JsonResponse
    {
        $validated = $request->validate([
            'visited_at' => ['required', 'date'],
            'service_type' => ['nullable', 'string', 'max:100'],
            'congregation_id' => ['nullable', 'integer', 'exists:congregations,id'],
            'welcomed_by' => ['nullable', 'string', 'max:255'],
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $visit = VisitorVisit::create([
            'visitor_id' => $visitor->id,
            'congregation_id' => $validated['congregation_id'] ?? $visitor->congregation_id,
            'visited_at' => $validated['visited_at'],
            'service_type' => $validated['service_type'] ?? 'Culto Regular',
            'welcomed_by' => $validated['welcomed_by'] ?? null,
            'notes' => $validated['notes'] ?? null,
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Nova visita registrada no histórico com sucesso.',
            'data' => $visit,
        ], 201);
    }

    public function convertToMember(Request $request, Visitor $visitor): JsonResponse
    {
        if ($visitor->status === 'converted') {
            return response()->json([
                'status' => 'error',
                'message' => 'Este visitante já foi convertido em membro anteriormente.',
            ], 422);
        }

        $validated = $request->validate([
            'admission_date' => ['nullable', 'date'],
            'admission_type' => ['nullable', 'string', 'in:baptism,profession_of_faith,transfer,acclamation'],
            'baptism_date' => ['nullable', 'date'],
            'birth_date' => ['nullable', 'date'],
            'gender' => ['nullable', 'in:male,female,other'],
            'marital_status' => ['nullable', 'string'],
            'address' => ['nullable', 'string', 'max:255'],
        ]);

        $member = DB::transaction(function () use ($visitor, $validated) {
            $member = Member::create([
                'name' => $visitor->name,
                'email' => $visitor->email,
                'phone' => $visitor->phone,
                'congregation_id' => $visitor->congregation_id,
                'admission_date' => $validated['admission_date'] ?? now()->toDateString(),
                'admission_type' => $validated['admission_type'] ?? 'profession_of_faith',
                'baptism_date' => $validated['baptism_date'] ?? null,
                'birth_date' => $validated['birth_date'] ?? null,
                'gender' => $validated['gender'] ?? null,
                'marital_status' => $validated['marital_status'] ?? 'single',
                'address' => $validated['address'] ?? null,
                'membership_status' => 'active',
                'notes' => 'Convertido a partir de visitante. Observações originais: ' . ($visitor->notes ?? 'N/A'),
            ]);

            $visitor->update([
                'status' => 'converted',
                'converted_to_member_id' => $member->id,
                'converted_at' => now(),
            ]);

            AuditService::log('visitor.converted_to_member', $visitor, null, [
                'member_id' => $member->id,
                'converted_at' => now()->toIso8601String(),
            ]);

            return $member;
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Visitante convertido em membro com sucesso.',
            'data' => [
                'visitor' => $visitor->fresh(),
                'member' => $member,
            ],
        ]);
    }
}
