import React, { useState } from 'react';
import type { Congregation } from '@/modules/members/types';
import type { CongregationFormData } from '@/modules/members/schemas';
import { congregationFormSchema } from '@/modules/members/schemas';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { EmptyState } from '@/components/shared/EmptyState';
import {
  Building2,
  Plus,
  Crown,
  MapPin,
  Phone,
  Mail,
  Users,
  Save,
  X,
  Loader2,
} from 'lucide-react';

interface CongregationsTabProps {
  congregations: Congregation[];
  isLoading: boolean;
  onCreateCongregation: (data: CongregationFormData) => Promise<void>;
}

export const CongregationsTab: React.FC<CongregationsTabProps> = ({
  congregations,
  onCreateCongregation,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CongregationFormData>({
    resolver: zodResolver(congregationFormSchema),
    defaultValues: {
      name: '',
      leaderName: '',
      phone: '',
      email: '',
      city: 'Manaus',
      state: 'AM',
      address: '',
      neighborhood: '',
      postalCode: '',
      isMain: false,
    },
  });

  const isMainWatched = watch('isMain');

  const onSubmit = async (data: CongregationFormData) => {
    try {
      setIsSubmitting(true);
      await onCreateCongregation(data);
      reset();
      setIsModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Barra de Ações */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">Congregações & Filiais</h3>
          <p className="text-xs text-muted-foreground">
            Gerencie o templo sede e as congregações filiais vinculadas a esta igreja.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          <span>Nova Congregação</span>
        </Button>
      </div>

      {/* Grid de Congregações */}
      {congregations.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="Nenhuma congregação cadastrada"
          description="Cadastre as filiais ou o templo principal para estruturar os membros e eventos."
          actionLabel="Cadastrar Congregação"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {congregations.map((cong) => (
            <Card
              key={cong.id}
              className={`hover:border-primary/50 transition-all flex flex-col justify-between ${
                cong.isMain ? 'border-primary/40 bg-primary/5 shadow-sm' : ''
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div
                    className={`h-10 w-10 rounded-xl flex items-center justify-center ${
                      cong.isMain
                        ? 'bg-primary text-primary-foreground font-bold'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <Building2 className="h-5 w-5" />
                  </div>
                  {cong.isMain ? (
                    <Badge variant="default" className="gap-1 font-semibold text-xs">
                      <Crown className="h-3 w-3 text-amber-300" />
                      Templo Sede
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      Congregação Filial
                    </Badge>
                  )}
                </div>

                <CardTitle className="text-base mt-2">{cong.name}</CardTitle>
                <CardDescription className="text-xs">
                  {cong.leaderName ? `Pastor / Líder: ${cong.leaderName}` : 'Liderança não definida'}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-2.5 pt-0 text-xs text-muted-foreground flex-1">
                <div className="flex items-center gap-2">
                  <Users className="h-3.5 w-3.5 text-primary" />
                  <span className="font-semibold text-foreground">
                    {cong.membersCount} {cong.membersCount === 1 ? 'membro ativo' : 'membros ativos'}
                  </span>
                </div>

                {cong.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground mt-0.5 shrink-0" />
                    <span>
                      {cong.address}, {cong.neighborhood} — {cong.city}/{cong.state}
                    </span>
                  </div>
                )}

                <div className="flex flex-col gap-1 pt-1 border-t border-border">
                  {cong.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      <span>{cong.phone}</span>
                    </div>
                  )}
                  {cong.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-3 w-3 text-muted-foreground" />
                      <span className="truncate">{cong.email}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de Criação de Congregação */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Cadastrar Nova Congregação
            </DialogTitle>
            <DialogDescription>
              Cadastre uma nova filial ou congregação para gerenciamento compartilhado.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 pt-2">
            <div className="space-y-1">
              <Label htmlFor="c-name">Nome da Congregação *</Label>
              <Input
                id="c-name"
                placeholder="Ex: Filial Flores, Congregação Alvorada"
                {...register('name')}
                aria-invalid={!!errors.name}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="c-leader">Pastor / Líder Responsável *</Label>
              <Input
                id="c-leader"
                placeholder="Nome do pastor dirigente"
                {...register('leaderName')}
                aria-invalid={!!errors.leaderName}
              />
              {errors.leaderName && (
                <p className="text-xs text-destructive">{errors.leaderName.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="c-phone">Telefone</Label>
                <Input id="c-phone" placeholder="(92) 3333-4444" {...register('phone')} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="c-email">E-mail</Label>
                <Input
                  id="c-email"
                  type="email"
                  placeholder="filial@igreja.com.br"
                  {...register('email')}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1 col-span-2">
                <Label htmlFor="c-city">Cidade *</Label>
                <Input id="c-city" placeholder="Cidade" {...register('city')} />
                {errors.city && <p className="text-xs text-destructive">{errors.city.message}</p>}
              </div>
              <div className="space-y-1">
                <Label htmlFor="c-state">UF *</Label>
                <Input id="c-state" placeholder="AM" {...register('state')} />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="c-address">Endereço</Label>
              <Input id="c-address" placeholder="Av. Principal, 100" {...register('address')} />
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-card">
              <div className="space-y-0.5">
                <Label htmlFor="c-ismain" className="text-xs font-semibold cursor-pointer">
                  Definir como Templo Sede
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  Identifica a sede administrativa principal
                </p>
              </div>
              <Switch
                id="c-ismain"
                checked={isMainWatched}
                onCheckedChange={(checked) => setValue('isMain', checked)}
              />
            </div>

            <DialogFooter className="pt-2 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
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
                    Salvar Congregação
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
