import React from 'react';
import { Building2, Users, HandHeart, CheckCircle2 } from 'lucide-react';
import type { CongregationComparisonPoint } from '../types';

interface CongregationPerformanceTableProps {
  data: CongregationComparisonPoint[];
  isLoading?: boolean;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value);
};

export const CongregationPerformanceTable: React.FC<CongregationPerformanceTableProps> = ({
  data,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div
        data-testid="congregation-performance-table"
        className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="h-6 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-700 mb-4" />
        <div className="h-48 w-full animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
      </div>
    );
  }

  const totalMembers = data.reduce((sum, item) => sum + item.membersCount, 0);
  const totalAttendance = data.reduce((sum, item) => sum + item.averageAttendance, 0);
  const totalIncome = data.reduce((sum, item) => sum + item.monthlyIncome, 0);
  const totalVolunteers = data.reduce((sum, item) => sum + item.activeVolunteersCount, 0);

  return (
    <div
      data-testid="congregation-performance-table"
      className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-teal-50 p-2 text-teal-600 dark:bg-teal-950/50 dark:text-teal-400">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Comparativo de Congregações
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Desempenho operacional entre Sede Matriz e Filiais integradas
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
            {data.length} Unidades Integradas
          </span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-semibold uppercase text-slate-500 dark:border-slate-800 dark:bg-slate-800/40 dark:text-slate-400">
              <th className="px-4 py-3">Congregação</th>
              <th className="px-4 py-3 text-right">Membros</th>
              <th className="px-4 py-3 text-right">Frequência Culto</th>
              <th className="px-4 py-3 text-right">Arrecadação Mês</th>
              <th className="px-4 py-3 text-right">Voluntários</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {data.map((congregation) => (
              <tr
                key={congregation.id}
                className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
              >
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {congregation.name}
                    </span>
                    {congregation.isMain ? (
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                        Sede Matriz
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                        Filial
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3.5 text-right font-medium text-slate-700 dark:text-slate-300">
                  <div className="inline-flex items-center gap-1">
                    <Users className="h-3.5 w-3.5 text-slate-400" />
                    {congregation.membersCount}
                  </div>
                </td>
                <td className="px-4 py-3.5 text-right font-medium text-slate-700 dark:text-slate-300">
                  ~{congregation.averageAttendance}
                </td>
                <td className="px-4 py-3.5 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(congregation.monthlyIncome)}
                </td>
                <td className="px-4 py-3.5 text-right font-medium text-slate-700 dark:text-slate-300">
                  <div className="inline-flex items-center gap-1">
                    <HandHeart className="h-3.5 w-3.5 text-indigo-500" />
                    {congregation.activeVolunteersCount}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-slate-200 bg-slate-50 font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800/80 dark:text-white">
              <td className="px-4 py-3 text-xs uppercase tracking-wide">
                Total Consolidado
              </td>
              <td className="px-4 py-3 text-right">{totalMembers}</td>
              <td className="px-4 py-3 text-right">~{totalAttendance}</td>
              <td className="px-4 py-3 text-right text-emerald-600 dark:text-emerald-400">
                {formatCurrency(totalIncome)}
              </td>
              <td className="px-4 py-3 text-right">{totalVolunteers}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};
