/**
 * AccountModal — Register or Edit Financial Accounts & Cash Registers
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
import { Landmark } from 'lucide-react';
import { accountFormSchema, type AccountFormData } from '../schemas';
import type { FinancialAccount } from '../types';

interface AccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: AccountFormData) => Promise<void>;
  accountToEdit?: FinancialAccount | null;
}

export const AccountModal: React.FC<AccountModalProps> = ({
  open,
  onOpenChange,
  onSubmit,
  accountToEdit,
}) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AccountFormData>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      name: '',
      type: 'checking',
      bankName: '',
      agency: '',
      accountNumber: '',
      initialBalance: 0,
      notes: '',
    },
  });

  useEffect(() => {
    if (open) {
      if (accountToEdit) {
        reset({
          name: accountToEdit.name,
          type: accountToEdit.type,
          bankName: accountToEdit.bankName || '',
          agency: accountToEdit.agency || '',
          accountNumber: accountToEdit.accountNumber || '',
          initialBalance: accountToEdit.initialBalance,
          notes: accountToEdit.notes || '',
        });
      } else {
        reset({
          name: '',
          type: 'checking',
          bankName: '',
          agency: '',
          accountNumber: '',
          initialBalance: 0,
          notes: '',
        });
      }
    }
  }, [open, accountToEdit, reset]);

  const handleFormSubmit = async (data: AccountFormData) => {
    await onSubmit(data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Landmark className="h-5 w-5 text-primary" />
            {accountToEdit ? 'Editar Conta Financeira' : 'Nova Conta Bancária ou Caixa'}
          </DialogTitle>
          <DialogDescription>
            Controle de contas correntes, caixas físicos e reservas de poupança.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="accName">Nome da Conta / Identificador*</Label>
            <Input
              id="accName"
              placeholder="Ex.: Banco do Brasil - Conta Principal"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="accType">Tipo de Conta*</Label>
            <select
              id="accType"
              {...register('type')}
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="checking">Conta Corrente (Bancária)</option>
              <option value="cash">Caixa Físico / Espécie (Tesouraria)</option>
              <option value="savings">Poupança / Reserva de Construção</option>
              <option value="investment">Investimento / Fundo Patrimonial</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="accBank">Instituição Financeira / Banco</Label>
            <Input
              id="accBank"
              placeholder="Ex.: Banco do Brasil, Itaú, Bradesco, Nubank"
              {...register('bankName')}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="accAgency">Agência</Label>
              <Input id="accAgency" placeholder="0000-0" {...register('agency')} />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="accNumber">Número da Conta</Label>
              <Input id="accNumber" placeholder="00000-0" {...register('accountNumber')} />
            </div>
          </div>

          {!accountToEdit && (
            <div className="space-y-1.5">
              <Label htmlFor="accBalance">Saldo Inicial de Abertura (R$)*</Label>
              <Input
                id="accBalance"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register('initialBalance')}
              />
              {errors.initialBalance && (
                <p className="text-xs text-destructive">{errors.initialBalance.message}</p>
              )}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="accNotes">Observações</Label>
            <Textarea
              id="accNotes"
              rows={2}
              placeholder="Finalidade da conta, autorizados a movimentar..."
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
            <Button type="submit" disabled={isSubmitting} className="gap-2">
              <Landmark className="h-4 w-4" />
              {isSubmitting ? 'Salvando...' : 'Salvar Conta'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
