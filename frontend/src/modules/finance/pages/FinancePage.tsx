/**
 * FinancePage — Orchestrator for Church Financial Management & Treasury
 * ChurchManager Enterprise Multi-Tenant Platform
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Breadcrumbs } from '@/components/shared/Breadcrumbs';
import { MetricKpiCard } from '@/components/shared/MetricKpiCard';
import { useToast } from '@/hooks/useToast';
import {
  Landmark,
  TrendingUp,
  TrendingDown,
  Clock,
  ShieldCheck,
  Heart,
  Plus,
  PieChart,
  Layers,
  Wallet,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { financeService } from '@/services/api/financeService';
import { secretariaService } from '@/services/api/secretariaService';
import { eventService } from '@/services/api/eventService';
import { TransactionsTab } from '../components/TransactionsTab';
import { TithesOfferingsTab } from '../components/TithesOfferingsTab';
import { ExpensesTab } from '../components/ExpensesTab';
import { AccountsTab } from '../components/AccountsTab';
import { BudgetsTab } from '../components/BudgetsTab';
import { ReconciliationTab } from '../components/ReconciliationTab';
import { TitheOfferingModal } from '../components/TitheOfferingModal';
import { ExpenseModal } from '../components/ExpenseModal';
import { QuickPayExpenseModal } from '../components/QuickPayExpenseModal';
import { TitheReceiptModal } from '../components/TitheReceiptModal';
import { AccountModal } from '../components/AccountModal';
import type {
  FinancialAccount,
  FinancialTransaction,
} from '../types';
import type {
  TitheOfferingFormData,
  ExpenseFormData,
  QuickPayExpenseFormData,
  AccountFormData,
  BudgetFormData,
} from '../schemas';

export const FinancePage: React.FC = () => {
  const { success, error } = useToast();
  const queryClient = useQueryClient();

  // Tab State
  const [activeTab, setActiveTab] = useState('transactions');

  // Modal States
  const [isTitheModalOpen, setIsTitheModalOpen] = useState(false);
  const [titheModalDefaultType, setTitheModalDefaultType] = useState<'tithe' | 'offering'>('tithe');
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [accountToEdit, setAccountToEdit] = useState<FinancialAccount | null>(null);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [selectedReceiptTx, setSelectedReceiptTx] = useState<FinancialTransaction | null>(null);
  const [quickPayModalOpen, setQuickPayModalOpen] = useState(false);
  const [selectedPayTx, setSelectedPayTx] = useState<FinancialTransaction | null>(null);

  // Queries
  const { data: accounts = [] } = useQuery({
    queryKey: ['finance', 'accounts'],
    queryFn: () => financeService.getAccounts(),
  });

  const { data: categories = [] } = useQuery({
    queryKey: ['finance', 'categories'],
    queryFn: () => financeService.getCategories(),
  });

  const { data: costCenters = [] } = useQuery({
    queryKey: ['finance', 'costCenters'],
    queryFn: () => financeService.getCostCenters(),
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ['finance', 'transactions'],
    queryFn: () => financeService.getTransactions(),
  });

  const { data: budgets = [] } = useQuery({
    queryKey: ['finance', 'budgets'],
    queryFn: () => financeService.getBudgets(),
  });

  const { data: metrics } = useQuery({
    queryKey: ['finance', 'metrics'],
    queryFn: () => financeService.getSummaryMetrics(),
  });

  const { data: members = [] } = useQuery({
    queryKey: ['secretaria', 'members'],
    queryFn: () => secretariaService.getMembers(),
  });

  const { data: events = [] } = useQuery({
    queryKey: ['events'],
    queryFn: () => eventService.getEvents(),
  });

  // Mutations
  const createTitheMutation = useMutation({
    mutationFn: (data: TitheOfferingFormData) => financeService.createTitheOffering(data),
    onSuccess: (newTx) => {
      queryClient.invalidateQueries({ queryKey: ['finance'] });
      success(
        'Lançamento Registrado!',
        `${newTx.categoryType === 'tithe' ? 'Dízimo' : 'Oferta'} no valor de ${formatCurrency(newTx.amount)} salvo com sucesso.`
      );
      // Opcional: abre recibo
      setSelectedReceiptTx(newTx);
      setReceiptModalOpen(true);
    },
    onError: (err: Error) => {
      error('Falha no Lançamento', err.message);
    },
  });

  const createExpenseMutation = useMutation({
    mutationFn: (data: ExpenseFormData) => financeService.createExpense(data),
    onSuccess: (newTx) => {
      queryClient.invalidateQueries({ queryKey: ['finance'] });
      success('Despesa Cadastrada!', `Despesa de ${formatCurrency(newTx.amount)} incluída no contas a pagar.`);
    },
    onError: (err: Error) => {
      error('Falha ao Cadastrar Despesa', err.message);
    },
  });

  const payExpenseMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: QuickPayExpenseFormData }) =>
      financeService.payExpense(id, data),
    onSuccess: (tx) => {
      queryClient.invalidateQueries({ queryKey: ['finance'] });
      success('Conta Liquidada!', `Pagamento de ${formatCurrency(tx.amount)} debitado com sucesso.`);
    },
    onError: (err: Error) => {
      error('Falha ao Liquidar Conta', err.message);
    },
  });

  const toggleReconcileMutation = useMutation({
    mutationFn: (id: string) => financeService.toggleReconciliation(id),
    onSuccess: (tx) => {
      queryClient.invalidateQueries({ queryKey: ['finance'] });
      success(
        'Conciliação Atualizada',
        `Lançamento marcado como ${tx.isReconciled ? 'Conciliado' : 'Pendente de Conciliação'}.`
      );
    },
    onError: (err: Error) => {
      error('Falha ao Conciliar', err.message);
    },
  });

  const deleteTransactionMutation = useMutation({
    mutationFn: (id: string) => financeService.deleteTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance'] });
      success('Lançamento Excluído', 'O registro foi removido e os saldos ajustados.');
    },
    onError: (err: Error) => {
      error('Falha ao Excluir', err.message);
    },
  });

  const saveAccountMutation = useMutation({
    mutationFn: (data: AccountFormData) => {
      if (accountToEdit) {
        return financeService.updateAccount(accountToEdit.id, data);
      }
      return financeService.createAccount(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance'] });
      success('Conta Salva!', 'Dados da conta financeira atualizados com sucesso.');
    },
    onError: (err: Error) => {
      error('Falha ao Salvar Conta', err.message);
    },
  });

  const createBudgetMutation = useMutation({
    mutationFn: (data: BudgetFormData) => financeService.createBudget(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['finance'] });
      success('Orçamento Registrado', 'Teto orçamentário configurado com sucesso.');
    },
    onError: (err: Error) => {
      error('Falha ao Salvar Orçamento', err.message);
    },
  });

  // Action Handlers
  const handleOpenNewTithe = () => {
    setTitheModalDefaultType('tithe');
    setIsTitheModalOpen(true);
  };

  const handleOpenNewOffering = () => {
    setTitheModalDefaultType('offering');
    setIsTitheModalOpen(true);
  };

  const handleViewReceipt = (tx: FinancialTransaction) => {
    setSelectedReceiptTx(tx);
    setReceiptModalOpen(true);
  };

  const handleQuickPayExpense = (tx: FinancialTransaction) => {
    setSelectedPayTx(tx);
    setQuickPayModalOpen(true);
  };

  const handleEditAccount = (acc: FinancialAccount) => {
    setAccountToEdit(acc);
    setIsAccountModalOpen(true);
  };

  const handleNewAccount = () => {
    setAccountToEdit(null);
    setIsAccountModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Breadcrumbs e Título */}
      <div className="space-y-2 mb-6">
        <Breadcrumbs
          items={[
            { label: 'Administração', href: '/admin' },
            { label: 'Financeiro Avançado', href: '/admin/finance' },
          ]}
        />
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Gestão Financeira & Tesouraria Eclesiástica
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Contas bancárias, dízimos, ofertas, contas a pagar, orçamentos por departamento e conciliação.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={handleOpenNewTithe}
              className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
            >
              <Heart className="h-4 w-4" />
              Lançar Dízimo / Oferta
            </Button>
            <Button
              variant="outline"
              onClick={() => setIsExpenseModalOpen(true)}
              className="gap-2 text-rose-600 border-rose-200 dark:border-rose-900/40 hover:bg-rose-500/10"
            >
              <Plus className="h-4 w-4" />
              Nova Despesa
            </Button>
          </div>
        </div>
      </div>

      {/* 6 Indicadores KPI no Topo */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        <MetricKpiCard
          title="Saldo Consolidado"
          value={metrics ? formatCurrency(metrics.consolidatedBalance) : 'R$ 0,00'}
          icon={Wallet}
          iconVariant="indigo"
          description="Em todas as contas ativas"
        />
        <MetricKpiCard
          title="Receitas no Mês"
          value={metrics ? formatCurrency(metrics.monthlyIncome) : 'R$ 0,00'}
          icon={TrendingUp}
          iconVariant="emerald"
          description="Dízimos e ofertas pagas"
        />
        <MetricKpiCard
          title="Despesas Pagas"
          value={metrics ? formatCurrency(metrics.monthlyExpenses) : 'R$ 0,00'}
          icon={TrendingDown}
          iconVariant="rose"
          description="Total liquidado no mês"
        />
        <MetricKpiCard
          title="Saldo Operacional"
          value={metrics ? formatCurrency(metrics.monthlyNetBalance) : 'R$ 0,00'}
          icon={Landmark}
          iconVariant="indigo"
          description="Superávit do mês corrente"
        />
        <MetricKpiCard
          title="Contas a Pagar"
          value={metrics ? formatCurrency(metrics.pendingPayables) : 'R$ 0,00'}
          icon={Clock}
          iconVariant="amber"
          description="Obrigações em aberto"
        />
        <MetricKpiCard
          title="Conciliação"
          value={metrics ? `${metrics.reconciliationRate}%` : '0%'}
          icon={ShieldCheck}
          iconVariant="purple"
          description="Transações conferidas"
        />
      </div>

      {/* Navegação por Abas Especializadas */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 w-full max-w-4xl h-auto p-1 bg-muted/60">
          <TabsTrigger
            value="transactions"
            onClick={() => setActiveTab('transactions')}
            className="gap-2 text-xs py-2"
          >
            <Layers className="h-4 w-4" />
            Lançamentos
          </TabsTrigger>
          <TabsTrigger
            value="tithes"
            onClick={() => setActiveTab('tithes')}
            className="gap-2 text-xs py-2"
          >
            <Heart className="h-4 w-4" />
            Dízimos & Ofertas
          </TabsTrigger>
          <TabsTrigger
            value="expenses"
            onClick={() => setActiveTab('expenses')}
            className="gap-2 text-xs py-2"
          >
            <TrendingDown className="h-4 w-4" />
            Contas a Pagar
          </TabsTrigger>
          <TabsTrigger
            value="accounts"
            onClick={() => setActiveTab('accounts')}
            className="gap-2 text-xs py-2"
          >
            <Wallet className="h-4 w-4" />
            Contas & Caixas
          </TabsTrigger>
          <TabsTrigger
            value="budgets"
            onClick={() => setActiveTab('budgets')}
            className="gap-2 text-xs py-2"
          >
            <PieChart className="h-4 w-4" />
            Orçamentos
          </TabsTrigger>
          <TabsTrigger
            value="reconciliation"
            onClick={() => setActiveTab('reconciliation')}
            className="gap-2 text-xs py-2"
          >
            <ShieldCheck className="h-4 w-4" />
            Conciliação
          </TabsTrigger>
        </TabsList>

        {/* Conteúdo das Abas */}
        <TabsContent value="transactions" className="space-y-4">
          <TransactionsTab
            transactions={transactions}
            accounts={accounts}
            categories={categories}
            costCenters={costCenters}
            onOpenNewTithe={handleOpenNewTithe}
            onOpenNewExpense={() => setIsExpenseModalOpen(true)}
            onViewReceipt={handleViewReceipt}
            onQuickPayExpense={handleQuickPayExpense}
            onToggleReconcile={async (id) => {
              await toggleReconcileMutation.mutateAsync(id);
            }}
            onDeleteTransaction={async (id) => {
              await deleteTransactionMutation.mutateAsync(id);
            }}
          />
        </TabsContent>

        <TabsContent value="tithes" className="space-y-4">
          <TithesOfferingsTab
            transactions={transactions}
            accounts={accounts}
            onOpenNewTithe={handleOpenNewTithe}
            onOpenNewOffering={handleOpenNewOffering}
            onViewReceipt={handleViewReceipt}
          />
        </TabsContent>

        <TabsContent value="expenses" className="space-y-4">
          <ExpensesTab
            transactions={transactions}
            accounts={accounts}
            categories={categories}
            costCenters={costCenters}
            onOpenNewExpense={() => setIsExpenseModalOpen(true)}
            onQuickPayExpense={handleQuickPayExpense}
          />
        </TabsContent>

        <TabsContent value="accounts" className="space-y-4">
          <AccountsTab
            accounts={accounts}
            onOpenNewAccount={handleNewAccount}
            onEditAccount={handleEditAccount}
          />
        </TabsContent>

        <TabsContent value="budgets" className="space-y-4">
          <BudgetsTab
            budgets={budgets}
            costCenters={costCenters}
            onCreateBudget={async (data) => {
              await createBudgetMutation.mutateAsync(data);
            }}
          />
        </TabsContent>

        <TabsContent value="reconciliation" className="space-y-4">
          <ReconciliationTab
            transactions={transactions}
            accounts={accounts}
            onToggleReconcile={async (id) => {
              await toggleReconcileMutation.mutateAsync(id);
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Modais do Módulo Financeiro */}
      <TitheOfferingModal
        open={isTitheModalOpen}
        onOpenChange={setIsTitheModalOpen}
        onSubmit={async (data) => {
          await createTitheMutation.mutateAsync(data);
        }}
        accounts={accounts}
        categories={categories}
        members={members}
        events={events}
        defaultCategoryType={titheModalDefaultType}
      />

      <ExpenseModal
        open={isExpenseModalOpen}
        onOpenChange={setIsExpenseModalOpen}
        onSubmit={async (data) => {
          await createExpenseMutation.mutateAsync(data);
        }}
        accounts={accounts}
        categories={categories}
        costCenters={costCenters}
      />

      <QuickPayExpenseModal
        open={quickPayModalOpen}
        onOpenChange={setQuickPayModalOpen}
        transaction={selectedPayTx}
        accounts={accounts}
        onConfirmPayment={async (id, data) => {
          await payExpenseMutation.mutateAsync({ id, data });
        }}
      />

      <TitheReceiptModal
        open={receiptModalOpen}
        onOpenChange={setReceiptModalOpen}
        transaction={selectedReceiptTx}
      />

      <AccountModal
        open={isAccountModalOpen}
        onOpenChange={setIsAccountModalOpen}
        onSubmit={async (data) => {
          await saveAccountMutation.mutateAsync(data);
        }}
        accountToEdit={accountToEdit}
      />
    </div>
  );
};
