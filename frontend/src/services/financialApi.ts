import type {
  FinancialAccount,
  FinancialBudget,
  FinancialCategory,
  FinancialSummaryReport,
  FinancialTransaction,
  MemberContributionReport,
} from '../types/financial';

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

// Contas
export async function getFinancialAccountsApi(filters?: { status?: string; type?: string }): Promise<FinancialAccount[]> {
  const params = new URLSearchParams();
  if (filters?.status) params.append('status', filters.status);
  if (filters?.type) params.append('type', filters.type);

  const url = `${API_BASE_URL}/tenant/financial/accounts${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetch(url, { headers: getAuthHeaders() });

  if (!response.ok) {
    throw new Error('Falha ao carregar contas financeiras.');
  }

  const data = await response.json();
  return data.data;
}

export async function createFinancialAccountApi(payload: Partial<FinancialAccount>): Promise<FinancialAccount> {
  const response = await fetch(`${API_BASE_URL}/tenant/financial/accounts`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Falha ao cadastrar conta financeira.');
  }

  return data.data;
}

export async function deleteFinancialAccountApi(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/tenant/financial/accounts/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || 'Falha ao excluir conta financeira.');
  }
}

// Categorias
export async function getFinancialCategoriesApi(filters?: { type?: string }): Promise<FinancialCategory[]> {
  const params = new URLSearchParams();
  if (filters?.type) params.append('type', filters.type);

  const url = `${API_BASE_URL}/tenant/financial/categories${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetch(url, { headers: getAuthHeaders() });

  if (!response.ok) {
    throw new Error('Falha ao carregar plano de contas.');
  }

  const data = await response.json();
  return data.data;
}

export async function createFinancialCategoryApi(payload: Partial<FinancialCategory>): Promise<FinancialCategory> {
  const response = await fetch(`${API_BASE_URL}/tenant/financial/categories`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Falha ao criar categoria financeira.');
  }

  return data.data;
}

// Transações
export async function getFinancialTransactionsApi(filters?: {
  start_date?: string;
  end_date?: string;
  account_id?: number;
  category_id?: number;
  type?: string;
  status?: string;
  reconciled?: boolean;
  search?: string;
}): Promise<FinancialTransaction[]> {
  const params = new URLSearchParams();
  if (filters?.start_date) params.append('start_date', filters.start_date);
  if (filters?.end_date) params.append('end_date', filters.end_date);
  if (filters?.account_id) params.append('account_id', String(filters.account_id));
  if (filters?.category_id) params.append('category_id', String(filters.category_id));
  if (filters?.type) params.append('type', filters.type);
  if (filters?.status) params.append('status', filters.status);
  if (filters?.reconciled !== undefined) params.append('reconciled', filters.reconciled ? '1' : '0');
  if (filters?.search) params.append('search', filters.search);

  const url = `${API_BASE_URL}/tenant/financial/transactions${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetch(url, { headers: getAuthHeaders() });

  if (!response.ok) {
    throw new Error('Falha ao carregar transações financeiras.');
  }

  const data = await response.json();
  return data.data;
}

export async function createFinancialTransactionApi(payload: Partial<FinancialTransaction>): Promise<FinancialTransaction> {
  const response = await fetch(`${API_BASE_URL}/tenant/financial/transactions`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Falha ao registrar transação.');
  }

  return data.data;
}

export async function reconcileTransactionApi(id: number): Promise<FinancialTransaction> {
  const response = await fetch(`${API_BASE_URL}/tenant/financial/transactions/${id}/reconcile`, {
    method: 'POST',
    headers: getAuthHeaders(),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Falha ao conciliar transação.');
  }

  return data.data;
}

export async function deleteFinancialTransactionApi(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/tenant/financial/transactions/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.message || 'Falha ao excluir transação.');
  }
}

// Relatórios & Dashboard
export async function getFinancialSummaryApi(startDate?: string, endDate?: string): Promise<FinancialSummaryReport> {
  const params = new URLSearchParams();
  if (startDate) params.append('start_date', startDate);
  if (endDate) params.append('end_date', endDate);

  const url = `${API_BASE_URL}/tenant/financial/reports/summary${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetch(url, { headers: getAuthHeaders() });

  if (!response.ok) {
    throw new Error('Falha ao carregar demonstrativo financeiro.');
  }

  const data = await response.json();
  return data.data;
}

export async function getMemberContributionsApi(memberId: number, year?: number): Promise<MemberContributionReport> {
  const params = new URLSearchParams();
  if (year) params.append('year', String(year));

  const url = `${API_BASE_URL}/tenant/financial/reports/member/${memberId}${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetch(url, { headers: getAuthHeaders() });

  if (!response.ok) {
    throw new Error('Falha ao carregar relatório de contribuições do membro.');
  }

  const data = await response.json();
  return data.data;
}

// Orçamentos
export async function getFinancialBudgetsApi(year?: number, month?: number): Promise<FinancialBudget[]> {
  const params = new URLSearchParams();
  if (year) params.append('year', String(year));
  if (month) params.append('month', String(month));

  const url = `${API_BASE_URL}/tenant/financial/budgets${params.toString() ? `?${params.toString()}` : ''}`;
  const response = await fetch(url, { headers: getAuthHeaders() });

  if (!response.ok) {
    throw new Error('Falha ao carregar orçamentos.');
  }

  const data = await response.json();
  return data.data;
}

export async function createFinancialBudgetApi(payload: Partial<FinancialBudget>): Promise<FinancialBudget> {
  const response = await fetch(`${API_BASE_URL}/tenant/financial/budgets`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(payload),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || 'Falha ao registrar orçamento.');
  }

  return data.data;
}
