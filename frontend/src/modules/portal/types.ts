/**
 * Member Portal Module — Domain Types & Contracts
 * ChurchManager Enterprise Multi-Tenant Platform
 */

import type { FinancialTransaction } from '@/modules/finance/types';
import type { Member } from '@/modules/members/types';

export interface MemberCredential {
  memberId: string;
  matricula: string;
  fullName: string;
  cpfMasked: string;
  rgMasked?: string;
  birthDate: string;
  baptismDate?: string;
  admissionDate: string;
  membershipStatus: 'active' | 'inactive' | 'transferred' | 'disciplined';
  ecclesiasticalRole: string;
  congregationName: string;
  tenantName: string;
  photoUrl?: string;
  qrCodeValidationToken: string;
  validUntil: string;
}

export interface MemberContributionSummary {
  yearlyTotal: number;
  monthlyTotal: number;
  totalCount: number;
  contributions: FinancialTransaction[];
}

export interface MonthlyTaxItem {
  month: string;
  monthName: string;
  tithes: number;
  offerings: number;
  total: number;
}

export interface MemberAnnualTaxStatement {
  year: number;
  memberName: string;
  memberCpf: string;
  churchName: string;
  churchCnpj: string;
  totalTithes: number;
  totalOfferings: number;
  totalContributed: number;
  monthlyBreakdown: MonthlyTaxItem[];
  emittedAt: string;
  verificationCode: string;
}

export interface MemberScheduleItem {
  scheduleId: string;
  volunteerId: string;
  date: string;
  startTime: string;
  endTime: string;
  ministryName: string;
  ministryColor?: string;
  roleName: string;
  status: 'confirmed' | 'pending' | 'declined' | 'substituted';
  notes?: string;
  declineReason?: string;
  respondedAt?: string;
}

export interface MemberRegistrationItem {
  registrationId: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  eventLocation: string;
  ticketCode: string;
  qrCodeToken: string;
  status: 'confirmed' | 'waitlist' | 'checked_in' | 'cancelled';
  checkedIn: boolean;
  checkedInAt?: string;
}

export interface MemberFamilyNucleus {
  familyId: string;
  familyName: string;
  address?: string;
  members: Member[];
}

export interface MemberAnnouncement {
  id: string;
  title: string;
  content: string;
  author: string;
  date: string;
  category: 'general' | 'event' | 'pastoral' | 'urgent';
  isImportant?: boolean;
}

export interface MemberPortalSummary {
  credential: MemberCredential;
  nextSchedule?: MemberScheduleItem;
  nextEvent?: MemberRegistrationItem;
  yearlyContributions: number;
  monthlyContributions: number;
  unreadAnnouncementsCount: number;
  familyMembersCount: number;
}
