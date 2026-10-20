import type {
  ChurchNotice,
  MemberContributionsData,
  MemberDashboardData,
  MemberEventsData,
  MemberFullProfile,
  MemberPortalSchedule,
  PrayerRequest,
} from '../types/memberPortal';
import type { EventRegistration } from '../types/event';

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

export async function getMemberDashboardApi(): Promise<MemberDashboardData> {
  const response = await fetch(`${API_BASE_URL}/tenant/member-portal/dashboard`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Falha ao carregar painel do membro.');
  }

  const data = await response.json();
  return data.data;
}

export async function getMemberProfileApi(): Promise<MemberFullProfile> {
  const response = await fetch(`${API_BASE_URL}/tenant/member-portal/profile`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Falha ao carregar perfil do membro.');
  }

  const data = await response.json();
  return data.data;
}

export async function requestMemberProfileUpdateApi(payload: Record<string, string>): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/tenant/member-portal/profile/update-request`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Falha ao solicitar alteração cadastral.');
  }
}

export async function getMemberSchedulesApi(): Promise<MemberPortalSchedule[]> {
  const response = await fetch(`${API_BASE_URL}/tenant/member-portal/schedules`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Falha ao carregar escalas de serviço.');
  }

  const data = await response.json();
  return data.data;
}

export async function respondMemberScheduleApi(
  scheduleVolunteerId: number,
  status: 'confirmed' | 'declined',
  declineReason?: string
): Promise<MemberPortalSchedule> {
  const response = await fetch(`${API_BASE_URL}/tenant/member-portal/schedules/${scheduleVolunteerId}/respond`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({
      status,
      decline_reason: declineReason,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Falha ao responder escala.');
  }

  return data.data;
}

export async function getMemberEventsApi(): Promise<MemberEventsData> {
  const response = await fetch(`${API_BASE_URL}/tenant/member-portal/events`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Falha ao carregar eventos do membro.');
  }

  const data = await response.json();
  return data.data;
}

export async function registerMemberEventApi(eventId: number): Promise<EventRegistration> {
  const response = await fetch(`${API_BASE_URL}/tenant/member-portal/events/${eventId}/register`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Falha ao realizar inscrição no evento.');
  }

  return data.data;
}

export async function getMemberContributionsApi(year?: number): Promise<MemberContributionsData> {
  const params = new URLSearchParams();
  if (year) params.append('year', String(year));

  const url = `${API_BASE_URL}/tenant/member-portal/contributions${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetch(url, { headers: getAuthHeaders() });

  if (!response.ok) {
    throw new Error('Falha ao carregar extrato de contribuições.');
  }

  const data = await response.json();
  return data.data;
}

export async function getMemberPrayerRequestsApi(): Promise<PrayerRequest[]> {
  const response = await fetch(`${API_BASE_URL}/tenant/member-portal/prayer-requests`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Falha ao carregar pedidos de oração.');
  }

  const data = await response.json();
  return data.data;
}

export async function createMemberPrayerRequestApi(payload: {
  title: string;
  description: string;
  is_confidential?: boolean;
}): Promise<PrayerRequest> {
  const response = await fetch(`${API_BASE_URL}/tenant/member-portal/prayer-requests`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Falha ao enviar pedido de oração.');
  }

  return data.data;
}

export async function getChurchNoticesApi(): Promise<ChurchNotice[]> {
  const response = await fetch(`${API_BASE_URL}/tenant/member-portal/notices`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Falha ao carregar mural de avisos.');
  }

  const data = await response.json();
  return data.data;
}
