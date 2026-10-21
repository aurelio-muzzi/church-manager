/**
 * Automated Test Suite — Etapa 07: Financeiro Avançado
 * ChurchManager Enterprise Multi-Tenant Platform
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ToastProvider } from '@/components/feedback/ToastProvider';
import { AuthContext } from '@/modules/authentication/AuthContext';
import { FinancePage } from '@/modules/finance/pages/FinancePage';
import { financeService } from '@/services/api/financeService';
import type { AuthUser } from '@/modules/authentication/types';

const mockTreasurerUser: AuthUser = {
  id: 'user-fin-01',
  name: 'Marcos Vinicius Santos',
  email: 'financeiro@churchmanager.app',
  role: 'treasurer',
  tenantId: 'tenant-manaus-central',
  tenantName: 'Igreja Central de Manaus',
  permissions: ['*'],
};

function renderFinance() {
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
          user: mockTreasurerUser,
          isAuthenticated: true,
          isLoading: false,
          error: null,
          login: async () => mockTreasurerUser,
          logout: async () => {},
          switchTenant: async () => {},
          hasRole: () => true,
          hasPermission: () => true,
        }}
      >
        <ToastProvider>
          <MemoryRouter initialEntries={['/admin/finance']}>
            <FinancePage />
          </MemoryRouter>
        </ToastProvider>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
}

describe('Etapa 07 — Financeiro Avançado', () => {
  beforeEach(() => {
    financeService.resetMockStores();
  });

  it('deve renderizar os 6 indicadores KPI e as 6 abas principais do Financeiro', async () => {
    renderFinance();

    // Título e subtítulo
    expect(
      screen.getByRole('heading', { name: /Gestão Financeira & Tesouraria Eclesiástica/i })
    ).toBeInTheDocument();

    // 6 KPIs
    await waitFor(() => {
      expect(screen.getByText('Saldo Consolidado')).toBeInTheDocument();
      expect(screen.getByText('Receitas no Mês')).toBeInTheDocument();
      expect(screen.getByText('Despesas Pagas')).toBeInTheDocument();
      expect(screen.getByText('Saldo Operacional')).toBeInTheDocument();
      expect(screen.getAllByText('Conciliação').length).toBeGreaterThanOrEqual(1);
    });

    // 6 Abas
    expect(screen.getByRole('tab', { name: /Lançamentos/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Dízimos & Ofertas/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Contas a Pagar/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Contas & Caixas/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Orçamentos/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Conciliação/i })).toBeInTheDocument();
  });

  it('deve filtrar transações por tipo (Receitas x Despesas) e busca textual', async () => {
    renderFinance();

    await waitFor(() => {
      expect(screen.getByText('Dízimo Pastoral - Outubro/2026')).toBeInTheDocument();
    });

    // Filtra apenas por despesas
    const typeSelect = screen.getByLabelText(/Filtrar por tipo de lançamento/i);
    fireEvent.change(typeSelect, { target: { value: 'expense' } });

    await waitFor(() => {
      expect(screen.getByText('Conta de Energia Elétrica - Templo Sede')).toBeInTheDocument();
      expect(screen.queryByText('Dízimo Pastoral - Outubro/2026')).not.toBeInTheDocument();
    });

    // Busca textual por fornecedor "Energia"
    const searchInput = screen.getByPlaceholderText(/Buscar por descrição, membro, fornecedor.../i);
    fireEvent.change(searchInput, { target: { value: 'Amazonas Energia' } });

    await waitFor(() => {
      expect(screen.getByText('Conta de Energia Elétrica - Templo Sede')).toBeInTheDocument();
      expect(screen.queryByText('Abastecimento de Água - Mês 10/2026')).not.toBeInTheDocument();
    });
  });

  it('deve registrar um dízimo identificado com membro e abrir o recibo timbrado oficial', async () => {
    const user = userEvent.setup();
    renderFinance();

    await waitFor(() => {
      expect(screen.getByText('Dízimo Pastoral - Outubro/2026')).toBeInTheDocument();
    });

    // Clica no botão de Dízimo / Oferta
    const openTitheBtn = screen.getByRole('button', { name: /Lançar Dízimo \/ Oferta/i });
    await user.click(openTitheBtn);

    // Modal aberto
    expect(screen.getByRole('heading', { name: /Registrar Dízimo Eclesiástico/i })).toBeInTheDocument();

    // Preenche nome do contribuinte e valor
    const contributorInput = screen.getByLabelText(/Nome do Contribuinte/i);
    await user.type(contributorInput, 'Pr. Carlos Eduardo Silva');

    // Digita valor R$ 1.200,00
    const amountInput = screen.getByLabelText(/Valor Arrecadado \(R\$\)\*/i);
    await user.clear(amountInput);
    await user.type(amountInput, '1200');

    // Confirma lançamento
    const submitBtn = screen.getByRole('button', { name: /Confirmar Lançamento/i });
    fireEvent.click(submitBtn);

    // Feedback toast de sucesso do lançamento
    await waitFor(() => {
      expect(screen.getByText(/Lançamento Registrado!/i)).toBeInTheDocument();
    });

    // Deve abrir automaticamente o Recibo Timbrado de Dízimo
    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Recibo de Contribuição Eclesiástica/i })).toBeInTheDocument();
      expect(screen.getByText('Igreja Central de Manaus')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Imprimir \/ Salvar PDF/i })).toBeInTheDocument();
    });

    // Fecha o modal de recibo
    const closeBtn = screen.getAllByRole('button', { name: /Fechar/i })[1];
    fireEvent.click(closeBtn);
  });

  it('deve cadastrar uma nova despesa no contas a pagar', async () => {
    const user = userEvent.setup();
    renderFinance();

    await waitFor(() => {
      expect(screen.getByText('Dízimo Pastoral - Outubro/2026')).toBeInTheDocument();
    });

    // Clica no botão de Nova Despesa (cabeçalho)
    const newExpenseBtn = screen.getAllByRole('button', { name: /Nova Despesa/i })[0];
    await user.click(newExpenseBtn);

    expect(screen.getByRole('heading', { name: /Lançar Despesa \/ Conta a Pagar/i })).toBeInTheDocument();

    // Preenche campos
    const descInput = screen.getByLabelText(/Descrição da Despesa\*/i);
    await user.type(descInput, 'Manutenção Emergencial do Gerador');

    const supplierInput = screen.getByLabelText(/Fornecedor \/ Credor\*/i);
    await user.type(supplierInput, 'Geradores Manaus Ltda');

    const amountInput = screen.getByLabelText(/Valor da Despesa \(R\$\)\*/i);
    await user.clear(amountInput);
    await user.type(amountInput, '1500');

    // Salva despesa
    const submitBtn = screen.getByRole('button', { name: /Salvar Despesa/i });
    fireEvent.click(submitBtn);

    // Verifica que a nova despesa aparece na tabela
    await waitFor(() => {
      expect(screen.getByText('Manutenção Emergencial do Gerador')).toBeInTheDocument();
      expect(screen.getByText('Geradores Manaus Ltda')).toBeInTheDocument();
    });
  });

  it('deve liquidar/pagar uma despesa pendente debitando da conta bancária com sucesso', async () => {
    const user = userEvent.setup();
    renderFinance();

    await waitFor(() => {
      expect(screen.getByText('Revisão e limpeza de 4 ares-condicionados centrais')).toBeInTheDocument();
    });

    // Encontra o botão "Pagar" na linha da despesa pendente
    const payButtons = screen.getAllByRole('button', { name: /Pagar/i });
    expect(payButtons.length).toBeGreaterThanOrEqual(1);
    await user.click(payButtons[0]);

    // Modal de Liquidação aberto
    expect(screen.getByRole('heading', { name: /Liquidar \/ Pagar Conta/i })).toBeInTheDocument();

    // Confirma pagamento
    const confirmBtn = screen.getByRole('button', { name: /Confirmar Pagamento/i });
    await user.click(confirmBtn);

    // Feedback de liquidação
    await waitFor(() => {
      expect(screen.getByText(/Conta Liquidada!/i)).toBeInTheDocument();
    });
  });

  it('deve realizar a conciliação bancária de um lançamento com 1 clique', async () => {
    const user = userEvent.setup();
    renderFinance();

    await waitFor(() => {
      expect(screen.getByText('Dízimo Pastoral - Outubro/2026')).toBeInTheDocument();
    });

    // Muda para a aba de Conciliação
    const reconTab = screen.getByRole('tab', { name: /Conciliação/i });
    fireEvent.click(reconTab);

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /Conciliação Bancária & Fechamento de Caixa/i })).toBeInTheDocument();
    });

    // Encontra o botão "Conciliar" em um lançamento pendente
    const conciliarBtns = screen.getAllByRole('button', { name: /Conciliar/i });
    expect(conciliarBtns.length).toBeGreaterThanOrEqual(1);
    await user.click(conciliarBtns[0]);

    // Feedback toast de conciliação atualizada
    await waitFor(() => {
      expect(screen.getByText(/Conciliação Atualizada/i)).toBeInTheDocument();
    });
  });

  it('deve exibir os orçamentos por departamento e alertar com destaque se houver estouro de verba', async () => {
    renderFinance();

    await waitFor(() => {
      expect(screen.getByText('Dízimo Pastoral - Outubro/2026')).toBeInTheDocument();
    });

    // Muda para a aba de Orçamentos
    const budgetTab = screen.getByRole('tab', { name: /Orçamentos/i });
    fireEvent.click(budgetTab);

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /Orçamento Eclesiástico por Ministério/i })
      ).toBeInTheDocument();
    });

    // Verifica departamentos orçados
    expect(screen.getByText('Ministério de Louvor & Som')).toBeInTheDocument();
    expect(screen.getAllByText('Manutenção Predial & Zeladoria').length).toBeGreaterThanOrEqual(1);

    // Alerta chamativo de estouro orçamentário (> 100%)
    expect(screen.getByTestId('budget-exceeded-alert')).toBeInTheDocument();
    expect(
      screen.getByText(/Alerta de Contingenciamento: Estouro de Teto Orçamentário Detectado!/i)
    ).toBeInTheDocument();
  });

  it('deve exibir as contas bancárias e caixas com seus saldos detalhados na aba Contas & Caixas', async () => {
    renderFinance();

    await waitFor(() => {
      expect(screen.getByText('Dízimo Pastoral - Outubro/2026')).toBeInTheDocument();
    });

    // Muda para a aba de Contas & Caixas
    const accountsTab = screen.getByRole('tab', { name: /Contas & Caixas/i });
    fireEvent.click(accountsTab);

    await waitFor(() => {
      expect(screen.getByText('Banco do Brasil - Conta Corrente Principal')).toBeInTheDocument();
      expect(screen.getByText('Itaú Unibanco - Arrecadação PIX')).toBeInTheDocument();
      expect(screen.getByText('Caixa Físico - Tesouraria Central')).toBeInTheDocument();
      expect(screen.getByText('Bradesco - Poupança Fundo de Construção')).toBeInTheDocument();
    });

    // Botão de nova conta visível
    expect(
      screen.getByRole('button', { name: /Cadastrar Conta ou Caixa/i })
    ).toBeInTheDocument();
  });
});
