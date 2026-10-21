import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/feedback/ToastProvider';
import { AuthContext } from '@/modules/authentication/AuthContext';
import { MinistriesPage } from '@/modules/ministries/pages/MinistriesPage';
import { ministryService } from '@/services/api/ministryService';
import type { AuthUser } from '@/modules/authentication/types';

const mockPastorUser: AuthUser = {
  id: 'user-admin-01',
  name: 'Pr. Carlos Eduardo',
  email: 'pastor@churchmanager.app',
  role: 'church_admin',
  tenantId: 'tenant-manaus-central',
  tenantName: 'Igreja Central de Manaus',
  permissions: ['*'],
};

function renderMinistries() {
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
          user: mockPastorUser,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          login: async () => mockPastorUser,
          logout: async () => {},
          switchTenant: async () => {},
          hasRole: () => true,
          hasPermission: () => true,
        }}
      >
        <ToastProvider>
          <MemoryRouter initialEntries={['/admin/ministries']}>
            <MinistriesPage />
          </MemoryRouter>
        </ToastProvider>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
}

describe('Etapa 05 — Ministérios & Voluntários', () => {
  beforeEach(() => {
    ministryService.resetMockStores();
  });

  it('deve renderizar a página de Ministérios com cartões KPI e as 4 abas funcionais', async () => {
    renderMinistries();

    expect(screen.getByText('Ministérios & Escalas de Voluntários')).toBeInTheDocument();

    // KPIs
    await waitFor(() => {
      expect(screen.getByText('Total de Ministérios')).toBeInTheDocument();
      expect(screen.getByText('Voluntários Ativos')).toBeInTheDocument();
      expect(screen.getByText('Escalas Publicadas')).toBeInTheDocument();
      expect(screen.getByText('Confirmações Pendentes')).toBeInTheDocument();
      expect(screen.getByText('Presenças Confirmadas')).toBeInTheDocument();
    });

    // Abas
    expect(screen.getByRole('tab', { name: /Escalas de Serviço/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Ministérios & Funções/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Equipes de Voluntários/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Confirmações de Presença/i })).toBeInTheDocument();
  });

  it('deve listar as escalas existentes com badges de status de voluntários', async () => {
    renderMinistries();

    await waitFor(() => {
      expect(screen.getByText('Culto de Celebração de Domingo (Noite)')).toBeInTheDocument();
      expect(screen.getByText('Escola Bíblica Infantil - Sala Juniores')).toBeInTheDocument();
    });

    // Lucas Oliveira Rocha está confirmado na escala sch-01
    expect(screen.getByText('Lucas Oliveira Rocha')).toBeInTheDocument();
    // Mariana Souza Rocha está pendente na escala sch-02
    expect(screen.getByText('Mariana Souza Rocha')).toBeInTheDocument();
  });

  it('deve navegar até a aba de Ministérios & Funções e listar os departamentos cadastrados', async () => {
    renderMinistries();

    const minTab = screen.getByRole('tab', { name: /Ministérios & Funções/i });
    fireEvent.click(minTab);

    await waitFor(() => {
      expect(screen.getByText('Ministério de Louvor & Adoração')).toBeInTheDocument();
      expect(screen.getByText('Ministério Infantil (Kids)')).toBeInTheDocument();
      expect(screen.getByText('Acolhimento & Recepção')).toBeInTheDocument();
      expect(screen.getByText('Mídia, Áudio & Transmissão')).toBeInTheDocument();
    });

    // Funções cadastradas
    expect(screen.getByText('Baterista')).toBeInTheDocument();
    expect(screen.getByText('Professora de Classe')).toBeInTheDocument();
  });

  it('deve disparar alerta chamativo em tempo real quando houver sobreposição de horário de voluntário', async () => {
    renderMinistries();

    await waitFor(() => {
      expect(screen.getByText('Culto de Celebração de Domingo (Noite)')).toBeInTheDocument();
    });

    // Clica no botão "Nova Escala"
    const newScheduleBtn = screen.getByRole('button', { name: /Nova Escala/i });
    fireEvent.click(newScheduleBtn);

    await waitFor(() => {
      expect(screen.getByText('Criar Nova Escala de Serviço')).toBeInTheDocument();
    });

    // Preenche com a data que já tem escala (2026-10-25) e horário conflitante (19:00 às 20:00)
    // Na escala sch-01 (18:30 às 20:30), mem-05 (Lucas Oliveira Rocha) já está escalado
    const dateInput = screen.getByLabelText(/Data da Escala \*/i);
    const startInput = screen.getByLabelText(/Início \*/i);
    const endInput = screen.getByLabelText(/Término \*/i);

    fireEvent.change(dateInput, { target: { value: '2026-10-25' } });
    fireEvent.change(startInput, { target: { value: '19:00' } });
    fireEvent.change(endInput, { target: { value: '20:00' } });

    // Seleciona o membro mem-07 (Lucas Oliveira Rocha)
    const volunteerSelect = screen.getByTestId('volunteer-member-select-0');
    fireEvent.change(volunteerSelect, { target: { value: 'mem-07' } });

    // O alerta de conflito deve ser exibido em tempo real
    await waitFor(() => {
      expect(screen.getByTestId('schedule-conflict-alert')).toBeInTheDocument();
      expect(
        screen.getByText(/Atenção: Conflito de Horário de Voluntários Detectado!/i)
      ).toBeInTheDocument();
      expect(screen.getAllByText('Lucas Oliveira Rocha').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('deve navegar até a aba de Equipes de Voluntários e permitir filtrar por ministério', async () => {
    renderMinistries();

    const volTab = screen.getByRole('tab', { name: /Equipes de Voluntários/i });
    fireEvent.click(volTab);

    await waitFor(() => {
      expect(screen.getByText('Lucas Oliveira Rocha')).toBeInTheDocument();
      expect(screen.getByText('Ana Carolina Silva')).toBeInTheDocument();
      expect(screen.getByText('Marcos Vinicius Santos')).toBeInTheDocument();
    });

    // Filtra por Ministério Infantil
    const selects = screen.getAllByRole('combobox');
    const filterSelect = selects[0];
    fireEvent.change(filterSelect, { target: { value: 'min-infantil' } });

    await waitFor(() => {
      expect(screen.getByText('Ana Carolina Silva')).toBeInTheDocument();
      expect(screen.queryByText('Lucas Oliveira Rocha')).not.toBeInTheDocument();
    });
  });

  it('deve confirmar a presença de um voluntário na aba de Confirmações de Presença', async () => {
    renderMinistries();

    const responsesTab = screen.getByRole('tab', { name: /Confirmações de Presença/i });
    fireEvent.click(responsesTab);

    await waitFor(() => {
      expect(screen.getByText('Mariana Souza Rocha')).toBeInTheDocument();
    });

    // Mariana está pendente; clica no botão "Confirmar" rápido
    const confirmButtons = screen.getAllByRole('button', { name: /Confirmar/i });
    fireEvent.click(confirmButtons[0]);

    // Verifica que Mariana agora está confirmada
    await waitFor(() => {
      expect(screen.getByText('Presença Confirmada!')).toBeInTheDocument();
    });
  });

  it('deve recusar presença com justificativa obrigatória e atualizar status para Recusado', async () => {
    const user = userEvent.setup();
    renderMinistries();

    const responsesTab = screen.getByRole('tab', { name: /Confirmações de Presença/i });
    fireEvent.click(responsesTab);

    await waitFor(() => {
      expect(screen.getAllByText('Gabriel Ferreira Lima').length).toBeGreaterThanOrEqual(1);
    });

    // Clica em "Alterar Resposta"
    const alterButtons = screen.getAllByRole('button', { name: /Alterar Resposta/i });
    fireEvent.click(alterButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Resposta da Escala de Serviço')).toBeInTheDocument();
    });

    // Clica no botão "Recusar"
    const declineOption = screen.getByRole('button', { name: /Recusar/i });
    fireEvent.click(declineOption);

    // Preenche justificativa obrigatória
    const reasonTextarea = screen.getByLabelText(/Justificativa da Impossibilidade \*/i);
    await user.type(reasonTextarea, 'Viagem de trabalho inadiável para o interior');

    // Submete a resposta
    const submitBtn = screen.getByRole('button', { name: /Confirmar Resposta/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Recusa Registrada')).toBeInTheDocument();
    });
  });
});
