import type { 
  ApiHealthResponse, 
  AuthData, 
  CreateTenantPayload, 
  PlatformTenant, 
  TenantInfo 
} from '../types';

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

export async function checkApiHealth(): Promise<ApiHealthResponse> {
  const response = await fetch(`${API_BASE_URL}/health`, {
    headers: { 'Accept': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Falha ao conectar na API: status ${response.status}`);
  }

  return response.json();
}

export async function loginApi(email: string, password: string): Promise<AuthData> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email, password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Credenciais inválidas.');
  }

  return data.data;
}

export async function logoutApi(): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: getAuthHeaders(),
    });
  } catch {
    // Silencia erros de logout de rede
  }
}

export async function getMeApi(): Promise<{ user: AuthData['user']; active_tenant: TenantInfo | null }> {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Sessão expirada ou inválida.');
  }

  const data = await response.json();
  return data.data;
}

export async function switchTenantApi(tenantId: number): Promise<TenantInfo> {
  const response = await fetch(`${API_BASE_URL}/auth/switch-tenant`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ tenant_id: tenantId }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Não foi possível alterar para esta igreja.');
  }

  return data.data.active_tenant;
}

export async function getPlatformTenantsApi(search = '', status = ''): Promise<PlatformTenant[]> {
  const params = new URLSearchParams();
  if (search) params.append('search', search);
  if (status) params.append('status', status);

  const response = await fetch(`${API_BASE_URL}/platform/tenants?${params.toString()}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Erro ao carregar lista de igrejas.');
  }

  const result = await response.json();
  return result.data.data;
}

export async function createPlatformTenantApi(payload: CreateTenantPayload): Promise<PlatformTenant> {
  const response = await fetch(`${API_BASE_URL}/platform/tenants`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Falha ao cadastrar igreja.');
  }

  return data.data;
}

export async function updateTenantStatusApi(tenantId: number, status: 'active' | 'suspended', reason?: string): Promise<PlatformTenant> {
  const response = await fetch(`${API_BASE_URL}/platform/tenants/${tenantId}/status`, {
    method: 'PATCH',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status, reason }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Falha ao atualizar status da igreja.');
  }

  return data.data;
}

export async function getTenantProfileApi(): Promise<TenantInfo> {
  const response = await fetch(`${API_BASE_URL}/tenant/profile`, {
    headers: getAuthHeaders(),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Falha ao obter perfil da igreja.');
  }

  return data.data;
}
