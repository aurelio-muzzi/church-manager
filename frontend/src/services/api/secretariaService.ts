import { http } from '@/services/http/client';
import type {
  Congregation,
  Family,
  Member,
  Visitor,
  MemberChangeRequest,
  SecretariaSummaryMetrics,
  MemberFilters,
} from '@/modules/members/types';
import type {
  MemberFormData,
  CongregationFormData,
  FamilyFormData,
  VisitorFormData,
  VisitorVisitFormData,
} from '@/modules/members/schemas';
import {
  MOCK_CONGREGATIONS,
  MOCK_FAMILIES,
  MOCK_MEMBERS,
  MOCK_VISITORS,
  MOCK_CHANGE_REQUESTS,
} from '@/services/adapters/fixtures';
import { isMinorBirthDate } from '@/modules/members/schemas';

const IS_MOCK = import.meta.env.VITE_USE_DEV_MOCK !== 'false';

// Mutable in-memory stores for realistic Dev Mock experience
let membersStore: Member[] = [...MOCK_MEMBERS];
let congregationsStore: Congregation[] = [...MOCK_CONGREGATIONS];
let familiesStore: Family[] = [...MOCK_FAMILIES];
let visitorsStore: Visitor[] = [...MOCK_VISITORS];
let changeRequestsStore: MemberChangeRequest[] = [...MOCK_CHANGE_REQUESTS];

export const secretariaService = {
  async getSummaryMetrics(): Promise<SecretariaSummaryMetrics> {
    if (IS_MOCK) {
      const activeMembers = membersStore.filter((m) => m.membershipStatus === 'active').length;
      const minorMembers = membersStore.filter((m) => m.isMinor).length;
      const activeVisitors = visitorsStore.filter((v) => v.status === 'active').length;
      const pendingChangeRequests = changeRequestsStore.filter((r) => r.status === 'pending').length;

      return {
        totalMembers: membersStore.length,
        activeMembers,
        minorMembers,
        totalCongregations: congregationsStore.length,
        activeVisitors,
        pendingChangeRequests,
      };
    }
    const response = await http.get<SecretariaSummaryMetrics>('/api/v1/tenant/secretaria/metrics');
    return response;
  },

  async getMembers(filters?: MemberFilters): Promise<Member[]> {
    if (IS_MOCK) {
      let filtered = [...membersStore];

      if (filters?.search) {
        const query = filters.search.toLowerCase();
        filtered = filtered.filter(
          (m) =>
            m.name.toLowerCase().includes(query) ||
            m.email?.toLowerCase().includes(query) ||
            m.phone?.includes(query)
        );
      }

      if (filters?.congregationId && filters.congregationId !== 'all') {
        filtered = filtered.filter((m) => m.congregationId === filters.congregationId);
      }

      if (filters?.status && filters.status !== 'all') {
        filtered = filtered.filter((m) => m.membershipStatus === filters.status);
      }

      if (filters?.isMinor !== undefined) {
        filtered = filtered.filter((m) => m.isMinor === filters.isMinor);
      }

      return filtered;
    }

    const response = await http.get<Member[]>('/api/v1/tenant/members', { params: filters });
    return response;
  },

  async getMemberById(id: string): Promise<Member | undefined> {
    if (IS_MOCK) {
      return membersStore.find((m) => m.id === id);
    }
    const response = await http.get<Member>(`/api/v1/tenant/members/${id}`);
    return response;
  },

  async createMember(data: MemberFormData): Promise<Member> {
    const isMinor = isMinorBirthDate(data.birthDate);
    const congregation = congregationsStore.find((c) => c.id === data.congregationId);
    const family = data.familyId ? familiesStore.find((f) => f.id === data.familyId) : undefined;

    if (IS_MOCK) {
      const newMember: Member = {
        id: `mem-${Date.now().toString(36)}`,
        tenantId: 'tenant-manaus-central',
        congregationId: data.congregationId,
        congregationName: congregation?.name || 'Congregação',
        familyId: data.familyId || undefined,
        familyName: family?.name,
        familyRole: data.familyRole,
        name: data.name,
        email: data.email || undefined,
        phone: data.phone || undefined,
        gender: data.gender,
        birthDate: data.birthDate,
        isMinor,
        legalGuardianName: data.legalGuardianName || undefined,
        legalGuardianPhone: data.legalGuardianPhone || undefined,
        maritalStatus: data.maritalStatus,
        membershipStatus: data.membershipStatus,
        admissionType: data.admissionType,
        admissionDate: data.admissionDate || undefined,
        baptismDate: data.baptismDate || undefined,
        address: data.address || undefined,
        neighborhood: data.neighborhood || undefined,
        city: data.city || undefined,
        state: data.state || undefined,
        postalCode: data.postalCode || undefined,
        emergencyContactName: data.emergencyContactName || undefined,
        emergencyContactPhone: data.emergencyContactPhone || undefined,
        notes: data.notes || undefined,
        createdAt: new Date().toISOString(),
      };

      membersStore = [newMember, ...membersStore];
      return newMember;
    }

    const response = await http.post<Member>('/api/v1/tenant/members', data);
    return response;
  },

  async updateMember(id: string, data: Partial<MemberFormData>): Promise<Member> {
    if (IS_MOCK) {
      const index = membersStore.findIndex((m) => m.id === id);
      if (index === -1) {
        throw new Error('Membro não encontrado');
      }

      const current = membersStore[index];
      const isMinor = data.birthDate ? isMinorBirthDate(data.birthDate) : current.isMinor;
      const congregation = data.congregationId
        ? congregationsStore.find((c) => c.id === data.congregationId)
        : undefined;

      const updated: Member = {
        ...current,
        ...data,
        isMinor,
        congregationName: congregation ? congregation.name : current.congregationName,
      };

      membersStore[index] = updated;
      return updated;
    }

    const response = await http.put<Member>(`/api/v1/tenant/members/${id}`, data);
    return response;
  },

  async deleteMember(id: string): Promise<void> {
    if (IS_MOCK) {
      membersStore = membersStore.filter((m) => m.id !== id);
      return;
    }
    await http.delete(`/api/v1/tenant/members/${id}`);
  },

  async getCongregations(): Promise<Congregation[]> {
    if (IS_MOCK) {
      return [...congregationsStore];
    }
    const response = await http.get<Congregation[]>('/api/v1/tenant/congregations');
    return response;
  },

  async createCongregation(data: CongregationFormData): Promise<Congregation> {
    if (IS_MOCK) {
      const newCongregation: Congregation = {
        id: `cong-${Date.now().toString(36)}`,
        tenantId: 'tenant-manaus-central',
        name: data.name,
        slug: data.name.toLowerCase().replace(/\s+/g, '-'),
        isMain: data.isMain ?? false,
        status: 'active',
        leaderName: data.leaderName,
        phone: data.phone || undefined,
        email: data.email || undefined,
        city: data.city,
        state: data.state,
        address: data.address || undefined,
        neighborhood: data.neighborhood || undefined,
        postalCode: data.postalCode || undefined,
        membersCount: 0,
        createdAt: new Date().toISOString(),
      };

      congregationsStore = [...congregationsStore, newCongregation];
      return newCongregation;
    }

    const response = await http.post<Congregation>('/api/v1/tenant/congregations', data);
    return response;
  },

  async getFamilies(): Promise<Family[]> {
    if (IS_MOCK) {
      return [...familiesStore];
    }
    const response = await http.get<Family[]>('/api/v1/tenant/families');
    return response;
  },

  async createFamily(data: FamilyFormData): Promise<Family> {
    if (IS_MOCK) {
      const newFamily: Family = {
        id: `fam-${Date.now().toString(36)}`,
        tenantId: 'tenant-manaus-central',
        name: data.name,
        address: data.address || undefined,
        notes: data.notes || undefined,
        membersCount: 0,
        createdAt: new Date().toISOString(),
      };

      familiesStore = [...familiesStore, newFamily];
      return newFamily;
    }

    const response = await http.post<Family>('/api/v1/tenant/families', data);
    return response;
  },

  async getVisitors(): Promise<Visitor[]> {
    if (IS_MOCK) {
      return [...visitorsStore];
    }
    const response = await http.get<Visitor[]>('/api/v1/tenant/visitors');
    return response;
  },

  async createVisitor(data: VisitorFormData): Promise<Visitor> {
    const congregation = congregationsStore.find((c) => c.id === data.congregationId);

    if (IS_MOCK) {
      const newVisitor: Visitor = {
        id: `vis-${Date.now().toString(36)}`,
        tenantId: 'tenant-manaus-central',
        congregationId: data.congregationId,
        congregationName: congregation?.name || 'Congregação',
        name: data.name,
        phone: data.phone,
        email: data.email || undefined,
        firstVisitDate: data.firstVisitDate,
        howMetChurch: data.howMetChurch || undefined,
        prayerRequest: data.prayerRequest || undefined,
        notes: data.notes || undefined,
        status: 'active',
        visitsCount: 1,
        visits: [
          {
            id: `vvis-${Date.now().toString(36)}`,
            visitorId: `vis-${Date.now().toString(36)}`,
            visitDate: data.firstVisitDate,
            serviceName: 'Primeira Visita',
          },
        ],
        createdAt: new Date().toISOString(),
      };

      visitorsStore = [newVisitor, ...visitorsStore];
      return newVisitor;
    }

    const response = await http.post<Visitor>('/api/v1/tenant/visitors', data);
    return response;
  },

  async recordVisitorVisit(visitorId: string, data: VisitorVisitFormData): Promise<void> {
    if (IS_MOCK) {
      const visitor = visitorsStore.find((v) => v.id === visitorId);
      if (visitor) {
        visitor.visitsCount++;
        visitor.visits = [
          ...(visitor.visits || []),
          {
            id: `vvis-${Date.now().toString(36)}`,
            visitorId,
            visitDate: data.visitDate,
            serviceName: data.serviceName,
            notes: data.notes || undefined,
          },
        ];
      }
      return;
    }

    await http.post(`/api/v1/tenant/visitors/${visitorId}/visits`, data);
  },

  async convertVisitorToMember(visitorId: string): Promise<Member> {
    if (IS_MOCK) {
      const visitorIndex = visitorsStore.findIndex((v) => v.id === visitorId);
      if (visitorIndex === -1) {
        throw new Error('Visitante não encontrado');
      }

      const visitor = visitorsStore[visitorIndex];
      const newMember: Member = {
        id: `mem-${Date.now().toString(36)}`,
        tenantId: visitor.tenantId,
        congregationId: visitor.congregationId,
        congregationName: visitor.congregationName,
        name: visitor.name,
        email: visitor.email,
        phone: visitor.phone,
        gender: 'male',
        birthDate: '1995-01-01',
        isMinor: false,
        maritalStatus: 'single',
        membershipStatus: 'active',
        admissionType: 'profession_of_faith',
        admissionDate: new Date().toISOString().split('T')[0],
        notes: `Convertido a partir do visitante ${visitor.name}. ${visitor.notes || ''}`,
        createdAt: new Date().toISOString(),
      };

      // Atualiza status do visitante
      visitorsStore[visitorIndex] = {
        ...visitor,
        status: 'converted',
        convertedToMemberId: newMember.id,
        convertedAt: new Date().toISOString(),
      };

      membersStore = [newMember, ...membersStore];
      return newMember;
    }

    const response = await http.post<Member>(`/api/v1/tenant/visitors/${visitorId}/convert-to-member`);
    return response;
  },

  async getChangeRequests(): Promise<MemberChangeRequest[]> {
    if (IS_MOCK) {
      return [...changeRequestsStore];
    }
    const response = await http.get<MemberChangeRequest[]>('/api/v1/tenant/change-requests');
    return response;
  },

  async reviewChangeRequest(
    id: string,
    data: { action: 'approve' | 'reject'; reviewNotes?: string }
  ): Promise<MemberChangeRequest> {
    if (IS_MOCK) {
      const index = changeRequestsStore.findIndex((r) => r.id === id);
      if (index === -1) {
        throw new Error('Solicitação cadastral não encontrada');
      }

      const request = changeRequestsStore[index];
      const updated: MemberChangeRequest = {
        ...request,
        status: data.action === 'approve' ? 'approved' : 'rejected',
        reviewNotes: data.reviewNotes,
        reviewedAt: new Date().toISOString(),
      };

      changeRequestsStore[index] = updated;

      // Se aprovado, aplica as alterações propostas no membro
      if (data.action === 'approve') {
        const memberIndex = membersStore.findIndex((m) => m.id === request.memberId);
        if (memberIndex !== -1) {
          membersStore[memberIndex] = {
            ...membersStore[memberIndex],
            ...request.proposedChanges,
          } as Member;
        }
      }

      return updated;
    }

    const response = await http.post<MemberChangeRequest>(
      `/api/v1/tenant/change-requests/${id}/review`,
      data
    );
    return response;
  },

  // Helper method for tests to reset stores to original fixtures
  resetMockStores() {
    membersStore = [...MOCK_MEMBERS];
    congregationsStore = [...MOCK_CONGREGATIONS];
    familiesStore = [...MOCK_FAMILIES];
    visitorsStore = [...MOCK_VISITORS];
    changeRequestsStore = [...MOCK_CHANGE_REQUESTS];
  },
};
