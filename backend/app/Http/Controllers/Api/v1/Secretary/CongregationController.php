<?php

namespace App\Http\Controllers\Api\v1\Secretary;

use App\Http\Controllers\Controller;
use App\Http\Requests\Secretary\StoreCongregationRequest;
use App\Models\Congregation;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class CongregationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Congregation::query()->withCount(['members' => function ($q) {
            $q->where('membership_status', 'active');
        }]);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('city', 'like', "%{$search}%")
                  ->orWhere('neighborhood', 'like', "%{$search}%");
            });
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $congregations = $query->orderBy('is_main', 'desc')->orderBy('name')->get();

        return response()->json([
            'status' => 'success',
            'data' => $congregations,
        ]);
    }

    public function store(StoreCongregationRequest $request): JsonResponse
    {
        $data = $request->validated();
        if (empty($data['slug'])) {
            $data['slug'] = Str::slug($data['name']);
        }

        $congregation = Congregation::create($data);

        AuditService::log('congregation.created', $congregation, null, $congregation->toArray());

        return response()->json([
            'status' => 'success',
            'message' => 'Congregação cadastrada com sucesso.',
            'data' => $congregation,
        ], 201);
    }

    public function show(Congregation $congregation): JsonResponse
    {
        $congregation->loadCount(['members' => function ($q) {
            $q->where('membership_status', 'active');
        }]);

        return response()->json([
            'status' => 'success',
            'data' => $congregation,
        ]);
    }

    public function update(StoreCongregationRequest $request, Congregation $congregation): JsonResponse
    {
        $oldData = $congregation->toArray();
        $congregation->update($request->validated());

        AuditService::log('congregation.updated', $congregation, $oldData, $congregation->toArray());

        return response()->json([
            'status' => 'success',
            'message' => 'Congregação atualizada com sucesso.',
            'data' => $congregation,
        ]);
    }

    public function destroy(Congregation $congregation): JsonResponse
    {
        AuditService::log('congregation.deleted', $congregation, $congregation->toArray());
        $congregation->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Congregação removida com sucesso.',
        ]);
    }
}
