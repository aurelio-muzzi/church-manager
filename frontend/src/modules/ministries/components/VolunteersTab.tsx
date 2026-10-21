import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  UserPlus,
  Search,
  Users,
  Trash2,
  Mail,
  Phone,
  Tag,
} from 'lucide-react';
import type { Ministry, MinistryVolunteer } from '../types';
import { volunteerAssignFormSchema, type VolunteerAssignFormData } from '../schemas';
import type { Member } from '@/modules/members/types';
import { ConfirmationDialog } from '@/components/shared/ConfirmationDialog';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatDate } from '@/utils/formatters';

export interface VolunteersTabProps {
  volunteers: MinistryVolunteer[];
  ministries: Ministry[];
  members: Member[];
  isLoading?: boolean;
  onAssignVolunteer: (data: VolunteerAssignFormData) => Promise<void>;
  onRemoveVolunteer: (volunteerId: string) => Promise<void>;
}

export const VolunteersTab: React.FC<VolunteersTabProps> = ({
  volunteers,
  ministries,
  members,
  isLoading,
  onAssignVolunteer,
  onRemoveVolunteer,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMinistry, setSelectedMinistry] = useState('all');

  // Modal states
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [volunteerToRemove, setVolunteerToRemove] = useState<MinistryVolunteer | null>(null);

  // Form for Assign Volunteer
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<VolunteerAssignFormData>({
    resolver: zodResolver(volunteerAssignFormSchema),
    defaultValues: {
      ministryId: ministries[0]?.id || '',
      memberId: members[0]?.id || '',
      roleId: ministries[0]?.roles?.[0]?.id || '',
    },
  });

  const watchedMinistryId = watch('ministryId');
  const targetMinistry = ministries.find((m) => m.id === watchedMinistryId);
  const availableRoles = targetMinistry?.roles || [];

  const handleOpenAssignModal = () => {
    reset({
      ministryId: ministries[0]?.id || '',
      memberId: members[0]?.id || '',
      roleId: ministries[0]?.roles?.[0]?.id || '',
    });
    setIsAssignModalOpen(true);
  };

  const onAssignSubmit = async (data: VolunteerAssignFormData) => {
    await onAssignVolunteer(data);
    setIsAssignModalOpen(false);
  };

  const filteredVolunteers = volunteers.filter((vol) => {
    if (selectedMinistry !== 'all' && vol.ministryId !== selectedMinistry) {
      return false;
    }
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      const matchesName = vol.memberName.toLowerCase().includes(query);
      const matchesMinistry = vol.ministryName.toLowerCase().includes(query);
      const matchesRole = vol.roleName.toLowerCase().includes(query);
      if (!matchesName && !matchesMinistry && !matchesRole) return false;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Barra de Filtros & Ações */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar voluntário por nome ou função..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>

          <select
            value={selectedMinistry}
            onChange={(e) => setSelectedMinistry(e.target.value)}
            className="h-9 text-xs rounded-md border border-input bg-background px-3 py-1 text-foreground"
          >
            <option value="all">Todos os Ministérios</option>
            {ministries.map((min) => (
              <option key={min.id} value={min.id}>
                {min.name}
              </option>
            ))}
          </select>
        </div>

        <Button size="sm" onClick={handleOpenAssignModal} className="gap-2 shrink-0">
          <UserPlus className="h-4 w-4" />
          <span>Vincular Voluntário</span>
        </Button>
      </div>

      {isLoading ? (
        <Card className="p-12 text-center text-sm text-muted-foreground flex flex-col items-center justify-center gap-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span>Carregando voluntários...</span>
        </Card>
      ) : filteredVolunteers.length === 0 ? (
        <Card>
          <EmptyState
            icon={Users}
            title="Nenhum voluntário encontrado"
            description={
              searchTerm || selectedMinistry !== 'all'
                ? 'Tente ajustar os filtros de busca para encontrar o voluntário desejado.'
                : 'Nenhum membro vinculado aos ministérios. Clique em "Vincular Voluntário" para iniciar.'
            }
            actionLabel="Vincular Voluntário"
            onAction={handleOpenAssignModal}
          />
        </Card>
      ) : (
        <Card className="overflow-hidden border-border">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="text-xs uppercase bg-muted/50 text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-4 py-3 font-semibold">Voluntário</th>
                  <th className="px-4 py-3 font-semibold">Ministério & Função</th>
                  <th className="px-4 py-3 font-semibold hidden md:table-cell">Contato</th>
                  <th className="px-4 py-3 font-semibold hidden lg:table-cell">Membro Desde</th>
                  <th className="px-4 py-3 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredVolunteers.map((vol) => {
                  const ministry = ministries.find((m) => m.id === vol.ministryId);
                  const initials = vol.memberName
                    .split(' ')
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((p) => p[0].toUpperCase())
                    .join('');

                  return (
                    <tr
                      key={vol.id}
                      data-testid={`volunteer-row-${vol.id}`}
                      className="hover:bg-muted/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8 text-xs font-semibold">
                            <AvatarFallback>{initials}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold text-foreground">{vol.memberName}</div>
                            <div className="text-[11px] text-muted-foreground">ID: {vol.memberId}</div>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <span
                            className="inline-block px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-xs"
                            style={{ backgroundColor: ministry?.color || '#4f46e5' }}
                          >
                            {vol.ministryName}
                          </span>
                          <div className="flex items-center gap-1 text-xs font-medium text-foreground">
                            <Tag className="h-3 w-3 text-primary" />
                            <span>{vol.roleName}</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 hidden md:table-cell text-xs text-muted-foreground">
                        {vol.memberPhone && (
                          <div className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            <span>{vol.memberPhone}</span>
                          </div>
                        )}
                        {vol.memberEmail && (
                          <div className="flex items-center gap-1 text-[11px] mt-0.5">
                            <Mail className="h-3 w-3" />
                            <span className="truncate max-w-[180px]">{vol.memberEmail}</span>
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3 hidden lg:table-cell text-xs text-muted-foreground">
                        {formatDate(vol.joinedAt)}
                      </td>

                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => setVolunteerToRemove(vol)}
                          title="Desvincular voluntário"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Modal Vincular Voluntário */}
      <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Vincular Membro a Ministério</DialogTitle>
            <DialogDescription>
              Selecione o membro, o ministério e atribua a função correspondente.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onAssignSubmit)} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="v-member" className="text-xs font-semibold">
                Membro da Igreja *
              </Label>
              <select
                id="v-member"
                className="w-full text-xs h-9 rounded-md border border-input bg-background px-3 py-1 text-foreground"
                {...register('memberId')}
              >
                {members.map((mem) => (
                  <option key={mem.id} value={mem.id}>
                    {mem.name} ({mem.phone || 'Sem telefone'})
                  </option>
                ))}
              </select>
              {errors.memberId && (
                <p className="text-[11px] text-destructive">{errors.memberId.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="v-ministry" className="text-xs font-semibold">
                Ministério de Atuação *
              </Label>
              <select
                id="v-ministry"
                className="w-full text-xs h-9 rounded-md border border-input bg-background px-3 py-1 text-foreground"
                {...register('ministryId')}
              >
                {ministries.map((min) => (
                  <option key={min.id} value={min.id}>
                    {min.name}
                  </option>
                ))}
              </select>
              {errors.ministryId && (
                <p className="text-[11px] text-destructive">{errors.ministryId.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="v-role" className="text-xs font-semibold">
                Função Atribuída *
              </Label>
              <select
                id="v-role"
                className="w-full text-xs h-9 rounded-md border border-input bg-background px-3 py-1 text-foreground"
                {...register('roleId')}
              >
                <option value="">Selecione a função...</option>
                {availableRoles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
              {errors.roleId && (
                <p className="text-[11px] text-destructive">{errors.roleId.message}</p>
              )}
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isSubmitting}
                onClick={() => setIsAssignModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" size="sm" disabled={isSubmitting}>
                {isSubmitting ? 'Salvando vínculo...' : 'Concluir Vínculo'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmação de Desassociação */}
      <ConfirmationDialog
        open={Boolean(volunteerToRemove)}
        onOpenChange={(open) => {
          if (!open) setVolunteerToRemove(null);
        }}
        title="Confirmar Desvinculação de Voluntário"
        description={`Tem certeza que deseja desvincular "${volunteerToRemove?.memberName}" do "${volunteerToRemove?.ministryName}"? Ele(a) continuará como membro regular da igreja.`}
        confirmLabel="Desvincular Voluntário"
        isDestructive={true}
        onConfirm={async () => {
          if (volunteerToRemove) {
            await onRemoveVolunteer(volunteerToRemove.id);
            setVolunteerToRemove(null);
          }
        }}
      />
    </div>
  );
};
