<?php

namespace App\Http\Controllers\Api\v1\Financial;

use App\Http\Controllers\Controller;
use App\Http\Requests\Financial\StoreAccountRequest;
use App\Models\FinancialAccount;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FinancialAccountController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = FinancialAccount::query()->with('congregation:id,name');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        $accounts = $query->orderBy('name')->get();

        return response()->json([
            'status' => 'success',
            'data' => $accounts,
        ]);
    }

    public function store(StoreAccountRequest $request): JsonResponse
    {
        $validated = $request->validated();
        if (!isset($validated['current_balance']) && isset($validated['initial_balance'])) {
            $validated['current_balance'] = $validated['initial_balance'];
        }
        $account = FinancialAccount::create($validated);

        AuditService::log('financial_account.created', $account, null, $account->toArray());

        return response()->json([
            'status' => 'success',
            'message' => 'Conta financeira criada com sucesso.',
            'data' => $account->load('congregation:id,name'),
        ], 201);
    }

    public function show(FinancialAccount $financialAccount): JsonResponse
    {
        $financialAccount->load([
            'congregation:id,name',
            'transactions' => function ($q) {
                $q->with('category:id,name,color')->latest('transaction_date')->take(20);
            },
        ]);

        return response()->json([
            'status' => 'success',
            'data' => $financialAccount,
        ]);
    }

    public function update(StoreAccountRequest $request, FinancialAccount $financialAccount): JsonResponse
    {
        $oldData = $financialAccount->toArray();
        $financialAccount->update($request->validated());

        AuditService::log('financial_account.updated', $financialAccount, $oldData, $financialAccount->toArray());

        return response()->json([
            'status' => 'success',
            'message' => 'Conta financeira atualizada com sucesso.',
            'data' => $financialAccount->load('congregation:id,name'),
        ]);
    }

    public function destroy(FinancialAccount $financialAccount): JsonResponse
    {
        // Se houver transações ativas nesta conta, previne exclusão direta
        if ($financialAccount->transactions()->exists()) {
            return response()->json([
                'status' => 'error',
                'message' => 'Não é possível excluir uma conta que possui movimentações financeiras registradas.',
            ], 422);
        }

        AuditService::log('financial_account.deleted', $financialAccount, $financialAccount->toArray());
        $financialAccount->delete();

        return response()->json([
            'status' => 'success',
            'message' => 'Conta financeira removida com sucesso.',
        ]);
    }
}
