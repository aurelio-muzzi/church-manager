<?php

namespace App\Http\Controllers\Api\v1\Financial;

use App\Http\Controllers\Controller;
use App\Http\Requests\Financial\StoreBudgetRequest;
use App\Models\FinancialAccount;
use App\Models\FinancialBudget;
use App\Models\FinancialCategory;
use App\Models\FinancialTransaction;
use App\Models\Member;
use App\Services\AuditService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FinancialReportController extends Controller
{
    public function summary(Request $request): JsonResponse
    {
        $startDate = $request->input('start_date', Carbon::now()->startOfMonth()->toDateString());
        $endDate = $request->input('end_date', Carbon::now()->endOfMonth()->toDateString());

        // 1. Saldo Consolidado de todas as contas ativas
        $totalBalance = (float) FinancialAccount::where('status', 'active')->sum('current_balance');
        $accounts = FinancialAccount::where('status', 'active')->get(['id', 'name', 'type', 'current_balance']);

        // 2. Transações do Período
        $periodQuery = FinancialTransaction::where('financial_transactions.status', 'confirmed')
            ->whereBetween('financial_transactions.transaction_date', [$startDate, $endDate]);

        $totalIncome = (float) (clone $periodQuery)->where('financial_transactions.type', 'income')->sum('financial_transactions.amount');
        $totalExpense = (float) (clone $periodQuery)->where('financial_transactions.type', 'expense')->sum('financial_transactions.amount');
        $netResult = $totalIncome - $totalExpense;

        // 3. Pendentes de Conciliação
        $pendingReconciliationCount = FinancialTransaction::where('financial_transactions.status', 'confirmed')
            ->where('financial_transactions.reconciled', false)
            ->count();

        // 4. Receitas agrupadas por categoria
        $incomeByCategory = (clone $periodQuery)->where('financial_transactions.type', 'income')
            ->join('financial_categories', 'financial_transactions.category_id', '=', 'financial_categories.id')
            ->selectRaw('financial_categories.id, financial_categories.name, financial_categories.color, SUM(financial_transactions.amount) as total')
            ->groupBy('financial_categories.id', 'financial_categories.name', 'financial_categories.color')
            ->get();

        // 5. Despesas agrupadas por categoria
        $expenseByCategory = (clone $periodQuery)->where('financial_transactions.type', 'expense')
            ->join('financial_categories', 'financial_transactions.category_id', '=', 'financial_categories.id')
            ->selectRaw('financial_categories.id, financial_categories.name, financial_categories.color, SUM(financial_transactions.amount) as total')
            ->groupBy('financial_categories.id', 'financial_categories.name', 'financial_categories.color')
            ->get();

        return response()->json([
            'status' => 'success',
            'data' => [
                'period' => [
                    'start_date' => $startDate,
                    'end_date' => $endDate,
                ],
                'total_balance' => $totalBalance,
                'total_income' => $totalIncome,
                'total_expense' => $totalExpense,
                'net_result' => $netResult,
                'pending_reconciliation_count' => $pendingReconciliationCount,
                'accounts' => $accounts,
                'income_by_category' => $incomeByCategory,
                'expense_by_category' => $expenseByCategory,
            ],
        ]);
    }

    public function memberContributions(Request $request, Member $member): JsonResponse
    {
        $year = (int) $request->input('year', Carbon::now()->year);

        $contributions = FinancialTransaction::where('member_id', $member->id)
            ->where('type', 'income')
            ->where('status', 'confirmed')
            ->whereYear('transaction_date', $year)
            ->with(['category:id,name', 'account:id,name'])
            ->orderBy('transaction_date', 'asc')
            ->get();

        $totalContributed = (float) $contributions->sum('amount');

        return response()->json([
            'status' => 'success',
            'data' => [
                'member' => [
                    'id' => $member->id,
                    'name' => $member->name,
                    'email' => $member->email,
                    'phone' => $member->phone,
                ],
                'year' => $year,
                'total_contributed' => $totalContributed,
                'contributions' => $contributions,
            ],
        ]);
    }

    public function budgets(Request $request): JsonResponse
    {
        $year = (int) $request->input('year', Carbon::now()->year);

        $budgets = FinancialBudget::where('year', $year)
            ->with('category:id,name,type,color')
            ->get();

        // Para cada orçamento, calcula o quanto foi realizado no ano
        $results = $budgets->map(function ($b) use ($year) {
            $executed = (float) FinancialTransaction::where('category_id', $b->category_id)
                ->where('status', 'confirmed')
                ->whereYear('transaction_date', $year)
                ->sum('amount');

            $percentage = $b->planned_amount > 0
                ? round(($executed / $b->planned_amount) * 100, 1)
                : 0;

            return [
                'id' => $b->id,
                'category_id' => $b->category_id,
                'category_name' => $b->category?->name,
                'category_type' => $b->category?->type,
                'category_color' => $b->category?->color,
                'year' => $b->year,
                'planned_amount' => (float) $b->planned_amount,
                'executed_amount' => $executed,
                'execution_percentage' => $percentage,
                'notes' => $b->notes,
            ];
        });

        return response()->json([
            'status' => 'success',
            'data' => $results,
        ]);
    }

    public function storeBudget(StoreBudgetRequest $request): JsonResponse
    {
        $validated = $request->validated();

        $budget = FinancialBudget::updateOrCreate(
            [
                'category_id' => $validated['category_id'],
                'year' => $validated['year'],
                'month' => $validated['month'] ?? null,
            ],
            [
                'planned_amount' => $validated['planned_amount'],
                'notes' => $validated['notes'] ?? null,
            ]
        );

        AuditService::log('financial_budget.saved', $budget, null, $budget->toArray());

        return response()->json([
            'status' => 'success',
            'message' => 'Orçamento salvo com sucesso.',
            'data' => $budget->load('category:id,name,type'),
        ], 201);
    }
}
