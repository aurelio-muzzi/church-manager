export interface MinistryRole {
  id: string;
  ministryId: string;
  name: string;
  description?: string;
  requiredVolunteers?: number;
}

export interface Ministry {
  id: string;
  tenantId: string;
  name: string;
  description: string;
  leaderId: string;
  leaderName: string;
  leaderEmail?: string;
  leaderPhone?: string;
  color: string; // Hex color code or color token
  status: 'active' | 'inactive';
  membersCount: number;
  rolesCount: number;
  roles?: MinistryRole[];
  createdAt: string;
}

export interface MinistryVolunteer {
  id: string;
  tenantId: string;
  ministryId: string;
  ministryName: string;
  memberId: string;
  memberName: string;
  memberEmail?: string;
  memberPhone?: string;
  roleId: string;
  roleName: string;
  status: 'active' | 'inactive';
  joinedAt: string;
}

export type ScheduleVolunteerStatus = 'pending' | 'confirmed' | 'declined' | 'substituted';

export interface ScheduleVolunteer {
  id: string;
  scheduleId: string;
  volunteerId: string; // ID of MinistryVolunteer or Member
  memberId: string;
  memberName: string;
  memberPhone?: string;
  roleName: string;
  status: ScheduleVolunteerStatus;
  declineReason?: string;
  substitutedById?: string;
  substitutedByName?: string;
  respondedAt?: string;
}

export type ScheduleStatus = 'draft' | 'published' | 'completed' | 'cancelled';

export interface Schedule {
  id: string;
  tenantId: string;
  ministryId: string;
  ministryName: string;
  ministryColor: string;
  title: string;
  description?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  status: ScheduleStatus;
  volunteers: ScheduleVolunteer[];
  notes?: string;
  createdAt: string;
}

export interface ScheduleConflict {
  hasConflict: boolean;
  memberId: string;
  memberName: string;
  conflictingScheduleId: string;
  conflictingScheduleTitle: string;
  conflictingMinistryName: string;
  conflictingDate: string;
  conflictingTimeWindow: string;
  message: string;
}

export interface MinistrySummaryMetrics {
  totalMinistries: number;
  activeVolunteers: number;
  publishedSchedules: number;
  pendingConfirmations: number;
  confirmedPresences: number;
  declinedPresences: number;
}

export interface ScheduleFilters {
  ministryId?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}
