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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Printer, ShieldCheck, FileText } from 'lucide-react';
import type { MemberAnnualTaxStatement } from '../types';

interface AnnualTaxStatementModalProps {
  isOpen: boolean;
  onClose: () => void;
  statement: MemberAnnualTaxStatement | null;
  selectedYear: number;
  onYearChange: (year: number) => void;
}

const formatBRL = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

export const AnnualTaxStatementModal: React.FC<AnnualTaxStatementModalProps> = ({
  isOpen,
  onClose,
  statement,
  selectedYear,
  onYearChange,
}) => {
  if (!statement) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto print:max-w-none print:shadow-none print:border-none print:p-0">
        <DialogHeader className="print:hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <DialogTitle className="text-lg">Informe Anual de Contribuições (IRPF)</DialogTitle>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Ano-base:</span>
              <Select
                value={String(selectedYear)}
                onValueChange={(val) => onYearChange(Number(val))}
              >
                <SelectTrigger className="w-24 h-8 text-xs" data-testid="tax-year-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2026">2026</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Documento oficial para fins de comprovação e declaração de Imposto de Renda.
          </DialogDescription>
        </DialogHeader>

        {/* Printable Official Statement Document */}
        <div className="border border-border/80 rounded-xl p-6 bg-card text-card-foreground shadow-sm space-y-5 print:border-none print:p-2">
          {/* Church Letterhead */}
          <div className="text-center border-b border-border/80 pb-4">
            <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 text-primary mb-2">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h2 className="text-base font-bold uppercase tracking-wide">
              {statement.churchName}
            </h2>
            <p className="text-xs text-muted-foreground">
              CNPJ: <span className="font-mono font-medium">{statement.churchCnpj}</span>
            </p>
            <p className="text-xs font-semibold text-primary mt-1 uppercase">
              Declaração de Quitação Anual de Contribuições Religiosas — Exercício {statement.year}
            </p>
          </div>

          {/* Member & Church Identification */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-muted/40 p-3 rounded-lg border border-border/50">
            <div>
              <span className="text-muted-foreground block text-[11px]">Membro Contribuinte:</span>
              <span className="font-semibold text-foreground">{statement.memberName}</span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px]">CPF:</span>
              <span className="font-mono font-semibold text-foreground">{statement.memberCpf}</span>
            </div>
          </div>

          {/* Monthly Breakdown Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse" data-testid="tax-breakdown-table">
              <thead>
                <tr className="border-b border-border bg-muted/60 text-muted-foreground">
                  <th className="py-2 px-3 font-semibold">Mês de Referência</th>
                  <th className="py-2 px-3 font-semibold text-right">Dízimos</th>
                  <th className="py-2 px-3 font-semibold text-right">Ofertas & Especiais</th>
                  <th className="py-2 px-3 font-semibold text-right">Total do Mês</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {statement.monthlyBreakdown.map((row) => (
                  <tr
                    key={row.month}
                    className={`hover:bg-muted/30 ${
                      row.total > 0 ? 'font-medium' : 'text-muted-foreground/70'
                    }`}
                  >
                    <td className="py-1.5 px-3">{row.monthName}</td>
                    <td className="py-1.5 px-3 text-right font-mono">
                      {row.tithes > 0 ? formatBRL(row.tithes) : '—'}
                    </td>
                    <td className="py-1.5 px-3 text-right font-mono">
                      {row.offerings > 0 ? formatBRL(row.offerings) : '—'}
                    </td>
                    <td className="py-1.5 px-3 text-right font-mono">
                      {row.total > 0 ? formatBRL(row.total) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-border bg-muted/70 font-bold text-foreground">
                  <td className="py-2.5 px-3 uppercase text-[11px]">Total Acumulado ({statement.year})</td>
                  <td className="py-2.5 px-3 text-right font-mono text-emerald-600 dark:text-emerald-400">
                    {formatBRL(statement.totalTithes)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-indigo-600 dark:text-indigo-400">
                    {formatBRL(statement.totalOfferings)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono text-primary text-sm" data-testid="tax-total-contributed">
                    {formatBRL(statement.totalContributed)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Legal Certification and Hash */}
          <div className="pt-2 border-t border-border/80 text-[11px] text-muted-foreground space-y-1.5">
            <p className="leading-relaxed">
              Declaramos para os devidos fins legais e tributários que os valores acima descritos foram
              arrecadados a título de doações, dízimos e ofertas voluntárias de caráter religioso,
              devidamente escriturados nos livros contábeis desta instituição eclesiástica sem fins lucrativos.
            </p>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[10px] bg-muted/30 p-2 rounded border border-border/40 font-mono">
              <span>Código Autenticador: <strong>{statement.verificationCode}</strong></span>
              <span>Emissão: {new Date(statement.emittedAt).toLocaleDateString('pt-BR')}</span>
            </div>
          </div>
        </div>

        <DialogFooter className="print:hidden mt-3 flex justify-between items-center sm:justify-between w-full">
          <Button variant="outline" size="sm" onClick={onClose} data-testid="tax-modal-close-btn">
            Fechar
          </Button>
          <Button
            size="sm"
            onClick={handlePrint}
            className="gap-2 bg-primary text-primary-foreground"
            data-testid="print-statement-btn"
          >
            <Printer className="h-4 w-4" />
            Imprimir / Exportar PDF
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
