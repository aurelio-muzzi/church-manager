/**
 * TransactionsTab — Complete Financial Ledger & Bookkeeping
 * ChurchManager Enterprise Multi-Tenant Platform
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Search,
  Plus,
  TrendingUp,
  TrendingDown,
  Printer,
  CheckCircle2,
  Trash2,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  TransactionStatusBadge,
  TransactionCategoryBadge,
  ReconciliationBadge,
  PaymentMethodBadge,
} from './FinanceBadges';
import type {
  FinancialTransaction,
  FinancialAccount,
  FinancialCategory,
  CostCenter,
} from '../types';

interface TransactionsTabProps {
  transactions: FinancialTransaction[];
  accounts: FinancialAccount[];
  categories: FinancialCategory[];
  costCenters: CostCenter[];
  onOpenNewTithe: () => void;
  onOpenNewExpense: () => void;
  onViewReceipt: (transaction: FinancialTransaction) => void;
  onQuickPayExpense: (transaction: FinancialTransaction) => void;
  onToggleReconcile: (id: string) => Promise<void>;
  onDeleteTransaction: (id: string) => Promise<void>;
}

export const TransactionsTab: React.FC<TransactionsTabProps> = ({
  transactions,
  accounts,
  categories,
  costCenters,
  onOpenNewTithe,
  onOpenNewExpense,
  onViewReceipt,
  onQuickPayExpense,
  onToggleReconcile,
  onDeleteTransaction,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [accountFilter, setAccountFilter] = useState<string>('all');
  const [reconcileFilter, setReconcileFilter] = useState<'all' | 'reconciled' | 'pending'>('all');

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Search filter
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matchesDesc = tx.description.toLowerCase().includes(query);
        const matchesContributor = tx.contributorName?.toLowerCase().includes(query);
        const matchesSupplier = tx.supplierName?.toLowerCase().includes(query);
        const matchesDoc = tx.documentNumber?.toLowerCase().includes(query);
        const matchesReceipt = tx.receiptNumber?.toLowerCase().includes(query);
        if (!matchesDesc && !matchesContributor && !matchesSupplier && !matchesDoc && !matchesReceipt) {
          return false;
        }
      }

      // Type filter
      if (typeFilter !== 'all' && tx.type !== typeFilter) {
        return false;
      }

      // Account filter
      if (accountFilter !== 'all' && tx.accountId !== accountFilter) {
        return false;
      }

      // Reconcile filter
      if (reconcileFilter === 'reconciled' && !tx.isReconciled) {
        return false;
      }
      if (reconcileFilter === 'pending' && tx.isReconciled) {
        return false;
      }

      return true;
    });
  }, [transactions, searchTerm, typeFilter, accountFilter, reconcileFilter]);

  const getAccountName = (accId: string) => {
    const acc = accounts.find((a) => a.id === accId);
    return acc ? acc.name : 'Conta Geral';
  };

  const getCategoryName = (catId: string) => {
    const cat = categories.find((c) => c.id === catId);
    return cat ? cat.name : 'Geral';
  };

  const getCostCenterName = (ccId?: string) => {
    if (!ccId) return null;
    const cc = costCenters.find((c) => c.id === ccId);
    return cc ? cc.name : null;
  };

  return (
    <div className="space-y-4">
      {/* Barra de Ações e Filtros */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2 flex-1">
          {/* Busca textual */}
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por descrição, membro, fornecedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9"
            />
          </div>

          {/* Filtro de Tipo */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as 'all' | 'income' | 'expense')}
            aria-label="Filtrar por tipo de lançamento"
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="all">Todos os Lançamentos</option>
            <option value="income">Apenas Receitas (+)</option>
            <option value="expense">Apenas Despesas (-)</option>
          </select>

          {/* Filtro de Conta */}
          <select
            value={accountFilter}
            onChange={(e) => setAccountFilter(e.target.value)}
            aria-label="Filtrar por conta bancária"
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="all">Todas as Contas</option>
            {accounts.map((acc) => (
              <option key={acc.id} value={acc.id}>
                {acc.name}
              </option>
            ))}
          </select>

          {/* Filtro de Conciliação */}
          <select
            value={reconcileFilter}
            onChange={(e) => setReconcileFilter(e.target.value as 'all' | 'reconciled' | 'pending')}
            aria-label="Filtrar por conciliação bancária"
            className="h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="all">Todas Situações</option>
            <option value="reconciled">Conciliados</option>
            <option value="pending">Pendentes de Conciliação</option>
          </select>
        </div>

        {/* Botões de Novo Lançamento */}
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={onOpenNewTithe}
            className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Plus className="h-4 w-4" />
            <TrendingUp className="h-3.5 w-3.5" />
            Dízimo / Oferta
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={onOpenNewExpense}
            className="gap-1.5 text-rose-600 border-rose-200 dark:border-rose-900/40 hover:bg-rose-500/10"
          >
            <Plus className="h-4 w-4" />
            <TrendingDown className="h-3.5 w-3.5" />
            Nova Despesa
          </Button>
        </div>
      </div>

      {/* Tabela de Lançamentos */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Descrição / Origem / Destino</th>
                  <th className="px-4 py-3">Categoria & Conta</th>
                  <th className="px-4 py-3 text-right">Valor</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-center">Conciliação</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                      Nenhum lançamento financeiro encontrado com os filtros atuais.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx) => {
                    const isIncome = tx.type === 'income';
                    const costCenter = getCostCenterName(tx.costCenterId);

                    return (
                      <tr
                        key={tx.id}
                        data-testid={`transaction-row-${tx.id}`}
                        className="hover:bg-muted/30 transition-colors"
                      >
                        {/* Data */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="font-medium text-foreground block">
                            {formatDate(tx.date)}
                          </span>
                          <span className="text-[11px] text-muted-foreground block">
                            Comp.: {tx.competency}
                          </span>
                        </td>

                        {/* Descrição & Detalhes */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <TransactionCategoryBadge categoryType={tx.categoryType} />
                            <span className="font-medium text-foreground">{tx.description}</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5 flex flex-wrap items-center gap-2">
                            {isIncome && tx.contributorName && (
                              <span>
                                Contribuinte: <strong className="text-foreground font-medium">{tx.contributorName}</strong>
                              </span>
                            )}
                            {!isIncome && tx.supplierName && (
                              <span>
                                Fornecedor: <strong className="text-foreground font-medium">{tx.supplierName}</strong>
                              </span>
                            )}
                            {tx.documentNumber && (
                              <span className="font-mono text-[11px]">Doc: {tx.documentNumber}</span>
                            )}
                            <PaymentMethodBadge method={tx.paymentMethod} />
                          </div>
                        </td>

                        {/* Categoria & Conta */}
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className="text-xs font-medium text-foreground block">
                            {getCategoryName(tx.categoryId)}
                          </span>
                          <span className="text-[11px] text-muted-foreground block">
                            {getAccountName(tx.accountId)}
                          </span>
                          {costCenter && (
                            <span className="text-[10px] text-primary block font-medium">
                              CC: {costCenter}
                            </span>
                          )}
                        </td>

                        {/* Valor */}
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <span
                            className={`font-bold font-mono text-sm ${
                              isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                            }`}
                          >
                            {isIncome ? '+' : '-'} {formatCurrency(tx.amount)}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          <TransactionStatusBadge status={tx.status} />
                        </td>

                        {/* Conciliação */}
                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          <ReconciliationBadge isReconciled={tx.isReconciled} />
                        </td>

                        {/* Ações */}
                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            {/* Ver Recibo para Dízimos/Ofertas */}
                            {isIncome && (
                              <Button
                                size="sm"
                                variant="ghost"
                                title="Ver Recibo Eclesiástico"
                                onClick={() => onViewReceipt(tx)}
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground"
                              >
                                <Printer className="h-4 w-4" />
                              </Button>
                            )}

                            {/* Pagar despesa pendente */}
                            {!isIncome && tx.status === 'pending' && (
                              <Button
                                size="sm"
                                variant="outline"
                                title="Liquidar / Dar Baixa"
                                onClick={() => onQuickPayExpense(tx)}
                                className="h-8 px-2 text-xs gap-1 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10"
                              >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Pagar
                              </Button>
                            )}

                            {/* Toggle Conciliação */}
                            <Button
                              size="sm"
                              variant="ghost"
                              title={tx.isReconciled ? 'Desmarcar Conciliação' : 'Marcar como Conciliado'}
                              onClick={() => onToggleReconcile(tx.id)}
                              className={`h-8 w-8 p-0 ${
                                tx.isReconciled ? 'text-indigo-600 hover:text-indigo-700' : 'text-muted-foreground hover:text-foreground'
                              }`}
                            >
                              {tx.isReconciled ? (
                                <ShieldCheck className="h-4 w-4" />
                              ) : (
                                <ShieldAlert className="h-4 w-4" />
                              )}
                            </Button>

                            {/* Excluir Lançamento */}
                            <Button
                              size="sm"
                              variant="ghost"
                              title="Excluir Lançamento"
                              onClick={() => onDeleteTransaction(tx.id)}
                              className="h-8 w-8 p-0 text-destructive/70 hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
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
