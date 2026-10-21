import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { MetricKpiCard } from '@/components/shared/MetricKpiCard';
import { useToast } from '@/hooks/useToast';
import { eventService } from '@/services/api/eventService';
import { secretariaService } from '@/services/api/secretariaService';
import {
  Calendar,
  Sparkles,
  Ticket,
  UserCheck,
  Percent,
} from 'lucide-react';
import type { ChurchEvent, CheckInResult } from '../types';
import type {
  EventFormData,
  EventRegistrationFormData,
} from '../schemas';

import { EventsListView } from '../components/EventsListView';
import { EventsCalendarView } from '../components/EventsCalendarView';
import { EventRegistrationsTab } from '../components/EventRegistrationsTab';
import { EventAttendanceTab } from '../components/EventAttendanceTab';
import { EventFormModal } from '../components/EventFormModal';

export const EventsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('events');
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<ChurchEvent | null>(null);

  const queryClient = useQueryClient();
  const { success, error } = useToast();

  // Queries
  const { data: metrics } = useQuery({
    queryKey: ['events', 'metrics'],
    queryFn: () => eventService.getSummaryMetrics(),
  });

  const { data: events = [] } = useQuery({
    queryKey: ['events', 'list'],
    queryFn: () => eventService.getEvents(),
  });

  const { data: registrations = [] } = useQuery({
    queryKey: ['events', 'registrations'],
    queryFn: () => eventService.getRegistrations(),
  });

  const { data: congregations = [] } = useQuery({
    queryKey: ['secretaria', 'congregations'],
    queryFn: () => secretariaService.getCongregations(),
  });

  const { data: members = [] } = useQuery({
    queryKey: ['secretaria', 'members'],
    queryFn: () => secretariaService.getMembers(),
  });

  const { data: visitors = [] } = useQuery({
    queryKey: ['secretaria', 'visitors'],
    queryFn: () => secretariaService.getVisitors(),
  });

  // Pega registros de presença do evento ativo
  const { data: attendanceRecords = [] } = useQuery({
    queryKey: ['events', 'attendance'],
    queryFn: async () => {
      const records = await Promise.all(
        events.map((e) => eventService.getAttendanceRecords(e.id))
      );
      return records.flat();
    },
    enabled: events.length > 0,
  });

  // Mutations
  const saveEventMutation = useMutation({
    mutationFn: async ({ data, id }: { data: EventFormData; id?: string }) => {
      if (id) {
        return eventService.updateEvent(id, data);
      }
      return eventService.createEvent(data);
    },
    onSuccess: (event, variables) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      if (variables.id) {
        success('Evento Atualizado', `O evento "${event.title}" foi salvo com sucesso.`);
      } else {
        success('Evento Criado', `O evento "${event.title}" foi agendado com sucesso.`);
      }
    },
    onError: (err: Error) => {
      error('Erro ao Salvar Evento', err.message || 'Falha ao salvar evento.');
    },
  });

  const cancelEventMutation = useMutation({
    mutationFn: (id: string) => eventService.cancelEvent(id),
    onSuccess: (event) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      success('Evento Cancelado', `O evento "${event.title}" foi marcado como cancelado.`);
    },
    onError: (err: Error) => {
      error('Erro ao Cancelar', err.message);
    },
  });

  const registrationMutation = useMutation({
    mutationFn: async ({
      eventId,
      data,
    }: {
      eventId: string;
      data: EventRegistrationFormData;
    }) => {
      return eventService.registerForEvent(eventId, data);
    },
    onSuccess: (reg) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      success(
        'Inscrição Confirmada!',
        `Ingresso [${reg.ticketCode}] emitido para ${reg.attendeeName}.`
      );
    },
    onError: (err: Error) => {
      error('Erro na Inscrição', err.message);
    },
  });

  const cancelRegistrationMutation = useMutation({
    mutationFn: (id: string) => eventService.cancelRegistration(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      success('Inscrição Cancelada', 'A inscrição foi cancelada com sucesso.');
    },
  });

  const manualCheckInMutation = useMutation({
    mutationFn: async ({
      eventId,
      attendeeId,
      attendeeType,
      attendeeName,
      notes,
    }: {
      eventId: string;
      attendeeId: string;
      attendeeType: 'member' | 'visitor';
      attendeeName: string;
      notes?: string;
    }): Promise<CheckInResult> => {
      return eventService.recordManualCheckIn(eventId, {
        attendeeId,
        attendeeType,
        attendeeName,
        notes,
      });
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      if (res.success) {
        success('Presença Confirmada!', res.message);
      } else {
        error('Aviso de Portaria', res.message);
      }
    },
  });

  const qrCheckInMutation = useMutation({
    mutationFn: async ({
      eventId,
      qrCode,
    }: {
      eventId: string;
      qrCode: string;
    }): Promise<CheckInResult> => {
      return eventService.recordQRCodeCheckIn(eventId, qrCode);
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      if (res.success) {
        success('QR Code Validado!', res.message);
      } else {
        error('Validação de Ingresso', res.message);
      }
    },
  });

  // Handlers
  const handleOpenCheckIn = (_event: ChurchEvent) => {
    setActiveTab('attendance');
  };

  const handleEditEvent = (event: ChurchEvent) => {
    setEventToEdit(event);
    setIsEventModalOpen(true);
  };

  const handleNewEvent = () => {
    setEventToEdit(null);
    setIsEventModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho e Breadcrumbs */}
      <div className="space-y-2 mb-6">
        <Breadcrumbs
          items={[
            { label: 'Administração', href: '/admin' },
            { label: 'Eventos & Presença', href: '/admin/events' },
          ]}
        />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Cultos, Eventos & Controle de Presença
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Agenda eclesiástica, inscrições em conferências, check-in manual na portaria e leitor de QR Code.
            </p>
          </div>
        </div>
      </div>

      {/* Cartões KPI Executivos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <MetricKpiCard
          title="Total de Eventos"
          value={metrics?.totalEvents ?? '...'}
          icon={Calendar}
          description="Agendados e realizados"
        />
        <MetricKpiCard
          title="Próximos Cultos"
          value={metrics?.upcomingServices ?? '...'}
          icon={Sparkles}
          description="Cultos congregacionais"
        />
        <MetricKpiCard
          title="Inscrições Confirmadas"
          value={metrics?.totalRegistrations ?? '...'}
          icon={Ticket}
          description="Congressos e retiros"
        />
        <MetricKpiCard
          title="Presenças Registradas"
          value={metrics?.totalAttendance ?? '...'}
          icon={UserCheck}
          description="Lançamentos nas portarias"
        />
        <MetricKpiCard
          title="Taxa Média Check-in"
          value={metrics ? `${metrics.checkInRate}%` : '...'}
          icon={Percent}
          description="Conversão de presença"
        />
      </div>

      {/* Abas Principais do Módulo */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full h-auto p-1 bg-muted/60">
          <TabsTrigger
            value="events"
            onClick={() => setActiveTab('events')}
            className="text-xs py-2 data-[state=active]:bg-background"
          >
            Lista de Eventos
          </TabsTrigger>
          <TabsTrigger
            value="calendar"
            onClick={() => setActiveTab('calendar')}
            className="text-xs py-2 data-[state=active]:bg-background"
          >
            Calendário / Agenda
          </TabsTrigger>
          <TabsTrigger
            value="registrations"
            onClick={() => setActiveTab('registrations')}
            className="text-xs py-2 data-[state=active]:bg-background"
          >
            Inscrições & Participantes
          </TabsTrigger>
          <TabsTrigger
            value="attendance"
            onClick={() => setActiveTab('attendance')}
            className="text-xs py-2 data-[state=active]:bg-background"
          >
            Portaria & Check-in
          </TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="focus-visible:outline-hidden">
          <EventsListView
            events={events}
            congregations={congregations}
            onNewEvent={handleNewEvent}
            onEditEvent={handleEditEvent}
            onOpenCheckIn={handleOpenCheckIn}
            onCancelEvent={(id) => cancelEventMutation.mutate(id)}
          />
        </TabsContent>

        <TabsContent value="calendar" className="focus-visible:outline-hidden">
          <EventsCalendarView
            events={events}
            onSelectEvent={handleEditEvent}
            onOpenCheckIn={handleOpenCheckIn}
          />
        </TabsContent>

        <TabsContent value="registrations" className="focus-visible:outline-hidden">
          <EventRegistrationsTab
            events={events}
            registrations={registrations}
            onNewRegistration={async (eventId, data) => {
              await registrationMutation.mutateAsync({ eventId, data });
            }}
            onCancelRegistration={async (id) => {
              await cancelRegistrationMutation.mutateAsync(id);
            }}
          />
        </TabsContent>

        <TabsContent value="attendance" className="focus-visible:outline-hidden">
          <EventAttendanceTab
            events={events}
            attendanceRecords={attendanceRecords}
            members={members}
            visitors={visitors}
            onRecordManualCheckIn={async (
              eventId,
              attendeeId,
              attendeeType,
              attendeeName,
              notes
            ) => {
              return manualCheckInMutation.mutateAsync({
                eventId,
                attendeeId,
                attendeeType,
                attendeeName,
                notes,
              });
            }}
            onRecordQRCodeCheckIn={async (eventId, qrCode) => {
              return qrCheckInMutation.mutateAsync({ eventId, qrCode });
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Modal de Cadastro / Edição de Evento */}
      <EventFormModal
        open={isEventModalOpen}
        onOpenChange={setIsEventModalOpen}
        eventToEdit={eventToEdit}
        congregations={congregations}
        onSave={async (data) => {
          await saveEventMutation.mutateAsync({ data, id: eventToEdit?.id });
        }}
      />
    </div>
  );
};
