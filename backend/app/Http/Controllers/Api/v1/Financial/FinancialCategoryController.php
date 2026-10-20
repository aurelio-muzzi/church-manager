<?php

namespace App\Http\Controllers\Api\v1\Financial;

use App\Http\Controllers\Controller;
use App\Http\Requests\Financial\StoreCategoryRequest;
use App\Models\FinancialCategory;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FinancialCategoryController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = FinancialCategory::query()->with('children');

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Se quiser apenas categorias raiz
        if ($request->boolean('root_only')) {
            $query->whereNull('parent_id');
        }

        $categories = $query->orderBy('type')->orderBy('name')->get();

        return response()->json([
            'status' => 'success',
            'data' => $categories,
        ]);
    }

    public function store(StoreCategoryRequest $request): JsonResponse
    {
        $validated = $request->validated();
        $category = FinancialCategory::create($validated);

        AuditService::log('financial_category.created', $category, null, $category->toArray());

        return response()->json([
            'status' => 'success',
            'message' => 'Categoria financeira cadastrada com sucesso.',
            'data' => $category,
        ], 201);
    }

    public function show(FinancialCategory $financialCategory): JsonResponse
    {
        $financialCategory->load(['parent', 'children']);

        return response()->json([
            'status' => 'success',
            'data' => $financialCategory,
        ]);
    }

    public function update(StoreCategoryRequest $request, FinancialCategory $financialCategory): JsonResponse
    {
        $oldData = $financialCategory->toArray();
        $financialCategory->update($request->validated());

        AuditService::log('financial_category.updated', $financialCategory, $oldData, $financialCategory->toArray());

        return response()->json([
            'status' => 'success',
            'message' => 'Categoria financeira atualizada com sucesso.',
            'data' => $financialCategory,
        ]);
    }

    public function destroy(FinancialCategory $financialCategory): JsonResponse
    {
        if ($financialCategory->transactions()->exists()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Não é possível excluir uma categoria que possui lançamentos vinculados.',
            ], 422);
        }

        AuditService::log('financial_category.deleted', $financialCategory, $financialCategory->toArray());
        $financialCategory->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Categoria financeira removida com sucesso.',
        ]);
    }
}
