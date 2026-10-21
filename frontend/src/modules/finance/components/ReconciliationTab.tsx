/**
 * ReconciliationTab — Bank & Cash Reconciliation Control
 * ChurchManager Enterprise Multi-Tenant Platform
 */

import React, { useState, useMemo } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Landmark,
  Layers,
} from 'lucide-react';
import { formatCurrency, formatDate, formatDateTime } from '@/lib/utils';
import {
  TransactionCategoryBadge,
  PaymentMethodBadge,
} from './FinanceBadges';
import type { FinancialTransaction, FinancialAccount } from '../types';

interface ReconciliationTabProps {
  transactions: FinancialTransaction[];
  accounts: FinancialAccount[];
  onToggleReconcile: (id: string) => Promise<void>;
}

export const ReconciliationTab: React.FC<ReconciliationTabProps> = ({
  transactions,
  accounts,
  onToggleReconcile,
}) => {
  const [selectedAccountId, setSelectedAccountId] = useState<string>(accounts[0]?.id || '');

  const activeAccount = accounts.find((a) => a.id === selectedAccountId) || accounts[0];

  const accountTransactions = useMemo(() => {
    if (!activeAccount) return [];
    return transactions
      .filter((t) => t.accountId === activeAccount.id && t.status === 'paid')
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [transactions, activeAccount]);

  const reconciledCount = accountTransactions.filter((t) => t.isReconciled).length;
  const totalCount = accountTransactions.length;
  const rate = totalCount > 0 ? Math.round((reconciledCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Top Banner de Conciliação */}
      <Card className="border-indigo-500/20 bg-indigo-500/5">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                <h3 className="text-lg font-bold text-foreground">
                  Conciliação Bancária & Fechamento de Caixa
                </h3>
              </div>
              <p className="text-xs text-muted-foreground max-w-2xl">
                Valide cada lançamento financeiro comparando os extratos bancários oficiais ou comprovantes de
                envelopes da tesouraria para auditoria canônica.
              </p>
            </div>

            {/* Seletor de Conta */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="space-y-1">
                <span className="text-xs font-medium text-muted-foreground">Selecionar Conta:</span>
                <select
                  value={selectedAccountId}
                  onChange={(e) => setSelectedAccountId(e.target.value)}
                  aria-label="Selecionar conta para conciliação"
                  className="w-full sm:w-64 h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mini taxa */}
              <div className="p-2.5 rounded-lg bg-card border border-border text-center shrink-0 min-w-[120px]">
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                  Conciliado
                </span>
                <span className="text-xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
                  {rate}%
                </span>
                <span className="text-[10px] text-muted-foreground block">
                  {reconciledCount} de {totalCount} itens
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Extrato da Conta com Ações de Conciliação */}
      <Card>
        <CardHeader className="pb-3 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <Landmark className="h-4 w-4 text-primary" />
                Extrato Operacional: {activeAccount?.name}
              </CardTitle>
              <CardDescription className="text-xs">
                Saldo atual registrado em sistema: <strong>{formatCurrency(activeAccount?.currentBalance || 0)}</strong>
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-xs">
              <Layers className="h-3 w-3 mr-1" />
              {totalCount} lançamentos efetivados
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <th className="px-4 py-3">Data</th>
                  <th className="px-4 py-3">Descrição / Origem / Destino</th>
                  <th className="px-4 py-3">Forma / Doc.</th>
                  <th className="px-4 py-3 text-right">Valor</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3">Auditoria / Conferência</th>
                  <th className="px-4 py-3 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {accountTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                      Nenhuma transação efetivada nesta conta bancária.
                    </td>
                  </tr>
                ) : (
                  accountTransactions.map((tx) => {
                    const isIncome = tx.type === 'income';

                    return (
                      <tr
                        key={tx.id}
                        data-testid={`reconciliation-row-${tx.id}`}
                        className={`transition-colors ${
                          tx.isReconciled ? 'bg-card/40' : 'bg-amber-500/5 hover:bg-amber-500/10'
                        }`}
                      >
                        <td className="px-4 py-3 whitespace-nowrap text-xs font-medium text-foreground">
                          {formatDate(tx.date)}
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <TransactionCategoryBadge categoryType={tx.categoryType} />
                            <span className="font-medium text-foreground">{tx.description}</span>
                          </div>
                          <div className="text-xs text-muted-foreground mt-0.5">
                            {isIncome ? tx.contributorName : tx.supplierName}
                          </div>
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground">
                          <PaymentMethodBadge method={tx.paymentMethod} />
                          {tx.documentNumber && (
                            <span className="block font-mono text-[11px] text-foreground">
                              {tx.documentNumber}
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3 text-right font-mono font-bold whitespace-nowrap">
                          <span
                            className={
                              isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                            }
                          >
                            {isIncome ? '+' : '-'} {formatCurrency(tx.amount)}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-center whitespace-nowrap">
                          {tx.isReconciled ? (
                            <Badge
                              variant="outline"
                              className="bg-indigo-500/10 text-indigo-600 border-indigo-500/30 gap-1 text-[11px]"
                            >
                              <ShieldCheck className="h-3 w-3" />
                              Conciliado
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="bg-amber-500/10 text-amber-600 border-amber-500/30 gap-1 text-[11px]"
                            >
                              <Clock className="h-3 w-3" />
                              Pendente
                            </Badge>
                          )}
                        </td>

                        <td className="px-4 py-3 whitespace-nowrap text-xs text-muted-foreground">
                          {tx.isReconciled ? (
                            <div>
                              <span className="font-medium text-foreground block">
                                Por: {tx.reconciledBy || 'Tesoureiro'}
                              </span>
                              <span className="text-[10px] text-muted-foreground block">
                                {tx.reconciledAt ? formatDateTime(tx.reconciledAt) : 'Conferido'}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[11px] italic text-amber-600 dark:text-amber-400">
                              Aguardando conferência de extrato
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3 text-right whitespace-nowrap">
                          <Button
                            size="sm"
                            variant={tx.isReconciled ? 'outline' : 'default'}
                            onClick={() => onToggleReconcile(tx.id)}
                            className={`h-8 px-2.5 text-xs gap-1.5 ${
                              tx.isReconciled
                                ? 'text-muted-foreground hover:text-foreground'
                                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                            }`}
                          >
                            {tx.isReconciled ? (
                              <>
                                <ShieldAlert className="h-3.5 w-3.5" />
                                Desmarcar
                              </>
                            ) : (
                              <>
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Conciliar
                              </>
                            )}
                          </Button>
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
