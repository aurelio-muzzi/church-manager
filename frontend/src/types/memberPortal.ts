import type { Event, EventRegistration } from './event';
import type { Member } from './secretary';
import type { FinancialTransaction } from './financial';

export type NoticeCategory = 'general' | 'youth' | 'kids' | 'urgent' | 'events';
export type PrayerStatus = 'pending' | 'praying' | 'answered' | 'archived';

export interface ChurchNotice {
  id: number;
  tenant_id: number;
  congregation_id?: number | null;
  title: string;
  content: string;
  category: NoticeCategory;
  is_pinned: boolean;
  published_at: string;
  expires_at?: string | null;
  congregation?: { id: number; name: string };
  created_at?: string;
  updated_at?: string;
}

export interface PrayerRequest {
  id: number;
  tenant_id: number;
  member_id?: number | null;
  requester_name?: string | null;
  title: string;
  description: string;
  is_confidential: boolean;
  status: PrayerStatus;
  pastoral_notes?: string | null;
  answered_at?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface MemberPortalSchedule {
  id: number;
  tenant_id: number;
  schedule_id: number;
  member_id: number;
  ministry_role_id: number;
  status: 'scheduled' | 'confirmed' | 'declined' | 'replaced';
  decline_reason?: string | null;
  confirmed_at?: string | null;
  responded_at?: string | null;
  schedule: {
    id: number;
    title: string;
    date: string;
    start_time: string;
    end_time: string;
    notes?: string | null;
    status: string;
    ministry?: {
      id: number;
      name: string;
      color: string;
    };
    congregation?: {
      id: number;
      name: string;
    };
  };
  role?: {
    id: number;
    name: string;
  };
}

export interface MemberDashboardData {
  member: {
    id: number;
    name: string;
    email?: string | null;
    phone?: string | null;
    membership_status: string;
    admission_date?: string | null;
  };
  pending_schedules_count: number;
  upcoming_schedules: MemberPortalSchedule[];
  my_registrations: EventRegistration[];
  pinned_notices: ChurchNotice[];
  prayer_requests_count: number;
}

export interface MemberEventsData {
  my_registrations: EventRegistration[];
  available_events: Event[];
}

export interface MemberContributionsData {
  year: number;
  total_contributed: number;
  contributions: FinancialTransaction[];
}

export interface MemberFullProfile extends Member {
  family?: {
    id: number;
    name: string;
    members?: Member[];
  } | null;
  ministryVolunteers?: Array<{
    id: number;
    ministry?: { id: number; name: string; color: string };
    role?: { id: number; name: string };
  }>;
}
