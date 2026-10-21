/**
 * Finance API Service — Client-side REST Adapter with DevMock
 * ChurchManager Enterprise Multi-Tenant Platform
 */

import { http } from '@/services/http/client';
import {
  MOCK_FINANCIAL_ACCOUNTS,
  MOCK_FINANCIAL_CATEGORIES,
  MOCK_COST_CENTERS,
  MOCK_FINANCIAL_TRANSACTIONS,
  MOCK_BUDGETS,
} from '@/services/adapters/fixtures';
import type {
  FinancialAccount,
  FinancialCategory,
  CostCenter,
  FinancialTransaction,
  DepartmentBudget,
  FinancialSummaryMetrics,
  TransactionFilters,
} from '@/modules/finance/types';
import type {
  AccountFormData,
  TitheOfferingFormData,
  ExpenseFormData,
  QuickPayExpenseFormData,
  BudgetFormData,
} from '@/modules/finance/schemas';

const IS_MOCK = import.meta.env.VITE_USE_DEV_MOCK !== 'false';

// In-Memory Reactive Stores for Mock Mode
let accountsStore: FinancialAccount[] = JSON.parse(JSON.stringify(MOCK_FINANCIAL_ACCOUNTS));
let categoriesStore: FinancialCategory[] = JSON.parse(JSON.stringify(MOCK_FINANCIAL_CATEGORIES));
let costCentersStore: CostCenter[] = JSON.parse(JSON.stringify(MOCK_COST_CENTERS));
let transactionsStore: FinancialTransaction[] = JSON.parse(JSON.stringify(MOCK_FINANCIAL_TRANSACTIONS));
let budgetsStore: DepartmentBudget[] = JSON.parse(JSON.stringify(MOCK_BUDGETS));

export const financeService = {
  /**
   * Resets all in-memory mock stores to original fixtures (useful for test isolation)
   */
  resetMockStores() {
    accountsStore = JSON.parse(JSON.stringify(MOCK_FINANCIAL_ACCOUNTS));
    categoriesStore = JSON.parse(JSON.stringify(MOCK_FINANCIAL_CATEGORIES));
    costCentersStore = JSON.parse(JSON.stringify(MOCK_COST_CENTERS));
    transactionsStore = JSON.parse(JSON.stringify(MOCK_FINANCIAL_TRANSACTIONS));
    budgetsStore = JSON.parse(JSON.stringify(MOCK_BUDGETS));
  },

  // ==========================================
  // FINANCIAL ACCOUNTS
  // ==========================================

  async getAccounts(): Promise<FinancialAccount[]> {
    if (IS_MOCK) {
      return [...accountsStore];
    }
    return http.get<FinancialAccount[]>('/api/v1/tenant/finance/accounts');
  },

  async createAccount(data: AccountFormData): Promise<FinancialAccount> {
    if (IS_MOCK) {
      const newAccount: FinancialAccount = {
        id: `acc-${Date.now()}`,
        name: data.name,
        type: data.type,
        bankName: data.bankName,
        agency: data.agency,
        accountNumber: data.accountNumber,
        currentBalance: data.initialBalance,
        initialBalance: data.initialBalance,
        isActive: true,
        congregationId: data.congregationId || 'cong-01',
        notes: data.notes,
      };
      accountsStore.unshift(newAccount);
      return newAccount;
    }
    return http.post<FinancialAccount>('/api/v1/tenant/finance/accounts', data);
  },

  async updateAccount(id: string, data: Partial<AccountFormData>): Promise<FinancialAccount> {
    if (IS_MOCK) {
      const index = accountsStore.findIndex((acc) => acc.id === id);
      if (index === -1) throw new Error('Conta não encontrada');
      const updated = { ...accountsStore[index], ...data };
      accountsStore[index] = updated;
      return updated;
    }
    return http.put<FinancialAccount>(`/api/v1/tenant/finance/accounts/${id}`, data);
  },

  // ==========================================
  // CATEGORIES & COST CENTERS
  // ==========================================

  async getCategories(): Promise<FinancialCategory[]> {
    if (IS_MOCK) {
      return [...categoriesStore];
    }
    return http.get<FinancialCategory[]>('/api/v1/tenant/finance/categories');
  },

  async getCostCenters(): Promise<CostCenter[]> {
    if (IS_MOCK) {
      return [...costCentersStore];
    }
    return http.get<CostCenter[]>('/api/v1/tenant/finance/cost-centers');
  },

  // ==========================================
  // TRANSACTIONS (INCOME & EXPENSES)
  // ==========================================

  async getTransactions(filters?: TransactionFilters): Promise<FinancialTransaction[]> {
    if (IS_MOCK) {
      let filtered = [...transactionsStore];

      if (filters?.search) {
        const query = filters.search.toLowerCase();
        filtered = filtered.filter(
          (t) =>
            t.description.toLowerCase().includes(query) ||
            t.contributorName?.toLowerCase().includes(query) ||
            t.supplierName?.toLowerCase().includes(query) ||
            t.documentNumber?.toLowerCase().includes(query) ||
            t.receiptNumber?.toLowerCase().includes(query)
        );
      }

      if (filters?.type && filters.type !== 'all') {
        filtered = filtered.filter((t) => t.type === filters.type);
      }

      if (filters?.categoryType && filters.categoryType !== 'all') {
        filtered = filtered.filter((t) => t.categoryType === filters.categoryType);
      }

      if (filters?.status && filters.status !== 'all') {
        filtered = filtered.filter((t) => t.status === filters.status);
      }

      if (filters?.accountId) {
        filtered = filtered.filter((t) => t.accountId === filters.accountId);
      }

      if (filters?.categoryId) {
        filtered = filtered.filter((t) => t.categoryId === filters.categoryId);
      }

      if (filters?.costCenterId) {
        filtered = filtered.filter((t) => t.costCenterId === filters.costCenterId);
      }

      if (filters?.startDate) {
        filtered = filtered.filter((t) => t.date >= filters.startDate!);
      }

      if (filters?.endDate) {
        filtered = filtered.filter((t) => t.date <= filters.endDate!);
      }

      if (filters?.isReconciled && filters.isReconciled !== 'all') {
        const wantsReconciled = filters.isReconciled === 'reconciled';
        filtered = filtered.filter((t) => t.isReconciled === wantsReconciled);
      }

      // Sort by date descending
      return filtered.sort((a, b) => b.date.localeCompare(a.date));
    }

    return http.get<FinancialTransaction[]>('/api/v1/tenant/finance/transactions', {
      params: filters,
    });
  },

  async createTitheOffering(data: TitheOfferingFormData): Promise<FinancialTransaction> {
    if (IS_MOCK) {
      const receiptNum = `REC-2026-${String(transactionsStore.length + 101).padStart(5, '0')}`;
      const newTx: FinancialTransaction = {
        id: `tx-${Date.now()}`,
        type: 'income',
        categoryType: data.categoryType,
        amount: data.amount,
        description:
          data.categoryType === 'tithe'
            ? `Dízimo de ${data.isAnonymous ? 'Anônimo' : data.contributorName || 'Membro'}`
            : `Oferta (${data.offeringType})`,
        date: data.date,
        competency: data.competency,
        status: 'paid', // arrecadações entram como efetivadas
        paymentMethod: data.paymentMethod,
        accountId: data.accountId,
        categoryId: data.categoryId,
        congregationId: data.congregationId,
        memberId: data.isAnonymous ? undefined : data.memberId,
        contributorName: data.isAnonymous ? 'Anônimo' : data.contributorName,
        isAnonymous: data.isAnonymous,
        offeringType: data.offeringType,
        eventId: data.eventId,
        documentNumber: data.documentNumber,
        receiptNumber: receiptNum,
        isReconciled: false,
        notes: data.notes,
      };

      // Atualiza saldo da conta destino
      const account = accountsStore.find((a) => a.id === data.accountId);
      if (account) {
        account.currentBalance += data.amount;
      }

      transactionsStore.unshift(newTx);
      return newTx;
    }

    return http.post<FinancialTransaction>(
      '/api/v1/tenant/finance/tithes-offerings',
      data
    );
  },

  async createExpense(data: ExpenseFormData): Promise<FinancialTransaction> {
    if (IS_MOCK) {
      const isPaid = data.status === 'paid';
      const newTx: FinancialTransaction = {
        id: `tx-${Date.now()}`,
        type: 'expense',
        categoryType: 'expense',
        amount: data.amount,
        description: data.description,
        date: data.dueDate,
        competency: data.dueDate.substring(0, 7),
        status: data.status,
        paymentMethod: data.paymentMethod,
        accountId: data.accountId,
        categoryId: data.categoryId,
        costCenterId: data.costCenterId,
        congregationId: data.congregationId,
        supplierName: data.supplierName,
        dueDate: data.dueDate,
        paidDate: isPaid ? data.paidDate || data.dueDate : undefined,
        documentNumber: data.documentNumber,
        isReconciled: false,
        notes: data.notes,
      };

      // Se criada já como paga, debita saldo e incrementa gasto no orçamento
      if (isPaid) {
        const account = accountsStore.find((a) => a.id === data.accountId);
        if (account) {
          account.currentBalance -= data.amount;
        }
        if (data.costCenterId) {
          const budget = budgetsStore.find((b) => b.costCenterId === data.costCenterId);
          if (budget) {
            budget.spentAmount += data.amount;
          }
        }
      }

      transactionsStore.unshift(newTx);
      return newTx;
    }

    return http.post<FinancialTransaction>('/api/v1/tenant/finance/expenses', data);
  },

  async payExpense(id: string, data: QuickPayExpenseFormData): Promise<FinancialTransaction> {
    if (IS_MOCK) {
      const tx = transactionsStore.find((t) => t.id === id);
      if (!tx) throw new Error('Despesa não encontrada');

      tx.status = 'paid';
      tx.paidDate = data.paidDate;
      tx.accountId = data.accountId;
      tx.paymentMethod = data.paymentMethod;

      // Debita na conta selecionada
      const account = accountsStore.find((a) => a.id === data.accountId);
      if (account) {
        account.currentBalance -= tx.amount;
      }

      // Atualiza gasto no orçamento do centro de custo correspondente
      if (tx.costCenterId) {
        const budget = budgetsStore.find((b) => b.costCenterId === tx.costCenterId);
        if (budget) {
          budget.spentAmount += tx.amount;
        }
      }

      return tx;
    }

    return http.post<FinancialTransaction>(
      `/api/v1/tenant/finance/expenses/${id}/pay`,
      data
    );
  },

  async toggleReconciliation(id: string, operatorName = 'Tesouraria'): Promise<FinancialTransaction> {
    if (IS_MOCK) {
      const tx = transactionsStore.find((t) => t.id === id);
      if (!tx) throw new Error('Transação não encontrada');

      tx.isReconciled = !tx.isReconciled;
      if (tx.isReconciled) {
        tx.reconciledAt = new Date().toISOString();
        tx.reconciledBy = operatorName;
      } else {
        tx.reconciledAt = undefined;
        tx.reconciledBy = undefined;
      }

      return tx;
    }

    return http.patch<FinancialTransaction>(
      `/api/v1/tenant/finance/transactions/${id}/reconcile`
    );
  },

  async deleteTransaction(id: string): Promise<boolean> {
    if (IS_MOCK) {
      const index = transactionsStore.findIndex((t) => t.id === id);
      if (index === -1) return false;
      const tx = transactionsStore[index];

      // Reverte efeito em conta se paga
      if (tx.status === 'paid') {
        const account = accountsStore.find((a) => a.id === tx.accountId);
        if (account) {
          if (tx.type === 'income') {
            account.currentBalance -= tx.amount;
          } else {
            account.currentBalance += tx.amount;
          }
        }
      }

      transactionsStore.splice(index, 1);
      return true;
    }

    await http.delete(`/api/v1/tenant/finance/transactions/${id}`);
    return true;
  },

  // ==========================================
  // BUDGETS (ORÇAMENTOS POR CENTRO DE CUSTO)
  // ==========================================

  async getBudgets(year = 2026): Promise<DepartmentBudget[]> {
    if (IS_MOCK) {
      return budgetsStore.filter((b) => b.year === year);
    }
    return http.get<DepartmentBudget[]>('/api/v1/tenant/finance/budgets', {
      params: { year },
    });
  },

  async createBudget(data: BudgetFormData): Promise<DepartmentBudget> {
    if (IS_MOCK) {
      const costCenter = costCentersStore.find((cc) => cc.id === data.costCenterId);
      const newBudget: DepartmentBudget = {
        id: `bdg-${Date.now()}`,
        costCenterId: data.costCenterId,
        costCenterName: costCenter?.name || 'Centro de Custo',
        year: data.year,
        plannedAmount: data.plannedAmount,
        spentAmount: 0,
        alertThresholdPercent: data.alertThresholdPercent,
      };
      budgetsStore.push(newBudget);
      return newBudget;
    }
    return http.post<DepartmentBudget>('/api/v1/tenant/finance/budgets', data);
  },

  // ==========================================
  // METRICS & DASHBOARD
  // ==========================================

  async getSummaryMetrics(): Promise<FinancialSummaryMetrics> {
    if (IS_MOCK) {
      const consolidatedBalance = accountsStore
        .filter((a) => a.isActive)
        .reduce((sum, acc) => sum + acc.currentBalance, 0);

      // Considera transações de 2026-10 para o mês ativo
      const currentMonth = '2026-10';
      const monthTransactions = transactionsStore.filter((t) => t.competency === currentMonth);

      const monthlyIncome = monthTransactions
        .filter((t) => t.type === 'income' && t.status === 'paid')
        .reduce((sum, t) => sum + t.amount, 0);

      const monthlyExpenses = monthTransactions
        .filter((t) => t.type === 'expense' && t.status === 'paid')
        .reduce((sum, t) => sum + t.amount, 0);

      const tithesTotal = monthTransactions
        .filter((t) => t.categoryType === 'tithe' && t.status === 'paid')
        .reduce((sum, t) => sum + t.amount, 0);

      const offeringsTotal = monthTransactions
        .filter((t) => t.categoryType === 'offering' && t.status === 'paid')
        .reduce((sum, t) => sum + t.amount, 0);

      const pendingPayables = transactionsStore
        .filter((t) => t.type === 'expense' && t.status === 'pending')
        .reduce((sum, t) => sum + t.amount, 0);

      const totalTx = transactionsStore.length;
      const reconciledCount = transactionsStore.filter((t) => t.isReconciled).length;
      const reconciliationRate = totalTx > 0 ? Math.round((reconciledCount / totalTx) * 100) : 0;

      return {
        consolidatedBalance,
        monthlyIncome,
        monthlyExpenses,
        monthlyNetBalance: monthlyIncome - monthlyExpenses,
        pendingPayables,
        tithesTotal,
        offeringsTotal,
        reconciliationRate,
      };
    }

    return http.get<FinancialSummaryMetrics>('/api/v1/tenant/finance/summary');
  },
};
