import { http } from '@/services/http/client';
import type {
  Ministry,
  MinistryRole,
  MinistryVolunteer,
  Schedule,
  ScheduleConflict,
  MinistrySummaryMetrics,
  ScheduleFilters,
} from '@/modules/ministries/types';
import type {
  MinistryFormData,
  MinistryRoleFormData,
  ScheduleFormData,
  ScheduleResponseFormData,
} from '@/modules/ministries/schemas';
import { isTimeIntervalOverlapping } from '@/modules/ministries/schemas';
import {
  MOCK_MINISTRIES,
  MOCK_MINISTRY_ROLES,
  MOCK_MINISTRY_VOLUNTEERS,
  MOCK_SCHEDULES,
  MOCK_MEMBERS,
} from '@/services/adapters/fixtures';

const IS_MOCK = import.meta.env.VITE_USE_DEV_MOCK !== 'false';

// Mutable in-memory stores for Dev Mock & Vitest environments
let ministriesStore: Ministry[] = JSON.parse(JSON.stringify(MOCK_MINISTRIES));
let ministryRolesStore: MinistryRole[] = JSON.parse(JSON.stringify(MOCK_MINISTRY_ROLES));
let volunteersStore: MinistryVolunteer[] = JSON.parse(JSON.stringify(MOCK_MINISTRY_VOLUNTEERS));
let schedulesStore: Schedule[] = JSON.parse(JSON.stringify(MOCK_SCHEDULES));

export const ministryService = {
  async getSummaryMetrics(): Promise<MinistrySummaryMetrics> {
    if (IS_MOCK) {
      const activeVolunteersCount = new Set(
        volunteersStore.filter((v) => v.status === 'active').map((v) => v.memberId)
      ).size;

      const publishedSchedules = schedulesStore.filter((s) => s.status === 'published').length;

      let pendingConfirmations = 0;
      let confirmedPresences = 0;
      let declinedPresences = 0;

      schedulesStore.forEach((schedule) => {
        schedule.volunteers.forEach((v) => {
          if (v.status === 'pending') pendingConfirmations++;
          if (v.status === 'confirmed') confirmedPresences++;
          if (v.status === 'declined') declinedPresences++;
        });
      });

      return {
        totalMinistries: ministriesStore.length,
        activeVolunteers: activeVolunteersCount,
        publishedSchedules,
        pendingConfirmations,
        confirmedPresences,
        declinedPresences,
      };
    }

    const response = await http.get<MinistrySummaryMetrics>('/api/v1/tenant/ministries/metrics');
    return response;
  },

  async getMinistries(): Promise<Ministry[]> {
    if (IS_MOCK) {
      return ministriesStore.map((m) => {
        const roles = ministryRolesStore.filter((r) => r.ministryId === m.id);
        const membersCount = new Set(
          volunteersStore.filter((v) => v.ministryId === m.id && v.status === 'active').map((v) => v.memberId)
        ).size;
        return {
          ...m,
          roles,
          rolesCount: roles.length,
          membersCount,
        };
      });
    }

    const response = await http.get<Ministry[]>('/api/v1/tenant/ministries');
    return response;
  },

  async createMinistry(data: MinistryFormData): Promise<Ministry> {
    if (IS_MOCK) {
      const newMinistry: Ministry = {
        id: `min-${Date.now().toString(36)}`,
        tenantId: 'tenant-manaus-central',
        name: data.name,
        description: data.description,
        leaderId: data.leaderId,
        leaderName: data.leaderName,
        color: data.color,
        status: data.status,
        membersCount: 0,
        rolesCount: 0,
        roles: [],
        createdAt: new Date().toISOString(),
      };

      ministriesStore = [newMinistry, ...ministriesStore];
      return newMinistry;
    }

    const response = await http.post<Ministry>('/api/v1/tenant/ministries', data);
    return response;
  },

  async updateMinistry(id: string, data: Partial<MinistryFormData>): Promise<Ministry> {
    if (IS_MOCK) {
      const index = ministriesStore.findIndex((m) => m.id === id);
      if (index === -1) {
        throw new Error('Ministério não encontrado');
      }

      const updated = {
        ...ministriesStore[index],
        ...data,
      };

      ministriesStore[index] = updated;
      return updated;
    }

    const response = await http.put<Ministry>(`/api/v1/tenant/ministries/${id}`, data);
    return response;
  },

  async deleteMinistry(id: string): Promise<void> {
    if (IS_MOCK) {
      ministriesStore = ministriesStore.filter((m) => m.id !== id);
      ministryRolesStore = ministryRolesStore.filter((r) => r.ministryId !== id);
      volunteersStore = volunteersStore.filter((v) => v.ministryId !== id);
      return;
    }

    await http.delete(`/api/v1/tenant/ministries/${id}`);
  },

  async getMinistryRoles(ministryId: string): Promise<MinistryRole[]> {
    if (IS_MOCK) {
      return ministryRolesStore.filter((r) => r.ministryId === ministryId);
    }

    const response = await http.get<MinistryRole[]>(`/api/v1/tenant/ministries/${ministryId}/roles`);
    return response;
  },

  async addMinistryRole(ministryId: string, data: MinistryRoleFormData): Promise<MinistryRole> {
    if (IS_MOCK) {
      const newRole: MinistryRole = {
        id: `role-${Date.now().toString(36)}`,
        ministryId,
        name: data.name,
        description: data.description,
        requiredVolunteers: data.requiredVolunteers,
      };

      ministryRolesStore = [...ministryRolesStore, newRole];
      return newRole;
    }

    const response = await http.post<MinistryRole>(`/api/v1/tenant/ministries/${ministryId}/roles`, data);
    return response;
  },

  async getVolunteers(ministryId?: string): Promise<MinistryVolunteer[]> {
    if (IS_MOCK) {
      if (ministryId) {
        return volunteersStore.filter((v) => v.ministryId === ministryId);
      }
      return [...volunteersStore];
    }

    const response = await http.get<MinistryVolunteer[]>('/api/v1/tenant/volunteers', {
      params: { ministryId },
    });
    return response;
  },

  async assignVolunteer(data: {
    ministryId: string;
    memberId: string;
    roleId: string;
  }): Promise<MinistryVolunteer> {
    if (IS_MOCK) {
      const ministry = ministriesStore.find((m) => m.id === data.ministryId);
      const member = MOCK_MEMBERS.find((m) => m.id === data.memberId);
      const role = ministryRolesStore.find((r) => r.id === data.roleId);

      const newVolunteer: MinistryVolunteer = {
        id: `mvol-${Date.now().toString(36)}`,
        tenantId: 'tenant-manaus-central',
        ministryId: data.ministryId,
        ministryName: ministry?.name || 'Ministério',
        memberId: data.memberId,
        memberName: member?.name || 'Membro Voluntário',
        memberEmail: member?.email,
        memberPhone: member?.phone,
        roleId: data.roleId,
        roleName: role?.name || 'Função',
        status: 'active',
        joinedAt: new Date().toISOString(),
      };

      volunteersStore = [newVolunteer, ...volunteersStore];
      return newVolunteer;
    }

    const response = await http.post<MinistryVolunteer>('/api/v1/tenant/volunteers', data);
    return response;
  },

  async removeVolunteer(volunteerId: string): Promise<void> {
    if (IS_MOCK) {
      volunteersStore = volunteersStore.filter((v) => v.id !== volunteerId);
      return;
    }

    await http.delete(`/api/v1/tenant/volunteers/${volunteerId}`);
  },

  async getSchedules(filters?: ScheduleFilters): Promise<Schedule[]> {
    if (IS_MOCK) {
      let filtered = [...schedulesStore];

      if (filters?.ministryId && filters.ministryId !== 'all') {
        filtered = filtered.filter((s) => s.ministryId === filters.ministryId);
      }

      if (filters?.status && filters.status !== 'all') {
        filtered = filtered.filter((s) => s.status === filters.status);
      }

      if (filters?.dateFrom) {
        filtered = filtered.filter((s) => s.date >= filters.dateFrom!);
      }

      if (filters?.dateTo) {
        filtered = filtered.filter((s) => s.date <= filters.dateTo!);
      }

      if (filters?.search) {
        const query = filters.search.toLowerCase();
        filtered = filtered.filter(
          (s) =>
            s.title.toLowerCase().includes(query) ||
            s.ministryName.toLowerCase().includes(query) ||
            s.volunteers.some((v) => v.memberName.toLowerCase().includes(query))
        );
      }

      // Ordena por data e horário de início
      return filtered.sort((a, b) => `${a.date} ${a.startTime}`.localeCompare(`${b.date} ${b.startTime}`));
    }

    const response = await http.get<Schedule[]>('/api/v1/tenant/schedules', { params: filters });
    return response;
  },

  async getScheduleById(id: string): Promise<Schedule | undefined> {
    if (IS_MOCK) {
      return schedulesStore.find((s) => s.id === id);
    }

    const response = await http.get<Schedule>(`/api/v1/tenant/schedules/${id}`);
    return response;
  },

  /**
   * Verifica em tempo real conflitos de sobreposição de horário para os voluntários selecionados
   */
  async checkConflicts(payload: {
    date: string;
    startTime: string;
    endTime: string;
    volunteerMemberIds: string[];
    excludeScheduleId?: string;
  }): Promise<ScheduleConflict[]> {
    if (IS_MOCK) {
      const conflicts: ScheduleConflict[] = [];

      // Procura todas as escalas na mesma data, exceto a própria e escalas canceladas
      const sameDaySchedules = schedulesStore.filter(
        (s) =>
          s.date === payload.date &&
          s.status !== 'cancelled' &&
          s.id !== payload.excludeScheduleId
      );

      for (const schedule of sameDaySchedules) {
        const isOverlap = isTimeIntervalOverlapping(
          payload.startTime,
          payload.endTime,
          schedule.startTime,
          schedule.endTime
        );

        if (isOverlap) {
          // Verifica quais voluntários estão em ambas as escalas
          for (const memberId of payload.volunteerMemberIds) {
            const conflictVolunteer = schedule.volunteers.find((v) => v.memberId === memberId);
            if (conflictVolunteer) {
              conflicts.push({
                hasConflict: true,
                memberId,
                memberName: conflictVolunteer.memberName,
                conflictingScheduleId: schedule.id,
                conflictingScheduleTitle: schedule.title,
                conflictingMinistryName: schedule.ministryName,
                conflictingDate: schedule.date,
                conflictingTimeWindow: `${schedule.startTime} às ${schedule.endTime}`,
                message: `O voluntário "${conflictVolunteer.memberName}" já está escalado em "${schedule.title}" (${schedule.ministryName}) no horário de ${schedule.startTime} às ${schedule.endTime}.`,
              });
            }
          }
        }
      }

      return conflicts;
    }

    const response = await http.post<ScheduleConflict[]>('/api/v1/tenant/schedules/check-conflicts', payload);
    return response;
  },

  async createSchedule(data: ScheduleFormData): Promise<Schedule> {
    const ministry = ministriesStore.find((m) => m.id === data.ministryId);

    if (IS_MOCK) {
      const volunteerList = data.volunteers.map((v, index) => {
        const member = MOCK_MEMBERS.find((m) => m.id === v.memberId);
        return {
          id: `svol-${Date.now().toString(36)}-${index}`,
          scheduleId: `sch-${Date.now().toString(36)}`,
          volunteerId: `mvol-temp-${index}`,
          memberId: v.memberId,
          memberName: member?.name || 'Voluntário',
          memberPhone: member?.phone,
          roleName: v.roleName,
          status: 'pending' as const,
        };
      });

      const newSchedule: Schedule = {
        id: `sch-${Date.now().toString(36)}`,
        tenantId: 'tenant-manaus-central',
        ministryId: data.ministryId,
        ministryName: ministry?.name || 'Ministério',
        ministryColor: ministry?.color || '#4f46e5',
        title: data.title,
        description: data.description,
        date: data.date,
        startTime: data.startTime,
        endTime: data.endTime,
        status: 'draft',
        volunteers: volunteerList,
        notes: data.notes,
        createdAt: new Date().toISOString(),
      };

      schedulesStore = [newSchedule, ...schedulesStore];
      return newSchedule;
    }

    const response = await http.post<Schedule>('/api/v1/tenant/schedules', data);
    return response;
  },

  async updateSchedule(id: string, data: Partial<ScheduleFormData>): Promise<Schedule> {
    if (IS_MOCK) {
      const index = schedulesStore.findIndex((s) => s.id === id);
      if (index === -1) {
        throw new Error('Escala não encontrada');
      }

      const current = schedulesStore[index];
      const ministry = data.ministryId
        ? ministriesStore.find((m) => m.id === data.ministryId)
        : undefined;

      const updated: Schedule = {
        ...current,
        ...data,
        ministryName: ministry ? ministry.name : current.ministryName,
        ministryColor: ministry ? ministry.color : current.ministryColor,
        volunteers: data.volunteers
          ? data.volunteers.map((v, i) => {
              const existing = current.volunteers.find((ev) => ev.memberId === v.memberId);
              const member = MOCK_MEMBERS.find((m) => m.id === v.memberId);
              return {
                id: existing?.id || `svol-${Date.now().toString(36)}-${i}`,
                scheduleId: id,
                volunteerId: existing?.volunteerId || `mvol-${Date.now().toString(36)}`,
                memberId: v.memberId,
                memberName: member?.name || existing?.memberName || 'Voluntário',
                memberPhone: member?.phone || existing?.memberPhone,
                roleName: v.roleName,
                status: existing?.status || 'pending',
                declineReason: existing?.declineReason,
                respondedAt: existing?.respondedAt,
              };
            })
          : current.volunteers,
      };

      schedulesStore[index] = updated;
      return updated;
    }

    const response = await http.put<Schedule>(`/api/v1/tenant/schedules/${id}`, data);
    return response;
  },

  async deleteSchedule(id: string): Promise<void> {
    if (IS_MOCK) {
      schedulesStore = schedulesStore.filter((s) => s.id !== id);
      return;
    }

    await http.delete(`/api/v1/tenant/schedules/${id}`);
  },

  async publishSchedule(id: string): Promise<Schedule> {
    if (IS_MOCK) {
      const index = schedulesStore.findIndex((s) => s.id === id);
      if (index === -1) {
        throw new Error('Escala não encontrada');
      }

      const updated: Schedule = {
        ...schedulesStore[index],
        status: 'published',
      };

      schedulesStore[index] = updated;
      return updated;
    }

    const response = await http.post<Schedule>(`/api/v1/tenant/schedules/${id}/publish`);
    return response;
  },

  async respondToSchedule(
    scheduleId: string,
    volunteerId: string,
    payload: ScheduleResponseFormData
  ): Promise<Schedule> {
    if (IS_MOCK) {
      const scheduleIndex = schedulesStore.findIndex((s) => s.id === scheduleId);
      if (scheduleIndex === -1) {
        throw new Error('Escala não encontrada');
      }

      const schedule = schedulesStore[scheduleIndex];
      const volunteerIndex = schedule.volunteers.findIndex(
        (v) => v.id === volunteerId || v.volunteerId === volunteerId || v.memberId === volunteerId
      );

      if (volunteerIndex === -1) {
        throw new Error('Voluntário não encontrado nesta escala');
      }

      const vol = schedule.volunteers[volunteerIndex];
      let newStatus: Schedule['volunteers'][0]['status'] = 'confirmed';
      let declineReason = undefined;
      let substitutedById = undefined;
      let substitutedByName = undefined;

      if (payload.action === 'confirm') {
        newStatus = 'confirmed';
      } else if (payload.action === 'decline') {
        newStatus = 'declined';
        declineReason = payload.reason;
      } else if (payload.action === 'substitute') {
        newStatus = 'substituted';
        substitutedById = payload.substituteMemberId;
        const subMember = MOCK_MEMBERS.find((m) => m.id === payload.substituteMemberId);
        substitutedByName = subMember?.name || 'Substituto Indicado';
      }

      const updatedVolunteers = [...schedule.volunteers];
      updatedVolunteers[volunteerIndex] = {
        ...vol,
        status: newStatus,
        declineReason,
        substitutedById,
        substitutedByName,
        respondedAt: new Date().toISOString(),
      };

      const updatedSchedule: Schedule = {
        ...schedule,
        volunteers: updatedVolunteers,
      };

      schedulesStore[scheduleIndex] = updatedSchedule;
      return updatedSchedule;
    }

    const response = await http.post<Schedule>(
      `/api/v1/tenant/schedules/${scheduleId}/respond`,
      { volunteerId, ...payload }
    );
    return response;
  },

  // Helper method for Vitest isolation
  resetMockStores() {
    ministriesStore = JSON.parse(JSON.stringify(MOCK_MINISTRIES));
    ministryRolesStore = JSON.parse(JSON.stringify(MOCK_MINISTRY_ROLES));
    volunteersStore = JSON.parse(JSON.stringify(MOCK_MINISTRY_VOLUNTEERS));
    schedulesStore = JSON.parse(JSON.stringify(MOCK_SCHEDULES));
  },
};
