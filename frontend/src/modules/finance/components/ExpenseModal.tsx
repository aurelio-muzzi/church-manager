/**
 * ExpenseModal — Register or Edit Bills to Pay & Church Expenses
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
import { Textarea } from '@/components/ui/textarea';
import { TrendingDown } from 'lucide-react';
import { expenseFormSchema, type ExpenseFormData } from '../schemas';
import type { FinancialAccount, FinancialCategory, CostCenter } from '../types';

interface ExpenseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: ExpenseFormData) => Promise<void>;
  accounts: FinancialAccount[];
  categories: FinancialCategory[];
  costCenters: CostCenter[];
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({
  open,
  onOpenChange,
  onSubmit,
  accounts,
  categories,
  costCenters,
}) => {
  const today = '2026-10-21';
  const defaultAccount = accounts.find((a) => a.isActive)?.id || accounts[0]?.id || '';
  const expenseCategories = categories.filter((c) => c.type === 'expense');
  const defaultCategory = expenseCategories[0]?.id || '';
  const defaultCostCenter = costCenters[0]?.id || '';

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      description: '',
      supplierName: '',
      amount: 0,
      dueDate: today,
      status: 'pending',
      paymentMethod: 'bank_slip',
      accountId: defaultAccount,
      categoryId: defaultCategory,
      costCenterId: defaultCostCenter,
      congregationId: 'cong-01',
      documentNumber: '',
      notes: '',
    },
  });

  const status = watch('status');

  useEffect(() => {
    if (open) {
      reset({
        description: '',
        supplierName: '',
        amount: 0,
        dueDate: today,
        status: 'pending',
        paymentMethod: 'bank_slip',
        accountId: defaultAccount,
        categoryId: defaultCategory,
        costCenterId: defaultCostCenter,
        congregationId: 'cong-01',
        documentNumber: '',
        notes: '',
      });
    }
  }, [open, defaultAccount, defaultCategory, defaultCostCenter, reset]);

  const handleFormSubmit = async (data: ExpenseFormData) => {
    await onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
            <TrendingDown className="h-5 w-5" />
            Lançar Despesa / Conta a Pagar
          </DialogTitle>
          <DialogDescription>
            Controle de obrigações financeiras, compras, fornecedores e folha ministerial.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 pt-2">
          {/* Descrição e Fornecedor */}
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="description">Descrição da Despesa*</Label>
              <Input
                id="description"
                placeholder="Ex.: Manutenção dos equipamentos de som do templo"
                {...register('description')}
              />
              {errors.description && (
                <p className="text-xs text-destructive">{errors.description.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="supplierName">Fornecedor / Credor*</Label>
              <Input
                id="supplierName"
                placeholder="Ex.: Amazonas Energia, Concessionária, Loja de Música"
                {...register('supplierName')}
              />
              {errors.supplierName && (
                <p className="text-xs text-destructive">{errors.supplierName.message}</p>
              )}
            </div>
          </div>

          {/* Valor, Vencimento e Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="amount">Valor da Despesa (R$)*</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register('amount')}
              />
              {errors.amount && (
                <p className="text-xs text-destructive">{errors.amount.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="dueDate">Data de Vencimento*</Label>
              <Input id="dueDate" type="date" {...register('dueDate')} />
              {errors.dueDate && (
                <p className="text-xs text-destructive">{errors.dueDate.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="status">Situação Inicial*</Label>
              <select
                id="status"
                {...register('status')}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="pending">Pendente (A Pagar)</option>
                <option value="paid">Já Pago / Liquidado</option>
              </select>
            </div>
          </div>

          {/* Se marcada como paga, solicita data de pagamento */}
          {status === 'paid' && (
            <div className="p-3 bg-muted/40 rounded-lg space-y-1.5 border border-border">
              <Label htmlFor="paidDate">Data do Pagamento Efetivo*</Label>
              <Input
                id="paidDate"
                type="date"
                defaultValue={today}
                onChange={(e) => setValue('paidDate', e.target.value)}
              />
            </div>
          )}

          {/* Categoria e Centro de Custo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="categoryId">Categoria da Despesa*</Label>
              <select
                id="categoryId"
                {...register('categoryId')}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {expenseCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.code} - {cat.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <p className="text-xs text-destructive">{errors.categoryId.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="costCenterId">Centro de Custo / Ministério</Label>
              <select
                id="costCenterId"
                {...register('costCenterId')}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">Sem centro de custo</option>
                {costCenters.map((cc) => (
                  <option key={cc.id} value={cc.id}>
                    {cc.code} - {cc.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Conta Debitada e Forma de Pagamento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="accountId">Conta Bancária de Saída*</Label>
              <select
                id="accountId"
                {...register('accountId')}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                  </option>
                ))}
              </select>
              {errors.accountId && (
                <p className="text-xs text-destructive">{errors.accountId.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="paymentMethod">Forma de Pagamento*</Label>
              <select
                id="paymentMethod"
                {...register('paymentMethod')}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="bank_slip">Boleto Bancário</option>
                <option value="pix">PIX</option>
                <option value="bank_transfer">Transferência Bancária</option>
                <option value="cash">Dinheiro em Espécie</option>
                <option value="credit_card">Cartão Corporativo</option>
                <option value="debit_card">Cartão de Débito</option>
              </select>
            </div>
          </div>

          {/* Documento e Observações */}
          <div className="space-y-1.5">
            <Label htmlFor="documentNumber">Nº da Nota Fiscal / Boleto / Código de Barras</Label>
            <Input
              id="documentNumber"
              placeholder="Ex.: NF-e 2891 ou linha digitável"
              {...register('documentNumber')}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Observações / Detalhes</Label>
            <Textarea
              id="notes"
              rows={2}
              placeholder="Aprovações da diretoria, detalhes do serviço..."
              {...register('notes')}
            />
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
              className="gap-2 bg-rose-600 hover:bg-rose-700 text-white"
            >
              <TrendingDown className="h-4 w-4" />
              {isSubmitting ? 'Salvando...' : 'Salvar Despesa'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
