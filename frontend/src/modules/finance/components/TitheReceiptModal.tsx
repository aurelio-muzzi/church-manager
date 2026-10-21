/**
 * TitheReceiptModal — Official Digital Church Contribution Receipt
 * ChurchManager Enterprise Multi-Tenant Platform
 */

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Building2, Printer, CheckCircle2, ShieldCheck, Heart } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import type { FinancialTransaction } from '../types';

interface TitheReceiptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: FinancialTransaction | null;
}

export const TitheReceiptModal: React.FC<TitheReceiptModalProps> = ({
  open,
  onOpenChange,
  transaction,
}) => {
  if (!transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  const isTithe = transaction.categoryType === 'tithe';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary">
            <Heart className="h-5 w-5 fill-primary/20" />
            Recibo de Contribuição Eclesiástica
          </DialogTitle>
          <DialogDescription>
            Comprovante oficial emitido pela tesouraria da congregação.
          </DialogDescription>
        </DialogHeader>

        {/* Timbrado Eclesiástico do Recibo */}
        <div
          id="church-receipt-print"
          className="p-6 rounded-xl border border-border bg-card/70 space-y-5 shadow-sm print:border-black print:p-8"
        >
          {/* Cabeçalho da Igreja */}
          <div className="flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm tracking-tight text-foreground">
                  Igreja Central de Manaus
                </h3>
                <p className="text-xs text-muted-foreground">
                  CNPJ: 04.123.456/0001-89 • Sede Administrativa
                </p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-muted-foreground block tracking-wider">
                Recibo Nº
              </span>
              <span className="font-mono text-xs font-bold text-primary">
                {transaction.receiptNumber || `REC-${transaction.id.toUpperCase()}`}
              </span>
            </div>
          </div>

          {/* Destaque do Valor */}
          <div className="text-center py-4 bg-muted/30 rounded-lg border border-border/50">
            <span className="text-xs text-muted-foreground uppercase font-medium tracking-wide">
              {isTithe ? 'Dízimo Eclesiástico' : 'Oferta Voluntária'}
            </span>
            <div className="text-3xl font-extrabold text-foreground mt-1">
              {formatCurrency(transaction.amount)}
            </div>
            <div className="mt-2 flex items-center justify-center gap-2">
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-xs">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Arrecadação Confirmada
              </Badge>
              {transaction.isReconciled && (
                <Badge variant="outline" className="bg-indigo-500/10 text-indigo-600 border-indigo-500/30 text-xs">
                  <ShieldCheck className="h-3 w-3 mr-1" />
                  Conciliado
                </Badge>
              )}
            </div>
          </div>

          {/* Dados do Contribuinte e Transação */}
          <div className="space-y-2 text-xs">
            <div className="flex justify-between py-1 border-b border-border/40">
              <span className="text-muted-foreground">Contribuinte / Dizimista:</span>
              <span className="font-semibold text-foreground">
                {transaction.isAnonymous ? 'Anônimo' : transaction.contributorName || 'Não informado'}
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/40">
              <span className="text-muted-foreground">Data da Arrecadação:</span>
              <span className="font-medium text-foreground">{formatDate(transaction.date)}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/40">
              <span className="text-muted-foreground">Competência Eclesiástica:</span>
              <span className="font-medium text-foreground">{transaction.competency}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-border/40">
              <span className="text-muted-foreground">Forma de Pagamento:</span>
              <span className="font-medium text-foreground uppercase">{transaction.paymentMethod}</span>
            </div>
            {transaction.documentNumber && (
              <div className="flex justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Doc. / Comprovante:</span>
                <span className="font-mono text-foreground">{transaction.documentNumber}</span>
              </div>
            )}
          </div>

          {/* Mensagem Canônica e Assinatura */}
          <div className="pt-2 text-center text-[11px] text-muted-foreground italic">
            "Cada um dê conforme determinou em seu coração, não com pesar ou por obrigação, pois Deus ama quem dá com alegria." (2 Co 9:7)
          </div>

          <div className="pt-4 border-t border-border flex justify-between items-end text-[11px] text-muted-foreground">
            <div>
              <span>Emitido digitalmente pelo</span>
              <p className="font-medium text-foreground">ChurchManager SaaS</p>
            </div>
            <div className="text-right">
              <div className="w-32 border-b border-muted-foreground/60 mb-1" />
              <span>Tesouraria Eclesiástica</span>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button onClick={handlePrint} className="gap-2">
            <Printer className="h-4 w-4" />
            Imprimir / Salvar PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
