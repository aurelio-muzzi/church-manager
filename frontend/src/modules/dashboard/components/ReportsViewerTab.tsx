import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  Download,
  Printer,
  Search,
  Calendar,
  Building2,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  RefreshCw,
} from 'lucide-react';
import { dashboardService } from '@/services/api/dashboardService';
import type { ReportType, PaginatedReportResult, ReportColumn } from '../types';
import { useToast } from '@/hooks/useToast';

const REPORT_TABS: { type: ReportType; label: string; icon: string }[] = [
  { type: 'members_roster', label: 'Rol de Membros', icon: 'users' },
  { type: 'financial_cashflow', label: 'Extrato Caixa', icon: 'dollar-sign' },
  { type: 'tithes_offerings', label: 'Dízimos & Ofertas', icon: 'heart-handshake' },
  { type: 'attendance_summary', label: 'Presença em Cultos', icon: 'church' },
  { type: 'ministry_volunteers', label: 'Voluntários & Escalas', icon: 'calendar-check' },
];

export const ReportsViewerTab: React.FC = () => {
  const { toast } = useToast();
  const [reportType, setReportType] = useState<ReportType>('members_roster');
  const [search, setSearch] = useState('');
  const [congregationId, setCongregationId] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState<string | undefined>(undefined);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [reportData, setReportData] = useState<PaginatedReportResult | null>(null);

  const fetchReport = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await dashboardService.generateReportData({
        reportType,
        search,
        congregationId,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        page,
        pageSize,
        sortBy,
        sortDirection,
      });
      setReportData(data);
    } catch {
      toast({
        title: 'Erro ao gerar relatório',
        description: 'Não foi possível carregar os dados selecionados.',
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  }, [reportType, search, congregationId, startDate, endDate, page, pageSize, sortBy, sortDirection, toast]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const handleTabChange = (type: ReportType) => {
    setReportType(type);
    setPage(1);
    setSearch('');
    setSortBy(undefined);
  };

  const handleSort = (columnKey: string) => {
    if (sortBy === columnKey) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(columnKey);
      setSortDirection('asc');
    }
  };

  const handleExportCsv = async () => {
    setIsExporting(true);
    try {
      const csvText = await dashboardService.exportReportCsv({
        reportType,
        search,
        congregationId,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });

      const blob = new Blob([csvText], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `relatorio_${reportType}_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: 'Exportação Concluída',
        description: 'O arquivo CSV foi baixado com sucesso.',
        variant: 'success',
      });
    } catch {
      toast({
        title: 'Falha na Exportação',
        description: 'Ocorreu um erro ao gerar o arquivo CSV.',
        variant: 'error',
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrintPdf = () => {
    window.print();
  };

  const renderCellContent = (value: unknown, column: ReportColumn) => {
    if (value === undefined || value === null) return '-';

    if (column.format === 'currency') {
      const num = Number(value);
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(num);
    }

    if (column.format === 'badge') {
      const strVal = String(value);
      const isPositive = ['active', 'paid', 'confirmed', 'concluded', 'completed'].includes(strVal.toLowerCase());
      const isPending = ['pending', 'scheduled'].includes(strVal.toLowerCase());

      const colorClass = isPositive
        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
        : isPending
        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
        : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';

      return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClass}`}>
          {strVal}
        </span>
      );
    }

    if (column.format === 'percent') {
      return `${value}%`;
    }

    return String(value);
  };

  return (
    <div data-testid="reports-viewer-tab" className="space-y-6">
      {/* Report Selection Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-4 dark:border-slate-800 print:hidden">
        {REPORT_TABS.map((tab) => {
          const isActive = reportType === tab.type;
          return (
            <button
              key={tab.type}
              onClick={() => handleTabChange(tab.type)}
              className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800'
              }`}
            >
              <FileText className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Filter and Action Bar */}
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900 print:hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Buscar por nome, categoria, observação..."
              className="w-full rounded-lg border border-slate-300 bg-slate-50 py-2 pl-9 pr-4 text-sm text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          {/* Action Buttons: CSV & Print */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={handleExportCsv}
              disabled={isExporting || isLoading}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 disabled:opacity-50"
            >
              <Download className="h-4 w-4 text-emerald-600" />
              {isExporting ? 'Exportando...' : 'Exportar CSV'}
            </button>

            <button
              onClick={handlePrintPdf}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              <Printer className="h-4 w-4 text-slate-600 dark:text-slate-300" />
              Imprimir / PDF
            </button>

            <button
              onClick={() => fetchReport()}
              title="Recarregar dados"
              className="rounded-lg border border-slate-300 p-2 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Detailed Filters row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          {/* Congregation */}
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-slate-400 shrink-0" />
            <select
              value={congregationId}
              onChange={(e) => {
                setCongregationId(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-md border border-slate-300 bg-white py-1.5 px-2 text-xs text-slate-800 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            >
              <option value="all">Todas as Congregações</option>
              <option value="cong-01">Templo Central (Sede)</option>
              <option value="cong-02">Filial Adrianópolis</option>
              <option value="cong-03">Filial Ponta Negra</option>
            </select>
          </div>

          {/* Start Date */}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-md border border-slate-300 bg-white py-1.5 px-2 text-xs text-slate-800 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            />
          </div>

          {/* End Date */}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="w-full rounded-md border border-slate-300 bg-white py-1.5 px-2 text-xs text-slate-800 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
            />
          </div>
        </div>
      </div>

      {/* Printable Report Header */}
      <div className="hidden print:block mb-6 border-b pb-4">
        <h1 className="text-xl font-bold text-black">{reportData?.title || 'Relatório Gerencial'}</h1>
        <p className="text-xs text-gray-600">{reportData?.description}</p>
        <p className="text-[10px] text-gray-500 mt-1">
          Emitido em: {reportData?.generatedAt ? new Date(reportData.generatedAt).toLocaleString('pt-BR') : '-'}
        </p>
      </div>

      {/* Report Table Card */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        {/* Header Title inside card */}
        <div className="border-b border-slate-200 px-6 py-4 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {reportData?.title || 'Carregando relatório...'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {reportData?.description || 'Aguarde o processamento dos dados.'}
            </p>
          </div>
          {reportData && (
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              {reportData.total} registros encontrados
            </span>
          )}
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-semibold uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400">
                {reportData?.columns.map((col) => (
                  <th
                    key={col.key}
                    onClick={() => handleSort(col.key)}
                    className="px-4 py-3 cursor-pointer select-none hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-1.5">
                      <span>{col.label}</span>
                      <ArrowUpDown className="h-3 w-3 text-slate-400" />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={reportData?.columns.length || 5}
                    className="px-4 py-8 text-center text-slate-500 dark:text-slate-400"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <RefreshCw className="h-4 w-4 animate-spin text-indigo-600" />
                      <span>Processando dados do relatório...</span>
                    </div>
                  </td>
                </tr>
              ) : !reportData || reportData.items.length === 0 ? (
                <tr>
                  <td
                    colSpan={reportData?.columns.length || 5}
                    className="px-4 py-8 text-center text-slate-500 dark:text-slate-400"
                  >
                    Nenhum registro encontrado para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                reportData.items.map((row, index) => (
                  <tr
                    key={index}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    {reportData.columns.map((col) => (
                      <td key={col.key} className="px-4 py-3 text-slate-700 dark:text-slate-300">
                        {renderCellContent(row[col.key], col)}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {reportData && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 px-4 py-3 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 print:hidden">
            <div className="flex items-center gap-2">
              <span>Linhas por página:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="rounded border border-slate-300 bg-white py-1 px-2 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
              <span className="ml-2">
                Página {reportData.page} de {reportData.totalPages || 1}
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={reportData.page <= 1 || isLoading}
                className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
                Anterior
              </button>
              <button
                onClick={() => setPage((p) => Math.min(reportData.totalPages, p + 1))}
                disabled={reportData.page >= reportData.totalPages || isLoading}
                className="inline-flex items-center gap-1 rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                Próxima
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
