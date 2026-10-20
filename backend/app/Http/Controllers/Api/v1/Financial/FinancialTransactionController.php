<?php

namespace App\Http\Controllers\Api\v1\Financial;

use App\Http\Controllers\Controller;
use App\Http\Requests\Financial\StoreTransactionRequest;
use App\Models\FinancialAccount;
use App\Models\FinancialTransaction;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class FinancialTransactionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = FinancialTransaction::query()->with([
            'account:id,name,type',
            'category:id,name,type,color',
            'member:id,name,email',
            'congregation:id,name',
            'reconciledBy:id,name',
        ]);

        if ($request->filled('type')) {
            $query->where('type', $request->type);
        }

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('account_id')) {
            $query->where('account_id', $request->account_id);
        }

        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        if ($request->filled('member_id')) {
            $query->where('member_id', $request->member_id);
        }

        if ($request->filled('reconciled')) {
            $query->where('reconciled', $request->boolean('reconciled'));
        }

        if ($request->filled('start_date') && $request->filled('end_date')) {
            $query->whereBetween('transaction_date', [$request->start_date, $request->end_date]);
        } elseif ($request->filled('start_date')) {
            $query->whereDate('transaction_date', '>=', $request->start_date);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('description', 'like', "%{$search}%")
                  ->orWhere('document_number', 'like', "%{$search}%");
            });
        }

        $transactions = $query->orderBy('transaction_date', 'desc')
            ->orderBy('id', 'desc')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => $transactions,
        ]);
    }

    public function store(StoreTransactionRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $transaction = DB::transaction(function () use ($validated) {
            $account = FinancialAccount::lockForUpdate()->findOrFail($validated['account_id']);

            $transaction = FinancialTransaction::create($validated);

            // Atualiza saldo da conta atipicamente se confirmada
            if ($transaction->status === 'confirmed') {
                if ($transaction->type === 'income') {
                    $account->deposit((float) $transaction->amount);
                } elseif ($transaction->type === 'expense') {
                    $account->withdraw((float) $transaction->amount);
                }
            }

            AuditService::log('financial_transaction.created', $transaction, null, $transaction->toArray());

            return $transaction;
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Lançamento financeiro realizado com sucesso.',
            'data' => $transaction->load(['account', 'category', 'member:id,name']),
        ], 201);
    }

    public function show(FinancialTransaction $financialTransaction): JsonResponse
    {
        $financialTransaction->load([
            'account',
            'category',
            'member:id,name,email,phone',
            'congregation:id,name',
            'reconciledBy:id,name',
        ]);

        return response()->json([
            'status' => 'success',
            'data' => $financialTransaction,
        ]);
    }

    public function update(StoreTransactionRequest $request, FinancialTransaction $financialTransaction): JsonResponse
    {
        if ($financialTransaction->reconciled) {
            return response()->json([
                'status' => 'error',
                'message' => 'Lançamentos já conciliados não podem ser editados. Efetue um estorno.',
            ], 422);
        }

        $validated = $request->validated();

        DB::transaction(function () use ($financialTransaction, $validated) {
            // Reverte o saldo anterior
            $oldAccount = FinancialAccount::lockForUpdate()->findOrFail($financialTransaction->account_id);
            if ($financialTransaction->status === 'confirmed') {
                if ($financialTransaction->type === 'income') {
                    $oldAccount->withdraw((float) $financialTransaction->amount);
                } elseif ($financialTransaction->type === 'expense') {
                    $oldAccount->deposit((float) $financialTransaction->amount);
                }
            }

            // Atualiza transação
            $oldData = $financialTransaction->toArray();
            $financialTransaction->update($validated);

            // Aplica novo saldo
            $newAccount = FinancialAccount::lockForUpdate()->findOrFail($financialTransaction->account_id);
            if ($financialTransaction->status === 'confirmed') {
                if ($financialTransaction->type === 'income') {
                    $newAccount->deposit((float) $financialTransaction->amount);
                } elseif ($financialTransaction->type === 'expense') {
                    $newAccount->withdraw((float) $financialTransaction->amount);
                }
            }

            AuditService::log('financial_transaction.updated', $financialTransaction, $oldData, $financialTransaction->toArray());
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Lançamento financeiro atualizado com sucesso.',
            'data' => $financialTransaction->fresh(['account', 'category', 'member:id,name']),
        ]);
    }

    public function destroy(FinancialTransaction $financialTransaction): JsonResponse
    {
        if ($financialTransaction->reconciled) {
            return response()->json([
                'status' => 'error',
                'message' => 'Lançamentos já conciliados pela tesouraria não podem ser excluídos.',
            ], 422);
        }

        DB::transaction(function () use ($financialTransaction) {
            $account = FinancialAccount::lockForUpdate()->findOrFail($financialTransaction->account_id);

            // Reverte o saldo caso estava confirmado
            if ($financialTransaction->status === 'confirmed') {
                if ($financialTransaction->type === 'income') {
                    $account->withdraw((float) $financialTransaction->amount);
                } elseif ($financialTransaction->type === 'expense') {
                    $account->deposit((float) $financialTransaction->amount);
                }
            }

            AuditService::log('financial_transaction.deleted', $financialTransaction, $financialTransaction->toArray());
            $financialTransaction->delete();
        });

        return response()->json([
            'status' => 'success',
            'message' => 'Lançamento financeiro excluído com sucesso e saldo estornado.',
        ]);
    }

    public function reconcile(FinancialTransaction $financialTransaction): JsonResponse
    {
        if ($financialTransaction->reconciled) {
            return response()->json([
                'status' => 'already_reconciled',
                'message' => 'Este lançamento já foi conciliado anteriormente.',
                'data' => $financialTransaction,
            ], 200);
        }

        $financialTransaction->reconcile(auth()->id() ?? 1);

        AuditService::log('financial_transaction.reconciled', $financialTransaction, null, [
            'reconciled_at' => $financialTransaction->reconciled_at,
            'reconciled_by' => auth()->id(),
        ]);

        return response()->json([
            'status' => 'success',
            'message' => 'Lançamento conciliado com sucesso pela tesouraria.',
            'data' => $financialTransaction->fresh(['reconciledBy:id,name']),
        ]);
    }
}
