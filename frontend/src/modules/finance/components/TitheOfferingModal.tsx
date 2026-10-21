/**
 * TitheOfferingModal — Register Tithes & Offerings
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
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Heart, TrendingUp } from 'lucide-react';
import {
  titheOfferingFormSchema,
  type TitheOfferingFormData,
} from '../schemas';
import type { FinancialAccount, FinancialCategory } from '../types';
import type { Member } from '@/modules/members/types';
import type { ChurchEvent } from '@/modules/events/types';

interface TitheOfferingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: TitheOfferingFormData) => Promise<void>;
  accounts: FinancialAccount[];
  categories: FinancialCategory[];
  members: Member[];
  events: ChurchEvent[];
  defaultCategoryType?: 'tithe' | 'offering';
}

export const TitheOfferingModal: React.FC<TitheOfferingModalProps> = ({
  open,
  onOpenChange,
  onSubmit,
  accounts,
  categories,
  members,
  events,
  defaultCategoryType = 'tithe',
}) => {
  const today = '2026-10-21';
  const currentCompetency = '2026-10';

  const defaultAccount = accounts.find((a) => a.isActive)?.id || accounts[0]?.id || '';
  const defaultCategory =
    categories.find((c) =>
      defaultCategoryType === 'tithe' ? c.code === '1.1.01' : c.code === '1.1.02'
    )?.id || categories[0]?.id || '';

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TitheOfferingFormData>({
    resolver: zodResolver(titheOfferingFormSchema),
    defaultValues: {
      categoryType: defaultCategoryType,
      offeringType: 'general',
      isAnonymous: false,
      memberId: '',
      contributorName: '',
      amount: 0,
      date: today,
      competency: currentCompetency,
      congregationId: 'cong-01',
      paymentMethod: 'pix',
      accountId: defaultAccount,
      categoryId: defaultCategory,
      notes: '',
    },
  });

  const categoryType = watch('categoryType');
  const isAnonymous = watch('isAnonymous');
  const selectedMemberId = watch('memberId');

  useEffect(() => {
    register('memberId');
    register('contributorName');
  }, [register]);

  // Sync category type if defaultCategoryType prop changes
  useEffect(() => {
    if (open) {
      const cat = categories.find((c) =>
        defaultCategoryType === 'tithe' ? c.code === '1.1.01' : c.code === '1.1.02'
      );
      reset({
        categoryType: defaultCategoryType,
        offeringType: 'general',
        isAnonymous: false,
        memberId: '',
        contributorName: '',
        amount: 0,
        date: today,
        competency: currentCompetency,
        congregationId: 'cong-01',
        paymentMethod: 'pix',
        accountId: defaultAccount,
        categoryId: cat?.id || categories[0]?.id || '',
        notes: '',
      });
    }
  }, [open, defaultCategoryType, defaultAccount, categories, reset]);

  // When a member is selected, auto-fill contributorName
  const handleMemberChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const memId = e.target.value;
    setValue('memberId', memId, { shouldValidate: true, shouldDirty: true });
    const found = members.find((m) => m.id === memId);
    if (found) {
      setValue('contributorName', found.name, { shouldValidate: true, shouldDirty: true });
    }
  };

  const handleFormSubmit = async (data: TitheOfferingFormData) => {
    await onSubmit(data);
    onOpenChange(false);
  };

  const relevantCategories = categories.filter((c) => c.type === 'income');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {categoryType === 'tithe' ? (
              <>
                <Heart className="h-5 w-5 text-emerald-500 fill-emerald-500/20" />
                Registrar Dízimo Eclesiástico
              </>
            ) : (
              <>
                <TrendingUp className="h-5 w-5 text-cyan-500" />
                Registrar Oferta Arrecadada
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            Lançamento de entrada no livro caixa e tesouraria da congregação.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 pt-2">
          {/* Tipo de Arrecadação */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-muted/40 rounded-lg">
            <Button
              type="button"
              variant={categoryType === 'tithe' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => {
                setValue('categoryType', 'tithe');
                const cat = categories.find((c) => c.code === '1.1.01');
                if (cat) setValue('categoryId', cat.id);
              }}
              className="w-full gap-2"
            >
              <Heart className="h-4 w-4" />
              Dízimo
            </Button>
            <Button
              type="button"
              variant={categoryType === 'offering' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => {
                setValue('categoryType', 'offering');
                const cat = categories.find((c) => c.code === '1.1.02');
                if (cat) setValue('categoryId', cat.id);
              }}
              className="w-full gap-2"
            >
              <TrendingUp className="h-4 w-4" />
              Oferta
            </Button>
          </div>

          {/* Subtipo de Oferta (se oferta) */}
          {categoryType === 'offering' && (
            <div className="space-y-1.5">
              <Label htmlFor="offeringType">Tipo / Finalidade da Oferta</Label>
              <select
                id="offeringType"
                {...register('offeringType')}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="general">Oferta Geral / Alçadas de Culto</option>
                <option value="missions">Oferta Missionária</option>
                <option value="building">Fundo de Construção / Reforma</option>
                <option value="campaign">Campanha Específica</option>
                <option value="special">Oferta Especial</option>
              </select>
            </div>
          )}

          {/* Alternador Anônimo */}
          <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-card/40">
            <div className="space-y-0.5">
              <Label htmlFor="isAnonymous" className="text-sm font-medium">
                Contribuição Anônima
              </Label>
              <p className="text-xs text-muted-foreground">
                Marque se a oferta ou dízimo foi entregue sem identificação do membro.
              </p>
            </div>
            <Switch
              id="isAnonymous"
              checked={isAnonymous}
              onCheckedChange={(checked) => setValue('isAnonymous', checked)}
            />
          </div>

          {/* Identificação do Membro (se não anônimo) */}
          {!isAnonymous && (
            <div className="space-y-3 p-3 rounded-lg border border-border bg-muted/10">
              <div className="space-y-1.5">
                <Label htmlFor="memberSelect">Selecionar Membro Cadastrado</Label>
                <select
                  id="memberSelect"
                  value={selectedMemberId || ''}
                  onChange={handleMemberChange}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="">-- Selecione ou digite o nome abaixo --</option>
                  {members.map((mem) => (
                    <option key={mem.id} value={mem.id}>
                      {mem.name} ({mem.membershipStatus || 'Membro'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="contributorName">Nome do Contribuinte</Label>
                <Input
                  id="contributorName"
                  placeholder="Nome completo para emissão do recibo"
                  {...register('contributorName')}
                />
                {errors.memberId && (
                  <p className="text-xs text-destructive">{errors.memberId.message}</p>
                )}
              </div>
            </div>
          )}

          {/* Valores e Datas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="amount">Valor Arrecadado (R$)*</Label>
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
              <Label htmlFor="date">Data da Entrada*</Label>
              <Input id="date" type="date" {...register('date')} />
              {errors.date && (
                <p className="text-xs text-destructive">{errors.date.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="competency">Competência (AAAA-MM)*</Label>
              <Input id="competency" placeholder="2026-10" {...register('competency')} />
              {errors.competency && (
                <p className="text-xs text-destructive">{errors.competency.message}</p>
              )}
            </div>
          </div>

          {/* Conta de Destino e Forma de Pagamento */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="accountId">Conta Bancária / Caixa de Entrada*</Label>
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
                <option value="pix">PIX</option>
                <option value="cash">Dinheiro em Espécie</option>
                <option value="bank_transfer">Transferência Bancária</option>
                <option value="credit_card">Cartão de Crédito</option>
                <option value="debit_card">Cartão de Débito</option>
                <option value="bank_slip">Boleto Bancário</option>
              </select>
            </div>
          </div>

          {/* Categoria e Culto/Evento Opcional */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="categoryId">Categoria Financeira*</Label>
              <select
                id="categoryId"
                {...register('categoryId')}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {relevantCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.code} - {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="eventId">Culto / Evento Vinculado</Label>
              <select
                id="eventId"
                {...register('eventId')}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">Nenhum culto específico</option>
                {events.map((evt) => (
                  <option key={evt.id} value={evt.id}>
                    {evt.title} ({evt.startDate})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Documento / Comprovante e Observações */}
          <div className="space-y-1.5">
            <Label htmlFor="documentNumber">Nº do Comprovante / Autenticação PIX</Label>
            <Input
              id="documentNumber"
              placeholder="Ex.: E20261021123456789"
              {...register('documentNumber')}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Observações da Tesouraria</Label>
            <Textarea
              id="notes"
              rows={2}
              placeholder="Anotações internas sobre esta arrecadação..."
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
              <Heart className="h-4 w-4" />
              {isSubmitting ? 'Salvando...' : 'Confirmar Lançamento'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
