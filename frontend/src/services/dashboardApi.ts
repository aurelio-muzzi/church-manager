import type {
  DemographicsData,
  ExecutiveOverview,
  FinancialEvolutionMonth,
  MinistryStatsData,
  PastoralAlertsData,
} from '../types/dashboard';

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

export async function getExecutiveOverviewApi(): Promise<ExecutiveOverview> {
  const response = await fetch(`${API_BASE_URL}/tenant/dashboard/executive`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Falha ao carregar visão executiva.');
  }

  const data = await response.json();
  return data.data;
}

export async function getDemographicsApi(): Promise<DemographicsData> {
  const response = await fetch(`${API_BASE_URL}/tenant/dashboard/demographics`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Falha ao carregar dados demográficos.');
  }

  const data = await response.json();
  return data.data;
}

export async function getMinistryStatsApi(): Promise<MinistryStatsData> {
  const response = await fetch(`${API_BASE_URL}/tenant/dashboard/ministries`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Falha ao carregar estatísticas de ministérios.');
  }

  const data = await response.json();
  return data.data;
}

export async function getFinancialEvolutionApi(): Promise<FinancialEvolutionMonth[]> {
  const response = await fetch(`${API_BASE_URL}/tenant/dashboard/financial-evolution`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Falha ao carregar evolução financeira.');
  }

  const data = await response.json();
  return data.data;
}

export async function getPastoralAlertsApi(): Promise<PastoralAlertsData> {
  const response = await fetch(`${API_BASE_URL}/tenant/dashboard/pastoral-alerts`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error('Falha ao carregar alertas pastorais.');
  }

  const data = await response.json();
  return data.data;
}

export async function downloadDashboardCsvApi(
  type: 'members' | 'financial' | 'attendance'
): Promise<void> {
  const endpointMap = {
    members: '/tenant/dashboard/export/members',
    financial: '/tenant/dashboard/export/financial',
    attendance: '/tenant/dashboard/export/attendance',
  };

  const headers = getAuthHeaders() as Record<string, string>;
  // For file download, remove Accept application/json
  headers['Accept'] = 'text/csv, application/octet-stream, */*';

  const response = await fetch(`${API_BASE_URL}${endpointMap[type]}`, {
    headers,
  });

  if (!response.ok) {
    throw new Error(`Falha ao exportar relatório CSV de ${type}.`);
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;

  // Extract filename if Content-Disposition is present
  const disposition = response.headers.get('Content-Disposition');
  let filename = `relatorio-${type}-${new Date().toISOString().split('T')[0]}.csv`;
  if (disposition && disposition.includes('filename=')) {
    const filenameMatch = disposition.match(/filename="?([^";]+)"?/);
    if (filenameMatch && filenameMatch[1]) {
      filename = filenameMatch[1];
    }
  }

  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
