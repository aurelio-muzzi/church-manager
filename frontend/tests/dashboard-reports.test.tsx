/**
 * Automated Test Suite — Etapa 09: Dashboards e Relatórios
 * ChurchManager Enterprise Multi-Tenant Platform
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/feedback/ToastProvider';
import { AuthContext } from '@/modules/authentication/AuthContext';
import { DashboardBiPage } from '@/modules/dashboard/pages/DashboardBiPage';
import { ReportsPage } from '@/modules/dashboard/pages/ReportsPage';
import { dashboardService } from '@/services/api/dashboardService';
import type { AuthUser } from '@/modules/authentication/types';

const mockAdminUser: AuthUser = {
  id: 'user-pastor-01',
  name: 'Pr. Carlos Eduardo Souza',
  email: 'pastor.carlos@batistamanaus.org.br',
  role: 'pastor',
  tenantId: 'tenant-manaus-central',
  tenantName: 'Igreja Batista Central de Manaus',
  permissions: ['view:dashboard', 'export:reports', 'manage:members'],
};

function renderDashboardPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider
        value={{
          user: mockAdminUser,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          login: async () => mockAdminUser,
          logout: async () => {},
          switchTenant: async () => {},
          hasRole: () => true,
          hasPermission: () => true,
        }}
      >
        <ToastProvider>
          <MemoryRouter initialEntries={['/admin/dashboard']}>
            <DashboardBiPage />
          </MemoryRouter>
        </ToastProvider>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
}

function renderReportsPage() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider
        value={{
          user: mockAdminUser,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          login: async () => mockAdminUser,
          logout: async () => {},
          switchTenant: async () => {},
          hasRole: () => true,
          hasPermission: () => true,
        }}
      >
        <ToastProvider>
          <MemoryRouter initialEntries={['/admin/reports']}>
            <ReportsPage />
          </MemoryRouter>
        </ToastProvider>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
}

describe('Etapa 09 — Dashboards Executivos e Relatórios BI', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    window.print = vi.fn();
    window.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
    window.URL.revokeObjectURL = vi.fn();
    dashboardService.resetMockStores();
  });

  it('1. Deve renderizar os KPIs Executivos com métricas consolidadas', async () => {
    renderDashboardPage();

    await waitFor(() => {
      expect(screen.getByTestId('executive-kpi-grid')).toBeInTheDocument();
    });

    expect(screen.getByText('Painel Executivo & BI')).toBeInTheDocument();

    // Verify presence of primary KPI titles
    expect(screen.getByText('Membros Ativos')).toBeInTheDocument();
    expect(screen.getByText('Dízimos & Ofertas (Mês)')).toBeInTheDocument();
    expect(screen.getByText('Despesas Pagas (Mês)')).toBeInTheDocument();
    expect(screen.getByText('Saldo Operacional')).toBeInTheDocument();
    expect(screen.getByText('Média Frequência / Culto')).toBeInTheDocument();
    expect(screen.getByText('Voluntários Servindo')).toBeInTheDocument();
  });

  it('2. Deve permitir alternar o filtro de congregação nos KPIs', async () => {
    const user = userEvent.setup();
    renderDashboardPage();

    await waitFor(() => {
      expect(screen.getByLabelText('Filtrar por Congregação')).toBeInTheDocument();
    });

    const select = screen.getByLabelText('Filtrar por Congregação');
    await user.selectOptions(select, 'cong-02');

    await waitFor(() => {
      expect(screen.getByTestId('executive-kpi-grid')).toBeInTheDocument();
    });
  });

  it('3. Deve renderizar o gráfico de Evolução do Rol de Membros (AreaChart)', async () => {
    renderDashboardPage();

    await waitFor(() => {
      expect(screen.getByTestId('membership-growth-chart')).toBeInTheDocument();
    });

    const chartCard = screen.getByTestId('membership-growth-chart');
    expect(within(chartCard).getByText('Evolução do Rol de Membros')).toBeInTheDocument();
    expect(within(chartCard).getByText(/Saldo Líquido/i)).toBeInTheDocument();
  });

  it('4. Deve renderizar o gráfico de Fluxo de Caixa Consolidado (Bar/Line Chart)', async () => {
    renderDashboardPage();

    await waitFor(() => {
      expect(screen.getByTestId('financial-cashflow-chart')).toBeInTheDocument();
    });

    const cashflowCard = screen.getByTestId('financial-cashflow-chart');
    expect(within(cashflowCard).getByText('Fluxo de Caixa Consolidado')).toBeInTheDocument();
    expect(within(cashflowCard).getByText(/Entradas/i)).toBeInTheDocument();
    expect(within(cashflowCard).getByText(/Saídas/i)).toBeInTheDocument();
  });

  it('5. Deve renderizar o gráfico de Tendências de Frequência e Distribuição Etária com LGPD', async () => {
    renderDashboardPage();

    await waitFor(() => {
      expect(screen.getByTestId('attendance-trends-chart')).toBeInTheDocument();
      expect(screen.getByTestId('demographics-pie-chart')).toBeInTheDocument();
    });

    // Attendance
    const attendanceCard = screen.getByTestId('attendance-trends-chart');
    expect(within(attendanceCard).getByText('Tendências de Frequência nos Cultos')).toBeInTheDocument();

    // Demographics with LGPD callout
    const demoCard = screen.getByTestId('demographics-pie-chart');
    expect(within(demoCard).getByText('Distribuição Etária')).toBeInTheDocument();
    expect(within(demoCard).getByText(/Proteção de Menores \(LGPD\)/i)).toBeInTheDocument();
  });

  it('6. Deve renderizar a tabela comparativa de Congregações (Sede vs Filiais)', async () => {
    renderDashboardPage();

    await waitFor(() => {
      expect(screen.getByTestId('congregation-performance-table')).toBeInTheDocument();
    });

    const tableCard = screen.getByTestId('congregation-performance-table');
    expect(within(tableCard).getByText('Comparativo de Congregações')).toBeInTheDocument();
    expect(within(tableCard).getByText('Templo Central (Sede)')).toBeInTheDocument();
    expect(within(tableCard).getByText('Filial Adrianópolis')).toBeInTheDocument();
    expect(within(tableCard).getByText('Total Consolidado')).toBeInTheDocument();
  });

  it('7. Deve navegar entre abas de relatórios e aplicar filtro de busca', async () => {
    const user = userEvent.setup();
    renderReportsPage();

    await waitFor(() => {
      expect(screen.getByTestId('reports-viewer-tab')).toBeInTheDocument();
    });

    // Default tab is Rol de Membros
    expect(screen.getAllByText('Livro de Rol de Membros Eclesiástico')[0]).toBeInTheDocument();

    // Switch to Extrato Caixa tab
    const cashflowTabBtn = screen.getByRole('button', { name: /Extrato Caixa/i });
    await user.click(cashflowTabBtn);

    await waitFor(() => {
      expect(screen.getAllByText('Extrato Geral do Livro Caixa & Fluxo Financeiro')[0]).toBeInTheDocument();
    });

    // Type in search box
    const searchInput = screen.getByPlaceholderText(/Buscar por nome/i);
    await user.type(searchInput, 'Dízimo');

    await waitFor(() => {
      expect(searchInput).toHaveValue('Dízimo');
    });
  });

  it('8. Deve acionar a exportação CSV e a impressão/PDF do relatório', async () => {
    const user = userEvent.setup();
    renderReportsPage();

    await waitFor(() => {
      expect(screen.getByTestId('reports-viewer-tab')).toBeInTheDocument();
    });

    // Click Export CSV button
    const exportCsvBtn = screen.getByRole('button', { name: /Exportar CSV/i });
    await user.click(exportCsvBtn);

    await waitFor(() => {
      expect(window.URL.createObjectURL).toHaveBeenCalled();
    });

    // Click Print / PDF button
    const printBtn = screen.getByRole('button', { name: /Imprimir \/ PDF/i });
    await user.click(printBtn);

    expect(window.print).toHaveBeenCalledTimes(1);
  });
});
