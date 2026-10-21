/**
 * Automated Test Suite — Etapa 08: Portal do Membro
 * ChurchManager Enterprise Multi-Tenant Platform
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/feedback/ToastProvider';
import { AuthContext } from '@/modules/authentication/AuthContext';
import { MemberPortalPage } from '@/modules/portal/pages/MemberPortalPage';
import { portalService } from '@/services/api/portalService';
import type { AuthUser } from '@/modules/authentication/types';

const mockMemberUser: AuthUser = {
  id: 'user-mem-01',
  name: 'Gabriel Ferreira Lima',
  email: 'gabriel.membro@gmail.com',
  role: 'member',
  tenantId: 'tenant-manaus-central',
  tenantName: 'Igreja Batista Central de Manaus',
  permissions: ['view:member_portal'],
};

function renderMemberPortal(initialRoute = '/portal') {
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
          user: mockMemberUser,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          login: async () => mockMemberUser,
          logout: async () => {},
          switchTenant: async () => {},
          hasRole: () => true,
          hasPermission: () => true,
        }}
      >
        <ToastProvider>
          <MemoryRouter initialEntries={[initialRoute]}>
            <MemberPortalPage />
          </MemoryRouter>
        </ToastProvider>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
}

describe('Etapa 08 — Portal do Membro Suite', () => {
  beforeEach(() => {
    portalService.resetMockStores();
    vi.restoreAllMocks();
  });

  it('1. Renderiza o Portal do Membro com dados do membro autenticado e visão geral', async () => {
    renderMemberPortal();

    // Welcome title & member credentials
    expect(await screen.findByTestId('portal-welcome-title')).toHaveTextContent(/Gabriel Ferreira Lima/i);
    expect(screen.getAllByText(/ROL-2026-0006/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Filial Ponta Negra/i)[0]).toBeInTheDocument();

    // Pending schedule alert banner
    expect(await screen.findByTestId('pending-schedule-banner')).toBeInTheDocument();
    expect(screen.getByText(/Você tem uma escala ministerial aguardando sua confirmação!/i)).toBeInTheDocument();
  });

  it('2. Exibe Credencial Digital Eclesiástica e permite girar para o verso com QR Code', async () => {
    renderMemberPortal();

    // Front of the digital card
    expect(await screen.findByTestId('card-front')).toBeInTheDocument();
    expect(screen.getByText(/Membro Comungante/i)).toBeInTheDocument();

    // Flip card button
    const flipBtn = screen.getByTestId('flip-card-btn');
    expect(flipBtn).toBeInTheDocument();
    await userEvent.click(flipBtn);

    // Back of card with masked CPF and QR Code
    expect(await screen.findByTestId('card-back')).toBeInTheDocument();
    expect(screen.getByText(/\*\*\*\.458\.912-\*\*/i)).toBeInTheDocument();
    expect(screen.getByTestId('credential-qr-code')).toBeInTheDocument();
    expect(screen.getByText(/QR Code Autenticado/i)).toBeInTheDocument();
  });

  it('3. Exibe extrato de contribuições (dízimos e ofertas), totais e comprovante individual', async () => {
    renderMemberPortal();

    // Navigate to Contributions tab
    const tabContrib = await screen.findByTestId('tab-contributions');
    await userEvent.click(tabContrib);

    // KPIs
    expect(await screen.findByTestId('yearly-total')).toBeInTheDocument();
    expect(screen.getByTestId('monthly-total')).toBeInTheDocument();
    expect(screen.getByTestId('contributions-count')).toBeInTheDocument();

    // Table with transactions
    const table = screen.getByTestId('member-contributions-table');
    expect(table).toBeInTheDocument();
    expect(screen.getAllByText(/Dízimo Mensal - Gabriel Lima/i)[0]).toBeInTheDocument();

    // Open receipt modal for tx-11
    const receiptBtn = screen.getByTestId('view-receipt-tx-11');
    await userEvent.click(receiptBtn);

    expect(await screen.findByText(/Comprovante de Contribuição Eclesiástica/i)).toBeInTheDocument();
    expect(screen.getByText(/REC-2026-00109/i)).toBeInTheDocument();
    expect(screen.getByText(/Conciliado pela Tesouraria Eclesiástica/i)).toBeInTheDocument();
  });

  it('4. Abre a Declaração de Quitação Anual de Contribuições (IRPF) com discriminação mensal e CNPJ', async () => {
    renderMemberPortal();

    // Open IRPF statement modal from header button
    const irpfBtn = await screen.findByTestId('header-irpf-btn');
    await userEvent.click(irpfBtn);

    // Modal verification
    expect(await screen.findByText(/Informe Anual de Contribuições \(IRPF\)/i)).toBeInTheDocument();
    expect(screen.getByText(/04\.552\.891\/0001-90/i)).toBeInTheDocument();
    expect(screen.getByTestId('tax-breakdown-table')).toBeInTheDocument();
    expect(screen.getByTestId('tax-total-contributed')).toBeInTheDocument();

    // Close modal
    const closeBtn = screen.getByTestId('tax-modal-close-btn');
    await userEvent.click(closeBtn);
    await waitFor(() => {
      expect(screen.queryByText(/Informe Anual de Contribuições \(IRPF\)/i)).not.toBeInTheDocument();
    });
  });

  it('5. Permite confirmar presença em escala ministerial com 1 clique', async () => {
    renderMemberPortal();

    // Navigate to Schedules tab
    const tabSchedules = await screen.findByTestId('tab-schedules');
    await userEvent.click(tabSchedules);

    // Should see pending schedule for Louvor (Tecladista)
    const scheduleCard = await screen.findByTestId('schedule-card-sch-01');
    expect(scheduleCard).toBeInTheDocument();
    expect(within(scheduleCard).getByText(/Ministério de Louvor & Adoração/i)).toBeInTheDocument();
    expect(screen.getByTestId('status-pending')).toBeInTheDocument();

    // Click "Confirmar Presença"
    const confirmBtn = screen.getByTestId('confirm-schedule-btn-sch-01');
    await userEvent.click(confirmBtn);

    // Schedule status should update to confirmed
    await waitFor(() => {
      expect(within(scheduleCard).getByTestId('status-confirmed')).toBeInTheDocument();
    });
  });

  it('6. Exige justificativa mínima para recusar escala e registra recusa com sucesso', async () => {
    renderMemberPortal();

    // Navigate to Schedules tab
    const tabSchedules = await screen.findByTestId('tab-schedules');
    await userEvent.click(tabSchedules);

    // Click "Não Comparecerei"
    const declineBtn = await screen.findByTestId('decline-schedule-btn-sch-01');
    await userEvent.click(declineBtn);

    // Decline dialog appears
    expect(await screen.findByText(/Justificar Ausência na Escala/i)).toBeInTheDocument();

    // Attempt to submit empty reason
    const submitBtn = screen.getByTestId('submit-decline-btn');
    await userEvent.click(submitBtn);

    expect(await screen.findByTestId('decline-reason-error')).toBeInTheDocument();

    // Enter valid reason (>= 5 chars)
    const reasonInput = screen.getByTestId('decline-reason-input');
    await userEvent.type(reasonInput, 'Viagem a trabalho no final de semana');
    await userEvent.click(submitBtn);

    // Verify schedule status updated to declined with reason visible
    await waitFor(() => {
      expect(screen.getByTestId('status-declined')).toBeInTheDocument();
      expect(screen.getByText(/Viagem a trabalho no final de semana/i)).toBeInTheDocument();
    });
  });

  it('7. Exibe lista de eventos com ingresso digital e visualização de QR Code para check-in', async () => {
    renderMemberPortal();

    // Navigate to Events tab
    const tabEvents = await screen.findByTestId('tab-events');
    await userEvent.click(tabEvents);

    // Event card with ticket code
    const regCard = await screen.findByTestId('reg-card-reg-01');
    expect(regCard).toBeInTheDocument();
    expect(screen.getByText(/Conferência de Avivamento & Missões 2026/i)).toBeInTheDocument();
    expect(screen.getByText(/AVIV-2026-001/i)).toBeInTheDocument();

    // Open ticket QR Code modal
    const ticketBtn = screen.getByTestId('open-ticket-btn-reg-01');
    await userEvent.click(ticketBtn);

    expect(await screen.findByText(/Ingresso Digital com Check-in Rápido/i)).toBeInTheDocument();
    expect(screen.getByTestId('event-ticket-qr-code')).toBeInTheDocument();
    expect(screen.getByText(/Token: CM-EVT2-TKT001-GABRIEL/i)).toBeInTheDocument();
  });

  it('8. Exibe núcleo familiar com proteção LGPD e permite solicitar alteração cadastral à secretaria', async () => {
    renderMemberPortal();

    // Navigate to Family tab
    const tabFamily = await screen.findByTestId('tab-family');
    await userEvent.click(tabFamily);

    // Family card
    expect(await screen.findByTestId('family-name')).toHaveTextContent(/Família Ferreira Lima/i);
    expect(screen.getByTestId('family-member-mem-06')).toBeInTheDocument();
    expect(screen.getByTestId('family-member-mem-10')).toBeInTheDocument();
    expect(screen.getByTestId('family-member-mem-11')).toBeInTheDocument();

    // Child protection badge (LGPD)
    expect(screen.getByTestId('minor-badge')).toHaveTextContent(/Menor de Idade \(LGPD\)/i);

    // Open update profile modal
    const updateBtn = screen.getByTestId('open-update-profile-btn');
    await userEvent.click(updateBtn);

    expect(await screen.findByText(/Atualização Cadastral Eclesiástica/i)).toBeInTheDocument();

    // Fill in justification and new address
    const addressInput = screen.getByTestId('input-address');
    await userEvent.clear(addressInput);
    await userEvent.type(addressInput, 'Rua Coronel Ferreira, 102');

    const justInput = screen.getByTestId('input-justification');
    await userEvent.type(justInput, 'Mudança de residência recente');

    const submitReqBtn = screen.getByTestId('submit-change-request-btn');
    await userEvent.click(submitReqBtn);

    // Switch to history tab and verify submission
    await waitFor(() => {
      expect(screen.getByTestId('requests-history-list')).toBeInTheDocument();
      expect(screen.getByText(/Mudança de residência recente/i)).toBeInTheDocument();
    });
  });
});
