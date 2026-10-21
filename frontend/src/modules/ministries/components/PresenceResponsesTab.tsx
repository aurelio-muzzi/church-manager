import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Clock3,
  XCircle,
  UserCheck,
  Search,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import type { Schedule, ScheduleVolunteer } from '../types';
import type { ScheduleResponseFormData } from '../schemas';
import type { Member } from '@/modules/members/types';
import { VolunteerResponseModal } from './VolunteerResponseModal';
import { formatDate } from '@/utils/formatters';

export interface PresenceResponsesTabProps {
  schedules: Schedule[];
  members: Member[];
  onRespond: (
    scheduleId: string,
    volunteerId: string,
    data: ScheduleResponseFormData
  ) => Promise<void>;
}

export const PresenceResponsesTab: React.FC<PresenceResponsesTabProps> = ({
  schedules,
  members,
  onRespond,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Modal response state
  const [activeModalData, setActiveModalData] = useState<{
    schedule: Schedule;
    volunteer: ScheduleVolunteer;
  } | null>(null);

  // Flatten all schedule volunteers for an aggregated view
  const allVolunteerSlots = schedules.flatMap((sch) =>
    sch.volunteers.map((vol) => ({
      schedule: sch,
      volunteer: vol,
    }))
  );

  const filteredSlots = allVolunteerSlots.filter(({ schedule, volunteer }) => {
    if (selectedStatus !== 'all' && volunteer.status !== selectedStatus) {
      return false;
    }
    if (searchTerm) {
      const query = searchTerm.toLowerCase();
      const matchesVolunteer = volunteer.memberName.toLowerCase().includes(query);
      const matchesSchedule = schedule.title.toLowerCase().includes(query);
      const matchesMinistry = schedule.ministryName.toLowerCase().includes(query);
      const matchesRole = volunteer.roleName.toLowerCase().includes(query);
      if (!matchesVolunteer && !matchesSchedule && !matchesMinistry && !matchesRole) {
        return false;
      }
    }
    return true;
  });

  const handleOpenResponse = (schedule: Schedule, volunteer: ScheduleVolunteer) => {
    setActiveModalData({ schedule, volunteer });
  };

  const handleQuickConfirm = async (scheduleId: string, volunteerId: string) => {
    await onRespond(scheduleId, volunteerId, { action: 'confirm' });
  };

  return (
    <div className="space-y-4">
      {/* Top Banner Explicativo */}
      <div className="p-3.5 rounded-lg bg-primary/5 border border-primary/20 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <Sparkles className="h-4 w-4 text-primary shrink-0" />
          <p className="text-muted-foreground">
            Painel de controle de confirmação e escala. Permite à liderança monitorar o engajamento e registrar respostas em nome dos voluntários.
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <div className="relative min-w-[200px] flex-1 sm:max-w-xs">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por voluntário ou culto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 h-9 text-xs"
            />
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-9 text-xs rounded-md border border-input bg-background px-3 py-1 text-foreground"
          >
            <option value="all">Todos os Status de Presença</option>
            <option value="pending">Pendentes de Resposta</option>
            <option value="confirmed">Confirmados</option>
            <option value="declined">Recusados (com motivo)</option>
            <option value="substituted">Substituídos</option>
          </select>
        </div>
      </div>

      {/* Grid de Escalações */}
      {filteredSlots.length === 0 ? (
        <Card className="p-12 text-center text-sm text-muted-foreground">
          Nenhuma presença ou escala encontrada para os critérios selecionados.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredSlots.map(({ schedule, volunteer }) => (
            <Card
              key={`${schedule.id}-${volunteer.id}`}
              data-testid={`presence-card-${schedule.id}-${volunteer.id}`}
              className="p-4 border-border flex flex-col justify-between hover:shadow-xs transition-shadow"
            >
              <div className="space-y-2.5">
                {/* Header com ministério e status */}
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-xs"
                    style={{ backgroundColor: schedule.ministryColor }}
                  >
                    {schedule.ministryName}
                  </span>

                  <div>
                    {volunteer.status === 'confirmed' && (
                      <Badge variant="success" className="text-[10px] gap-1 py-0">
                        <CheckCircle2 className="h-3 w-3" />
                        Confirmado
                      </Badge>
                    )}
                    {volunteer.status === 'pending' && (
                      <Badge variant="warning" className="text-[10px] gap-1 py-0">
                        <Clock3 className="h-3 w-3" />
                        Pendente
                      </Badge>
                    )}
                    {volunteer.status === 'declined' && (
                      <Badge variant="destructive" className="text-[10px] gap-1 py-0">
                        <XCircle className="h-3 w-3" />
                        Recusado
                      </Badge>
                    )}
                    {volunteer.status === 'substituted' && (
                      <Badge variant="secondary" className="text-[10px] gap-1 py-0">
                        <UserCheck className="h-3 w-3" />
                        Substituído
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Nome do Voluntário e Função */}
                <div>
                  <h4 className="font-bold text-foreground text-sm">
                    {volunteer.memberName}
                  </h4>
                  <div className="text-xs text-muted-foreground font-medium">
                    {volunteer.roleName}
                  </div>
                </div>

                {/* Detalhes do Culto */}
                <div className="p-2 rounded bg-muted/40 text-xs space-y-1">
                  <div className="font-semibold text-foreground line-clamp-1">
                    {schedule.title}
                  </div>
                  <div className="flex items-center gap-3 text-muted-foreground text-[11px]">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(schedule.date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {schedule.startTime} às {schedule.endTime}
                    </span>
                  </div>
                </div>

                {/* Justificativa de Recusa ou Substituto */}
                {volunteer.status === 'declined' && volunteer.declineReason && (
                  <div className="p-2 rounded bg-destructive/10 border border-destructive/20 text-xs text-destructive space-y-0.5">
                    <span className="font-bold text-[11px] flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" />
                      Motivo da Recusa:
                    </span>
                    <p className="text-[11px] italic">"{volunteer.declineReason}"</p>
                  </div>
                )}

                {volunteer.status === 'substituted' && volunteer.substitutedByName && (
                  <div className="p-2 rounded bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-900 dark:text-indigo-300">
                    <span className="font-bold text-[11px]">Substituto indicado:</span>{' '}
                    <strong>{volunteer.substitutedByName}</strong>
                  </div>
                )}
              </div>

              {/* Botões de Ação */}
              <div className="mt-3 pt-2.5 border-t border-border flex items-center justify-end gap-1.5">
                {volunteer.status === 'pending' && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs gap-1 border-emerald-600/40 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/10"
                    onClick={() => handleQuickConfirm(schedule.id, volunteer.id)}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Confirmar</span>
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground"
                  onClick={() => handleOpenResponse(schedule, volunteer)}
                >
                  <span>Alterar Resposta</span>
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de Resposta */}
      <VolunteerResponseModal
        open={Boolean(activeModalData)}
        onOpenChange={(open) => {
          if (!open) setActiveModalData(null);
        }}
        schedule={activeModalData?.schedule || null}
        volunteer={activeModalData?.volunteer || null}
        availableMembers={members}
        onRespond={async (data) => {
          if (activeModalData) {
            await onRespond(
              activeModalData.schedule.id,
              activeModalData.volunteer.id,
              data
            );
            setActiveModalData(null);
          }
        }}
      />
    </div>
  );
};
