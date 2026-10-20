import type {
  Congregation,
  Member,
  MemberChangeRequest,
  Visitor,
} from '../types/secretary';

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

export async function getCongregationsApi(): Promise<Congregation[]> {
  const response = await fetch(`${API_BASE_URL}/tenant/congregations`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Falha ao carregar congregações.');
  }

  const data = await response.json();
  return data.data;
}

export async function createCongregationApi(payload: Partial<Congregation>): Promise<Congregation> {
  const response = await fetch(`${API_BASE_URL}/tenant/congregations`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Falha ao cadastrar congregação.');
  }

  return data.data;
}

export async function getMembersApi(search = '', status = '', congregationId = ''): Promise<Member[]> {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (status) params.append('status', status);
  if (congregationId) params.append('congregation_id', congregationId);

  const response = await fetch(`${API_BASE_URL}/tenant/members?${params.toString()}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Falha ao carregar membros.');
  }

  const data = await response.json();
  return data.data.data;
}

export async function createMemberApi(payload: Partial<Member>): Promise<Member> {
  const response = await fetch(`${API_BASE_URL}/tenant/members`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Falha ao cadastrar membro.');
  }

  return data.data;
}

export async function getVisitorsApi(search = '', status = ''): Promise<Visitor[]> {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (status) params.append('status', status);

  const response = await fetch(`${API_BASE_URL}/tenant/visitors?${params.toString()}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Falha ao carregar visitantes.');
  }

  const data = await response.json();
  return data.data.data;
}

export async function createVisitorApi(payload: Partial<Visitor>): Promise<Visitor> {
  const response = await fetch(`${API_BASE_URL}/tenant/visitors`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Falha ao cadastrar visitante.');
  }

  return data.data;
}

export async function convertVisitorToMemberApi(visitorId: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/tenant/visitors/${visitorId}/convert-to-member`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({}),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Falha ao converter visitante em membro.');
  }
}

export async function getChangeRequestsApi(status = ''): Promise<MemberChangeRequest[]> {
  const params = new URLSearchParams();
  if (status) params.append('status', status);

  const response = await fetch(`${API_BASE_URL}/tenant/change-requests?${params.toString()}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Falha ao carregar solicitações cadastrais.');
  }

  const data = await response.json();
  return data.data.data;
}

export async function reviewChangeRequestApi(requestId: number, action: 'approve' | 'reject', reviewNotes: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/tenant/change-requests/${requestId}/review`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ action, review_notes: reviewNotes }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Falha ao processar solicitação.');
  }
}

export async function submitChangeRequestApi(proposedChanges: Record<string, string>): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/tenant/change-requests`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ proposed_changes: proposedChanges }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Falha ao enviar solicitação.');
  }
}
