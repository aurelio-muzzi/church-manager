/**
 * ChurchManager — Member Portal API Service
 * Decoupled REST client with mock adapter for development and testing.
 */

import { http } from '@/services/http/client';
import type {
  MemberCredential,
  MemberContributionSummary,
  MemberAnnualTaxStatement,
  MonthlyTaxItem,
  MemberScheduleItem,
  MemberRegistrationItem,
  MemberFamilyNucleus,
  MemberAnnouncement,
  MemberPortalSummary,
} from '@/modules/portal/types';
import type {
  MemberUpdateRegistrationFormData,
  MemberScheduleResponseFormData,
} from '@/modules/portal/schemas';
import type { MemberChangeRequest } from '@/modules/members/types';
import type { Schedule } from '@/modules/ministries/types';
import type { EventRegistration } from '@/modules/events/types';
import type { FinancialTransaction } from '@/modules/finance/types';
import {
  MOCK_MEMBERS,
  MOCK_FAMILIES,
  MOCK_SCHEDULES,
  MOCK_EVENT_REGISTRATIONS,
  MOCK_FINANCIAL_TRANSACTIONS,
  MOCK_ANNOUNCEMENTS,
  MOCK_CHANGE_REQUESTS,
} from '@/services/adapters/fixtures';

const IS_MOCK = import.meta.env.VITE_USE_DEV_MOCK !== 'false';
const DEFAULT_MEMBER_ID = 'mem-06';

// Mutable in-memory stores for Dev Mock & Vitest environments
let schedulesStore: Schedule[] = JSON.parse(JSON.stringify(MOCK_SCHEDULES));
let registrationsStore: EventRegistration[] = JSON.parse(
  JSON.stringify(MOCK_EVENT_REGISTRATIONS)
);
let transactionsStore: FinancialTransaction[] = JSON.parse(
  JSON.stringify(MOCK_FINANCIAL_TRANSACTIONS)
);
let changeRequestsStore: MemberChangeRequest[] = JSON.parse(
  JSON.stringify(MOCK_CHANGE_REQUESTS)
);
let announcementsStore: MemberAnnouncement[] = JSON.parse(
  JSON.stringify(MOCK_ANNOUNCEMENTS)
);

const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

export const portalService = {
  /**
   * Resets all in-memory stores back to original fixtures
   */
  resetMockStores() {
    schedulesStore = JSON.parse(JSON.stringify(MOCK_SCHEDULES));
    registrationsStore = JSON.parse(JSON.stringify(MOCK_EVENT_REGISTRATIONS));
    transactionsStore = JSON.parse(JSON.stringify(MOCK_FINANCIAL_TRANSACTIONS));
    changeRequestsStore = JSON.parse(JSON.stringify(MOCK_CHANGE_REQUESTS));
    announcementsStore = JSON.parse(JSON.stringify(MOCK_ANNOUNCEMENTS));
  },

  /**
   * Get overall portal summary / KPIs for the logged-in member
   */
  async getMemberPortalSummary(
    memberId = DEFAULT_MEMBER_ID
  ): Promise<MemberPortalSummary> {
    if (IS_MOCK) {
      const credential = await this.getDigitalCredential(memberId);
      const schedules = await this.getMemberSchedules(memberId);
      const registrations = await this.getMemberRegistrations(memberId);
      const contributions = await this.getMemberContributions(memberId);
      const family = await this.getMemberFamily(memberId);

      const nextSchedule = schedules.find((s) => s.status !== 'declined');
      const nextEvent = registrations.find((r) => r.status === 'confirmed');

      return {
        credential,
        nextSchedule,
        nextEvent,
        yearlyContributions: contributions.yearlyTotal,
        monthlyContributions: contributions.monthlyTotal,
        unreadAnnouncementsCount: announcementsStore.length,
        familyMembersCount: family ? family.members.length : 1,
      };
    }

    return http.get<MemberPortalSummary>(
      `/api/v1/tenant/portal/summary?memberId=${memberId}`
    );
  },

  /**
   * Get digital ecclesiastical credential card details
   */
  async getDigitalCredential(
    memberId = DEFAULT_MEMBER_ID
  ): Promise<MemberCredential> {
    if (IS_MOCK) {
      const member =
        MOCK_MEMBERS.find((m) => m.id === memberId) || MOCK_MEMBERS[0];

      return {
        memberId: member.id,
        matricula: `ROL-2026-${member.id.replace('mem-', '00')}`,
        fullName: member.name,
        cpfMasked: '***.458.912-**',
        rgMasked: '***.312-SSP/AM',
        birthDate: member.birthDate,
        baptismDate: member.baptismDate || '2020-11-20',
        admissionDate: member.admissionDate || '2020-11-20',
        membershipStatus:
          (member.membershipStatus as
            | 'active'
            | 'inactive'
            | 'transferred'
            | 'disciplined') || 'active',
        ecclesiasticalRole: 'Membro Comungante',
        congregationName: member.congregationName || 'Filial Ponta Negra',
        tenantName: 'Igreja Batista Central de Manaus',
        photoUrl: undefined,
        qrCodeValidationToken: `SEC-VAL-${member.id.toUpperCase()}-2026-TOKEN-VERIFIED`,
        validUntil: '31/12/2026',
      };
    }

    return http.get<MemberCredential>(
      `/api/v1/tenant/portal/credential?memberId=${memberId}`
    );
  },

  /**
   * Get financial contributions (tithes & offerings) for member
   */
  async getMemberContributions(
    memberId = DEFAULT_MEMBER_ID
  ): Promise<MemberContributionSummary> {
    if (IS_MOCK) {
      const memberTxs = transactionsStore.filter(
        (t) =>
          t.memberId === memberId && t.type === 'income' && t.status === 'paid'
      );

      const yearlyTotal = memberTxs
        .filter((t) => t.date.startsWith('2026'))
        .reduce((sum, t) => sum + t.amount, 0);

      const monthlyTotal = memberTxs
        .filter((t) => t.date.startsWith('2026-10'))
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        yearlyTotal,
        monthlyTotal,
        totalCount: memberTxs.length,
        contributions: memberTxs.sort((a, b) => b.date.localeCompare(a.date)),
      };
    }

    return http.get<MemberContributionSummary>(
      `/api/v1/tenant/portal/contributions?memberId=${memberId}`
    );
  },

  /**
   * Generate Annual Tax Statement (Declaração de Quitação / IRPF)
   */
  async getMemberTaxStatement(
    memberId = DEFAULT_MEMBER_ID,
    year = 2026
  ): Promise<MemberAnnualTaxStatement> {
    if (IS_MOCK) {
      const member =
        MOCK_MEMBERS.find((m) => m.id === memberId) || MOCK_MEMBERS[0];
      const memberTxs = transactionsStore.filter(
        (t) =>
          t.memberId === memberId &&
          t.type === 'income' &&
          t.status === 'paid' &&
          t.date.startsWith(String(year))
      );

      const monthlyBreakdown: MonthlyTaxItem[] = Array.from(
        { length: 12 },
        (_, i) => {
          const monthNum = String(i + 1).padStart(2, '0');
          const monthKey = `${year}-${monthNum}`;
          const monthTxs = memberTxs.filter((t) => t.date.startsWith(monthKey));

          const tithes = monthTxs
            .filter((t) => t.offeringType === 'tithe' || t.categoryType === 'tithe')
            .reduce((sum, t) => sum + t.amount, 0);

          const offerings = monthTxs
            .filter((t) => t.offeringType !== 'tithe' && t.categoryType !== 'tithe')
            .reduce((sum, t) => sum + t.amount, 0);

          return {
            month: monthKey,
            monthName: MONTH_NAMES[i],
            tithes,
            offerings,
            total: tithes + offerings,
          };
        }
      );

      const totalTithes = monthlyBreakdown.reduce((sum, m) => sum + m.tithes, 0);
      const totalOfferings = monthlyBreakdown.reduce(
        (sum, m) => sum + m.offerings,
        0
      );

      return {
        year,
        memberName: member.name,
        memberCpf: '023.458.912-88',
        churchName: 'Igreja Batista Central de Manaus',
        churchCnpj: '04.552.891/0001-90',
        totalTithes,
        totalOfferings,
        totalContributed: totalTithes + totalOfferings,
        monthlyBreakdown,
        emittedAt: new Date().toISOString(),
        verificationCode: `IRPF-${year}-${member.id.toUpperCase()}-VERIF-9421A`,
      };
    }

    return http.get<MemberAnnualTaxStatement>(
      `/api/v1/tenant/portal/tax-statement?memberId=${memberId}&year=${year}`
    );
  },

  /**
   * Get volunteer service schedules for the member
   */
  async getMemberSchedules(
    memberId = DEFAULT_MEMBER_ID
  ): Promise<MemberScheduleItem[]> {
    if (IS_MOCK) {
      const items: MemberScheduleItem[] = [];

      schedulesStore.forEach((schedule) => {
        const assignedVol = schedule.volunteers.find(
          (v) => v.memberId === memberId
        );
        if (assignedVol) {
          items.push({
            scheduleId: schedule.id,
            volunteerId: assignedVol.id,
            date: schedule.date,
            startTime: schedule.startTime,
            endTime: schedule.endTime,
            ministryName: schedule.ministryName,
            ministryColor: schedule.ministryColor,
            roleName: assignedVol.roleName,
            status: assignedVol.status,
            notes: schedule.notes,
            declineReason: assignedVol.declineReason,
            respondedAt: assignedVol.respondedAt,
          });
        }
      });

      return items.sort((a, b) => a.date.localeCompare(b.date));
    }

    return http.get<MemberScheduleItem[]>(
      `/api/v1/tenant/portal/schedules?memberId=${memberId}`
    );
  },

  /**
   * Respond to a volunteer schedule (Confirm or Decline with reason)
   */
  async respondSchedule(
    scheduleId: string,
    data: MemberScheduleResponseFormData,
    memberId = DEFAULT_MEMBER_ID
  ): Promise<MemberScheduleItem> {
    if (IS_MOCK) {
      const schedule = schedulesStore.find((s) => s.id === scheduleId);
      if (!schedule) {
        throw new Error('Escala não encontrada no sistema.');
      }

      const assignedVol = schedule.volunteers.find(
        (v) => v.memberId === memberId
      );
      if (!assignedVol) {
        throw new Error('Membro não escalado para esta atividade.');
      }

      assignedVol.status = data.status;
      assignedVol.respondedAt = new Date().toISOString();
      if (data.status === 'declined') {
        assignedVol.declineReason = data.declineReason;
      } else {
        assignedVol.declineReason = undefined;
      }

      return {
        scheduleId: schedule.id,
        volunteerId: assignedVol.id,
        date: schedule.date,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        ministryName: schedule.ministryName,
        ministryColor: schedule.ministryColor,
        roleName: assignedVol.roleName,
        status: assignedVol.status,
        notes: schedule.notes,
        declineReason: assignedVol.declineReason,
        respondedAt: assignedVol.respondedAt,
      };
    }

    return http.post<MemberScheduleItem>(
      `/api/v1/tenant/portal/schedules/${scheduleId}/respond`,
      data
    );
  },

  /**
   * Get member event registrations & tickets
   */
  async getMemberRegistrations(
    memberId = DEFAULT_MEMBER_ID
  ): Promise<MemberRegistrationItem[]> {
    if (IS_MOCK) {
      const memberRegs = registrationsStore.filter(
        (r) => r.memberId === memberId
      );

      return memberRegs.map((r) => ({
        registrationId: r.id,
        eventId: r.eventId,
        eventTitle: r.eventTitle,
        eventDate: '2026-11-14',
        eventLocation: 'Auditório Principal - Templo Central',
        ticketCode: r.ticketCode,
        qrCodeToken: r.qrCodeValue,
        status: r.status,
        checkedIn: r.checkedIn,
        checkedInAt: r.checkedInAt,
      }));
    }

    return http.get<MemberRegistrationItem[]>(
      `/api/v1/tenant/portal/registrations?memberId=${memberId}`
    );
  },

  /**
   * Get member family nucleus
   */
  async getMemberFamily(
    memberId = DEFAULT_MEMBER_ID
  ): Promise<MemberFamilyNucleus | null> {
    if (IS_MOCK) {
      const member =
        MOCK_MEMBERS.find((m) => m.id === memberId) || MOCK_MEMBERS[0];
      if (!member.familyId) {
        return null;
      }

      const family = MOCK_FAMILIES.find((f) => f.id === member.familyId);
      const familyMembers = MOCK_MEMBERS.filter(
        (m) => m.familyId === member.familyId
      );

      return {
        familyId: member.familyId,
        familyName: family ? family.name : member.familyName || 'Família',
        address: family?.address || member.address,
        members: familyMembers,
      };
    }

    return http.get<MemberFamilyNucleus | null>(
      `/api/v1/tenant/portal/family?memberId=${memberId}`
    );
  },

  /**
   * Get church & pastoral announcements
   */
  async getMemberAnnouncements(): Promise<MemberAnnouncement[]> {
    if (IS_MOCK) {
      return [...announcementsStore];
    }

    return http.get<MemberAnnouncement[]>('/api/v1/tenant/portal/announcements');
  },

  /**
   * Get change requests submitted by member
   */
  async getMemberChangeRequests(
    memberId = DEFAULT_MEMBER_ID
  ): Promise<MemberChangeRequest[]> {
    if (IS_MOCK) {
      return changeRequestsStore.filter((r) => r.memberId === memberId);
    }

    return http.get<MemberChangeRequest[]>(
      `/api/v1/tenant/portal/change-requests?memberId=${memberId}`
    );
  },

  /**
   * Submit registration update request to secretariat
   */
  async submitChangeRequest(
    memberId: string,
    data: MemberUpdateRegistrationFormData
  ): Promise<MemberChangeRequest> {
    if (IS_MOCK) {
      const member =
        MOCK_MEMBERS.find((m) => m.id === memberId) || MOCK_MEMBERS[0];

      const newRequest: MemberChangeRequest = {
        id: `req-${Date.now().toString().slice(-4)}`,
        tenantId: member.tenantId,
        memberId: member.id,
        memberName: member.name,
        memberEmail: member.email,
        requestedByUserId: 'user-mem-01',
        status: 'pending',
        proposedChanges: {
          phone: data.phone,
          email: data.email,
          maritalStatus: data.maritalStatus,
          address: data.address,
          neighborhood: data.neighborhood,
          city: data.city,
          state: data.state,
          postalCode: data.postalCode,
          emergencyContactName: data.emergencyContactName,
          emergencyContactPhone: data.emergencyContactPhone,
          justification: data.justification,
        },
        originalData: {
          phone: member.phone,
          email: member.email,
          maritalStatus: member.maritalStatus,
          address: member.address,
          neighborhood: member.neighborhood,
          city: member.city,
          state: member.state,
          postalCode: member.postalCode,
          emergencyContactName: member.emergencyContactName,
          emergencyContactPhone: member.emergencyContactPhone,
        },
        createdAt: new Date().toISOString(),
      };

      changeRequestsStore.unshift(newRequest);
      return newRequest;
    }

    return http.post<MemberChangeRequest>(
      '/api/v1/tenant/portal/change-requests',
      { memberId, ...data }
    );
  },
};
