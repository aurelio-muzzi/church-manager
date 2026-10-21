import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  memberFormSchema,
  type MemberFormData,
  isMinorBirthDate,
} from '@/modules/members/schemas';
import type { Member, Congregation, Family } from '@/modules/members/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
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
import { ShieldAlert, User, Save, X, Loader2 } from 'lucide-react';

interface MemberFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memberToEdit?: Member | null;
  congregations: Congregation[];
  families: Family[];
  onSave: (data: MemberFormData) => Promise<void>;
}

export const MemberFormModal: React.FC<MemberFormModalProps> = ({
  open,
  onOpenChange,
  memberToEdit,
  congregations,
  families,
  onSave,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    formState: { errors },
  } = useForm<MemberFormData>({
    resolver: zodResolver(memberFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      gender: 'male',
      birthDate: '',
      maritalStatus: 'single',
      congregationId: congregations[0]?.id || '',
      membershipStatus: 'active',
      admissionType: 'baptism',
      admissionDate: '',
      baptismDate: '',
      familyId: '',
      familyRole: 'other',
      address: '',
      neighborhood: '',
      city: 'Manaus',
      state: 'AM',
      postalCode: '',
      legalGuardianName: '',
      legalGuardianPhone: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      notes: '',
    },
  });

  useEffect(() => {
    if (open) {
      reset({
        name: memberToEdit?.name || '',
        email: memberToEdit?.email || '',
        phone: memberToEdit?.phone || '',
        gender: memberToEdit?.gender || 'male',
        birthDate: memberToEdit?.birthDate || '',
        maritalStatus: memberToEdit?.maritalStatus || 'single',
        congregationId: memberToEdit?.congregationId || (congregations[0]?.id || ''),
        membershipStatus: memberToEdit?.membershipStatus || 'active',
        admissionType: memberToEdit?.admissionType || 'baptism',
        admissionDate: memberToEdit?.admissionDate || '',
        baptismDate: memberToEdit?.baptismDate || '',
        familyId: memberToEdit?.familyId || '',
        familyRole: memberToEdit?.familyRole || 'other',
        address: memberToEdit?.address || '',
        neighborhood: memberToEdit?.neighborhood || '',
        city: memberToEdit?.city || 'Manaus',
        state: memberToEdit?.state || 'AM',
        postalCode: memberToEdit?.postalCode || '',
        legalGuardianName: memberToEdit?.legalGuardianName || '',
        legalGuardianPhone: memberToEdit?.legalGuardianPhone || '',
        emergencyContactName: memberToEdit?.emergencyContactName || '',
        emergencyContactPhone: memberToEdit?.emergencyContactPhone || '',
        notes: memberToEdit?.notes || '',
      });
    }
  }, [open, memberToEdit, congregations, reset]);

  // Observa a data de nascimento para detecção em tempo real de Menor de Idade (LGPD)
  const watchedBirthDate = watch('birthDate');
  const isMinor = Boolean(watchedBirthDate && isMinorBirthDate(watchedBirthDate));

  const onSubmit = async (data: MemberFormData) => {
    try {
      setIsSubmitting(true);
      await onSave(data);
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <User className="h-5 w-5 text-primary" />
            {memberToEdit ? 'Editar Dados do Membro' : 'Novo Cadastro de Membro'}
          </DialogTitle>
          <DialogDescription>
            Preencha as informações pessoais, eclesiásticas e de contato do membro.
          </DialogDescription>
        </DialogHeader>

        {/* Alerta reativo LGPD quando detectado Menor de Idade (< 18 anos) */}
        {isMinor && (
          <div
            data-testid="lgpd-minor-warning"
            className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3.5 text-sm space-y-1 animate-in fade-in duration-300"
          >
            <div className="flex items-center gap-2 font-semibold text-amber-500">
              <ShieldAlert className="h-4 w-4" />
              <span>Atenção: Menor de Idade Detectado (&lt; 18 anos)</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Em estrita conformidade com a <strong>LGPD (Lei Geral de Proteção de Dados)</strong> e políticas de proteção à infância e juventude, é <strong>obrigatório</strong> informar os dados do Responsável Legal ou Contato de Emergência abaixo.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {/* Seção 1: Dados Pessoais */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              1. Identificação Pessoal
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="name">Nome Completo *</Label>
                <Input
                  id="name"
                  placeholder="Nome do membro"
                  {...register('name')}
                  aria-invalid={!!errors.name}
                />
                {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
              </div>

              <div className="space-y-1">
                <Label htmlFor="birthDate">Data de Nascimento *</Label>
                <Input
                  id="birthDate"
                  type="date"
                  {...register('birthDate')}
                  aria-invalid={!!errors.birthDate}
                />
                {errors.birthDate && (
                  <p className="text-xs text-destructive">{errors.birthDate.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="gender">Gênero *</Label>
                <Controller
                  name="gender"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="gender">
                        <SelectValue placeholder="Selecione o gênero" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Masculino</SelectItem>
                        <SelectItem value="female">Feminino</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="maritalStatus">Estado Civil *</Label>
                <Controller
                  name="maritalStatus"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="maritalStatus">
                        <SelectValue placeholder="Selecione o estado civil" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">Solteiro(a)</SelectItem>
                        <SelectItem value="married">Casado(a)</SelectItem>
                        <SelectItem value="divorced">Divorciado(a)</SelectItem>
                        <SelectItem value="widowed">Viúvo(a)</SelectItem>
                        <SelectItem value="separated">Separado(a)</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="phone">Telefone / WhatsApp</Label>
                <Input id="phone" placeholder="(92) 99999-9999" {...register('phone')} />
                {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
              </div>

              <div className="space-y-1">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" placeholder="membro@email.com" {...register('email')} />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
            </div>
          </div>

          {/* Seção 2: Dados de Tutela LGPD (Destacados para Menor de Idade) */}
          {isMinor && (
            <div className="space-y-3 p-3.5 rounded-lg border border-amber-500/30 bg-amber-500/5">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                <ShieldAlert className="h-3.5 w-3.5" />
                2. Tutela & Responsável Legal (Obrigatório LGPD)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="legalGuardianName">Nome do Responsável Legal *</Label>
                  <Input
                    id="legalGuardianName"
                    placeholder="Nome do pai, mãe ou tutor"
                    {...register('legalGuardianName')}
                    aria-invalid={!!errors.legalGuardianName}
                  />
                  {errors.legalGuardianName && (
                    <p className="text-xs text-destructive">{errors.legalGuardianName.message}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="legalGuardianPhone">Telefone do Responsável *</Label>
                  <Input
                    id="legalGuardianPhone"
                    placeholder="(92) 99999-9999"
                    {...register('legalGuardianPhone')}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Seção 3: Vínculo Eclesiástico */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {isMinor ? '3. Vínculo Eclesiástico' : '2. Vínculo Eclesiástico'}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label htmlFor="congregationId">Congregação *</Label>
                <Controller
                  name="congregationId"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="congregationId">
                        <SelectValue placeholder="Selecione a congregação" />
                      </SelectTrigger>
                      <SelectContent>
                        {congregations.map((cong) => (
                          <SelectItem key={cong.id} value={cong.id}>
                            {cong.name} {cong.isMain && '(Sede)'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.congregationId && (
                  <p className="text-xs text-destructive">{errors.congregationId.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="membershipStatus">Status de Membresia *</Label>
                <Controller
                  name="membershipStatus"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="membershipStatus">
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Ativo</SelectItem>
                        <SelectItem value="inactive">Inativo</SelectItem>
                        <SelectItem value="under_discipline">Sob Disciplina</SelectItem>
                        <SelectItem value="transferred">Transferido</SelectItem>
                        <SelectItem value="deceased">Falecido</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="admissionType">Tipo de Admissão</Label>
                <Controller
                  name="admissionType"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value || 'baptism'} onValueChange={field.onChange}>
                      <SelectTrigger id="admissionType">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="baptism">Batismo</SelectItem>
                        <SelectItem value="transfer">Transferência / Carta</SelectItem>
                        <SelectItem value="profession_of_faith">Profissão de Fé</SelectItem>
                        <SelectItem value="acclamation">Aclamação</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="admissionDate">Data de Admissão</Label>
                <Input id="admissionDate" type="date" {...register('admissionDate')} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="baptismDate">Data do Batismo nas Águas</Label>
                <Input id="baptismDate" type="date" {...register('baptismDate')} />
              </div>
            </div>
          </div>

          {/* Seção 4: Família & Endereço */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {isMinor ? '4. Família & Endereço' : '3. Família & Endereço'}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="familyId">Vínculo Familiar</Label>
                <Controller
                  name="familyId"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value || 'none'} onValueChange={(val) => field.onChange(val === 'none' ? '' : val)}>
                      <SelectTrigger id="familyId">
                        <SelectValue placeholder="Selecione uma família" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Sem família vinculada</SelectItem>
                        {families.map((fam) => (
                          <SelectItem key={fam.id} value={fam.id}>
                            {fam.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="familyRole">Papel Familiar</Label>
                <Controller
                  name="familyRole"
                  control={control}
                  render={({ field }) => (
                    <Select value={field.value || 'other'} onValueChange={field.onChange}>
                      <SelectTrigger id="familyRole">
                        <SelectValue placeholder="Papel" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="head">Chefe de Família / Responsável</SelectItem>
                        <SelectItem value="spouse">Cônjuge</SelectItem>
                        <SelectItem value="child">Filho(a)</SelectItem>
                        <SelectItem value="dependent">Dependente</SelectItem>
                        <SelectItem value="other">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="address">Endereço Residencial</Label>
                <Input id="address" placeholder="Rua, número, complemento" {...register('address')} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="neighborhood">Bairro</Label>
                <Input id="neighborhood" placeholder="Bairro" {...register('neighborhood')} />
              </div>
            </div>
          </div>

          {/* Seção 5: Observações */}
          <div className="space-y-1">
            <Label htmlFor="notes">Observações Pastorais / Secretaria</Label>
            <Textarea
              id="notes"
              rows={2}
              placeholder="Informações adicionais sobre o membro ou sua trajetória"
              {...register('notes')}
            />
          </div>

          <DialogFooter className="pt-2 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              <X className="h-4 w-4 mr-1.5" />
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-1.5">
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Salvar Cadastro
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
