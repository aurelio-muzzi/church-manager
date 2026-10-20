export interface Congregation {
  id: number;
  name: string;
  slug: string;
  address?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
  phone?: string | null;
  leader_name?: string | null;
  is_main: boolean;
  status: 'active' | 'inactive';
  members_count?: number;
}

export interface Member {
  id: number;
  tenant_id: number;
  congregation_id?: number | null;
  congregation?: { id: number; name: string } | null;
  family_id?: number | null;
  family?: { id: number; name: string } | null;
  family_role?: string | null;
  name: string;
  email?: string | null;
  phone?: string | null;
  gender?: 'male' | 'female' | 'other' | null;
  birth_date?: string | null;
  is_minor: boolean;
  marital_status?: string | null;
  membership_status: 'active' | 'inactive' | 'under_discipline' | 'transferred' | 'deceased';
  admission_date?: string | null;
  admission_type?: string | null;
  address?: string | null;
  neighborhood?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  notes?: string | null;
}

export interface VisitorVisit {
  id: number;
  visited_at: string;
  service_type?: string | null;
  welcomed_by?: string | null;
}

export interface Visitor {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
  first_visit_date?: string | null;
  how_met_church?: string | null;
  prayer_request?: string | null;
  status: 'active' | 'converted' | 'archived';
  visits_count?: number;
  visits?: VisitorVisit[];
}

export interface MemberChangeRequest {
  id: number;
  member_id: number;
  status: 'pending' | 'approved' | 'rejected';
  proposed_changes: Record<string, string>;
  original_data?: Record<string, string> | null;
  review_notes?: string | null;
  reviewed_at?: string | null;
  created_at: string;
  member?: { id: number; name: string; email?: string; phone?: string };
  requested_by?: { id: number; name: string; email: string };
  reviewed_by?: { id: number; name: string; email: string } | null;
}
