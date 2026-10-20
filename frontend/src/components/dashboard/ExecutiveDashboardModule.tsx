import React, { useEffect, useState } from 'react';
import type {
  DemographicsData,
  ExecutiveOverview,
  FinancialEvolutionMonth,
  MinistryStatsData,
  PastoralAlertsData,
} from '../../types/dashboard';
import {
  downloadDashboardCsvApi,
  getDemographicsApi,
  getExecutiveOverviewApi,
  getFinancialEvolutionApi,
  getMinistryStatsApi,
  getPastoralAlertsApi,
} from '../../services/dashboardApi';
import {
  AlertCircle,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Download,
  FileSpreadsheet,
  HeartHandshake,
  Layers,
  Mail,
  Phone,
  PieChart,
  RefreshCw,
  TrendingUp,
  UserCheck,
  Users,
} from 'lucide-react';

type DashboardTab = 'overview' | 'demographics' | 'ministries' | 'pastoral' | 'exports';

export const ExecutiveDashboardModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState<string | null>(null);

  const [overview, setOverview] = useState<ExecutiveOverview | null>(null);
  const [demographics, setDemographics] = useState<DemographicsData | null>(null);
  const [ministryStats, setMinistryStats] = useState<MinistryStatsData | null>(null);
  const [financialEvolution, setFinancialEvolution] = useState<FinancialEvolutionMonth[]>([]);
  const [pastoralAlerts, setPastoralAlerts] = useState<PastoralAlertsData | null>(null);

  const [notification, setNotification] = useState<{ message: string; isError?: boolean } | null>(null);

  const notify = (message: string, isError = false) => {
    setNotification({ message, isError });
    setTimeout(() => setNotification(null), 5000);
  };

  const loadAll = async () => {
    setLoading(true);
    try {
      const [over, demo, min, fin, past] = await Promise.all([
        getExecutiveOverviewApi(),
        getDemographicsApi(),
        getMinistryStatsApi(),
        getFinancialEvolutionApi(),
        getPastoralAlertsApi(),
      ]);

      setOverview(over);
      setDemographics(demo);
      setMinistryStats(min);
      setFinancialEvolution(fin);
      setPastoralAlerts(past);
    } catch (err: unknown) {
      const error = err as Error;
      notify(error.message || 'Erro ao carregar dados do dashboard executivo.', true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleExport = async (type: 'members' | 'financial' | 'attendance', title: string) => {
    setDownloading(type);
    try {
      await downloadDashboardCsvApi(type);
      notify(`Relatório de ${title} exportado com sucesso no formato CSV (Excel PT-BR)!`);
    } catch (err: unknown) {
      const error = err as Error;
      notify(error.message || `Erro ao exportar ${title}.`, true);
    } finally {
      setDownloading(null);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // Max value for financial evolution chart bars
  const maxFinVal = Math.max(
    ...financialEvolution.map((m) => Math.max(m.income, m.expense)),
    1000
  );

  return (
    <div className="space-y-6">
      {/* Notificação Flutuante / Toast */}
      {notification && (
        <div
          className={`px-4 py-3 rounded-xl flex items-center justify-between border transition animate-fade-in ${
            notification.isError
              ? 'bg-rose-900/40 border-rose-500/50 text-rose-200'
              : 'bg-emerald-900/40 border-emerald-500/50 text-emerald-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.isError ? (
              <AlertCircle className="w-5 h-5 text-rose-400" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            )}
            <span className="text-sm font-medium">{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-white text-sm"
          >
            &times;
          </button>
        </div>
      )}

      {/* Cabeçalho do Dashboard */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/80 to-slate-900 p-6 rounded-2xl border border-indigo-900/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5" />
              Business Intelligence & Analytics
            </span>
            <span className="text-xs text-slate-400">Etapa 08</span>
          </div>
          <h1 className="text-2xl font-bold text-white mt-1.5 flex items-center gap-2">
            Dashboard Executivo da Liderança
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Métricas estratégicas consolidadas, saúde financeira, engajamento ministerial e retenção pastoral em tempo real.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadAll}
            disabled={loading}
            className="px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs flex items-center gap-2 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Atualizar Indicadores
          </button>
        </div>
      </div>

      {/* Navegação de Abas */}
      <div className="border-b border-slate-800 flex items-center gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2.5 rounded-xl text-sm font-medium transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Visão Geral & Finanças
        </button>

        <button
          onClick={() => setActiveTab('demographics')}
          className={`px-4 py-2.5 rounded-xl text-sm font-medium transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'demographics'
              ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <PieChart className="w-4 h-4" />
          Demografia & Congregações
        </button>

        <button
          onClick={() => setActiveTab('ministries')}
          className={`px-4 py-2.5 rounded-xl text-sm font-medium transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'ministries'
              ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <HeartHandshake className="w-4 h-4" />
          Ministérios & Voluntariado
        </button>

        <button
          onClick={() => setActiveTab('pastoral')}
          className={`px-4 py-2.5 rounded-xl text-sm font-medium transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'pastoral'
              ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          Cuidado Pastoral & Alertas
          {(pastoralAlerts?.members_absent_60_days.length ?? 0) > 0 && (
            <span className="px-1.5 py-0.2 rounded-full text-xs font-bold bg-amber-500/30 text-amber-300 border border-amber-500/40">
              {pastoralAlerts?.members_absent_60_days.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('exports')}
          className={`px-4 py-2.5 rounded-xl text-sm font-medium transition flex items-center gap-2 whitespace-nowrap ${
            activeTab === 'exports'
              ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
              : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
          }`}
        >
          <FileSpreadsheet className="w-4 h-4" />
          Central de Exportações CSV
        </button>
      </div>

      {/* ABA 1: VISÃO GERAL EXECUTIVA & FINANÇAS */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Grade de 4 KPIs Principais */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* KPI 1: Membros Totais */}
            <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Membros Ativos</span>
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-white">
                {overview?.total_members ?? 0}
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs">
                {(overview?.growth_rate_percentage ?? 0) >= 0 ? (
                  <span className="flex items-center text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-md">
                    <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                    +{overview?.growth_rate_percentage}%
                  </span>
                ) : (
                  <span className="flex items-center text-rose-400 font-semibold bg-rose-500/10 px-2 py-0.5 rounded-md">
                    <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
                    {overview?.growth_rate_percentage}%
                  </span>
                )}
                <span className="text-slate-400">
                  +{overview?.new_members_this_month ?? 0} novos neste mês
                </span>
              </div>
            </div>

            {/* KPI 2: Engajamento Voluntário */}
            <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Voluntários Ativos</span>
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                  <HeartHandshake className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-white">
                {overview?.active_volunteers_count ?? 0}
              </div>
              <div className="mt-2 flex items-center gap-2 text-xs">
                <span className="text-purple-400 font-semibold bg-purple-500/10 px-2 py-0.5 rounded-md">
                  {overview?.volunteer_engagement_rate ?? 0}%
                </span>
                <span className="text-slate-400">dos membros servem em equipes</span>
              </div>
            </div>

            {/* KPI 3: Frequência Geral (30 dias) */}
            <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Presenças (30 dias)</span>
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                  <Calendar className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-white">
                {overview?.attendance_last_30_days ?? 0}
              </div>
              <div className="mt-2 text-xs text-slate-400">
                Check-ins registrados em cultos e celebrações
              </div>
            </div>

            {/* KPI 4: Saldo Consolidado */}
            <div className="bg-slate-900/80 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
              <div className="flex items-center justify-between text-slate-400 mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider">Saldo em Caixa / Bancos</span>
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-extrabold text-white">
                {formatCurrency(overview?.financial.total_balance ?? 0)}
              </div>
              <div className="mt-2 text-xs text-slate-400">
                Soma de todas as contas ativas do tenant
              </div>
            </div>
          </div>

          {/* Destaque Financeiro do Mês Corrente */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-emerald-400" />
              Resultado Operacional do Mês Corrente
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-xl">
                <span className="text-xs text-slate-400 font-medium">Receitas Arrecadadas</span>
                <div className="text-xl font-bold text-emerald-400 mt-1">
                  {formatCurrency(overview?.financial.income_this_month ?? 0)}
                </div>
                <span className="text-xs text-slate-500">Dízimos, ofertas e doações</span>
              </div>

              <div className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-xl">
                <span className="text-xs text-slate-400 font-medium">Despesas Pagas</span>
                <div className="text-xl font-bold text-rose-400 mt-1">
                  {formatCurrency(overview?.financial.expense_this_month ?? 0)}
                </div>
                <span className="text-xs text-slate-500">Manutenção, ministérios e custos</span>
              </div>

              <div className="bg-slate-800/40 border border-slate-700/50 p-4 rounded-xl">
                <span className="text-xs text-slate-400 font-medium">Resultado Líquido</span>
                <div
                  className={`text-xl font-bold mt-1 ${
                    (overview?.financial.is_surplus ?? true) ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {formatCurrency(overview?.financial.net_result_this_month ?? 0)}
                </div>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full inline-block mt-1 ${
                    (overview?.financial.is_surplus ?? true)
                      ? 'bg-emerald-500/20 text-emerald-300'
                      : 'bg-rose-500/20 text-rose-300'
                  }`}
                >
                  {(overview?.financial.is_surplus ?? true) ? 'Superávit no período' : 'Déficit no período'}
                </span>
              </div>
            </div>
          </div>

          {/* Gráfico de Barras: Evolução Financeira Semestral */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-indigo-400" />
                  Evolução Histórica das Finanças (Últimos 6 Meses)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Comparativo mensal entre receitas recebidas e despesas liquidadas.
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <div className="w-3 h-3 rounded-sm bg-emerald-500" />
                  <span>Receitas</span>
                </div>
                <div className="flex items-center gap-1.5 text-rose-400">
                  <div className="w-3 h-3 rounded-sm bg-rose-500" />
                  <span>Despesas</span>
                </div>
              </div>
            </div>

            {financialEvolution.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                Nenhum histórico financeiro registrado para os últimos meses.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {financialEvolution.map((m) => {
                  const incHeight = Math.max(Math.round((m.income / maxFinVal) * 100), 4);
                  const expHeight = Math.max(Math.round((m.expense / maxFinVal) * 100), 4);

                  return (
                    <div
                      key={m.month}
                      className="bg-slate-800/30 border border-slate-800/60 rounded-xl p-3 flex flex-col items-center justify-between text-center hover:border-slate-700 transition"
                    >
                      <span className="text-xs font-semibold text-slate-300 capitalize mb-3">
                        {m.label}
                      </span>

                      {/* Visual Bars Container */}
                      <div className="h-32 w-full flex items-end justify-center gap-2 px-2 pb-1 border-b border-slate-800">
                        {/* Income Bar */}
                        <div
                          className="w-1/2 bg-emerald-500 rounded-t transition-all hover:bg-emerald-400"
                          style={{ height: `${incHeight}%` }}
                          title={`Receitas: ${formatCurrency(m.income)}`}
                        />
                        {/* Expense Bar */}
                        <div
                          className="w-1/2 bg-rose-500 rounded-t transition-all hover:bg-rose-400"
                          style={{ height: `${expHeight}%` }}
                          title={`Despesas: ${formatCurrency(m.expense)}`}
                        />
                      </div>

                      <div className="mt-3 w-full text-left space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">Rec:</span>
                          <span className="font-semibold text-emerald-400">{formatCurrency(m.income)}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-400">Desp:</span>
                          <span className="font-semibold text-rose-400">{formatCurrency(m.expense)}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-800">
                          <span className="text-slate-400">Saldo:</span>
                          <span
                            className={`font-bold ${
                              m.net >= 0 ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {formatCurrency(m.net)}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ABA 2: DEMOGRAFIA & CONGREGAÇÕES */}
      {activeTab === 'demographics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Gênero */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-400" />
                Distribuição por Gênero
              </h3>

              {(() => {
                const totalGender =
                  (demographics?.by_gender.male ?? 0) +
                  (demographics?.by_gender.female ?? 0) +
                  (demographics?.by_gender.other ?? 0) +
                  (demographics?.by_gender.not_informed ?? 0);

                const malePct = totalGender > 0 ? Math.round(((demographics?.by_gender.male ?? 0) / totalGender) * 100) : 0;
                const femalePct = totalGender > 0 ? Math.round(((demographics?.by_gender.female ?? 0) / totalGender) * 100) : 0;

                return (
                  <div className="space-y-4">
                    {/* Visual Progress Bar */}
                    <div className="h-4 w-full bg-slate-800 rounded-full overflow-hidden flex">
                      <div
                        style={{ width: `${malePct}%` }}
                        className="bg-blue-500 h-full"
                        title={`Masculino: ${malePct}%`}
                      />
                      <div
                        style={{ width: `${femalePct}%` }}
                        className="bg-pink-500 h-full"
                        title={`Feminino: ${femalePct}%`}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800">
                        <div className="flex items-center gap-2 text-xs text-blue-400 font-semibold">
                          <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                          Masculino
                        </div>
                        <div className="text-xl font-bold text-white mt-1">
                          {demographics?.by_gender.male ?? 0}
                          <span className="text-xs text-slate-400 font-normal ml-2">({malePct}%)</span>
                        </div>
                      </div>

                      <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-800">
                        <div className="flex items-center gap-2 text-xs text-pink-400 font-semibold">
                          <div className="w-2.5 h-2.5 rounded-full bg-pink-500" />
                          Feminino
                        </div>
                        <div className="text-xl font-bold text-white mt-1">
                          {demographics?.by_gender.female ?? 0}
                          <span className="text-xs text-slate-400 font-normal ml-2">({femalePct}%)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Faixa Etária */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <PieChart className="w-5 h-5 text-indigo-400" />
                Composição por Faixa Etária
              </h3>

              {(() => {
                const ageGroups = [
                  { label: 'Crianças (<12 anos)', count: demographics?.by_age_group.kids ?? 0, color: 'bg-emerald-500' },
                  { label: 'Adolescentes (12-17)', count: demographics?.by_age_group.teens ?? 0, color: 'bg-cyan-500' },
                  { label: 'Jovens (18-29)', count: demographics?.by_age_group.young_adults ?? 0, color: 'bg-indigo-500' },
                  { label: 'Adultos (30-59)', count: demographics?.by_age_group.adults ?? 0, color: 'bg-amber-500' },
                  { label: 'Terceira Idade (60+)', count: demographics?.by_age_group.seniors ?? 0, color: 'bg-purple-500' },
                ];

                const totalAges = ageGroups.reduce((acc, g) => acc + g.count, 0) || 1;

                return (
                  <div className="space-y-3">
                    {ageGroups.map((group) => {
                      const pct = Math.round((group.count / totalAges) * 100);
                      return (
                        <div key={group.label}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-300">{group.label}</span>
                            <span className="text-slate-400 font-semibold">
                              {group.count} ({pct}%)
                            </span>
                          </div>
                          <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`${group.color} h-full rounded-full transition-all`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          </div>

          {/* Congregações: Sede vs Filiais */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              Membros por Congregação / Unidade
            </h3>

            {demographics?.by_congregation.length === 0 ? (
              <p className="text-slate-400 text-xs">Nenhuma congregação vinculada.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {demographics?.by_congregation.map((cong) => (
                  <div
                    key={cong.id}
                    className="bg-slate-800/40 border border-slate-800 p-4 rounded-xl flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{cong.name}</span>
                        {cong.is_main && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Sede
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 mt-0.5 block">
                        Unidade #{cong.id}
                      </span>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-black text-indigo-400">
                        {cong.members_count}
                      </div>
                      <span className="text-[11px] text-slate-400">membros</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ABA 3: MINISTÉRIOS & VOLUNTARIADO */}
      {activeTab === 'ministries' && (
        <div className="space-y-6">
          {/* Card de Eficiência de Escalas */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-400" />
              Eficiência e Confirmação de Escalas (Mês Atual)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400">Total de Alocações</span>
                <div className="text-2xl font-extrabold text-white mt-1">
                  {ministryStats?.schedules_this_month.total_allocations ?? 0}
                </div>
              </div>

              <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400">Confirmadas</span>
                <div className="text-2xl font-extrabold text-emerald-400 mt-1">
                  {ministryStats?.schedules_this_month.confirmed ?? 0}
                </div>
              </div>

              <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400">Pendentes</span>
                <div className="text-2xl font-extrabold text-amber-400 mt-1">
                  {ministryStats?.schedules_this_month.pending ?? 0}
                </div>
              </div>

              <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400">Taxa de Confirmação</span>
                <div className="text-2xl font-extrabold text-indigo-400 mt-1">
                  {ministryStats?.schedules_this_month.confirmation_rate ?? 0}%
                </div>
              </div>
            </div>
          </div>

          {/* Voluntários por Ministério */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-indigo-400" />
              Voluntários Cadastrados por Departamento Ministerial
            </h3>

            {ministryStats?.ministries.length === 0 ? (
              <p className="text-slate-400 text-xs">Nenhum ministério cadastrado.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {ministryStats?.ministries.map((min) => (
                  <div
                    key={min.id}
                    className="bg-slate-800/40 border border-slate-800 p-4 rounded-xl flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3.5 h-3.5 rounded-full"
                        style={{ backgroundColor: min.color || '#6366f1' }}
                      />
                      <div>
                        <span className="text-sm font-bold text-white block">{min.name}</span>
                        <span className="text-xs text-slate-400">Equipe ativa</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xl font-bold text-white">{min.volunteers_count}</span>
                      <span className="text-[11px] text-slate-400 block">voluntários</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ABA 4: CUIDADO PASTORAL & ALERTAS */}
      {activeTab === 'pastoral' && (
        <div className="space-y-6">
          {/* Alerta 1: Membros Ausentes há mais de 60 dias */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  Membros sem Frequência Registrada há mais de 60 dias
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Lista de retenção pastoral para contato fraterno, visitação ou oração.
                </p>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                {pastoralAlerts?.members_absent_60_days.length ?? 0} membros
              </span>
            </div>

            {pastoralAlerts?.members_absent_60_days.length === 0 ? (
              <div className="bg-slate-800/30 border border-slate-800 p-6 rounded-xl text-center text-slate-400 text-sm">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                Excelente! Nenhum membro ativo está afastado há mais de 60 dias.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800/60 text-slate-400 uppercase font-semibold">
                    <tr>
                      <th className="p-3 rounded-l-lg">Membro</th>
                      <th className="p-3">Congregação</th>
                      <th className="p-3">Contatos</th>
                      <th className="p-3 rounded-r-lg text-right">Ação Pastoral</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {pastoralAlerts?.members_absent_60_days.map((member) => (
                      <tr key={member.id} className="hover:bg-slate-800/30 transition">
                        <td className="p-3 font-medium text-white flex items-center gap-2">
                          <UserCheck className="w-4 h-4 text-slate-400" />
                          {member.name}
                        </td>
                        <td className="p-3 text-slate-300">
                          {member.congregation?.name || 'Sede'}
                        </td>
                        <td className="p-3 text-slate-400 space-y-0.5">
                          {member.phone && (
                            <div className="flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-slate-500" />
                              <span>{member.phone}</span>
                            </div>
                          )}
                          {member.email && (
                            <div className="flex items-center gap-1.5">
                              <Mail className="w-3.5 h-3.5 text-slate-500" />
                              <span>{member.email}</span>
                            </div>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <div className="inline-flex gap-2">
                            {member.phone && (
                              <a
                                href={`tel:${member.phone}`}
                                className="px-2.5 py-1 rounded bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 transition inline-flex items-center gap-1"
                              >
                                <Phone className="w-3 h-3" />
                                Ligar
                              </a>
                            )}
                            {member.email && (
                              <a
                                href={`mailto:${member.email}`}
                                className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition inline-flex items-center gap-1"
                              >
                                <Mail className="w-3 h-3" />
                                E-mail
                              </a>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Alerta 2: Pedidos de Oração Pendentes há mais de 7 dias */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-400" />
              Pedidos de Oração sem Atendimento há mais de 7 dias
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Motivos apresentados pelos membros que aguardam retorno ou intercessão da liderança.
            </p>

            {pastoralAlerts?.pending_prayer_alerts.length === 0 ? (
              <div className="bg-slate-800/30 border border-slate-800 p-6 rounded-xl text-center text-slate-400 text-sm">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                Todos os pedidos de oração recentes foram acolhidos e atendidos.
              </div>
            ) : (
              <div className="space-y-3">
                {pastoralAlerts?.pending_prayer_alerts.map((prayer) => (
                  <div
                    key={prayer.id}
                    className="bg-slate-800/40 border border-slate-800 p-4 rounded-xl flex items-center justify-between"
                  >
                    <div>
                      <span className="text-sm font-semibold text-white block">{prayer.title}</span>
                      <span className="text-xs text-slate-400">
                        Por {prayer.member?.name || 'Membro anônimo'} •{' '}
                        {new Date(prayer.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>

                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Pendente de Acolhimento
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ABA 5: CENTRAL DE EXPORTAÇÕES CSV */}
      {activeTab === 'exports' && (
        <div className="space-y-6">
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-indigo-400" />
              Exportações Seguras de Dados em CSV (Excel UTF-8 BOM)
            </h3>
            <p className="text-xs text-slate-400 mb-6">
              Todos os arquivos exportados contêm cabeçalhos padronizados, separador ponto-e-vírgula (;) e codificação UTF-8 com BOM para abertura perfeita no Microsoft Excel e Google Planilhas.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: Membros */}
              <div className="bg-slate-800/40 border border-slate-800 p-5 rounded-xl flex flex-col justify-between hover:border-slate-700 transition">
                <div>
                  <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 inline-block mb-3">
                    <Users className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-white">Rol Geral de Membros</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Exporta a relação completa de membros da congregação com CPF, e-mail, telefone, data de nascimento, congregação e status.
                  </p>
                </div>

                <button
                  onClick={() => handleExport('members', 'Membros')}
                  disabled={downloading !== null}
                  className="mt-5 w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  <Download className={`w-4 h-4 ${downloading === 'members' ? 'animate-bounce' : ''}`} />
                  {downloading === 'members' ? 'Gerando CSV...' : 'Baixar Lista de Membros'}
                </button>
              </div>

              {/* Card 2: Lançamentos Financeiros */}
              <div className="bg-slate-800/40 border border-slate-800 p-5 rounded-xl flex flex-col justify-between hover:border-slate-700 transition">
                <div>
                  <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 inline-block mb-3">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-white">Livro Caixa & Movimentações</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Exporta todos os lançamentos de receitas e despesas com conta bancária/caixa, plano de contas, valores e status de conciliação.
                  </p>
                </div>

                <button
                  onClick={() => handleExport('financial', 'Financeiro')}
                  disabled={downloading !== null}
                  className="mt-5 w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  <Download className={`w-4 h-4 ${downloading === 'financial' ? 'animate-bounce' : ''}`} />
                  {downloading === 'financial' ? 'Gerando CSV...' : 'Baixar Livro Financeiro'}
                </button>
              </div>

              {/* Card 3: Presenças e Check-in */}
              <div className="bg-slate-800/40 border border-slate-800 p-5 rounded-xl flex flex-col justify-between hover:border-slate-700 transition">
                <div>
                  <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 inline-block mb-3">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-white">Histórico de Frequência</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Exporta o histórico de presenças em cultos e eventos com nome do participante, data e hora do check-in efetuado.
                  </p>
                </div>

                <button
                  onClick={() => handleExport('attendance', 'Presenças')}
                  disabled={downloading !== null}
                  className="mt-5 w-full py-2.5 px-4 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition disabled:opacity-50"
                >
                  <Download className={`w-4 h-4 ${downloading === 'attendance' ? 'animate-bounce' : ''}`} />
                  {downloading === 'attendance' ? 'Gerando CSV...' : 'Baixar Histórico de Presenças'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
