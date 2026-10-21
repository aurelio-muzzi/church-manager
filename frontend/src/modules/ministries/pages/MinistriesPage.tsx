import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PageHeader } from '@/components/shared/PageHeader';
import { MetricKpiCard } from '@/components/shared/MetricKpiCard';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useToast } from '@/hooks/useToast';
import {
  Sparkles,
  Users,
  Calendar,
  Clock,
  CheckCircle2,
  CalendarDays,
  UserCheck,
} from 'lucide-react';
import { ministryService } from '@/services/api/ministryService';
import { secretariaService } from '@/services/api/secretariaService';
import { SchedulesTab } from '../components/SchedulesTab';
import { MinistriesTab } from '../components/MinistriesTab';
import { VolunteersTab } from '../components/VolunteersTab';
import { PresenceResponsesTab } from '../components/PresenceResponsesTab';
import type {
  MinistryFormData,
  MinistryRoleFormData,
  ScheduleFormData,
  VolunteerAssignFormData,
  ScheduleResponseFormData,
} from '../schemas';

export const MinistriesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { success, error } = useToast();
  const [activeTab, setActiveTab] = useState('schedules');

  // Queries
  const { data: metrics, isLoading: isMetricsLoading } = useQuery({
    queryKey: ['ministries', 'metrics'],
    queryFn: () => ministryService.getSummaryMetrics(),
  });

  const { data: ministries = [], isLoading: isMinistriesLoading } = useQuery({
    queryKey: ['ministries', 'list'],
    queryFn: () => ministryService.getMinistries(),
  });

  const { data: volunteers = [], isLoading: isVolunteersLoading } = useQuery({
    queryKey: ['ministries', 'volunteers'],
    queryFn: () => ministryService.getVolunteers(),
  });

  const { data: schedules = [], isLoading: isSchedulesLoading } = useQuery({
    queryKey: ['ministries', 'schedules'],
    queryFn: () => ministryService.getSchedules(),
  });

  const { data: members = [] } = useQuery({
    queryKey: ['secretaria', 'members'],
    queryFn: () => secretariaService.getMembers(),
  });

  // Mutations
  const saveScheduleMutation = useMutation({
    mutationFn: async ({ data, id }: { data: ScheduleFormData; id?: string }) => {
      if (id) {
        return ministryService.updateSchedule(id, data);
      }
      return ministryService.createSchedule(data);
    },
    onSuccess: (schedule, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ministries'] });
      if (variables.id) {
        success('Escala Atualizada', `A escala "${schedule.title}" foi salva.`);
      } else {
        success('Escala Criada', `A escala "${schedule.title}" foi planejada com sucesso.`);
      }
    },
    onError: (err: Error) => {
      error('Erro ao Salvar Escala', err.message || 'Falha ao salvar a escala de serviço.');
    },
  });

  const deleteScheduleMutation = useMutation({
    mutationFn: (id: string) => ministryService.deleteSchedule(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ministries'] });
      success('Escala Excluída', 'A escala foi removida do calendário eclesiástico.');
    },
    onError: (err: Error) => {
      error('Erro ao Excluir Escala', err.message);
    },
  });

  const publishScheduleMutation = useMutation({
    mutationFn: (id: string) => ministryService.publishSchedule(id),
    onSuccess: (schedule) => {
      queryClient.invalidateQueries({ queryKey: ['ministries'] });
      success(
        'Escala Publicada com Sucesso!',
        `A escala "${schedule.title}" foi publicada e seus voluntários foram convocados.`
      );
    },
    onError: (err: Error) => {
      error('Erro ao Publicar Escala', err.message);
    },
  });

  const saveMinistryMutation = useMutation({
    mutationFn: async ({ data, id }: { data: MinistryFormData; id?: string }) => {
      if (id) {
        return ministryService.updateMinistry(id, data);
      }
      return ministryService.createMinistry(data);
    },
    onSuccess: (ministry, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ministries'] });
      if (variables.id) {
        success('Ministério Atualizado', `As alterações no "${ministry.name}" foram salvas.`);
      } else {
        success('Ministério Cadastrado', `O ministério "${ministry.name}" foi criado com sucesso.`);
      }
    },
    onError: (err: Error) => {
      error('Erro ao Salvar Ministério', err.message);
    },
  });

  const deleteMinistryMutation = useMutation({
    mutationFn: (id: string) => ministryService.deleteMinistry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ministries'] });
      success('Ministério Excluído', 'O departamento foi desvinculado com sucesso.');
    },
    onError: (err: Error) => {
      error('Erro ao Excluir Ministério', err.message);
    },
  });

  const addRoleMutation = useMutation({
    mutationFn: ({ ministryId, data }: { ministryId: string; data: MinistryRoleFormData }) =>
      ministryService.addMinistryRole(ministryId, data),
    onSuccess: (role) => {
      queryClient.invalidateQueries({ queryKey: ['ministries'] });
      success('Função Adicionada', `A função "${role.name}" foi vinculada ao ministério.`);
    },
    onError: (err: Error) => {
      error('Erro ao Adicionar Função', err.message);
    },
  });

  const assignVolunteerMutation = useMutation({
    mutationFn: (data: VolunteerAssignFormData) => ministryService.assignVolunteer(data),
    onSuccess: (vol) => {
      queryClient.invalidateQueries({ queryKey: ['ministries'] });
      success('Voluntário Vinculado', `${vol.memberName} agora integra o ministério como ${vol.roleName}.`);
    },
    onError: (err: Error) => {
      error('Erro ao Vincular Voluntário', err.message);
    },
  });

  const removeVolunteerMutation = useMutation({
    mutationFn: (volunteerId: string) => ministryService.removeVolunteer(volunteerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ministries'] });
      success('Voluntário Desvinculado', 'O vínculo com o ministério foi removido.');
    },
    onError: (err: Error) => {
      error('Erro ao Desvincular Voluntário', err.message);
    },
  });

  const respondScheduleMutation = useMutation({
    mutationFn: ({
      scheduleId,
      volunteerId,
      data,
    }: {
      scheduleId: string;
      volunteerId: string;
      data: ScheduleResponseFormData;
    }) => ministryService.respondToSchedule(scheduleId, volunteerId, data),
    onSuccess: (_res, variables) => {
      queryClient.invalidateQueries({ queryKey: ['ministries'] });
      if (variables.data.action === 'confirm') {
        success('Presença Confirmada!', 'A disponibilidade para o culto foi confirmada com sucesso.');
      } else if (variables.data.action === 'decline') {
        success('Recusa Registrada', 'A liderança foi notificada com a justificativa de ausência.');
      } else {
        success('Substituição Solicitada', 'O voluntário substituto foi indicado para a escala.');
      }
    },
    onError: (err: Error) => {
      error('Erro ao Gravar Resposta', err.message);
    },
  });

  return (
    <div className="space-y-6">
      {/* Cabeçalho da Página */}
      <PageHeader
        title="Ministérios & Escalas de Voluntários"
        description="Gestão de departamentos eclesiásticos, alocação de equipes voluntárias e escalas dominicais com prevenção de sobreposição de horários."
        breadcrumbs={[
          { label: 'Administração', href: '/admin' },
          { label: 'Ministérios & Voluntários' },
        ]}
      />

      {/* Grid de KPIs do Módulo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <MetricKpiCard
          title="Total de Ministérios"
          value={metrics?.totalMinistries ?? 0}
          icon={Sparkles}
          iconVariant="indigo"
          isLoading={isMetricsLoading}
        />
        <MetricKpiCard
          title="Voluntários Ativos"
          value={metrics?.activeVolunteers ?? 0}
          icon={Users}
          iconVariant="emerald"
          isLoading={isMetricsLoading}
        />
        <MetricKpiCard
          title="Escalas Publicadas"
          value={metrics?.publishedSchedules ?? 0}
          icon={Calendar}
          iconVariant="purple"
          isLoading={isMetricsLoading}
        />
        <MetricKpiCard
          title="Confirmações Pendentes"
          value={metrics?.pendingConfirmations ?? 0}
          icon={Clock}
          iconVariant="amber"
          isLoading={isMetricsLoading}
        />
        <MetricKpiCard
          title="Presenças Confirmadas"
          value={metrics?.confirmedPresences ?? 0}
          icon={CheckCircle2}
          iconVariant="emerald"
          isLoading={isMetricsLoading}
        />
      </div>

      {/* Navegação por Abas Especializadas */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-muted/70 p-1 border border-border">
          <TabsTrigger
            value="schedules"
            onClick={() => setActiveTab('schedules')}
            className="gap-2 text-xs"
          >
            <CalendarDays className="h-4 w-4" />
            <span>Escalas de Serviço</span>
          </TabsTrigger>

          <TabsTrigger
            value="ministries"
            onClick={() => setActiveTab('ministries')}
            className="gap-2 text-xs"
          >
            <Sparkles className="h-4 w-4" />
            <span>Ministérios & Funções</span>
          </TabsTrigger>

          <TabsTrigger
            value="volunteers"
            onClick={() => setActiveTab('volunteers')}
            className="gap-2 text-xs"
          >
            <Users className="h-4 w-4" />
            <span>Equipes de Voluntários</span>
          </TabsTrigger>

          <TabsTrigger
            value="responses"
            onClick={() => setActiveTab('responses')}
            className="gap-2 text-xs"
          >
            <UserCheck className="h-4 w-4" />
            <span>Confirmações de Presença</span>
            {metrics?.pendingConfirmations ? (
              <span className="ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300">
                {metrics.pendingConfirmations}
              </span>
            ) : null}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="schedules" className="m-0 focus-visible:outline-none">
          <SchedulesTab
            schedules={schedules}
            ministries={ministries}
            members={members}
            isLoading={isSchedulesLoading}
            onSaveSchedule={async (data, id) => {
              await saveScheduleMutation.mutateAsync({ data, id });
            }}
            onDeleteSchedule={async (id) => {
              await deleteScheduleMutation.mutateAsync(id);
            }}
            onPublishSchedule={async (id) => {
              await publishScheduleMutation.mutateAsync(id);
            }}
          />
        </TabsContent>

        <TabsContent value="ministries" className="m-0 focus-visible:outline-none">
          <MinistriesTab
            ministries={ministries}
            members={members}
            isLoading={isMinistriesLoading}
            onSaveMinistry={async (data, id) => {
              await saveMinistryMutation.mutateAsync({ data, id });
            }}
            onDeleteMinistry={async (id) => {
              await deleteMinistryMutation.mutateAsync(id);
            }}
            onAddRole={async (ministryId, data) => {
              await addRoleMutation.mutateAsync({ ministryId, data });
            }}
          />
        </TabsContent>

        <TabsContent value="volunteers" className="m-0 focus-visible:outline-none">
          <VolunteersTab
            volunteers={volunteers}
            ministries={ministries}
            members={members}
            isLoading={isVolunteersLoading}
            onAssignVolunteer={async (data) => {
              await assignVolunteerMutation.mutateAsync(data);
            }}
            onRemoveVolunteer={async (id) => {
              await removeVolunteerMutation.mutateAsync(id);
            }}
          />
        </TabsContent>

        <TabsContent value="responses" className="m-0 focus-visible:outline-none">
          <PresenceResponsesTab
            schedules={schedules}
            members={members}
            onRespond={async (scheduleId, volunteerId, data) => {
              await respondScheduleMutation.mutateAsync({ scheduleId, volunteerId, data });
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};
