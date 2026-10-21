/**
 * ExpensesTab — Specialized View for Accounts Payable & Church Expenses
 * ChurchManager Enterprise Multi-Tenant Platform
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  TrendingDown,
  Search,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  TransactionStatusBadge,
  PaymentMethodBadge,
  ReconciliationBadge,
} from './FinanceBadges';
import type {
  FinancialTransaction,
  FinancialAccount,
  FinancialCategory,
  CostCenter,
} from '../types';

interface ExpensesTabProps {
  transactions: FinancialTransaction[];
  accounts: FinancialAccount[];
  categories: FinancialCategory[];
  costCenters: CostCenter[];
  onOpenNewExpense: () => void;
  onQuickPayExpense: (transaction: FinancialTransaction) => void;
}

export const ExpensesTab: React.FC<ExpensesTabProps> = ({
  transactions,
  accounts,
  categories,
  costCenters,
  onOpenNewExpense,
  onQuickPayExpense,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'paid'>('all');

  const expenseList = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'expense')
      .filter((t) => {
        if (statusFilter !== 'all' && t.status !== statusFilter) {
          return false;
        }
        if (searchTerm) {
          const q = searchTerm.toLowerCase();
          const matchesDesc = t.description.toLowerCase().includes(q);
          const matchesSupplier = t.supplierName?.toLowerCase().includes(q);
          const matchesDoc = t.documentNumber?.toLowerCase().includes(q);
          if (!matchesDesc && !matchesSupplier && !matchesDoc) return false;
        }
        return true;
      });
  }, [transactions, statusFilter, searchTerm]);

  // Métricas
  const totalPaid = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'expense' && t.status === 'paid')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const totalPending = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'expense' && t.status === 'pending')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const pendingCount = useMemo(() => {
    return transactions.filter((t) => t.type === 'expense' && t.status === 'pending').length;
  }, [transactions]);

  const getAccountName = (accId: string) => {
    return accounts.find((a) => a.id === accId)?.name || 'Conta Geral';
  };

  const getCategoryName = (catId: string) => {
    return categories.find((c) => c.id === catId)?.name || 'Geral';
  };

  const getCostCenterName = (ccId?: string) => {
    if (!ccId) return null;
    return costCenters.find((c) => c.id === ccId)?.name || null;
  };

  return (
    <div className="space-y-6">
      {/* 3 Mini Cards de Contas a Pagar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-rose-500/30 bg-rose-500/5">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total de Despesas Pagas</p>
              <h3 className="text-xl font-bold text-rose-600 dark:text-rose-400 mt-1">
                {formatCurrency(totalPaid)}
              </h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-rose-500/20 text-rose-600 flex items-center justify-center">
              <TrendingDown className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Contas a Pagar Pendentes</p>
              <h3 className="text-xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                {formatCurrency(totalPending)}
              </h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Obrigações em Aberto</p>
              <h3 className="text-xl font-bold text-foreground mt-1">
                {pendingCount} contas
              </h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-muted text-muted-foreground flex items-center justify-center">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ações e Filtros */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por descrição, fornecedor, nota..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9"
            />
          </div>

          <div className="flex items-center gap-1 border border-border rounded-lg p-0.5 bg-muted/30">
            <Button
              size="sm"
              variant={statusFilter === 'all' ? 'secondary' : 'ghost'}
              onClick={() => setStatusFilter('all')}
              className="h-8 text-xs"
            >
              Todas ({transactions.filter((t) => t.type === 'expense').length})
            </Button>
            <Button
              size="sm"
              variant={statusFilter === 'pending' ? 'secondary' : 'ghost'}
              onClick={() => setStatusFilter('pending')}
              className="h-8 text-xs gap-1"
            >
              <Clock className="h-3 w-3" />
              Pendentes
            </Button>
            <Button
              size="sm"
              variant={statusFilter === 'paid' ? 'secondary' : 'ghost'}
              onClick={() => setStatusFilter('paid')}
              className="h-8 text-xs gap-1"
            >
              <CheckCircle2 className="h-3 w-3" />
              Pagas
            </Button>
          </div>
        </div>

        <Button
          size="sm"
          onClick={onOpenNewExpense}
          className="gap-1.5 bg-rose-600 hover:bg-rose-700 text-white"
        >
          <Plus className="h-4 w-4" />
          Nova Despesa / Conta
        </Button>
      </div>

      {/* Tabela de Despesas */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <th className="px-4 py-3">Vencimento</th>
                  <th className="px-4 py-3">Descrição / Fornecedor</th>
                  <th className="px-4 py-3">Categoria & Centro de Custo</th>
                  <th className="px-4 py-3">Conta Debitada</th>
                  <th className="px-4 py-3 text-right">Valor</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {expenseList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                      Nenhuma despesa encontrada com os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  expenseList.map((tx) => {
                    const costCenter = getCostCenterName(tx.costCenterId);

                    return (
                      <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="font-medium text-foreground block">
                            {formatDate(tx.dueDate || tx.date)}
                          </span>
                          {tx.paidDate && (
                            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 block font-medium">
                              Pago em: {formatDate(tx.paidDate)}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className="font-medium text-foreground block">{tx.description}</span>
                          <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5">
                            <span>Fornecedor: <strong className="text-foreground">{tx.supplierName}</strong></span>
                            {tx.documentNumber && <span>Doc: {tx.documentNumber}</span>}
                            <PaymentMethodBadge method={tx.paymentMethod} />
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-xs font-medium text-foreground block">
                            {getCategoryName(tx.categoryId)}
                          </span>
                          {costCenter && (
                            <span className="text-[11px] text-primary block">
                              CC: {costCenter}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground">
                          {getAccountName(tx.accountId)}
                        </td>
                        <td className="px-4 py-3 text-right font-bold font-mono text-rose-600 dark:text-rose-400 whitespace-nowrap">
                          - {formatCurrency(tx.amount)}
                        </td>
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          <TransactionStatusBadge status={tx.status} />
                        </td>
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          {tx.status === 'pending' ? (
                            <Button
                              size="sm"
                              onClick={() => onQuickPayExpense(tx)}
                              className="h-8 px-2.5 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700 text-white"
                            >
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Liquidar
                            </Button>
                          ) : (
                            <ReconciliationBadge isReconciled={tx.isReconciled} />
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
