import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/feedback/ToastProvider';
import { AuthContext } from '@/modules/authentication/AuthContext';
import { SecretariaPage } from '@/modules/members/pages/SecretariaPage';
import { secretariaService } from '@/services/api/secretariaService';
import type { AuthUser } from '@/modules/authentication/types';

const mockAdminUser: AuthUser = {
  id: 'user-admin-01',
  name: 'Pr. Carlos Eduardo',
  email: 'pastor@churchmanager.app',
  role: 'church_admin',
  tenantId: 'tenant-manaus-central',
  tenantName: 'Igreja Central de Manaus',
  permissions: ['*'],
};

function renderSecretaria() {
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
          <MemoryRouter initialEntries={['/admin/members']}>
            <SecretariaPage />
          </MemoryRouter>
        </ToastProvider>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
}

describe('Etapa 04 — Secretaria & Gestão de Membresia', () => {
  beforeEach(() => {
    secretariaService.resetMockStores();
  });

  it('deve renderizar os indicadores KPI e abas principais da Secretaria', async () => {
    renderSecretaria();

    // Título da página
    expect(
      screen.getByRole('heading', { name: /Secretaria & Gestão de Membresia/i })
    ).toBeInTheDocument();

    // Abas de navegação
    expect(screen.getByRole('tab', { name: /Membros/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Famílias/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Visitantes/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Congregações/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Aprovações/i })).toBeInTheDocument();

    // KPI Cards
    await waitFor(() => {
      expect(screen.getByText('Total de Membros')).toBeInTheDocument();
      expect(screen.getAllByText('Menores (LGPD)').length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('Visitantes Ativos')).toBeInTheDocument();
    });
  });

  it('deve listar membros cadastrados e identificar menores de idade conforme a LGPD', async () => {
    renderSecretaria();

    // Verifica membros iniciais dos fixtures
    await waitFor(() => {
      expect(screen.getByText('Pr. Carlos Eduardo Silva')).toBeInTheDocument();
      expect(screen.getByText('Lucas Silva')).toBeInTheDocument();
    });

    // Menores de idade devem ter o badge "Menor (< 18)"
    const minorBadges = screen.getAllByText(/Menor \(< 18\)/i);
    expect(minorBadges.length).toBeGreaterThan(0);
  });

  it('deve filtrar membros ao ativar o filtro de conformidade LGPD para menores de idade', async () => {
    const user = userEvent.setup();
    renderSecretaria();

    await waitFor(() => {
      expect(screen.getByText('Pr. Carlos Eduardo Silva')).toBeInTheDocument();
    });

    // Ativa o toggle "Menores (LGPD)"
    const minorsSwitch = screen.getByRole('switch', { name: /Menores \(LGPD\)/i });
    await user.click(minorsSwitch);

    // Pr. Carlos Eduardo (adulto) deve desaparecer, Lucas Silva e Sofia Santos (menores) devem permanecer
    await waitFor(() => {
      expect(screen.queryByText('Pr. Carlos Eduardo Silva')).not.toBeInTheDocument();
      expect(screen.getByText('Lucas Silva')).toBeInTheDocument();
      expect(screen.getByText('Sofia Santos')).toBeInTheDocument();
    });
  });

  it('deve abrir o modal de detalhes do membro com informações de tutela LGPD', async () => {
    const user = userEvent.setup();
    renderSecretaria();

    await waitFor(() => {
      expect(screen.getByText('Lucas Silva')).toBeInTheDocument();
    });

    // Clica no botão de ver detalhes do primeiro membro menor
    const viewButtons = screen.getAllByTitle(/Ver detalhes completos/i);
    await user.click(viewButtons[3]); // Lucas Silva

    // Modal de detalhes deve exibir alerta de conformidade LGPD
    await waitFor(() => {
      expect(
        screen.getByText(/Conformidade com a LGPD — Dados de Menor de Idade/i)
      ).toBeInTheDocument();
      expect(screen.getByText(/Pr. Carlos Eduardo Silva \(Pai\)/i)).toBeInTheDocument();
    });
  });

  it('deve exibir aviso reativo de menor de idade e campos de responsável no formulário ao digitar data de nascimento < 18 anos', async () => {
    const user = userEvent.setup();
    renderSecretaria();

    // Abre modal de novo membro
    const newMemberButton = screen.getByRole('button', { name: /Novo Membro/i });
    await user.click(newMemberButton);

    expect(screen.getByRole('heading', { name: /Novo Cadastro de Membro/i })).toBeInTheDocument();

    // Digita data de nascimento que torna a pessoa menor de idade (ex: 2012-05-10)
    const birthInput = screen.getByLabelText(/Data de Nascimento \*/i);
    await user.type(birthInput, '2012-05-10');

    // Alerta reativo LGPD deve aparecer em tempo real
    await waitFor(() => {
      expect(screen.getByTestId('lgpd-minor-warning')).toBeInTheDocument();
      expect(screen.getByLabelText(/Nome do Responsável Legal \*/i)).toBeInTheDocument();
    });
  });

  it('deve navegar até a aba de Visitantes e executar a conversão atômica de visitante em membro', async () => {
    renderSecretaria();

    // Clica na aba Visitantes
    const visitorsTab = screen.getByRole('tab', { name: /Visitantes/i });
    fireEvent.click(visitorsTab);

    // Verifica visitante ativo Juliana Costa Mendes
    await waitFor(() => {
      expect(screen.getByText('Juliana Costa Mendes')).toBeInTheDocument();
    });

    // Clica no botão "Converter"
    const convertButton = screen.getByRole('button', { name: /Converter/i });
    fireEvent.click(convertButton);

    // Deve atualizar e exibir toast de celebração
    await waitFor(() => {
      expect(screen.getByText(/Visitante Convertido em Membro!/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Membro Oficial/i).length).toBe(2);
    });
  });

  it('deve exibir o comparativo antes/depois na aba de Aprovações Cadastrais e aprovar alteração', async () => {
    const user = userEvent.setup();
    renderSecretaria();

    await waitFor(() => {
      expect(screen.getByText('Total de Membros')).toBeInTheDocument();
    });

    // Clica na aba Aprovações
    const approvalsTab = screen.getByRole('tab', { name: /Aprovações/i });
    fireEvent.click(approvalsTab);

    // Verifica que a aba de aprovações e os comparativos são renderizados
    await waitFor(() => {
      expect(screen.getByText('Aprovações de Alterações Cadastrais')).toBeInTheDocument();
      expect(screen.getAllByText(/Comparativo de Dados/i).length).toBe(2);
      expect(screen.getAllByText('Gabriel Ferreira Lima').length).toBeGreaterThanOrEqual(1);
    });

    // Clica no botão "Aprovar Alteração"
    const approveButtons = screen.getAllByRole('button', { name: /Aprovar Alteração/i });
    await user.click(approveButtons[0]);

    // Modal de confirmação
    expect(screen.getByRole('heading', { name: /Confirmar Aprovação de Alterações/i })).toBeInTheDocument();

    const confirmApprove = screen.getByRole('button', { name: /Efetivar Aprovação/i });
    await user.click(confirmApprove);

    // Notificação Toast e atualização
    await waitFor(() => {
      expect(screen.getByText(/Solicitação Aprovada/i)).toBeInTheDocument();
    });
  });
});
