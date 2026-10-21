import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/feedback/ToastProvider';
import { AuthContext } from '@/modules/authentication/AuthContext';
import { EventsPage } from '@/modules/events/pages/EventsPage';
import { eventService } from '@/services/api/eventService';
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

function renderEvents() {
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
          <MemoryRouter initialEntries={['/admin/events']}>
            <EventsPage />
          </MemoryRouter>
        </ToastProvider>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
}

describe('Etapa 06 — Eventos & Presença', () => {
  beforeEach(() => {
    eventService.resetMockStores();
  });

  it('deve renderizar a página com indicadores KPI e as 4 abas funcionais', async () => {
    renderEvents();

    expect(
      screen.getByRole('heading', { name: /Cultos, Eventos & Controle de Presença/i })
    ).toBeInTheDocument();

    // KPIs
    await waitFor(() => {
      expect(screen.getByText('Total de Eventos')).toBeInTheDocument();
      expect(screen.getByText('Próximos Cultos')).toBeInTheDocument();
      expect(screen.getByText('Inscrições Confirmadas')).toBeInTheDocument();
      expect(screen.getByText('Presenças Registradas')).toBeInTheDocument();
      expect(screen.getByText('Taxa Média Check-in')).toBeInTheDocument();
    });

    // Abas
    expect(screen.getByRole('tab', { name: /Lista de Eventos/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Calendário \/ Agenda/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Inscrições & Participantes/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Portaria & Check-in/i })).toBeInTheDocument();
  });

  it('deve listar os eventos cadastrados com badges de categoria e status', async () => {
    renderEvents();

    await waitFor(() => {
      expect(screen.getByText('Culto de Celebração de Domingo (Noite)')).toBeInTheDocument();
      expect(screen.getByText('Conferência de Avivamento & Missões 2026')).toBeInTheDocument();
      expect(screen.getByText('Encontro de Mulheres Virtuosas: Florescer')).toBeInTheDocument();
    });

    // Filtra por busca textual
    const searchInput = screen.getByPlaceholderText(
      /Buscar por culto, conferência, espaço ou congregação.../i
    );
    fireEvent.change(searchInput, { target: { value: 'Mulheres' } });

    await waitFor(() => {
      expect(screen.getByText('Encontro de Mulheres Virtuosas: Florescer')).toBeInTheDocument();
      expect(screen.queryByText('Conferência de Avivamento & Missões 2026')).not.toBeInTheDocument();
    });
  });

  it('deve navegar até a aba de Calendário / Agenda e exibir a programação por dia', async () => {
    renderEvents();

    await waitFor(() => {
      expect(screen.getByText('Culto de Celebração de Domingo (Noite)')).toBeInTheDocument();
    });

    const calendarTab = screen.getByRole('tab', { name: /Calendário \/ Agenda/i });
    fireEvent.click(calendarTab);

    await waitFor(() => {
      expect(screen.getByText('Programação do Dia')).toBeInTheDocument();
      expect(screen.getByText(/Fuso Horário Eclesiástico/i)).toBeInTheDocument();
    });
  });

  it('deve abrir o modal de cadastro de novo evento/culto e preencher os dados', async () => {
    const user = userEvent.setup();
    renderEvents();

    await waitFor(() => {
      expect(screen.getByText('Culto de Celebração de Domingo (Noite)')).toBeInTheDocument();
    });

    const newBtn = screen.getByRole('button', { name: /Novo Culto \/ Evento/i });
    await user.click(newBtn);

    expect(screen.getByRole('heading', { name: /Novo Culto ou Evento Especial/i })).toBeInTheDocument();

    const titleInput = screen.getByLabelText(/Título do Evento \/ Culto \*/i);
    await user.type(titleInput, 'Vigília da Virada 2026');

    expect(titleInput).toHaveValue('Vigília da Virada 2026');
  });

  it('deve navegar até a aba de Inscrições & Participantes e abrir o modal de Ingresso com QR Code', async () => {
    const user = userEvent.setup();
    renderEvents();

    await waitFor(() => {
      expect(screen.getByText('Culto de Celebração de Domingo (Noite)')).toBeInTheDocument();
    });

    const regTab = screen.getByRole('tab', { name: /Inscrições & Participantes/i });
    fireEvent.click(regTab);

    await waitFor(() => {
      expect(screen.getByText('Gabriel Ferreira Lima')).toBeInTheDocument();
      expect(screen.getByText('AVIV-2026-001')).toBeInTheDocument();
    });

    // Clica no botão QR Code do ingresso
    const qrButtons = screen.getAllByRole('button', { name: /QR Code/i });
    await user.click(qrButtons[0]);

    // Modal de ingresso
    await waitFor(() => {
      expect(screen.getByText('Ingresso Digital com QR Code')).toBeInTheDocument();
      expect(screen.getAllByText('AVIV-2026-001').length).toBeGreaterThanOrEqual(1);
    });
  });

  it('deve registrar presença manual de participante e exibir feedback de sucesso', async () => {
    const user = userEvent.setup();
    renderEvents();

    await waitFor(() => {
      expect(screen.getByText('Culto de Celebração de Domingo (Noite)')).toBeInTheDocument();
    });

    const attendanceTab = screen.getByRole('tab', { name: /Portaria & Check-in/i });
    fireEvent.click(attendanceTab);

    await waitFor(() => {
      expect(screen.getByText('Controle de Presença em Tempo Real')).toBeInTheDocument();
    });

    // Abre modal de presença manual
    const manualBtn = screen.getByRole('button', { name: /Presença Manual/i });
    await user.click(manualBtn);

    expect(screen.getByRole('heading', { name: /Registro Manual de Presença/i })).toBeInTheDocument();

    // Pesquisa pelo membro Lucas
    const searchInput = screen.getByPlaceholderText(/Digite o nome ou telefone do participante.../i);
    await user.type(searchInput, 'Lucas');

    await waitFor(() => {
      expect(screen.getByText('Lucas Silva')).toBeInTheDocument();
    });

    // Seleciona Lucas Silva
    const attendeeButton = screen.getByTestId('attendee-option-mem-04');
    await user.click(attendeeButton);

    // Confirma presença
    const confirmBtn = screen.getByRole('button', { name: /Confirmar Presença/i });
    await user.click(confirmBtn);

    // Feedback de sucesso
    await waitFor(() => {
      expect(screen.getByTestId('manual-attendance-feedback')).toBeInTheDocument();
      expect(screen.getAllByText(/registrada com sucesso/i).length).toBeGreaterThanOrEqual(1);
    });
  });

  it('deve bloquear duplicidade de presença manual exibindo alerta chamativo quando o participante já deu check-in', async () => {
    const user = userEvent.setup();
    renderEvents();

    await waitFor(() => {
      expect(screen.getByText('Culto de Celebração de Domingo (Noite)')).toBeInTheDocument();
    });

    const attendanceTab = screen.getByRole('tab', { name: /Portaria & Check-in/i });
    fireEvent.click(attendanceTab);

    await waitFor(() => {
      expect(screen.getByText('Controle de Presença em Tempo Real')).toBeInTheDocument();
    });

    // Seleciona o Culto de Celebração de Domingo (Noite) - evt-01
    const select = screen.getByLabelText(/Culto \/ Evento em Andamento:/i);
    fireEvent.change(select, { target: { value: 'evt-01' } });

    // Abre modal de presença manual
    const manualBtn = screen.getByRole('button', { name: /Presença Manual/i });
    await user.click(manualBtn);

    // Pesquisa pelo Pr. Carlos Eduardo Silva (que já está nos fixtures de presença de evt-01)
    const searchInput = screen.getByPlaceholderText(/Digite o nome ou telefone do participante.../i);
    await user.type(searchInput, 'Carlos Eduardo');

    await waitFor(() => {
      expect(screen.getByTestId('attendee-option-mem-01')).toBeInTheDocument();
    });

    // Clica no resultado de busca através do data-testid exato
    const attendeeOption = screen.getByTestId('attendee-option-mem-01');
    await user.click(attendeeOption);

    await waitFor(() => {
      expect(screen.getByText('Selecionado para Check-in:')).toBeInTheDocument();
    });

    // Tenta confirmar presença
    const confirmBtn = screen.getByRole('button', { name: /Confirmar Presença/i });
    fireEvent.click(confirmBtn);

    // Alerta de duplicidade
    await waitFor(() => {
      expect(screen.getByTestId('manual-attendance-feedback')).toBeInTheDocument();
      expect(screen.getAllByText(/já foi confirmada anteriormente neste evento/i).length).toBeGreaterThanOrEqual(1);
    });
  });

  it('deve realizar check-in por código de QR Code e alertar se o ingresso for validado novamente', async () => {
    const user = userEvent.setup();
    renderEvents();

    await waitFor(() => {
      expect(screen.getByText('Culto de Celebração de Domingo (Noite)')).toBeInTheDocument();
    });

    const attendanceTab = screen.getByRole('tab', { name: /Portaria & Check-in/i });
    fireEvent.click(attendanceTab);

    await waitFor(() => {
      expect(screen.getByText('Controle de Presença em Tempo Real')).toBeInTheDocument();
    });

    // Seleciona o evento com inscrições: "Conferência de Avivamento & Missões 2026"
    const select = screen.getByLabelText(/Culto \/ Evento em Andamento:/i);
    fireEvent.change(select, { target: { value: 'evt-02' } });

    // Abre scanner de QR Code
    const qrBtn = screen.getByRole('button', { name: /Escanear QR Code/i });
    await user.click(qrBtn);

    expect(screen.getByRole('heading', { name: /Leitor de QR Code & Check-in/i })).toBeInTheDocument();

    // Digita o código do ingresso de Gabriel (AVIV-2026-001)
    const qrInput = screen.getByPlaceholderText(/Ex.: AVIV-2026-001 ou código do leitor USB/i);
    await user.type(qrInput, 'AVIV-2026-001');

    const validateBtn = screen.getByRole('button', { name: /Validar/i });
    await user.click(validateBtn);

    // Validação com sucesso
    await waitFor(() => {
      expect(screen.getByTestId('qr-checkin-feedback')).toBeInTheDocument();
      expect(screen.getAllByText(/Ingresso \[AVIV-2026-001\] validado!/i).length).toBeGreaterThanOrEqual(1);
    });

    // Segunda tentativa com o mesmo código deve acusar duplicidade
    await user.type(qrInput, 'AVIV-2026-001');
    await user.click(validateBtn);

    await waitFor(() => {
      expect(screen.getAllByText(/já foi validado anteriormente/i).length).toBeGreaterThanOrEqual(1);
    });
  });
});
