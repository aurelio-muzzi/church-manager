export interface MinistryRole {
  id: number;
  tenant_id?: number;
  ministry_id: number;
  name: string;
  description?: string | null;
}

export interface MinistryVolunteer {
  id: number;
  tenant_id?: number;
  ministry_id: number;
  member_id: number;
  ministry_role_id?: number | null;
  status: 'active' | 'inactive';
  joined_at?: string | null;
  notes?: string | null;
  member?: {
    id: number;
    name: string;
    email?: string | null;
    phone?: string | null;
  };
  role?: {
    id: number;
    name: string;
  } | null;
}

export interface Ministry {
  id: number;
  tenant_id: number;
  leader_member_id?: number | null;
  name: string;
  slug: string;
  description?: string | null;
  color: string;
  status: 'active' | 'inactive';
  leader?: {
    id: number;
    name: string;
    email?: string | null;
    phone?: string | null;
  } | null;
  roles?: MinistryRole[];
  volunteers?: MinistryVolunteer[];
  volunteers_count?: number;
}

export interface ScheduleVolunteer {
  id: number;
  schedule_id: number;
  member_id: number;
  ministry_role_id?: number | null;
  status: 'pending' | 'confirmed' | 'declined' | 'substituted';
  decline_reason?: string | null;
  substituted_by_member_id?: number | null;
  confirmed_at?: string | null;
  notes?: string | null;
  member?: {
    id: number;
    name: string;
    email?: string | null;
    phone?: string | null;
  };
  role?: {
    id: number;
    name: string;
  } | null;
  substituted_by?: {
    id: number;
    name: string;
  } | null;
}

export interface Schedule {
  id: number;
  tenant_id: number;
  ministry_id: number;
  congregation_id?: number | null;
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  notes?: string | null;
  status: 'draft' | 'published' | 'completed' | 'cancelled';
  ministry?: {
    id: number;
    name: string;
    color: string;
  };
  congregation?: {
    id: number;
    name: string;
  } | null;
  volunteers?: ScheduleVolunteer[];
}

export interface ConflictDetails {
  has_conflict: boolean;
  schedule_id: number;
  schedule_title: string;
  ministry_name: string;
  date: string;
  start_time: string;
  end_time: string;
  status: string;
  message: string;
}

export interface ConflictCheckResult {
  has_conflict: boolean;
  conflict?: ConflictDetails | null;
}
