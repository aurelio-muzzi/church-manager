import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  FileSpreadsheet,
  Building2,
  RefreshCw,
  BellRing,
  ArrowRight,
} from 'lucide-react';
import { ExecutiveKpiGrid } from '../components/ExecutiveKpiGrid';
import { MembershipGrowthChart } from '../components/MembershipGrowthChart';
import { FinancialCashflowChart } from '../components/FinancialCashflowChart';
import { AttendanceTrendsChart } from '../components/AttendanceTrendsChart';
import { DemographicsPieChart } from '../components/DemographicsPieChart';
import { CongregationPerformanceTable } from '../components/CongregationPerformanceTable';
import { dashboardService } from '@/services/api/dashboardService';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type {
  ExecutiveMetrics,
  MembershipGrowthPoint,
  FinancialCashflowPoint,
  AttendanceTrendPoint,
  DemographicDataPoint,
  CongregationComparisonPoint,
} from '../types';

const CONGREGATION_NAMES: Record<string, string> = {
  all: 'Todas as Congregações',
  'cong-01': 'Templo Central (Sede)',
  'cong-02': 'Filial Adrianópolis',
  'cong-03': 'Filial Ponta Negra',
};

export const DashboardBiPage: React.FC = () => {
  const [selectedCongregation, setSelectedCongregation] = useState('all');
  const [isLoading, setIsLoading] = useState(false);

  const [metrics, setMetrics] = useState<ExecutiveMetrics | null>(null);
  const [membershipData, setMembershipData] = useState<MembershipGrowthPoint[]>([]);
  const [cashflowData, setCashflowData] = useState<FinancialCashflowPoint[]>([]);
  const [attendanceData, setAttendanceData] = useState<AttendanceTrendPoint[]>([]);
  const [demographicsData, setDemographicsData] = useState<DemographicDataPoint[]>([]);
  const [congregationsData, setCongregationsData] = useState<CongregationComparisonPoint[]>([]);

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [metricsRes, growthRes, cashflowRes, attendanceRes, demographicsRes, compRes] =
        await Promise.all([
          dashboardService.getExecutiveMetrics(selectedCongregation),
          dashboardService.getMembershipGrowthChart(selectedCongregation),
          dashboardService.getFinancialCashflowChart(selectedCongregation),
          dashboardService.getAttendanceChart(selectedCongregation),
          dashboardService.getDemographicsChart(selectedCongregation),
          dashboardService.getCongregationComparison(),
        ]);

      setMetrics(metricsRes);
      setMembershipData(growthRes);
      setCashflowData(cashflowRes);
      setAttendanceData(attendanceRes);
      setDemographicsData(demographicsRes);
      setCongregationsData(compRes);
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCongregation]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  return (
    <div data-testid="dashboard-bi-page" className="space-y-8 pb-12">
      {/* Header Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-600 p-2.5 text-white shadow-md shadow-indigo-600/20">
              <LayoutDashboard className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Painel Executivo & BI
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Indicadores estratégicos consolidados para liderança e tomada de decisão
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Congregation Filter */}
          <Select
            value={selectedCongregation}
            onValueChange={(value) => setSelectedCongregation(value)}
          >
            <SelectTrigger
              aria-label="Filtrar por Congregação"
              className="h-9 w-[220px] border border-slate-200 bg-white text-xs font-medium text-slate-900 shadow-xs hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
            >
              <div className="flex items-center gap-2 truncate">
                <Building2 className="h-4 w-4 shrink-0 text-slate-500 dark:text-slate-400" />
                <SelectValue placeholder="Selecione a Congregação" />
              </div>
            </SelectTrigger>
            <SelectContent className="border border-slate-200 bg-white shadow-lg dark:border-slate-800 dark:bg-slate-900">
              <SelectItem value="all" className="text-xs">
                Todas as Congregações
              </SelectItem>
              <SelectItem value="cong-01" className="text-xs">
                Templo Central (Sede)
              </SelectItem>
              <SelectItem value="cong-02" className="text-xs">
                Filial Adrianópolis
              </SelectItem>
              <SelectItem value="cong-03" className="text-xs">
                Filial Ponta Negra
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Refresh Button */}
          <button
            onClick={() => loadDashboardData()}
            title="Atualizar Indicadores"
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white p-2 text-slate-600 shadow-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          {/* Quick link to reports */}
          <Link
            to="/admin/reports"
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Central de Relatórios
          </Link>
        </div>
      </div>

      {/* Pending Secretary / Financial alerts */}
      {metrics && (metrics.pendingSecretaryRequests > 0 || metrics.unreconciledTransactionsCount > 0) && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-amber-300 border-l-4 border-l-amber-500 bg-amber-50 p-4 shadow-sm dark:border-amber-800/80 dark:border-l-amber-500 dark:bg-amber-950/40">
          <div className="flex items-center gap-3.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-500 text-white shadow-xs ring-4 ring-amber-100 dark:ring-amber-900/50">
              <BellRing className="h-5 w-5" />
            </div>
            <div className="text-sm">
              <span className="font-bold text-amber-950 dark:text-amber-100">
                Atenção Operacional:
              </span>{' '}
              <span className="font-medium text-amber-900 dark:text-amber-200">
                <span className="font-semibold text-amber-950 dark:text-amber-50">{metrics.pendingSecretaryRequests}</span> solicitações de membros pendentes de validação e{' '}
                <span className="font-semibold text-amber-950 dark:text-amber-50">{metrics.unreconciledTransactionsCount}</span> transações bancárias pendentes de conciliação.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <Link
              to="/admin/members"
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-950 shadow-xs transition-colors hover:bg-amber-100 hover:border-amber-400 dark:border-amber-800 dark:bg-slate-900 dark:text-amber-200 dark:hover:bg-slate-800"
            >
              <span>Ver Secretaria</span>
              <ArrowRight className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            </Link>
            <Link
              to="/admin/finance"
              className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-950 shadow-xs transition-colors hover:bg-amber-100 hover:border-amber-400 dark:border-amber-800 dark:bg-slate-900 dark:text-amber-200 dark:hover:bg-slate-800"
            >
              <span>Ver Financeiro</span>
              <ArrowRight className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            </Link>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      {metrics && (
        <ExecutiveKpiGrid
          metrics={metrics}
          isLoading={isLoading}
          selectedCongregationName={CONGREGATION_NAMES[selectedCongregation] || 'Todas as Congregações'}
        />
      )}

      {/* Visual Analytics Charts Grid 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <div className="flex flex-col h-full">
          <MembershipGrowthChart data={membershipData} isLoading={isLoading} />
        </div>
        <div className="flex flex-col h-full">
          <FinancialCashflowChart data={cashflowData} isLoading={isLoading} />
        </div>
      </div>

      {/* Visual Analytics Charts Grid 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="lg:col-span-2 flex flex-col h-full">
          <AttendanceTrendsChart data={attendanceData} isLoading={isLoading} />
        </div>
        <div className="flex flex-col h-full">
          <DemographicsPieChart data={demographicsData} isLoading={isLoading} />
        </div>
      </div>

      {/* Multi-Congregation Comparison Table */}
      <CongregationPerformanceTable data={congregationsData} isLoading={isLoading} />
    </div>
  );
};
