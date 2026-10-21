/**
 * QuickPayExpenseModal — Fast Settlement & Payment of Bills
 * ChurchManager Enterprise Multi-Tenant Platform
 */

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2 } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { quickPayExpenseSchema, type QuickPayExpenseFormData } from '../schemas';
import type { FinancialTransaction, FinancialAccount } from '../types';

interface QuickPayExpenseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: FinancialTransaction | null;
  accounts: FinancialAccount[];
  onConfirmPayment: (id: string, data: QuickPayExpenseFormData) => Promise<void>;
}

export const QuickPayExpenseModal: React.FC<QuickPayExpenseModalProps> = ({
  open,
  onOpenChange,
  transaction,
  accounts,
  onConfirmPayment,
}) => {
  const today = '2026-10-21';

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<QuickPayExpenseFormData>({
    resolver: zodResolver(quickPayExpenseSchema),
    defaultValues: {
      paidDate: today,
      accountId: accounts[0]?.id || '',
      paymentMethod: 'pix',
    },
  });

  useEffect(() => {
    if (open && transaction) {
      reset({
        paidDate: today,
        accountId: transaction.accountId || accounts[0]?.id || '',
        paymentMethod: transaction.paymentMethod || 'pix',
      });
    }
  }, [open, transaction, accounts, reset]);

  if (!transaction) return null;

  const handleFormSubmit = async (data: QuickPayExpenseFormData) => {
    await onConfirmPayment(transaction.id, data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-5 w-5" />
            Liquidar / Pagar Conta
          </DialogTitle>
          <DialogDescription>
            Confirme o débito bancário e a efetivação do pagamento da despesa.
          </DialogDescription>
        </DialogHeader>

        {/* Resumo da Despesa */}
        <div className="p-4 rounded-lg border border-border bg-muted/30 space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <p className="font-semibold text-sm text-foreground">{transaction.description}</p>
              <p className="text-xs text-muted-foreground">Fornecedor: {transaction.supplierName}</p>
            </div>
            <div className="text-right">
              <span className="text-base font-bold text-foreground">
                {formatCurrency(transaction.amount)}
              </span>
              <p className="text-[11px] text-muted-foreground">
                Vencimento: {formatDate(transaction.dueDate || transaction.date)}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="payPaidDate">Data do Pagamento Efetivo*</Label>
            <Input id="payPaidDate" type="date" {...register('paidDate')} />
            {errors.paidDate && (
              <p className="text-xs text-destructive">{errors.paidDate.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="payAccountId">Conta Bancária de Saída*</Label>
            <select
              id="payAccountId"
              {...register('accountId')}
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} (Saldo: {formatCurrency(acc.currentBalance)})
                </option>
              ))}
            </select>
            {errors.accountId && (
              <p className="text-xs text-destructive">{errors.accountId.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="payPaymentMethod">Forma de Pagamento*</Label>
            <select
              id="payPaymentMethod"
              {...register('paymentMethod')}
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="pix">PIX</option>
              <option value="bank_slip">Boleto Bancário</option>
              <option value="bank_transfer">Transferência Bancária</option>
              <option value="cash">Dinheiro em Espécie</option>
              <option value="credit_card">Cartão Corporativo</option>
              <option value="debit_card">Cartão de Débito</option>
            </select>
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <CheckCircle2 className="h-4 w-4" />
              {isSubmitting ? 'Processando...' : 'Confirmar Pagamento'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
