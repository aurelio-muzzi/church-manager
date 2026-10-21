import React, { useState } from 'react';
import type { Family } from '@/modules/members/types';
import type { FamilyFormData } from '@/modules/members/schemas';
import { familyFormSchema } from '@/modules/members/schemas';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { EmptyState } from '@/components/shared/EmptyState';
import { Heart, Plus, Users, MapPin, Crown, Save, X, Loader2 } from 'lucide-react';

interface FamiliesTabProps {
  families: Family[];
  isLoading: boolean;
  onCreateFamily: (data: FamilyFormData) => Promise<void>;
}

export const FamiliesTab: React.FC<FamiliesTabProps> = ({
  families,
  onCreateFamily,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FamilyFormData>({
    resolver: zodResolver(familyFormSchema),
    defaultValues: {
      name: '',
      address: '',
      notes: '',
    },
  });

  const onSubmit = async (data: FamilyFormData) => {
    try {
      setIsSubmitting(true);
      await onCreateFamily(data);
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
          <h3 className="text-base font-semibold text-foreground">Núcleos Familiares</h3>
          <p className="text-xs text-muted-foreground">
            Acompanhe a composição das famílias da igreja e seus laços de comunhão.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          <span>Cadastrar Família</span>
        </Button>
      </div>

      {/* Grid de Famílias */}
      {families.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="Nenhuma família cadastrada"
          description="Cadastre as famílias da igreja para acompanhar cônjuges e filhos de forma agrupada."
          actionLabel="Cadastrar Família"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {families.map((family) => (
            <Card key={family.id} className="hover:border-primary/50 transition-all flex flex-col justify-between">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="h-10 w-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                    <Heart className="h-5 w-5" />
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {family.membersCount} {family.membersCount === 1 ? 'membro' : 'membros'}
                  </Badge>
                </div>
                <CardTitle className="text-base mt-2">{family.name}</CardTitle>
                {family.headMemberName && (
                  <CardDescription className="flex items-center gap-1.5 text-xs">
                    <Crown className="h-3.5 w-3.5 text-amber-500" />
                    Responsável: <span className="font-semibold text-foreground">{family.headMemberName}</span>
                  </CardDescription>
                )}
              </CardHeader>

              <CardContent className="space-y-3 pt-0 text-xs text-muted-foreground flex-1">
                {family.address && (
                  <div className="flex items-start gap-1.5">
                    <MapPin className="h-3.5 w-3.5 mt-0.5 shrink-0 text-primary" />
                    <span className="line-clamp-2">{family.address}</span>
                  </div>
                )}

                {family.members && family.members.length > 0 && (
                  <div className="pt-2 border-t border-border space-y-1.5">
                    <span className="font-semibold text-[11px] uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                      <Users className="h-3 w-3" /> Membros Integrantes:
                    </span>
                    <div className="flex flex-wrap gap-1.5 pt-0.5">
                      {family.members.map((m) => (
                        <Badge
                          key={m.id}
                          variant={m.familyRole === 'head' ? 'default' : 'secondary'}
                          className="text-[11px] font-normal"
                        >
                          {m.name} ({m.familyRole === 'head' ? 'Chefe' : m.familyRole === 'spouse' ? 'Cônjuge' : 'Filho'})
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {family.notes && (
                  <p className="italic text-[11px] text-muted-foreground/80 pt-1 line-clamp-2">
                    "{family.notes}"
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de Criação de Família */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-rose-500" />
              Cadastrar Novo Núcleo Familiar
            </DialogTitle>
            <DialogDescription>
              Informe o nome da família e o endereço de residência.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 pt-2">
            <div className="space-y-1">
              <Label htmlFor="fam-name">Nome da Família *</Label>
              <Input
                id="fam-name"
                placeholder="Ex: Família Oliveira"
                {...register('name')}
                aria-invalid={!!errors.name}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-1">
              <Label htmlFor="fam-address">Endereço Residencial</Label>
              <Input
                id="fam-address"
                placeholder="Rua, número, bairro, cidade"
                {...register('address')}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="fam-notes">Observações</Label>
              <Textarea
                id="fam-notes"
                rows={2}
                placeholder="Anotações pastorais sobre a família"
                {...register('notes')}
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
                    Salvar Família
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
