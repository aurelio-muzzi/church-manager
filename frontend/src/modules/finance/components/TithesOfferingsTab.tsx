/**
 * TithesOfferingsTab — Specialized View for Tithes & Church Offerings
 * ChurchManager Enterprise Multi-Tenant Platform
 */

import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Heart,
  TrendingUp,
  Search,
  Plus,
  Printer,
  Calendar,
  Users,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  TransactionCategoryBadge,
  PaymentMethodBadge,
  ReconciliationBadge,
} from './FinanceBadges';
import type { FinancialTransaction, FinancialAccount } from '../types';

interface TithesOfferingsTabProps {
  transactions: FinancialTransaction[];
  accounts: FinancialAccount[];
  onOpenNewTithe: () => void;
  onOpenNewOffering: () => void;
  onViewReceipt: (transaction: FinancialTransaction) => void;
}

export const TithesOfferingsTab: React.FC<TithesOfferingsTabProps> = ({
  transactions,
  accounts,
  onOpenNewTithe,
  onOpenNewOffering,
  onViewReceipt,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'tithe' | 'offering'>('all');

  const titheOfferingList = useMemo(() => {
    return transactions
      .filter((t) => t.categoryType === 'tithe' || t.categoryType === 'offering')
      .filter((t) => {
        if (categoryFilter !== 'all' && t.categoryType !== categoryFilter) {
          return false;
        }
        if (searchTerm) {
          const q = searchTerm.toLowerCase();
          const matchesDesc = t.description.toLowerCase().includes(q);
          const matchesContr = t.contributorName?.toLowerCase().includes(q);
          const matchesReceipt = t.receiptNumber?.toLowerCase().includes(q);
          if (!matchesDesc && !matchesContr && !matchesReceipt) return false;
        }
        return true;
      });
  }, [transactions, categoryFilter, searchTerm]);

  // Totais do mês ativo
  const totalTithes = useMemo(() => {
    return transactions
      .filter((t) => t.categoryType === 'tithe' && t.status === 'paid')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const totalOfferings = useMemo(() => {
    return transactions
      .filter((t) => t.categoryType === 'offering' && t.status === 'paid')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const identifiedCount = useMemo(() => {
    return transactions.filter(
      (t) => (t.categoryType === 'tithe' || t.categoryType === 'offering') && !t.isAnonymous && t.memberId
    ).length;
  }, [transactions]);

  const getAccountName = (accId: string) => {
    return accounts.find((a) => a.id === accId)?.name || 'Conta Geral';
  };

  return (
    <div className="space-y-6">
      {/* 4 Mini Cards Eclesiásticos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-emerald-500/30 bg-emerald-500/5">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Dízimos Arrecadados</p>
              <h3 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                {formatCurrency(totalTithes)}
              </h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/20 text-emerald-600 flex items-center justify-center">
              <Heart className="h-5 w-5 fill-emerald-500/20" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-cyan-500/30 bg-cyan-500/5">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Ofertas Voluntárias</p>
              <h3 className="text-xl font-bold text-cyan-600 dark:text-cyan-400 mt-1">
                {formatCurrency(totalOfferings)}
              </h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-cyan-500/20 text-cyan-600 flex items-center justify-center">
              <TrendingUp className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Total de Entradas Eclesiásticas</p>
              <h3 className="text-xl font-bold text-foreground mt-1">
                {formatCurrency(totalTithes + totalOfferings)}
              </h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
              <Calendar className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-indigo-500/30 bg-indigo-500/5">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground font-medium">Membros Contribuintes Identificados</p>
              <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mt-1">
                {identifiedCount} membros
              </h3>
            </div>
            <div className="h-10 w-10 rounded-xl bg-indigo-500/20 text-indigo-600 flex items-center justify-center">
              <Users className="h-5 w-5" />
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
              placeholder="Buscar por dizimista ou recibo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9"
            />
          </div>

          <div className="flex items-center gap-1 border border-border rounded-lg p-0.5 bg-muted/30">
            <Button
              size="sm"
              variant={categoryFilter === 'all' ? 'secondary' : 'ghost'}
              onClick={() => setCategoryFilter('all')}
              className="h-8 text-xs"
            >
              Todos ({titheOfferingList.length})
            </Button>
            <Button
              size="sm"
              variant={categoryFilter === 'tithe' ? 'secondary' : 'ghost'}
              onClick={() => setCategoryFilter('tithe')}
              className="h-8 text-xs gap-1"
            >
              <Heart className="h-3 w-3" />
              Dízimos
            </Button>
            <Button
              size="sm"
              variant={categoryFilter === 'offering' ? 'secondary' : 'ghost'}
              onClick={() => setCategoryFilter('offering')}
              className="h-8 text-xs gap-1"
            >
              <TrendingUp className="h-3 w-3" />
              Ofertas
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            onClick={onOpenNewTithe}
            className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            <Plus className="h-4 w-4" />
            Registrar Dízimo
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={onOpenNewOffering}
            className="gap-1.5 text-cyan-600 border-cyan-500/30 hover:bg-cyan-500/10"
          >
            <Plus className="h-4 w-4" />
            Registrar Oferta
          </Button>
        </div>
      </div>

      {/* Tabela de Contribuições */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <th className="px-4 py-3">Recibo Nº</th>
                  <th className="px-4 py-3">Contribuinte / Dizimista</th>
                  <th className="px-4 py-3">Tipo / Finalidade</th>
                  <th className="px-4 py-3">Data / Conta</th>
                  <th className="px-4 py-3 text-right">Valor</th>
                  <th className="px-4 py-3 text-center">Conciliação</th>
                  <th className="px-4 py-3 text-right">Comprovante</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {titheOfferingList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-muted-foreground">
                      Nenhuma contribuição encontrada com os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  titheOfferingList.map((tx) => (
                    <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-primary">
                        {tx.receiptNumber || `REC-${tx.id.toUpperCase()}`}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-foreground">
                          {tx.isAnonymous ? (
                            <span className="text-muted-foreground italic">Anônimo</span>
                          ) : (
                            tx.contributorName
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Comp.: {tx.competency} • <PaymentMethodBadge method={tx.paymentMethod} />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <TransactionCategoryBadge categoryType={tx.categoryType} />
                        {tx.offeringType && tx.offeringType !== 'general' && (
                          <Badge variant="outline" className="ml-1 text-[10px] text-muted-foreground">
                            {tx.offeringType}
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-medium text-foreground block">{formatDate(tx.date)}</span>
                        <span className="text-[11px] text-muted-foreground block">
                          {getAccountName(tx.accountId)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-bold font-mono text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                        + {formatCurrency(tx.amount)}
                      </td>
                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <ReconciliationBadge isReconciled={tx.isReconciled} />
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onViewReceipt(tx)}
                          className="gap-1 text-xs h-8 border-primary/30 text-primary hover:bg-primary/10"
                        >
                          <Printer className="h-3.5 w-3.5" />
                          Ver Recibo
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
