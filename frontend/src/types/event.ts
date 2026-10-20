export interface EventRegistration {
  id: number;
  event_id: number;
  member_id?: number | null;
  name: string;
  email?: string | null;
  phone?: string | null;
  qr_code_token: string;
  status: 'confirmed' | 'cancelled' | 'waitlist';
  registered_at: string;
  notes?: string | null;
  member?: {
    id: number;
    name: string;
    email?: string | null;
    phone?: string | null;
  } | null;
  attendance?: {
    id: number;
    checked_in_at: string;
  } | null;
}

export interface EventAttendance {
  id: number;
  event_id: number;
  registration_id?: number | null;
  member_id?: number | null;
  visitor_id?: number | null;
  name: string;
  check_in_type: 'qr_code' | 'manual';
  checked_in_at: string;
  checked_in_by?: {
    id: number;
    name: string;
  } | null;
  notes?: string | null;
  registration?: EventRegistration | null;
}

export interface Event {
  id: number;
  tenant_id: number;
  congregation_id?: number | null;
  ministry_id?: number | null;
  title: string;
  slug: string;
  type: 'service' | 'conference' | 'course' | 'workshop' | 'retreat' | 'other';
  description?: string | null;
  location?: string | null;
  banner_url?: string | null;
  start_date: string;
  end_date?: string | null;
  start_time: string;
  end_time?: string | null;
  max_capacity?: number | null;
  requires_registration: boolean;
  is_free: boolean;
  price?: number;
  status: 'draft' | 'published' | 'cancelled' | 'completed';
  congregation?: {
    id: number;
    name: string;
  } | null;
  ministry?: {
    id: number;
    name: string;
    color: string;
  } | null;
  registrations_count?: number;
  attendances_count?: number;
  registrations?: EventRegistration[];
  attendances?: EventAttendance[];
}

export interface EventStats {
  event_id: number;
  title: string;
  max_capacity: number | null;
  total_confirmed_registrations: number;
  total_waitlist: number;
  total_attendances: number;
  attendance_rate: number;
  occupancy_rate: number | null;
  is_full: boolean;
  check_in_by_type: {
    qr_code: number;
    manual: number;
  };
}
