import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Calendar,
  Clock,
  Plus,
  Search,
  CheckCircle2,
  Clock3,
  XCircle,
  UserCheck,
  Send,
  Pencil,
  Trash2,
} from 'lucide-react';
import type { Schedule, Ministry } from '../types';
import type { ScheduleFormData } from '../schemas';
import type { Member } from '@/modules/members/types';
import { ScheduleFormModal } from './ScheduleFormModal';
import { ConfirmationDialog } from '@/components/shared/ConfirmationDialog';
import { EmptyState } from '@/components/shared/EmptyState';
import { formatDate } from '@/utils/formatters';

export interface SchedulesTabProps {
  schedules: Schedule[];
  ministries: Ministry[];
  members: Member[];
  isLoading?: boolean;
  onSaveSchedule: (data: ScheduleFormData, id?: string) => Promise<void>;
  onDeleteSchedule: (id: string) => Promise<void>;
  onPublishSchedule: (id: string) => Promise<void>;
}

export const SchedulesTab: React.FC<SchedulesTabProps> = ({
  schedules,
  ministries,
  members,
  isLoading,
  onSaveSchedule,
  onDeleteSchedule,
  onPublishSchedule,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMinistry, setSelectedMinistry] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [scheduleToEdit, setScheduleToEdit] = useState<Schedule | null>(null);
  const [scheduleToDelete, setScheduleToDelete] = useState<Schedule | null>(null);

  const filteredSchedules = schedules.filter((schedule) => {
    if (selectedMinistry !== 'all' && schedule.ministryId !== selectedMinistry) {
      return false;
    }
    if (selectedStatus !== 'all' && schedule.status !== selectedStatus) {
      return false;
    }
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      const matchesTitle = schedule.title.toLowerCase().includes(query);
      const matchesMinistry = schedule.ministryName.toLowerCase().includes(query);
      const matchesVolunteer = schedule.volunteers.some((v) =>
        v.memberName.toLowerCase().includes(query)
      );
      if (!matchesTitle && !matchesMinistry && !matchesVolunteer) {
        return false;
      }
    }
    return true;
  });

  const handleOpenCreate = () => {
    setScheduleToEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (schedule: Schedule) => {
    setScheduleToEdit(schedule);
    setIsFormOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (scheduleToDelete) {
      await onDeleteSchedule(scheduleToDelete.id);
      setScheduleToDelete(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Barra de Ações & Filtros */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {/* Busca textual */}
          <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por culto ou voluntário..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>

          {/* Filtro por Ministério */}
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

          {/* Filtro por Status */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-9 text-xs rounded-md border border-input bg-background px-3 py-1 text-foreground"
          >
            <option value="all">Todos os Status</option>
            <option value="published">Publicadas</option>
            <option value="draft">Rascunhos</option>
            <option value="completed">Concluídas</option>
          </select>
        </div>

        <Button size="sm" onClick={handleOpenCreate} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          <span>Nova Escala</span>
        </Button>
      </div>

      {/* Conteúdo das Escalas */}
      {isLoading ? (
        <Card className="p-12 text-center text-sm text-muted-foreground flex flex-col items-center justify-center gap-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span>Carregando escalas de serviço...</span>
        </Card>
      ) : filteredSchedules.length === 0 ? (
        <Card>
          <EmptyState
            icon={Calendar}
            title="Nenhuma escala de serviço encontrada"
            description={
              searchTerm || selectedMinistry !== 'all' || selectedStatus !== 'all'
                ? 'Tente ajustar os filtros de busca para encontrar as escalas desejadas.'
                : 'Nenhuma escala planejada para os próximos cultos. Comece criando uma nova escala.'
            }
            actionLabel="Criar Escala"
            onAction={handleOpenCreate}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSchedules.map((schedule) => {
            const confirmedCount = schedule.volunteers.filter((v) => v.status === 'confirmed').length;
            const pendingCount = schedule.volunteers.filter((v) => v.status === 'pending').length;
            const declinedCount = schedule.volunteers.filter((v) => v.status === 'declined').length;

            return (
              <Card
                key={schedule.id}
                data-testid={`schedule-card-${schedule.id}`}
                className="p-5 border-border flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden"
              >
                {/* Linha colorida do ministério no topo */}
                <div
                  className="absolute top-0 left-0 right-0 h-1.5"
                  style={{ backgroundColor: schedule.ministryColor }}
                />

                <div className="space-y-3">
                  {/* Cabeçalho do Card */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-xs"
                          style={{ backgroundColor: schedule.ministryColor }}
                        >
                          {schedule.ministryName}
                        </span>
                        <Badge
                          variant={
                            schedule.status === 'published'
                              ? 'success'
                              : schedule.status === 'draft'
                              ? 'warning'
                              : 'secondary'
                          }
                          className="text-[10px]"
                        >
                          {schedule.status === 'published'
                            ? 'Publicada'
                            : schedule.status === 'draft'
                            ? 'Rascunho'
                            : 'Concluída'}
                        </Badge>
                      </div>
                      <h4 className="font-bold text-foreground text-sm mt-1.5 line-clamp-1">
                        {schedule.title}
                      </h4>
                    </div>

                    <div className="flex items-center gap-1">
                      {schedule.status === 'draft' && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs gap-1 border-primary/40 text-primary hover:bg-primary/10"
                          onClick={() => onPublishSchedule(schedule.id)}
                          title="Publicar escala e notificar voluntários"
                        >
                          <Send className="h-3 w-3" />
                          <span>Publicar</span>
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        onClick={() => handleOpenEdit(schedule)}
                        title="Editar escala"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        onClick={() => setScheduleToDelete(schedule)}
                        title="Excluir escala"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Informações de Data e Hora */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1.5 font-medium text-foreground">
                      <Calendar className="h-3.5 w-3.5 text-primary" />
                      {formatDate(schedule.date)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5" />
                      {schedule.startTime} às {schedule.endTime}
                    </span>
                  </div>

                  {schedule.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {schedule.description}
                    </p>
                  )}

                  {/* Resumo de Confirmação */}
                  <div className="flex items-center gap-3 text-[11px] pt-1">
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      {confirmedCount} confirmado(s)
                    </span>
                    {pendingCount > 0 && (
                      <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                        <Clock3 className="h-3.5 w-3.5" />
                        {pendingCount} pendente(s)
                      </span>
                    )}
                    {declinedCount > 0 && (
                      <span className="flex items-center gap-1 text-destructive font-medium">
                        <XCircle className="h-3.5 w-3.5" />
                        {declinedCount} recusa(s)
                      </span>
                    )}
                  </div>

                  {/* Lista de Voluntários Escalados */}
                  <div className="space-y-1.5 pt-2 border-t border-border">
                    <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Equipe Escalada ({schedule.volunteers.length})
                    </div>
                    <div className="space-y-1.5">
                      {schedule.volunteers.map((vol) => (
                        <div
                          key={vol.id}
                          className="flex items-center justify-between p-2 rounded-md bg-muted/40 text-xs"
                        >
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">
                              {vol.memberName.charAt(0)}
                            </div>
                            <div>
                              <div className="font-medium text-foreground">{vol.memberName}</div>
                              <div className="text-[10px] text-muted-foreground">{vol.roleName}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1.5">
                            {vol.status === 'confirmed' && (
                              <Badge variant="success" className="text-[10px] gap-1 py-0">
                                <CheckCircle2 className="h-3 w-3" />
                                Confirmado
                              </Badge>
                            )}
                            {vol.status === 'pending' && (
                              <Badge variant="warning" className="text-[10px] gap-1 py-0">
                                <Clock3 className="h-3 w-3" />
                                Pendente
                              </Badge>
                            )}
                            {vol.status === 'declined' && (
                              <Badge
                                variant="destructive"
                                className="text-[10px] gap-1 py-0"
                                title={vol.declineReason || 'Sem justificativa informada'}
                              >
                                <XCircle className="h-3 w-3" />
                                Recusado
                              </Badge>
                            )}
                            {vol.status === 'substituted' && (
                              <Badge variant="secondary" className="text-[10px] gap-1 py-0">
                                <UserCheck className="h-3 w-3" />
                                Substituído: {vol.substitutedByName}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {schedule.notes && (
                  <div className="mt-3 p-2 rounded bg-muted/30 border border-border/50 text-[11px] text-muted-foreground">
                    <strong>Instruções:</strong> {schedule.notes}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Modais */}
      <ScheduleFormModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        scheduleToEdit={scheduleToEdit}
        ministries={ministries}
        members={members}
        onSave={async (data) => {
          await onSaveSchedule(data, scheduleToEdit?.id);
        }}
      />

      <ConfirmationDialog
        open={Boolean(scheduleToDelete)}
        onOpenChange={(open) => {
          if (!open) setScheduleToDelete(null);
        }}
        title="Confirmar Exclusão de Escala"
        description={`Tem certeza que deseja excluir a escala "${scheduleToDelete?.title}"? Os voluntários notificados serão desvinculados desta data.`}
        confirmLabel="Excluir Escala"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};
