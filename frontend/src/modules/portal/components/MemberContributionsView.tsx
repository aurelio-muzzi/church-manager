import React, { useState } from 'react';
import {
  DollarSign,
  Calendar,
  FileText,
  Receipt,
  Download,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import type { MemberContributionSummary } from '../types';
import type { FinancialTransaction } from '@/modules/finance/types';

interface MemberContributionsViewProps {
  summary: MemberContributionSummary;
  onOpenTaxStatement: () => void;
}

const formatBRL = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

export const MemberContributionsView: React.FC<MemberContributionsViewProps> = ({
  summary,
  onOpenTaxStatement,
}) => {
  const [selectedReceipt, setSelectedReceipt] = useState<FinancialTransaction | null>(null);

  const getOfferingLabel = (type?: string, categoryType?: string) => {
    if (categoryType === 'tithe' || type === 'tithe') return 'Dízimo Eclesiástico';
    if (type === 'missions') return 'Oferta Missionária';
    if (type === 'building') return 'Oferta para Construção';
    return 'Oferta Voluntária';
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case 'pix':
        return 'PIX';
      case 'card_credit':
        return 'Cartão de Crédito';
      case 'card_debit':
        return 'Cartão de Débito';
      case 'cash':
        return 'Dinheiro / Espécie';
      case 'bank_transfer':
        return 'Transferência';
      default:
        return method;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & IRPF Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent p-4 sm:p-5 rounded-2xl border border-emerald-500/20">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <DollarSign className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-foreground">
              Histórico de Dízimos e Ofertas
            </h3>
            <p className="text-xs text-muted-foreground">
              Acompanhe suas contribuições, acesse recibos e emita o relatório anual de IRPF.
            </p>
          </div>
        </div>

        <Button
          onClick={onOpenTaxStatement}
          className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm text-xs shrink-0"
          data-testid="open-tax-statement-btn"
        >
          <FileText className="h-4 w-4" />
          Declaração Anual IRPF (2026)
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Dízimos e Ofertas (2026)
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400" data-testid="yearly-total">
              {formatBRL(summary.yearlyTotal)}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Total acumulado no ano corrente
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Mês Corrente (Outubro)
            </CardTitle>
            <Calendar className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl font-bold font-mono text-indigo-600 dark:text-indigo-400" data-testid="monthly-total">
              {formatBRL(summary.monthlyTotal)}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Contribuições identificadas no mês
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Total de Contribuições
            </CardTitle>
            <Receipt className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl font-bold font-mono text-foreground" data-testid="contributions-count">
              {summary.totalCount} lançamentos
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Recibos registrados pela tesouraria
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Contributions Table */}
      <Card className="border-border/60 shadow-sm overflow-hidden">
        <CardHeader className="p-4 border-b border-border/60 bg-muted/20">
          <CardTitle className="text-sm font-semibold flex items-center justify-between">
            <span>Extrato de Entregas</span>
            <span className="text-xs font-normal text-muted-foreground">
              Exibindo {summary.contributions.length} registro(s)
            </span>
          </CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left" data-testid="member-contributions-table">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-muted-foreground">
                <th className="py-2.5 px-4 font-semibold">Data</th>
                <th className="py-2.5 px-4 font-semibold">Descrição / Tipo</th>
                <th className="py-2.5 px-4 font-semibold">Método</th>
                <th className="py-2.5 px-4 font-semibold">Situação</th>
                <th className="py-2.5 px-4 font-semibold text-right">Valor</th>
                <th className="py-2.5 px-4 font-semibold text-center">Recibo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {summary.contributions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-muted-foreground">
                    Nenhuma contribuição identificada para este membro.
                  </td>
                </tr>
              ) : (
                summary.contributions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4 font-mono">
                      {new Date(tx.date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-foreground">{tx.description}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {getOfferingLabel(tx.offeringType, tx.categoryType)}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {getPaymentMethodLabel(tx.paymentMethod)}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant="success"
                        className="text-[10px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                      >
                        Confirmado
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-foreground">
                      {formatBRL(tx.amount)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedReceipt(tx)}
                        className="h-7 px-2 text-xs text-primary hover:text-primary gap-1"
                        title="Visualizar Recibo"
                        data-testid={`view-receipt-${tx.id}`}
                      >
                        <Receipt className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Recibo</span>
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Single Receipt Dialog */}
      {selectedReceipt && (
        <Dialog open={Boolean(selectedReceipt)} onOpenChange={() => setSelectedReceipt(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base flex items-center gap-2">
                <Receipt className="h-5 w-5 text-emerald-600" />
                Comprovante de Contribuição Eclesiástica
              </DialogTitle>
            </DialogHeader>

            <div className="border border-border/80 rounded-xl p-4 bg-muted/20 space-y-3 text-xs">
              <div className="flex justify-between border-b border-border/60 pb-2">
                <span className="text-muted-foreground">Número do Recibo:</span>
                <span className="font-mono font-bold text-foreground">
                  {selectedReceipt.receiptNumber || 'REC-2026-00109'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Contribuinte:</span>
                <span className="font-semibold text-foreground">{selectedReceipt.contributorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Finalidade:</span>
                <span>{getOfferingLabel(selectedReceipt.offeringType, selectedReceipt.categoryType)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Data do Pagamento:</span>
                <span>{new Date(selectedReceipt.date).toLocaleDateString('pt-BR')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Forma de Pagamento:</span>
                <span className="font-mono">{getPaymentMethodLabel(selectedReceipt.paymentMethod)}</span>
              </div>
              <div className="flex justify-between border-t border-border/60 pt-2 text-sm">
                <span className="font-bold text-foreground">Valor Contribuído:</span>
                <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                  {formatBRL(selectedReceipt.amount)}
                </span>
              </div>
              {selectedReceipt.isReconciled && (
                <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 dark:text-emerald-400 pt-1">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Conciliado pela Tesouraria Eclesiástica</span>
                </div>
              )}
            </div>

            <DialogFooter className="flex justify-between sm:justify-between">
              <Button variant="outline" size="sm" onClick={() => setSelectedReceipt(null)}>
                Fechar
              </Button>
              <Button
                size="sm"
                className="gap-2"
                onClick={() => window.print()}
              >
                <Download className="h-3.5 w-3.5" />
                Imprimir Recibo
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
