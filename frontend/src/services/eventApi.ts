import type {
  Event,
  EventAttendance,
  EventRegistration,
  EventStats,
} from '../types/event';

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

export async function getEventsApi(filters?: {
  type?: string;
  status?: string;
  start_date?: string;
  search?: string;
}): Promise<Event[]> {
  const params = new URLSearchParams();
  if (filters?.type) params.append('type', filters.type);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.start_date) params.append('start_date', filters.start_date);
  if (filters?.search) params.append('search', filters.search);

  const url = `${API_BASE_URL}/tenant/events${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetch(url, { headers: getAuthHeaders() });

  if (!response.ok) {
    throw new Error('Falha ao carregar lista de eventos.');
  }

  const data = await response.json();
  return data.data;
}

export async function createEventApi(payload: Partial<Event>): Promise<Event> {
  const response = await fetch(`${API_BASE_URL}/tenant/events`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Falha ao cadastrar evento.');
  }

  return data.data;
}

export async function getEventDetailsApi(id: number): Promise<Event> {
  const response = await fetch(`${API_BASE_URL}/tenant/events/${id}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Falha ao carregar detalhes do evento.');
  }

  const data = await response.json();
  return data.data;
}

export async function getEventRegistrationsApi(eventId: number): Promise<EventRegistration[]> {
  const response = await fetch(`${API_BASE_URL}/tenant/events/${eventId}/registrations`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Falha ao carregar inscrições do evento.');
  }

  const data = await response.json();
  return data.data;
}

export async function registerForEventApi(
  eventId: number,
  payload: {
    member_id?: number | null;
    name: string;
    email?: string | null;
    phone?: string | null;
    notes?: string | null;
  }
): Promise<{ registration: EventRegistration; message: string }> {
  const response = await fetch(`${API_BASE_URL}/tenant/events/${eventId}/registrations`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Falha ao realizar inscrição no evento.');
  }

  return { registration: data.data, message: data.message };
}

export async function checkInEventApi(
  eventId: number,
  payload: {
    qr_code_token?: string;
    registration_id?: number;
    member_id?: number;
    visitor_id?: number;
    name?: string;
    check_in_type?: 'qr_code' | 'manual';
    notes?: string;
  }
): Promise<{ status: string; message: string; attendance: EventAttendance }> {
  const response = await fetch(`${API_BASE_URL}/tenant/events/${eventId}/check-in`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Falha ao processar check-in.');
  }

  return {
    status: data.status,
    message: data.message,
    attendance: data.data,
  };
}

export async function getEventStatsApi(eventId: number): Promise<EventStats> {
  const response = await fetch(`${API_BASE_URL}/tenant/events/${eventId}/stats`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Falha ao carregar estatísticas do evento.');
  }

  const data = await response.json();
  return data.data;
}
