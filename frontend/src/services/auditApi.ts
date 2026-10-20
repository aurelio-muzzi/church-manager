import type { IsolationAuditResult, SystemReadinessReport } from '../types/audit';

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

export async function getSystemReadinessApi(): Promise<SystemReadinessReport> {
  const response = await fetch(`${API_BASE_URL}/system/readiness`, {
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Falha ao consultar auditoria e prontidão do sistema.');
  }

  return response.json();
}

export async function simulateIsolationSelfAuditApi(): Promise<IsolationAuditResult> {
  const response = await fetch(`${API_BASE_URL}/tenant/audit/simulate-isolation-test`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Falha ao executar autoteste de isolamento multi-tenant.');
  }

  return response.json();
}
