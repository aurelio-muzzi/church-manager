import React, { useEffect, useState } from 'react';
import type {
  AccountType,
  FinancialAccount,
  FinancialBudget,
  FinancialCategory,
  FinancialSummaryReport,
  FinancialTransaction,
  MemberContributionReport,
  PaymentMethod,
  TransactionType,
} from '../../types/financial';
import type { Member } from '../../types/secretary';
import {
  createFinancialAccountApi,
  createFinancialBudgetApi,
  createFinancialCategoryApi,
  createFinancialTransactionApi,
  deleteFinancialAccountApi,
  deleteFinancialTransactionApi,
  getFinancialAccountsApi,
  getFinancialBudgetsApi,
  getFinancialCategoriesApi,
  getFinancialSummaryApi,
  getFinancialTransactionsApi,
  getMemberContributionsApi,
  reconcileTransactionApi,
} from '../../services/financialApi';
import { getMembersApi } from '../../services/secretaryApi';
import { CardSkeleton } from '../ui/Skeleton';
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Building2,
  CheckCircle2,
  Clock,
  DollarSign,
  Filter,
  Plus,
  Receipt,
  RefreshCw,
  Search,
  ShieldCheck,
  Tag,
  Trash2,
  User,
  Wallet,
} from 'lucide-react';

type FinancialTab = 'transactions' | 'accounts' | 'categories' | 'reconciliation' | 'budgets' | 'member_report';

export const FinancialModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<FinancialTab>('transactions');

  // Estados gerais
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<FinancialSummaryReport | null>(null);
  const [accounts, setAccounts] = useState<FinancialAccount[]>([]);
  const [categories, setCategories] = useState<FinancialCategory[]>([]);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [budgets, setBudgets] = useState<FinancialBudget[]>([]);
  const [members, setMembers] = useState<Member[]>([]);

  // Filtros de Transações
  const [filterType, setFilterType] = useState<string>('');
  const [filterAccountId, setFilterAccountId] = useState<string>('');
  const [filterCategoryId, setFilterCategoryId] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Notificações
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modais
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showBudgetModal, setShowBudgetModal] = useState(false);

  // Forms
  const [newTransaction, setNewTransaction] = useState<{
    account_id: number;
    category_id: number;
    member_id: number | null;
    type: TransactionType;
    amount: number;
    transaction_date: string;
    payment_method: PaymentMethod;
    description: string;
    document_number: string;
  }>({
    account_id: 0,
    category_id: 0,
    member_id: null,
    type: 'income',
    amount: 0,
    transaction_date: new Date().toISOString().split('T')[0],
    payment_method: 'pix',
    description: '',
    document_number: '',
  });

  const [newAccount, setNewAccount] = useState<{
    name: string;
    type: AccountType;
    bank_name: string;
    agency_number: string;
    account_number: string;
    initial_balance: number;
    notes: string;
  }>({
    name: '',
    type: 'checking',
    bank_name: '',
    agency_number: '',
    account_number: '',
    initial_balance: 0,
    notes: '',
  });

  const [newCategory, setNewCategory] = useState({
    name: '',
    code: '',
    type: 'income' as TransactionType,
    color: '#10b981',
  });

  const [newBudget, setNewBudget] = useState<{
    category_id: number;
    year: number;
    month: number | null;
    planned_amount: number;
    notes: string;
  }>({
    category_id: 0,
    year: new Date().getFullYear(),
    month: new Date().getMonth() + 1,
    planned_amount: 0,
    notes: '',
  });

  // Relatório de Membros
  const [selectedMemberId, setSelectedMemberId] = useState<number | null>(null);
  const [memberReport, setMemberReport] = useState<MemberContributionReport | null>(null);
  const [loadingMemberReport, setLoadingMemberReport] = useState(false);

  const formatBRL = (val: number | string) => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(isNaN(num) ? 0 : num);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  const notify = (msg: string, isError = false) => {
    if (isError) {
      setErrorMessage(msg);
      setTimeout(() => setErrorMessage(null), 5000);
    } else {
      setSuccessMessage(msg);
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  const loadAll = async () => {
    setLoading(true);
    try {
      const [sumData, accData, catData, transData, budData, memData] = await Promise.all([
        getFinancialSummaryApi(),
        getFinancialAccountsApi(),
        getFinancialCategoriesApi(),
        getFinancialTransactionsApi(),
        getFinancialBudgetsApi(),
        getMembersApi(),
      ]);

      setSummary(sumData);
      setAccounts(accData);
      setCategories(catData);
      setTransactions(transData);
      setBudgets(budData);
      setMembers(memData);

      if (accData.length > 0 && newTransaction.account_id === 0) {
        setNewTransaction((prev) => ({ ...prev, account_id: accData[0].id }));
      }
      if (catData.length > 0 && newTransaction.category_id === 0) {
        setNewTransaction((prev) => ({ ...prev, category_id: catData[0].id }));
        setNewBudget((prev) => ({ ...prev, category_id: catData[0].id }));
      }
    } catch (err: unknown) {
      const error = err as Error;
      notify(error.message || 'Erro ao carregar dados financeiros.', true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTransaction.account_id || !newTransaction.category_id || newTransaction.amount <= 0) {
      notify('Preencha os campos obrigatórios e um valor maior que zero.', true);
      return;
    }

    try {
      await createFinancialTransactionApi({
        ...newTransaction,
        member_id: newTransaction.member_id ? Number(newTransaction.member_id) : undefined,
      });
      notify('Transação financeira lançada com sucesso!');
      setShowTransactionModal(false);
      setNewTransaction({
        account_id: accounts[0]?.id || 0,
        category_id: categories[0]?.id || 0,
        member_id: null,
        type: 'income',
        amount: 0,
        transaction_date: new Date().toISOString().split('T')[0],
        payment_method: 'pix',
        description: '',
        document_number: '',
      });
      await loadAll();
    } catch (err: unknown) {
      const error = err as Error;
      notify(error.message || 'Erro ao criar transação.', true);
    }
  };

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccount.name) {
      notify('O nome da conta é obrigatório.', true);
      return;
    }

    try {
      await createFinancialAccountApi(newAccount);
      notify('Conta cadastrada com sucesso!');
      setShowAccountModal(false);
      setNewAccount({
        name: '',
        type: 'checking',
        bank_name: '',
        agency_number: '',
        account_number: '',
        initial_balance: 0,
        notes: '',
      });
      await loadAll();
    } catch (err: unknown) {
      const error = err as Error;
      notify(error.message || 'Erro ao cadastrar conta.', true);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.name) {
      notify('O nome da categoria é obrigatório.', true);
      return;
    }

    try {
      await createFinancialCategoryApi(newCategory);
      notify('Categoria adicionada ao Plano de Contas!');
      setShowCategoryModal(false);
      setNewCategory({
        name: '',
        code: '',
        type: 'income',
        color: '#10b981',
      });
      await loadAll();
    } catch (err: unknown) {
      const error = err as Error;
      notify(error.message || 'Erro ao criar categoria.', true);
    }
  };

  const handleCreateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBudget.category_id || newBudget.planned_amount <= 0) {
      notify('Selecione uma categoria e informe um valor planejado maior que zero.', true);
      return;
    }

    try {
      await createFinancialBudgetApi(newBudget);
      notify('Orçamento definido com sucesso!');
      setShowBudgetModal(false);
      setNewBudget({
        category_id: categories[0]?.id || 0,
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        planned_amount: 0,
        notes: '',
      });
      await loadAll();
    } catch (err: unknown) {
      const error = err as Error;
      notify(error.message || 'Erro ao definir orçamento.', true);
    }
  };

  const handleReconcile = async (id: number) => {
    try {
      await reconcileTransactionApi(id);
      notify('Transação conciliada com sucesso!');
      await loadAll();
    } catch (err: unknown) {
      const error = err as Error;
      notify(error.message || 'Erro ao conciliar transação.', true);
    }
  };

  const handleDeleteTransaction = async (id: number) => {
    if (!confirm('Deseja realmente excluir esta transação? O saldo da conta será revertido.')) {
      return;
    }

    try {
      await deleteFinancialTransactionApi(id);
      notify('Transação excluída e saldo revertido.');
      await loadAll();
    } catch (err: unknown) {
      const error = err as Error;
      notify(error.message || 'Erro ao excluir transação.', true);
    }
  };

  const handleDeleteAccount = async (id: number) => {
    if (!confirm('Deseja excluir esta conta? Só é permitida a exclusão de contas sem transações.')) {
      return;
    }

    try {
      await deleteFinancialAccountApi(id);
      notify('Conta financeira excluída.');
      await loadAll();
    } catch (err: unknown) {
      const error = err as Error;
      notify(error.message || 'Erro ao excluir conta.', true);
    }
  };

  const handleFetchMemberReport = async (memberId: number) => {
    setSelectedMemberId(memberId);
    setLoadingMemberReport(true);
    try {
      const report = await getMemberContributionsApi(memberId);
      setMemberReport(report);
    } catch (err: unknown) {
      const error = err as Error;
      notify(error.message || 'Erro ao carregar relatório do membro.', true);
    } finally {
      setLoadingMemberReport(false);
    }
  };

  // Filtragem local de transações
  const filteredTransactions = transactions.filter((t) => {
    if (filterType && t.type !== filterType) return false;
    if (filterAccountId && String(t.account_id) !== filterAccountId) return false;
    if (filterCategoryId && String(t.category_id) !== filterCategoryId) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const desc = t.description?.toLowerCase() || '';
      const doc = t.document_number?.toLowerCase() || '';
      const cat = t.category?.name.toLowerCase() || '';
      const mem = t.member?.name.toLowerCase() || '';
      if (!desc.includes(term) && !doc.includes(term) && !cat.includes(term) && !mem.includes(term)) {
        return false;
      }
    }
    return true;
  });

  const unreconciledTransactions = transactions.filter((t) => !t.reconciled);

  return (
    <div className="space-y-6">
      {/* Alertas */}
      {successMessage && (
        <div className="bg-emerald-900/40 border border-emerald-500/50 text-emerald-200 px-4 py-3 rounded-xl flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-medium">{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-400 hover:text-emerald-200 text-sm">
            &times;
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="bg-rose-900/40 border border-rose-500/50 text-rose-200 px-4 py-3 rounded-xl flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-rose-400" />
            <span className="text-sm font-medium">{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-rose-400 hover:text-rose-200 text-sm">
            &times;
          </button>
        </div>
      )}

      {/* Header com Ações Rápidas */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-slate-900/70 p-6 rounded-2xl border border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <DollarSign className="w-7 h-7 text-emerald-400" />
            Módulo Financeiro Avançado
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Gestão transparente de dízimos, ofertas, contas bancárias, conciliação e controle orçamentário.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={loadAll}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-sm flex items-center gap-2 transition"
            title="Atualizar dados"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
          <button
            onClick={() => setShowTransactionModal(true)}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-sm flex items-center gap-2 shadow-lg shadow-emerald-950/30 transition"
          >
            <Plus className="w-4 h-4" />
            Novo Lançamento
          </button>
        </div>
      </div>

      {/* KPIs Financeiros */}
      {loading && !summary ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Saldo Total */}
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Saldo Consolidado</span>
              <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
                <Wallet className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold text-white">{formatBRL(summary?.total_balance ?? 0)}</span>
              <p className="text-xs text-slate-500 mt-1">{accounts.length} contas ativas gerenciadas</p>
            </div>
          </div>

          {/* Entradas */}
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Entradas no Período</span>
              <div className="p-2 bg-teal-500/10 rounded-xl text-teal-400">
                <ArrowUpRight className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold text-teal-400">{formatBRL(summary?.total_income ?? 0)}</span>
              <p className="text-xs text-slate-500 mt-1">Dízimos, ofertas e doações</p>
            </div>
          </div>

          {/* Saídas */}
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Saídas no Período</span>
              <div className="p-2 bg-rose-500/10 rounded-xl text-rose-400">
                <ArrowDownRight className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold text-rose-400">{formatBRL(summary?.total_expense ?? 0)}</span>
              <p className="text-xs text-slate-500 mt-1">Custos operacionais e ministérios</p>
            </div>
          </div>

          {/* Superávit / Déficit */}
          <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Resultado Líquido</span>
              <div
                className={`p-2 rounded-xl ${
                  (summary?.net_result ?? 0) >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                }`}
              >
                <BarChart3 className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3">
              <span
                className={`text-2xl font-bold ${
                  (summary?.net_result ?? 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {formatBRL(summary?.net_result ?? 0)}
              </span>
              <div className="flex items-center gap-1.5 mt-1">
                {(summary?.pending_reconciliation_count ?? 0) > 0 ? (
                  <button
                    onClick={() => setActiveTab('reconciliation')}
                    className="text-xs text-amber-400 hover:underline flex items-center gap-1 font-medium"
                  >
                    <Clock className="w-3.5 h-3.5" />
                    {summary?.pending_reconciliation_count} pendentes de conciliação
                  </button>
                ) : (
                  <span className="text-xs text-slate-500">Conciliações em dia</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Navegação de Abas */}
      <div className="border-b border-slate-800 flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('transactions')}
          className={`px-4 py-2.5 rounded-xl text-sm font-medium transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'transactions'
              ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Receipt className="w-4 h-4" />
          Fluxo de Caixa & Lançamentos
        </button>

        <button
          onClick={() => setActiveTab('accounts')}
          className={`px-4 py-2.5 rounded-xl text-sm font-medium transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'accounts'
              ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Building2 className="w-4 h-4" />
          Contas & Caixas ({accounts.length})
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2.5 rounded-xl text-sm font-medium transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'categories'
              ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <Tag className="w-4 h-4" />
          Plano de Contas ({categories.length})
        </button>

        <button
          onClick={() => setActiveTab('reconciliation')}
          className={`px-4 py-2.5 rounded-xl text-sm font-medium transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'reconciliation'
              ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          Conciliação Bancária
          {unreconciledTransactions.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30">
              {unreconciledTransactions.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('budgets')}
          className={`px-4 py-2.5 rounded-xl text-sm font-medium transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'budgets'
              ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Orçamento vs Realizado
        </button>

        <button
          onClick={() => setActiveTab('member_report')}
          className={`px-4 py-2.5 rounded-xl text-sm font-medium transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'member_report'
              ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <User className="w-4 h-4" />
          Extrato do Membro (Dízimos)
        </button>
      </div>

      {/* ABA 1: Fluxo de Caixa & Lançamentos */}
      {activeTab === 'transactions' && (
        <div className="space-y-4">
          {/* Barra de Filtros */}
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-1 min-w-[240px]">
              <Search className="w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por descrição, documento ou membro..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-full"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Filter className="w-3.5 h-3.5" />
                Filtros:
              </div>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="">Todos os tipos</option>
                <option value="income">Entradas (Receitas)</option>
                <option value="expense">Saídas (Despesas)</option>
              </select>

              <select
                value={filterAccountId}
                onChange={(e) => setFilterAccountId(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="">Todas as contas</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name}
                  </option>
                ))}
              </select>

              <select
                value={filterCategoryId}
                onChange={(e) => setFilterCategoryId(e.target.value)}
                className="bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="">Todas as categorias</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tabela de Transações */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950/60 text-xs uppercase text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3.5">Data</th>
                    <th className="px-4 py-3.5">Descrição</th>
                    <th className="px-4 py-3.5">Categoria</th>
                    <th className="px-4 py-3.5">Conta</th>
                    <th className="px-4 py-3.5">Forma / Doc</th>
                    <th className="px-4 py-3.5">Membro</th>
                    <th className="px-4 py-3.5 text-right">Valor</th>
                    <th className="px-4 py-3.5 text-center">Conciliado</th>
                    <th className="px-4 py-3.5 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-slate-500">
                        Nenhuma transação encontrada no período ou com os filtros aplicados.
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-800/40 transition">
                        <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-400">
                          {formatDate(tx.transaction_date)}
                        </td>
                        <td className="px-4 py-3 font-medium text-white max-w-[200px] truncate" title={tx.description}>
                          {tx.description}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: `${tx.category?.color || '#3b82f6'}20`,
                              color: tx.category?.color || '#3b82f6',
                              border: `1px solid ${tx.category?.color || '#3b82f6'}40`,
                            }}
                          >
                            {tx.category?.name || 'Sem categoria'}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-400">
                          {tx.account?.name || '-'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-400">
                          <span className="uppercase text-slate-300 font-medium">{tx.payment_method}</span>
                          {tx.document_number && (
                            <span className="block text-[11px] text-slate-500">Doc: {tx.document_number}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-300">
                          {tx.member ? (
                            <span className="text-emerald-400 flex items-center gap-1 font-medium">
                              <User className="w-3 h-3" />
                              {tx.member.name}
                            </span>
                          ) : (
                            <span className="text-slate-500">-</span>
                          )}
                        </td>
                        <td
                          className={`px-4 py-3 whitespace-nowrap text-right font-bold ${
                            tx.type === 'income' ? 'text-teal-400' : 'text-rose-400'
                          }`}
                        >
                          {tx.type === 'income' ? '+' : '-'} {formatBRL(tx.amount)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-center">
                          {tx.reconciled ? (
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                              title={`Conciliado em ${formatDate(tx.reconciled_at?.split('T')[0])}`}
                            >
                              <ShieldCheck className="w-3 h-3" /> Sim
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                              <Clock className="w-3 h-3" /> Não
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-center">
                          {!tx.reconciled ? (
                            <button
                              onClick={() => handleDeleteTransaction(tx.id)}
                              className="text-slate-500 hover:text-rose-400 p-1 rounded-lg transition"
                              title="Excluir lançamento"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          ) : (
                            <span className="text-xs text-slate-600" title="Transação conciliada não pode ser excluída">
                              Bloqueado
                            </span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ABA 2: Contas & Caixas */}
      {activeTab === 'accounts' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">Contas bancárias, caixas de culto e aplicações da igreja.</p>
            <button
              onClick={() => setShowAccountModal(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm flex items-center gap-2 border border-slate-700 transition"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              Adicionar Conta / Caixa
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {accounts.map((acc) => (
              <div
                key={acc.id}
                className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-white text-base">{acc.name}</h3>
                      <p className="text-xs text-slate-400 mt-0.5 uppercase tracking-wider font-semibold">
                        {acc.type === 'checking' && 'Conta Corrente'}
                        {acc.type === 'savings' && 'Conta Poupança'}
                        {acc.type === 'cash' && 'Caixa Físico'}
                        {acc.type === 'investment' && 'Aplicação Financeira'}
                      </p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        acc.status === 'active'
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-700 text-slate-400'
                      }`}
                    >
                      {acc.status === 'active' ? 'Ativa' : 'Inativa'}
                    </span>
                  </div>

                  <div className="mt-4 space-y-1.5 text-xs text-slate-400">
                    {acc.bank_name && (
                      <p>
                        <strong className="text-slate-300">Banco:</strong> {acc.bank_name}
                      </p>
                    )}
                    {acc.agency_number && (
                      <p>
                        <strong className="text-slate-300">Agência:</strong> {acc.agency_number}
                        {acc.account_number && ` | Conta: ${acc.account_number}`}
                      </p>
                    )}
                    {acc.congregation && (
                      <p>
                        <strong className="text-slate-300">Congregação:</strong> {acc.congregation.name}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-slate-500 block uppercase font-medium">Saldo Atual</span>
                    <span
                      className={`text-lg font-bold ${
                        Number(acc.current_balance) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {formatBRL(acc.current_balance)}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteAccount(acc.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                    title="Excluir conta (somente se não houver lançamentos)"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ABA 3: Plano de Contas */}
      {activeTab === 'categories' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">Classificação de receitas e despesas da instituição.</p>
            <button
              onClick={() => setShowCategoryModal(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm flex items-center gap-2 border border-slate-700 transition"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              Nova Categoria
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Categorias de Receita */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <ArrowUpRight className="w-5 h-5 text-teal-400" />
                <h3 className="font-bold text-white">Categorias de Receitas</h3>
              </div>
              <div className="space-y-2">
                {categories
                  .filter((c) => c.type === 'income')
                  .map((cat) => (
                    <div
                      key={cat.id}
                      className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: cat.color }} />
                        <div>
                          <span className="text-sm font-semibold text-white">{cat.name}</span>
                          {cat.code && <span className="text-xs text-slate-500 block">Código: {cat.code}</span>}
                        </div>
                      </div>
                      <span className="text-xs text-teal-400 font-medium bg-teal-500/10 px-2 py-0.5 rounded-full">
                        Entrada
                      </span>
                    </div>
                  ))}
              </div>
            </div>

            {/* Categorias de Despesa */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <ArrowDownRight className="w-5 h-5 text-rose-400" />
                <h3 className="font-bold text-white">Categorias de Despesas</h3>
              </div>
              <div className="space-y-2">
                {categories
                  .filter((c) => c.type === 'expense')
                  .map((cat) => (
                    <div
                      key={cat.id}
                      className="p-3 bg-slate-800/40 border border-slate-800 rounded-xl flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: cat.color }} />
                        <div>
                          <span className="text-sm font-semibold text-white">{cat.name}</span>
                          {cat.code && <span className="text-xs text-slate-500 block">Código: {cat.code}</span>}
                        </div>
                      </div>
                      <span className="text-xs text-rose-400 font-medium bg-rose-500/10 px-2 py-0.5 rounded-full">
                        Saída
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 4: Conciliação Bancária */}
      {activeTab === 'reconciliation' && (
        <div className="space-y-4">
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-amber-400" />
              Painel de Conciliação Bancária
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Transações confirmadas pelo extrato bancário oficial são marcadas como conciliadas e travadas contra
              alterações acidentais para garantir conformidade contábil.
            </p>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950/60 text-xs uppercase text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3.5">Data</th>
                    <th className="px-4 py-3.5">Descrição</th>
                    <th className="px-4 py-3.5">Conta</th>
                    <th className="px-4 py-3.5">Categoria</th>
                    <th className="px-4 py-3.5 text-right">Valor</th>
                    <th className="px-4 py-3.5 text-center">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {unreconciledTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-emerald-400 font-medium">
                        ✓ Todas as transações estão devidamente conciliadas com o extrato!
                      </td>
                    </tr>
                  ) : (
                    unreconciledTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-800/40 transition">
                        <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-400">
                          {formatDate(tx.transaction_date)}
                        </td>
                        <td className="px-4 py-3 font-medium text-white">{tx.description}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-400">
                          {tx.account?.name || '-'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-xs text-slate-400">
                          {tx.category?.name || '-'}
                        </td>
                        <td
                          className={`px-4 py-3 whitespace-nowrap text-right font-bold ${
                            tx.type === 'income' ? 'text-teal-400' : 'text-rose-400'
                          }`}
                        >
                          {tx.type === 'income' ? '+' : '-'} {formatBRL(tx.amount)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-center">
                          <button
                            onClick={() => handleReconcile(tx.id)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center gap-1.5 mx-auto transition shadow"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            Conciliar Agora
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ABA 5: Orçamento vs Realizado */}
      {activeTab === 'budgets' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-400">
              Acompanhamento de metas orçamentárias anuais e mensais por categoria de despesa.
            </p>
            <button
              onClick={() => setShowBudgetModal(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm flex items-center gap-2 border border-slate-700 transition"
            >
              <Plus className="w-4 h-4 text-emerald-400" />
              Definir Orçamento
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {budgets.length === 0 ? (
              <div className="col-span-3 bg-slate-900/60 border border-slate-800 p-8 rounded-2xl text-center text-slate-500">
                Nenhum orçamento cadastrado para o exercício atual.
              </div>
            ) : (
              budgets.map((bg) => {
                const percentage = bg.percentage_used ?? 0;
                let barColor = 'bg-emerald-500';
                if (percentage > 80 && percentage <= 100) barColor = 'bg-amber-500';
                if (percentage > 100) barColor = 'bg-rose-500';

                return (
                  <div key={bg.id} className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-bold text-white text-base">{bg.category?.name || 'Categoria'}</h4>
                        <span className="text-xs text-slate-500">
                          {bg.month ? `Mês ${bg.month} / ${bg.year}` : `Ano ${bg.year}`}
                        </span>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          percentage > 100
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {percentage.toFixed(1)}%
                      </span>
                    </div>

                    {/* Barra de Progresso */}
                    <div className="space-y-1.5">
                      <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full ${barColor} transition-all duration-500`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>Realizado: {formatBRL(bg.executed_amount)}</span>
                        <span>Meta: {formatBRL(bg.planned_amount)}</span>
                      </div>
                    </div>

                    {bg.notes && <p className="text-xs text-slate-500 italic">{bg.notes}</p>}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* ABA 6: Extrato do Membro (Dízimos Nominais) */}
      {activeTab === 'member_report' && (
        <div className="space-y-4">
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <User className="w-5 h-5 text-emerald-400" />
                Informe Anual de Contribuições (Dízimos Nominais)
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Emissão transparente do relatório anual de dízimos para comprovação e declaração de renda.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={selectedMemberId || ''}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  if (val) handleFetchMemberReport(val);
                }}
                className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                <option value="">Selecione um membro...</option>
                {members.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {loadingMemberReport && (
            <div className="p-8 text-center text-slate-400 flex items-center justify-center gap-2">
              <RefreshCw className="w-5 h-5 animate-spin text-emerald-400" />
              Carregando contribuições do membro...
            </div>
          )}

          {!loadingMemberReport && memberReport && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
                <div>
                  <h2 className="text-xl font-bold text-white">{memberReport.member.name}</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    {memberReport.member.email && `Email: ${memberReport.member.email}`}
                    {memberReport.member.phone && ` | Telefone: ${memberReport.member.phone}`}
                  </p>
                </div>
                <div className="bg-emerald-500/10 border border-emerald-500/30 px-5 py-3 rounded-2xl text-right">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Total Contribuído em {memberReport.year}
                  </span>
                  <span className="text-2xl font-bold text-emerald-400">
                    {formatBRL(memberReport.total_contributed)}
                  </span>
                </div>
              </div>

              {/* Tabela de Contribuições */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-slate-950/60 text-xs uppercase text-slate-400 font-semibold border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Data</th>
                      <th className="px-4 py-3">Descrição</th>
                      <th className="px-4 py-3">Categoria</th>
                      <th className="px-4 py-3">Conta / Caixa</th>
                      <th className="px-4 py-3">Forma</th>
                      <th className="px-4 py-3 text-right">Valor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {memberReport.contributions.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-800/40">
                        <td className="px-4 py-2.5 text-xs text-slate-400">{formatDate(c.transaction_date)}</td>
                        <td className="px-4 py-2.5 font-medium text-white">{c.description}</td>
                        <td className="px-4 py-2.5 text-xs text-slate-300">{c.category?.name || '-'}</td>
                        <td className="px-4 py-2.5 text-xs text-slate-400">{c.account?.name || '-'}</td>
                        <td className="px-4 py-2.5 text-xs uppercase text-slate-400">{c.payment_method}</td>
                        <td className="px-4 py-2.5 text-right font-bold text-teal-400">{formatBRL(c.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODAL: Novo Lançamento */}
      {showTransactionModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Plus className="w-5 h-5 text-emerald-400" />
                Registrar Lançamento Financeiro
              </h3>
              <button
                onClick={() => setShowTransactionModal(false)}
                className="text-slate-400 hover:text-white text-lg"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateTransaction} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Tipo de Lançamento *</label>
                  <select
                    value={newTransaction.type}
                    onChange={(e) =>
                      setNewTransaction({ ...newTransaction, type: e.target.value as TransactionType })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="income">Entrada (Receita)</option>
                    <option value="expense">Saída (Despesa)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Valor (R$) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={newTransaction.amount || ''}
                    onChange={(e) =>
                      setNewTransaction({ ...newTransaction, amount: parseFloat(e.target.value) || 0 })
                    }
                    placeholder="0,00"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Conta Bancária / Caixa *</label>
                  <select
                    value={newTransaction.account_id}
                    onChange={(e) =>
                      setNewTransaction({ ...newTransaction, account_id: Number(e.target.value) })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    {accounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Categoria *</label>
                  <select
                    value={newTransaction.category_id}
                    onChange={(e) =>
                      setNewTransaction({ ...newTransaction, category_id: Number(e.target.value) })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    {categories
                      .filter((c) => c.type === newTransaction.type)
                      .map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Se for receita, permitir associar membro (nominal) */}
              {newTransaction.type === 'income' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Membro Doador (Opcional - Dízimo Nominal)
                  </label>
                  <select
                    value={newTransaction.member_id || ''}
                    onChange={(e) =>
                      setNewTransaction({
                        ...newTransaction,
                        member_id: e.target.value ? Number(e.target.value) : null,
                      })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="">Anônimo / Não identificado</option>
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Data *</label>
                  <input
                    type="date"
                    required
                    value={newTransaction.transaction_date}
                    onChange={(e) =>
                      setNewTransaction({ ...newTransaction, transaction_date: e.target.value })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Forma de Pagamento *</label>
                  <select
                    value={newTransaction.payment_method}
                    onChange={(e) =>
                      setNewTransaction({
                        ...newTransaction,
                        payment_method: e.target.value as PaymentMethod,
                      })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="pix">PIX</option>
                    <option value="cash">Dinheiro em Espécie</option>
                    <option value="credit_card">Cartão de Crédito</option>
                    <option value="debit_card">Cartão de Débito</option>
                    <option value="bank_transfer">Transferência Bancária</option>
                    <option value="bank_slip">Boleto Bancário</option>
                    <option value="check">Cheque</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Descrição / Histórico *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Dízimo referente a Outubro, Compra de material..."
                  value={newTransaction.description}
                  onChange={(e) =>
                    setNewTransaction({ ...newTransaction, description: e.target.value })
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Número do Documento / Comprovante
                </label>
                <input
                  type="text"
                  placeholder="Ex: NF-1049, PIX ID..."
                  value={newTransaction.document_number}
                  onChange={(e) =>
                    setNewTransaction({ ...newTransaction, document_number: e.target.value })
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowTransactionModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition"
                >
                  Salvar Lançamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Nova Conta */}
      {showAccountModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-400" />
                Cadastrar Conta / Caixa
              </h3>
              <button
                onClick={() => setShowAccountModal(false)}
                className="text-slate-400 hover:text-white text-lg"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateAccount} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nome da Conta *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Banco do Brasil - Principal, Caixa Secretaria"
                  value={newAccount.name}
                  onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Tipo de Conta *</label>
                <select
                  value={newAccount.type}
                  onChange={(e) =>
                    setNewAccount({
                      ...newAccount,
                      type: e.target.value as 'checking' | 'savings' | 'cash' | 'investment',
                    })
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="checking">Conta Corrente</option>
                  <option value="savings">Conta Poupança</option>
                  <option value="cash">Caixa Físico / Espécie</option>
                  <option value="investment">Aplicação Financeira</option>
                </select>
              </div>

              {newAccount.type !== 'cash' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Instituição Bancária</label>
                    <input
                      type="text"
                      placeholder="Ex: Santander, Itaú, Bradesco..."
                      value={newAccount.bank_name}
                      onChange={(e) => setNewAccount({ ...newAccount, bank_name: e.target.value })}
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Agência</label>
                      <input
                        type="text"
                        placeholder="Ex: 1234-5"
                        value={newAccount.agency_number}
                        onChange={(e) => setNewAccount({ ...newAccount, agency_number: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1">Número da Conta</label>
                      <input
                        type="text"
                        placeholder="Ex: 56789-0"
                        value={newAccount.account_number}
                        onChange={(e) => setNewAccount({ ...newAccount, account_number: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Saldo Inicial (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={newAccount.initial_balance}
                  onChange={(e) =>
                    setNewAccount({ ...newAccount, initial_balance: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAccountModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition"
                >
                  Cadastrar Conta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Nova Categoria */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Tag className="w-5 h-5 text-emerald-400" />
                Nova Categoria (Plano de Contas)
              </h3>
              <button
                onClick={() => setShowCategoryModal(false)}
                className="text-slate-400 hover:text-white text-lg"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Tipo da Categoria *</label>
                <select
                  value={newCategory.type}
                  onChange={(e) =>
                    setNewCategory({ ...newCategory, type: e.target.value as TransactionType })
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="income">Receita (Entrada)</option>
                  <option value="expense">Despesa (Saída)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Nome da Categoria *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Missões, Construção, Energia Elétrica..."
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Código Contábil</label>
                  <input
                    type="text"
                    placeholder="Ex: 1.01.05"
                    value={newCategory.code}
                    onChange={(e) => setNewCategory({ ...newCategory, code: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Cor de Destaque</label>
                  <input
                    type="color"
                    value={newCategory.color}
                    onChange={(e) => setNewCategory({ ...newCategory, color: e.target.value })}
                    className="w-full h-10 bg-slate-800 border border-slate-700 rounded-xl px-1 py-1 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition"
                >
                  Salvar Categoria
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Novo Orçamento */}
      {showBudgetModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-400" />
                Definir Meta de Orçamento
              </h3>
              <button
                onClick={() => setShowBudgetModal(false)}
                className="text-slate-400 hover:text-white text-lg"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleCreateBudget} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Categoria de Despesa *</label>
                <select
                  value={newBudget.category_id}
                  onChange={(e) => setNewBudget({ ...newBudget, category_id: Number(e.target.value) })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  {categories
                    .filter((c) => c.type === 'expense')
                    .map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Ano *</label>
                  <input
                    type="number"
                    required
                    value={newBudget.year}
                    onChange={(e) => setNewBudget({ ...newBudget, year: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Mês (Opcional)</label>
                  <input
                    type="number"
                    min="1"
                    max="12"
                    placeholder="1 a 12"
                    value={newBudget.month || ''}
                    onChange={(e) =>
                      setNewBudget({ ...newBudget, month: e.target.value ? Number(e.target.value) : null })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Valor Planejado (R$) *</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  value={newBudget.planned_amount || ''}
                  onChange={(e) =>
                    setNewBudget({ ...newBudget, planned_amount: parseFloat(e.target.value) || 0 })
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Observações</label>
                <input
                  type="text"
                  placeholder="Ex: Teto máximo aprovado na assembleia anual"
                  value={newBudget.notes}
                  onChange={(e) => setNewBudget({ ...newBudget, notes: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowBudgetModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white text-sm"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition"
                >
                  Salvar Orçamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default FinancialModule;
