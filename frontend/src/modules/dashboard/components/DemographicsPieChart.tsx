import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Users2, ShieldCheck } from 'lucide-react';
import type { DemographicDataPoint } from '../types';

interface DemographicsPieChartProps {
  data: DemographicDataPoint[];
  isLoading?: boolean;
}

export const DemographicsPieChart: React.FC<DemographicsPieChartProps> = ({
  data,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div
        data-testid="demographics-pie-chart"
        className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="h-6 w-40 animate-pulse rounded bg-slate-200 dark:bg-slate-700 mb-4" />
        <div className="h-64 w-full animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
      </div>
    );
  }

  // Calculate minors (< 18) for LGPD compliance highlight
  const minorsCount = data
    .filter((d) => d.group.includes('Crianças') || d.group.includes('Adolescentes'))
    .reduce((sum, d) => sum + d.count, 0);

  const totalMembers = data.reduce((sum, d) => sum + d.count, 0);
  const minorsPercent = totalMembers > 0 ? Math.round((minorsCount / totalMembers) * 100) : 0;

  return (
    <div
      data-testid="demographics-pie-chart"
      className="flex flex-col rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-purple-50 p-2 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400">
            <Users2 className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Distribuição Etária
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Perfil demográfico da comunidade
            </p>
          </div>
        </div>
      </div>

      <div className="relative h-56 w-full">
        <ResponsiveContainer width="100%" height="100%" minWidth={200} minHeight={200}>
          <PieChart>
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '12px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              }}
              formatter={(value: unknown, _name: unknown, item: { payload?: DemographicDataPoint }) => [
                `${String(value)} membros (${item.payload?.percentage ?? 0}%)`,
                item.payload?.group ?? '',
              ]}
            />
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
              dataKey="count"
              nameKey="group"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Custom Legend Grid */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
        {data.map((item) => (
          <div key={item.group} className="flex items-center justify-between py-1">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="truncate text-slate-600 dark:text-slate-300">{item.group}</span>
            </div>
            <span className="font-semibold text-slate-900 dark:text-slate-100 ml-2">
              {item.percentage}%
            </span>
          </div>
        ))}
      </div>

      {/* LGPD Minors Spotlight */}
      <div className="mt-4 rounded-lg border border-purple-100 bg-purple-50/70 p-3 text-xs dark:border-purple-900/40 dark:bg-purple-950/30">
        <div className="flex items-start gap-2">
          <ShieldCheck className="h-4 w-4 shrink-0 text-purple-600 dark:text-purple-400 mt-0.5" />
          <div>
            <span className="font-semibold text-purple-900 dark:text-purple-200">
              Proteção de Menores (LGPD):
            </span>{' '}
            <span className="text-purple-700 dark:text-purple-300">
              {minorsCount} menores ({minorsPercent}%) sob custódia e termos de consentimento
              validados pelos responsáveis legais.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
