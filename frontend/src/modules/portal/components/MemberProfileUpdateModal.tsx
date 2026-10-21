import React, { useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  ShieldCheck,
  Clock,
  CheckCircle2,
  XCircle,
  FileText,
  Send,
} from 'lucide-react';
import {
  memberUpdateRegistrationSchema,
  type MemberUpdateRegistrationFormData,
} from '../schemas';
import type { MemberChangeRequest } from '@/modules/members/types';

interface MemberProfileUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberId: string;
  initialData?: {
    phone?: string;
    email?: string;
    maritalStatus?: string;
    address?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
  };
  onSubmitRequest: (data: MemberUpdateRegistrationFormData) => Promise<void>;
  existingRequests?: MemberChangeRequest[];
}

export const MemberProfileUpdateModal: React.FC<MemberProfileUpdateModalProps> = ({
  isOpen,
  onClose,
  initialData,
  onSubmitRequest,
  existingRequests = [],
}) => {
  const [activeTab, setActiveTab] = useState<'form' | 'history'>('form');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MemberUpdateRegistrationFormData>({
    resolver: zodResolver(memberUpdateRegistrationSchema),
    defaultValues: {
      phone: initialData?.phone || '(92) 98555-6677',
      email: initialData?.email || 'gabriel.membro@gmail.com',
      maritalStatus:
        (initialData?.maritalStatus as
          | 'single'
          | 'married'
          | 'divorced'
          | 'widowed') || 'married',
      address: initialData?.address || 'Rua das Palmeiras, 55',
      neighborhood: initialData?.neighborhood || 'Ponta Negra',
      city: initialData?.city || 'Manaus',
      state: initialData?.state || 'AM',
      postalCode: initialData?.postalCode || '69037-120',
      emergencyContactName: initialData?.emergencyContactName || '',
      emergencyContactPhone: initialData?.emergencyContactPhone || '',
      justification: '',
    },
  });

  const onSubmit = async (data: MemberUpdateRegistrationFormData) => {
    await onSubmitRequest(data);
    reset();
    setActiveTab('history');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <Badge variant="success" className="text-[10px] gap-1 bg-emerald-500/15 text-emerald-600 border-emerald-500/30">
            <CheckCircle2 className="h-3 w-3" /> Aprovada
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive" className="text-[10px] gap-1">
            <XCircle className="h-3 w-3" /> Indeferida
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-[10px] gap-1 bg-amber-500/15 text-amber-600 border-amber-500/30">
            <Clock className="h-3 w-3" /> Em Análise (Secretaria)
          </Badge>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <DialogTitle className="text-base sm:text-lg">
              Atualização Cadastral Eclesiástica
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground">
            Solicite correções de endereço e contatos diretamente para a Secretaria Geral da Igreja.
          </DialogDescription>
        </DialogHeader>

        <Tabs
          value={activeTab}
          onValueChange={(val) => setActiveTab(val === 'history' ? 'history' : 'form')}
          className="w-full"
        >
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="form" className="text-xs" data-testid="tab-new-request">
              Novo Pedido de Alteração
            </TabsTrigger>
            <TabsTrigger value="history" className="text-xs" data-testid="tab-requests-history">
              Histórico ({existingRequests.length})
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: FORM */}
          <TabsContent value="form">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="bg-primary/5 p-3 rounded-xl border border-primary/20 text-xs text-muted-foreground flex items-start gap-2.5">
                <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  Para manter a fidedignidade do rol de membros e atender à LGPD, as alterações
                  cadastrais passam por conferência da secretaria antes de serem aplicadas em definitivo.
                </p>
              </div>

              {/* Contact Data */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="phone" className="text-xs font-semibold">Telefone / WhatsApp *</Label>
                  <Input id="phone" className="text-xs" {...register('phone')} data-testid="input-phone" />
                  {errors.phone && <p className="text-[10px] text-destructive">{errors.phone.message}</p>}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="email" className="text-xs font-semibold">E-mail *</Label>
                  <Input id="email" type="email" className="text-xs" {...register('email')} data-testid="input-email" />
                  {errors.email && <p className="text-[10px] text-destructive">{errors.email.message}</p>}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="maritalStatus" className="text-xs font-semibold">Estado Civil *</Label>
                  <Select
                    value={watch('maritalStatus')}
                    onValueChange={(val) =>
                      setValue(
                        'maritalStatus',
                        val as 'single' | 'married' | 'divorced' | 'widowed'
                      )
                    }
                  >
                    <SelectTrigger id="maritalStatus" className="text-xs" data-testid="select-marital-status">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="single">Solteiro(a)</SelectItem>
                      <SelectItem value="married">Casado(a)</SelectItem>
                      <SelectItem value="divorced">Divorciado(a)</SelectItem>
                      <SelectItem value="widowed">Viúvo(a)</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.maritalStatus && <p className="text-[10px] text-destructive">{errors.maritalStatus.message}</p>}
                </div>
              </div>

              {/* Address Data */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div className="sm:col-span-2 space-y-1">
                  <Label htmlFor="address" className="text-xs font-semibold">Endereço Residencial *</Label>
                  <Input id="address" className="text-xs" {...register('address')} data-testid="input-address" />
                  {errors.address && <p className="text-[10px] text-destructive">{errors.address.message}</p>}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="neighborhood" className="text-xs font-semibold">Bairro *</Label>
                  <Input id="neighborhood" className="text-xs" {...register('neighborhood')} data-testid="input-neighborhood" />
                  {errors.neighborhood && <p className="text-[10px] text-destructive">{errors.neighborhood.message}</p>}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="postalCode" className="text-xs font-semibold">CEP *</Label>
                  <Input id="postalCode" className="text-xs" {...register('postalCode')} data-testid="input-postal-code" />
                  {errors.postalCode && <p className="text-[10px] text-destructive">{errors.postalCode.message}</p>}
                </div>

                <div className="sm:col-span-3 space-y-1">
                  <Label htmlFor="city" className="text-xs font-semibold">Cidade *</Label>
                  <Input id="city" className="text-xs" {...register('city')} data-testid="input-city" />
                  {errors.city && <p className="text-[10px] text-destructive">{errors.city.message}</p>}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="state" className="text-xs font-semibold">UF *</Label>
                  <Input id="state" maxLength={2} className="text-xs uppercase" {...register('state')} data-testid="input-state" />
                  {errors.state && <p className="text-[10px] text-destructive">{errors.state.message}</p>}
                </div>
              </div>

              {/* Justification */}
              <div className="space-y-1">
                <Label htmlFor="justification" className="text-xs font-semibold">
                  Justificativa / Motivo da Alteração *
                </Label>
                <Textarea
                  id="justification"
                  rows={2}
                  placeholder="Ex: Mudança de endereço recente para novo bairro / Alteração de número de telefone..."
                  className="text-xs"
                  {...register('justification')}
                  data-testid="input-justification"
                />
                {errors.justification && (
                  <p className="text-[10px] text-destructive" data-testid="justification-error">
                    {errors.justification.message}
                  </p>
                )}
              </div>

              <DialogFooter className="flex justify-between sm:justify-between pt-2">
                <Button type="button" variant="outline" size="sm" onClick={onClose}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting}
                  className="gap-1.5 bg-primary text-primary-foreground"
                  data-testid="submit-change-request-btn"
                >
                  <Send className="h-3.5 w-3.5" />
                  Enviar Solicitação à Secretaria
                </Button>
              </DialogFooter>
            </form>
          </TabsContent>

          {/* TAB 2: REQUESTS HISTORY */}
          <TabsContent value="history" className="space-y-3" data-testid="requests-history-list">
            {existingRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-xs">
                Nenhuma solicitação enviada até o momento.
              </div>
            ) : (
              existingRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-3.5 rounded-xl border border-border/70 bg-card space-y-2 text-xs"
                  data-testid={`request-item-${req.id}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-semibold text-foreground">{req.id}</span>
                    {getStatusBadge(req.status)}
                  </div>

                  <div className="text-muted-foreground text-[11px]">
                    Data de Envio: {new Date(req.createdAt).toLocaleDateString('pt-BR')}
                  </div>

                  {req.proposedChanges && (
                    <div className="bg-muted/40 p-2 rounded-lg border border-border/40 text-[11px] space-y-0.5">
                      <span className="font-semibold text-foreground block">Alterações Solicitadas:</span>
                      {req.proposedChanges.phone && <div>Telefone: {String(req.proposedChanges.phone)}</div>}
                      {req.proposedChanges.address && <div>Endereço: {String(req.proposedChanges.address)}</div>}
                      {req.proposedChanges.neighborhood && <div>Bairro: {String(req.proposedChanges.neighborhood)}</div>}
                      {req.proposedChanges.city && <div>Cidade: {String(req.proposedChanges.city)}</div>}
                      {req.proposedChanges.justification && (
                        <div className="text-muted-foreground italic pt-1">
                          Justificativa: "{String(req.proposedChanges.justification)}"
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
