/**
 * ChurchManager — Event & Attendance API Service
 * Decoupled REST client with mock adapter for development and testing.
 */

import { http } from '@/services/http/client';
import type {
  ChurchEvent,
  EventRegistration,
  EventAttendanceRecord,
  EventSummaryMetrics,
  EventFilters,
  CheckInResult,
} from '@/modules/events/types';
import type {
  EventFormData,
  EventRegistrationFormData,
  ManualAttendanceFormData,
} from '@/modules/events/schemas';
import {
  MOCK_EVENTS,
  MOCK_EVENT_REGISTRATIONS,
  MOCK_ATTENDANCE_RECORDS,
  MOCK_CONGREGATIONS,
  MOCK_USERS,
} from '@/services/adapters/fixtures';

const IS_MOCK = import.meta.env.VITE_USE_DEV_MOCK !== 'false';

// Mutable in-memory stores for Dev Mock & Vitest environments
let eventsStore: ChurchEvent[] = JSON.parse(JSON.stringify(MOCK_EVENTS));
let registrationsStore: EventRegistration[] = JSON.parse(JSON.stringify(MOCK_EVENT_REGISTRATIONS));
let attendanceStore: EventAttendanceRecord[] = JSON.parse(JSON.stringify(MOCK_ATTENDANCE_RECORDS));

export const eventService = {
  async getSummaryMetrics(): Promise<EventSummaryMetrics> {
    if (IS_MOCK) {
      const totalEvents = eventsStore.length;
      const upcomingServices = eventsStore.filter(
        (e) => e.type === 'service' && e.status !== 'cancelled' && e.status !== 'completed'
      ).length;
      const totalRegistrations = registrationsStore.filter((r) => r.status === 'confirmed').length;
      const totalAttendance = attendanceStore.length;

      const eligibleForCheckIn = registrationsStore.filter((r) => r.status === 'confirmed').length;
      const checkInRate =
        eligibleForCheckIn > 0
          ? Math.round(
              (registrationsStore.filter((r) => r.checkedIn).length / eligibleForCheckIn) * 100
            )
          : totalEvents > 0
            ? 78
            : 0;

      return {
        totalEvents,
        upcomingServices,
        totalRegistrations,
        totalAttendance,
        checkInRate,
      };
    }

    const response = await http.get<EventSummaryMetrics>('/api/v1/tenant/events/summary-metrics');
    return response;
  },

  async getEvents(filters?: EventFilters): Promise<ChurchEvent[]> {
    if (IS_MOCK) {
      let filtered = [...eventsStore];

      if (filters?.search) {
        const query = filters.search.toLowerCase();
        filtered = filtered.filter(
          (e) =>
            e.title.toLowerCase().includes(query) ||
            e.location.toLowerCase().includes(query) ||
            e.congregationName.toLowerCase().includes(query) ||
            (e.description && e.description.toLowerCase().includes(query))
        );
      }

      if (filters?.category && filters.category !== 'all') {
        filtered = filtered.filter((e) => e.category === filters.category);
      }

      if (filters?.type && filters.type !== 'all') {
        filtered = filtered.filter((e) => e.type === filters.type);
      }

      if (filters?.status && filters.status !== 'all') {
        filtered = filtered.filter((e) => e.status === filters.status);
      }

      if (filters?.congregationId && filters.congregationId !== 'all') {
        filtered = filtered.filter((e) => e.congregationId === filters.congregationId);
      }

      if (filters?.startDate) {
        filtered = filtered.filter((e) => e.startDate >= filters.startDate!);
      }

      if (filters?.endDate) {
        filtered = filtered.filter((e) => e.endDate <= filters.endDate!);
      }

      // Ordena por data e horário
      return filtered.sort((a, b) => `${a.startDate} ${a.startTime}`.localeCompare(`${b.startDate} ${b.startTime}`));
    }

    const response = await http.get<ChurchEvent[]>('/api/v1/tenant/events', { params: filters });
    return response;
  },

  async getEventById(id: string): Promise<ChurchEvent | undefined> {
    if (IS_MOCK) {
      return eventsStore.find((e) => e.id === id);
    }

    const response = await http.get<ChurchEvent>(`/api/v1/tenant/events/${id}`);
    return response;
  },

  async createEvent(data: EventFormData): Promise<ChurchEvent> {
    const congregation = MOCK_CONGREGATIONS.find((c) => c.id === data.congregationId);

    if (IS_MOCK) {
      const newEvent: ChurchEvent = {
        id: `evt-${Date.now().toString(36)}`,
        tenantId: 'tenant-manaus-central',
        congregationId: data.congregationId,
        congregationName: congregation?.name || 'Templo Central (Sede)',
        title: data.title,
        description: data.description,
        category: data.category,
        type: data.type,
        status: 'scheduled',
        startDate: data.startDate,
        endDate: data.endDate,
        startTime: data.startTime,
        endTime: data.endTime,
        location: data.location,
        address: data.address,
        maxCapacity: data.maxCapacity,
        isRegistrationRequired: data.isRegistrationRequired,
        registrationFee: data.registrationFee,
        registrationDeadline: data.registrationDeadline,
        checkInMethod: data.checkInMethod,
        targetAudience: data.targetAudience,
        registeredCount: 0,
        checkedInCount: 0,
        createdAt: new Date().toISOString(),
      };

      eventsStore = [newEvent, ...eventsStore];
      return newEvent;
    }

    const response = await http.post<ChurchEvent>('/api/v1/tenant/events', data);
    return response;
  },

  async updateEvent(id: string, data: Partial<EventFormData>): Promise<ChurchEvent> {
    if (IS_MOCK) {
      const index = eventsStore.findIndex((e) => e.id === id);
      if (index === -1) {
        throw new Error('Evento não encontrado');
      }

      const current = eventsStore[index];
      const congregation = data.congregationId
        ? MOCK_CONGREGATIONS.find((c) => c.id === data.congregationId)
        : undefined;

      const updated: ChurchEvent = {
        ...current,
        ...data,
        congregationName: congregation ? congregation.name : current.congregationName,
        updatedAt: new Date().toISOString(),
      };

      eventsStore[index] = updated;
      return updated;
    }

    const response = await http.put<ChurchEvent>(`/api/v1/tenant/events/${id}`, data);
    return response;
  },

  async deleteEvent(id: string): Promise<void> {
    if (IS_MOCK) {
      eventsStore = eventsStore.filter((e) => e.id !== id);
      return;
    }

    await http.delete(`/api/v1/tenant/events/${id}`);
  },

  async cancelEvent(id: string, _reason?: string): Promise<ChurchEvent> {
    if (IS_MOCK) {
      const index = eventsStore.findIndex((e) => e.id === id);
      if (index === -1) throw new Error('Evento não encontrado');

      const updated: ChurchEvent = {
        ...eventsStore[index],
        status: 'cancelled',
        updatedAt: new Date().toISOString(),
      };

      eventsStore[index] = updated;
      return updated;
    }

    const response = await http.post<ChurchEvent>(`/api/v1/tenant/events/${id}/cancel`, {
      reason: _reason,
    });
    return response;
  },

  async rescheduleEvent(
    id: string,
    newStartDate: string,
    newEndDate: string,
    newStartTime: string,
    newEndTime: string
  ): Promise<ChurchEvent> {
    if (IS_MOCK) {
      const index = eventsStore.findIndex((e) => e.id === id);
      if (index === -1) throw new Error('Evento não encontrado');

      const updated: ChurchEvent = {
        ...eventsStore[index],
        status: 'rescheduled',
        startDate: newStartDate,
        endDate: newEndDate,
        startTime: newStartTime,
        endTime: newEndTime,
        updatedAt: new Date().toISOString(),
      };

      eventsStore[index] = updated;
      return updated;
    }

    const response = await http.post<ChurchEvent>(`/api/v1/tenant/events/${id}/reschedule`, {
      startDate: newStartDate,
      endDate: newEndDate,
      startTime: newStartTime,
      endTime: newEndTime,
    });
    return response;
  },

  async getRegistrations(eventId?: string): Promise<EventRegistration[]> {
    if (IS_MOCK) {
      if (eventId) {
        return registrationsStore.filter((r) => r.eventId === eventId);
      }
      return registrationsStore;
    }

    const response = await http.get<EventRegistration[]>('/api/v1/tenant/events/registrations', {
      params: { eventId },
    });
    return response;
  },

  async registerForEvent(
    eventId: string,
    data: EventRegistrationFormData
  ): Promise<EventRegistration> {
    const event = eventsStore.find((e) => e.id === eventId);
    if (!event) throw new Error('Evento não encontrado');

    if (IS_MOCK) {
      const ticketSeq = (registrationsStore.filter((r) => r.eventId === eventId).length + 1)
        .toString()
        .padStart(3, '0');
      const ticketCode = `TKT-${event.title.substring(0, 4).toUpperCase()}-${ticketSeq}`;
      const qrCodeValue = `CM-${eventId}-${ticketCode}-${data.attendeeName.replace(/\s+/g, '').toUpperCase()}`;

      const newRegistration: EventRegistration = {
        id: `reg-${Date.now().toString(36)}`,
        tenantId: 'tenant-manaus-central',
        eventId,
        eventTitle: event.title,
        memberId: data.memberId,
        attendeeName: data.attendeeName,
        attendeeEmail: data.attendeeEmail,
        attendeePhone: data.attendeePhone,
        status: 'confirmed',
        ticketCode,
        qrCodeValue,
        checkedIn: false,
        createdAt: new Date().toISOString(),
      };

      registrationsStore = [newRegistration, ...registrationsStore];

      // Atualiza contador no evento
      const eventIndex = eventsStore.findIndex((e) => e.id === eventId);
      if (eventIndex !== -1) {
        eventsStore[eventIndex].registeredCount += 1;
      }

      return newRegistration;
    }

    const response = await http.post<EventRegistration>(
      `/api/v1/tenant/events/${eventId}/registrations`,
      data
    );
    return response;
  },

  async cancelRegistration(registrationId: string): Promise<void> {
    if (IS_MOCK) {
      const reg = registrationsStore.find((r) => r.id === registrationId);
      if (reg) {
        reg.status = 'cancelled';
        const event = eventsStore.find((e) => e.id === reg.eventId);
        if (event && event.registeredCount > 0) {
          event.registeredCount -= 1;
        }
      }
      return;
    }

    await http.delete(`/api/v1/tenant/events/registrations/${registrationId}`);
  },

  async getAttendanceRecords(eventId: string): Promise<EventAttendanceRecord[]> {
    if (IS_MOCK) {
      return attendanceStore.filter((a) => a.eventId === eventId);
    }

    const response = await http.get<EventAttendanceRecord[]>(
      `/api/v1/tenant/events/${eventId}/attendance`
    );
    return response;
  },

  /**
   * Registro de Presença Manual com Prevenção de Duplicidade
   */
  async recordManualCheckIn(
    eventId: string,
    data: ManualAttendanceFormData
  ): Promise<CheckInResult> {
    const event = eventsStore.find((e) => e.id === eventId);
    if (!event) throw new Error('Evento não encontrado');

    if (IS_MOCK) {
      // Valida duplicidade de presença para o mesmo participante no mesmo evento
      const alreadyCheckedIn = attendanceStore.some(
        (a) => a.eventId === eventId && a.attendeeId === data.attendeeId
      );

      if (alreadyCheckedIn) {
        return {
          success: false,
          alreadyCheckedIn: true,
          message: `A presença de "${data.attendeeName}" já foi confirmada anteriormente neste evento!`,
          attendeeName: data.attendeeName,
        };
      }

      const newRecord: EventAttendanceRecord = {
        id: `att-${Date.now().toString(36)}`,
        tenantId: 'tenant-manaus-central',
        eventId,
        eventTitle: event.title,
        attendeeId: data.attendeeId,
        attendeeType: data.attendeeType,
        attendeeName: data.attendeeName,
        checkInMethod: 'manual',
        checkedInAt: new Date().toISOString(),
        checkedInBy: MOCK_USERS.admin.name,
        notes: data.notes,
      };

      attendanceStore = [newRecord, ...attendanceStore];

      // Atualiza status na inscrição se houver
      const registration = registrationsStore.find(
        (r) => r.eventId === eventId && (r.memberId === data.attendeeId || r.id === data.attendeeId)
      );
      if (registration) {
        registration.checkedIn = true;
        registration.checkedInAt = newRecord.checkedInAt;
      }

      // Incrementa presença no evento
      const eventIndex = eventsStore.findIndex((e) => e.id === eventId);
      if (eventIndex !== -1) {
        eventsStore[eventIndex].checkedInCount += 1;
      }

      return {
        success: true,
        message: `Presença de "${data.attendeeName}" registrada com sucesso!`,
        attendeeName: data.attendeeName,
        checkedInAt: newRecord.checkedInAt,
      };
    }

    const response = await http.post<CheckInResult>(
      `/api/v1/tenant/events/${eventId}/check-in/manual`,
      data
    );
    return response;
  },

  /**
   * Validação de Check-in por QR Code / Código de Ingresso
   */
  async recordQRCodeCheckIn(eventId: string, qrCodeString: string): Promise<CheckInResult> {
    const event = eventsStore.find((e) => e.id === eventId);
    if (!event) throw new Error('Evento não encontrado');

    if (IS_MOCK) {
      const cleanCode = qrCodeString.trim();

      // Busca por qrCodeValue exato ou por ticketCode
      const registration = registrationsStore.find(
        (r) =>
          r.eventId === eventId &&
          (r.qrCodeValue === cleanCode || r.ticketCode.toUpperCase() === cleanCode.toUpperCase())
      );

      if (!registration) {
        return {
          success: false,
          alreadyCheckedIn: false,
          message: 'Ingresso inválido ou não pertencente a este evento.',
        };
      }

      if (registration.checkedIn) {
        return {
          success: false,
          alreadyCheckedIn: true,
          message: `Atenção: O ingresso [${registration.ticketCode}] de "${registration.attendeeName}" já foi validado anteriormente!`,
          attendeeName: registration.attendeeName,
          ticketCode: registration.ticketCode,
          checkedInAt: registration.checkedInAt,
        };
      }

      const now = new Date().toISOString();
      registration.checkedIn = true;
      registration.checkedInAt = now;

      const newRecord: EventAttendanceRecord = {
        id: `att-${Date.now().toString(36)}`,
        tenantId: 'tenant-manaus-central',
        eventId,
        eventTitle: event.title,
        attendeeId: registration.memberId || registration.id,
        attendeeType: registration.memberId ? 'member' : 'visitor',
        attendeeName: registration.attendeeName,
        attendeeEmail: registration.attendeeEmail,
        attendeePhone: registration.attendeePhone,
        checkInMethod: 'qr_code',
        ticketCode: registration.ticketCode,
        checkedInAt: now,
        checkedInBy: 'Leitor QR Code / Portaria',
      };

      attendanceStore = [newRecord, ...attendanceStore];

      // Incrementa presença no evento
      const eventIndex = eventsStore.findIndex((e) => e.id === eventId);
      if (eventIndex !== -1) {
        eventsStore[eventIndex].checkedInCount += 1;
      }

      return {
        success: true,
        message: `Ingresso [${registration.ticketCode}] validado! Seja bem-vindo(a), ${registration.attendeeName}!`,
        attendeeName: registration.attendeeName,
        ticketCode: registration.ticketCode,
        checkedInAt: now,
      };
    }

    const response = await http.post<CheckInResult>(
      `/api/v1/tenant/events/${eventId}/check-in/qr`,
      { qrCode: qrCodeString }
    );
    return response;
  },

  // Helper method for Vitest isolation
  resetMockStores() {
    eventsStore = JSON.parse(JSON.stringify(MOCK_EVENTS));
    registrationsStore = JSON.parse(JSON.stringify(MOCK_EVENT_REGISTRATIONS));
    attendanceStore = JSON.parse(JSON.stringify(MOCK_ATTENDANCE_RECORDS));
  },
};
