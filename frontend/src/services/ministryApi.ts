import type {
  ConflictCheckResult,
  Ministry,
  MinistryVolunteer,
  Schedule,
  ScheduleVolunteer,
} from '../types/ministry';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

function getAuthHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  };

  const token = localStorage.getItem('cm_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const tenantId = localStorage.getItem('cm_active_tenant_id');
  if (tenantId) {
    headers['X-Tenant-ID'] = tenantId;
  }

  return headers;
}

export async function getMinistriesApi(search = '', status = ''): Promise<Ministry[]> {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (status) params.append('status', status);

  const url = `${API_BASE_URL}/tenant/ministries${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetch(url, { headers: getAuthHeaders() });

  if (!response.ok) {
    throw new Error('Falha ao carregar ministérios.');
  }

  const data = await response.json();
  return data.data;
}

export async function createMinistryApi(payload: {
  name: string;
  description?: string;
  color?: string;
  leader_member_id?: number | null;
  roles?: { name: string }[];
}): Promise<Ministry> {
  const response = await fetch(`${API_BASE_URL}/tenant/ministries`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Falha ao cadastrar ministério.');
  }

  return data.data;
}

export async function getMinistryDetailsApi(id: number): Promise<Ministry> {
  const response = await fetch(`${API_BASE_URL}/tenant/ministries/${id}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Falha ao carregar detalhes do ministério.');
  }

  const data = await response.json();
  return data.data;
}

export async function addMinistryVolunteerApi(
  ministryId: number,
  payload: { member_id: number; ministry_role_id?: number | null; notes?: string }
): Promise<MinistryVolunteer> {
  const response = await fetch(`${API_BASE_URL}/tenant/ministries/${ministryId}/volunteers`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Falha ao adicionar voluntário ao ministério.');
  }

  return data.data;
}

export async function removeMinistryVolunteerApi(
  ministryId: number,
  volunteerId: number
): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/tenant/ministries/${ministryId}/volunteers/${volunteerId}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Falha ao remover voluntário do ministério.');
  }
}

export async function getSchedulesApi(filters?: {
  ministry_id?: number | string;
  date?: string;
  status?: string;
}): Promise<Schedule[]> {
  const params = new URLSearchParams();
  if (filters?.ministry_id) params.append('ministry_id', String(filters.ministry_id));
  if (filters?.date) params.append('date', filters.date);
  if (filters?.status) params.append('status', filters.status);

  const url = `${API_BASE_URL}/tenant/schedules${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetch(url, { headers: getAuthHeaders() });

  if (!response.ok) {
    throw new Error('Falha ao carregar escalas de serviço.');
  }

  const data = await response.json();
  return data.data;
}

export async function checkScheduleConflictApi(payload: {
  member_id: number;
  date: string;
  start_time: string;
  end_time: string;
  ignore_schedule_id?: number;
}): Promise<ConflictCheckResult> {
  const response = await fetch(`${API_BASE_URL}/tenant/schedules/check-conflicts`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Falha ao verificar conflitos de escala.');
  }

  return data;
}

export async function createScheduleApi(payload: {
  ministry_id: number;
  congregation_id?: number | null;
  title: string;
  date: string;
  start_time: string;
  end_time: string;
  notes?: string;
  volunteers?: { member_id: number; ministry_role_id?: number | null }[];
  allow_conflicts?: boolean;
}): Promise<Schedule> {
  const response = await fetch(`${API_BASE_URL}/tenant/schedules`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    const error: any = new Error(data.message || 'Falha ao cadastrar escala.');
    error.conflict = data.conflict;
    error.status = response.status;
    throw error;
  }

  return data.data;
}

export async function respondScheduleApi(
  scheduleId: number,
  volunteerId: number,
  payload: {
    action: 'confirm' | 'decline' | 'substitute';
    decline_reason?: string;
    substituted_by_member_id?: number;
    notes?: string;
  }
): Promise<ScheduleVolunteer> {
  const response = await fetch(
    `${API_BASE_URL}/tenant/schedules/${scheduleId}/volunteers/${volunteerId}/respond`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    }
  );

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Falha ao responder escala.');
  }

  return data.data;
}
