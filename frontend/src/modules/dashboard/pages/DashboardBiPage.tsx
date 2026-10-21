import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard,
  FileSpreadsheet,
  Building2,
  RefreshCw,
  BellRing,
} from 'lucide-react';
import { ExecutiveKpiGrid } from '../components/ExecutiveKpiGrid';
import { MembershipGrowthChart } from '../components/MembershipGrowthChart';
import { FinancialCashflowChart } from '../components/FinancialCashflowChart';
import { AttendanceTrendsChart } from '../components/AttendanceTrendsChart';
import { DemographicsPieChart } from '../components/DemographicsPieChart';
import { CongregationPerformanceTable } from '../components/CongregationPerformanceTable';
import { dashboardService } from '@/services/api/dashboardService';
import type {
  ExecutiveMetrics,
  MembershipGrowthPoint,
  FinancialCashflowPoint,
  AttendanceTrendPoint,
  DemographicDataPoint,
  CongregationComparisonPoint,
} from '../types';

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
          <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <Building2 className="h-4 w-4 text-slate-400" />
            <select
              value={selectedCongregation}
              onChange={(e) => setSelectedCongregation(e.target.value)}
              className="bg-transparent text-xs font-medium text-slate-800 focus:outline-none dark:text-slate-200"
              aria-label="Filtrar por Congregação"
            >
              <option value="all">Todas as Congregações</option>
              <option value="cong-01">Templo Central (Sede)</option>
              <option value="cong-02">Filial Adrianópolis</option>
              <option value="cong-03">Filial Ponta Negra</option>
            </select>
          </div>

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
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-amber-200 bg-amber-50/70 p-4 dark:border-amber-900/50 dark:bg-amber-950/30">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-amber-100 p-2 text-amber-700 dark:bg-amber-900/60 dark:text-amber-300">
              <BellRing className="h-5 w-5" />
            </div>
            <div className="text-sm">
              <span className="font-semibold text-amber-900 dark:text-amber-200">
                Atenção Operacional:
              </span>{' '}
              <span className="text-amber-800 dark:text-amber-300">
                {metrics.pendingSecretaryRequests} solicitações de membros pendentes de validação e{' '}
                {metrics.unreconciledTransactionsCount} transações bancárias pendentes de conciliação.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/admin/secretary"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 underline dark:text-indigo-400"
            >
              Ver Secretaria &rarr;
            </Link>
            <span className="text-slate-300 dark:text-slate-700">|</span>
            <Link
              to="/admin/finance"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 underline dark:text-indigo-400"
            >
              Ver Financeiro &rarr;
            </Link>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      {metrics && <ExecutiveKpiGrid metrics={metrics} isLoading={isLoading} />}

      {/* Visual Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MembershipGrowthChart data={membershipData} isLoading={isLoading} />
        <FinancialCashflowChart data={cashflowData} isLoading={isLoading} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <AttendanceTrendsChart data={attendanceData} isLoading={isLoading} />
        </div>
        <div>
          <DemographicsPieChart data={demographicsData} isLoading={isLoading} />
        </div>
      </div>

      {/* Multi-Congregation Comparison Table */}
      <CongregationPerformanceTable data={congregationsData} isLoading={isLoading} />
    </div>
  );
};
