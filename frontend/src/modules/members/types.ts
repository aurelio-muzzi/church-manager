// Types for the Secretaria module (Members, Families, Visitors, Congregations, Change Requests)

export type Gender = 'male' | 'female';

export type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed' | 'separated';

export type MembershipStatus = 'active' | 'inactive' | 'under_discipline' | 'transferred' | 'deceased';

export type AdmissionType = 'baptism' | 'transfer' | 'profession_of_faith' | 'acclamation';

export type FamilyRole = 'head' | 'spouse' | 'child' | 'dependent' | 'other';

export type ChangeRequestStatus = 'pending' | 'approved' | 'rejected';

export type VisitorStatus = 'active' | 'converted' | 'inactive';

export interface Congregation {
  id: string;
  tenantId: string;
  name: string;
  slug: string;
  isMain: boolean;
  status: 'active' | 'inactive';
  leaderName?: string;
  email?: string;
  phone?: string;
  address?: string;
  neighborhood?: string;
  city: string;
  state: string;
  postalCode?: string;
  membersCount: number;
  createdAt: string;
}

export interface Family {
  id: string;
  tenantId: string;
  name: string;
  address?: string;
  notes?: string;
  headMemberId?: string;
  headMemberName?: string;
  membersCount: number;
  members?: {
    id: string;
    name: string;
    familyRole: FamilyRole;
    isMinor: boolean;
  }[];
  createdAt: string;
}

export interface Member {
  id: string;
  tenantId: string;
  congregationId: string;
  congregationName?: string;
  familyId?: string;
  familyName?: string;
  familyRole?: FamilyRole;
  name: string;
  email?: string;
  phone?: string;
  gender: Gender;
  birthDate: string; // YYYY-MM-DD
  isMinor: boolean; // Calculated: age < 18 (LGPD requirement)
  legalGuardianName?: string;
  legalGuardianPhone?: string;
  maritalStatus: MaritalStatus;
  membershipStatus: MembershipStatus;
  baptismDate?: string;
  admissionDate?: string;
  admissionType?: AdmissionType;
  address?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  notes?: string;
  createdAt: string;
}

export interface VisitorVisit {
  id: string;
  visitorId: string;
  visitDate: string;
  serviceName: string;
  notes?: string;
}

export interface Visitor {
  id: string;
  tenantId: string;
  congregationId: string;
  congregationName?: string;
  name: string;
  email?: string;
  phone?: string;
  firstVisitDate: string;
  howMetChurch?: string;
  prayerRequest?: string;
  status: VisitorStatus;
  notes?: string;
  convertedToMemberId?: string;
  convertedAt?: string;
  visitsCount: number;
  visits?: VisitorVisit[];
  createdAt: string;
}

export interface MemberChangeRequest {
  id: string;
  tenantId: string;
  memberId: string;
  memberName: string;
  memberEmail?: string;
  requestedByUserId?: string;
  reviewedByUserId?: string;
  status: ChangeRequestStatus;
  proposedChanges: Record<string, string | number | boolean | null | undefined>;
  originalData: Record<string, string | number | boolean | null | undefined>;
  reviewNotes?: string;
  reviewedAt?: string;
  createdAt: string;
}

export interface SecretariaSummaryMetrics {
  totalMembers: number;
  activeMembers: number;
  minorMembers: number; // LGPD
  totalCongregations: number;
  activeVisitors: number;
  pendingChangeRequests: number;
}

export interface MemberFilters {
  search?: string;
  congregationId?: string;
  status?: string;
  isMinor?: boolean;
  maritalStatus?: string;
}
