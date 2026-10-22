import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Users, TrendingUp, UserPlus } from 'lucide-react';
import type { MembershipGrowthPoint } from '../types';

interface MembershipGrowthChartProps {
  data: MembershipGrowthPoint[];
  isLoading?: boolean;
}

export const MembershipGrowthChart: React.FC<MembershipGrowthChartProps> = ({
  data,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div
        data-testid="membership-growth-chart"
        className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="flex items-center justify-between pb-4">
          <div className="h-6 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="h-72 w-full animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
      </div>
    );
  }

  const latest = data[data.length - 1];
  const first = data[0];
  const totalNetGrowth = latest && first ? latest.totalMembers - first.totalMembers : 0;
  const totalAdmissions = data.reduce((sum, item) => sum + item.newAdmissions, 0);

  return (
    <div
      data-testid="membership-growth-chart"
      className="h-full flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="rounded-lg bg-indigo-50 p-2 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 shrink-0">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Evolução do Rol de Membros
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Crescimento cumulativo e novas admissões nos últimos 12 meses
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 dark:border-slate-700 dark:bg-slate-800/60">
            <UserPlus className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-slate-600 dark:text-slate-300">Total Admissões:</span>
            <span className="font-semibold text-slate-900 dark:text-white">+{totalAdmissions}</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 dark:border-slate-700 dark:bg-slate-800/60">
            <TrendingUp className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="text-slate-600 dark:text-slate-300">Saldo Líquido:</span>
            <span className="font-semibold text-slate-900 dark:text-white">+{totalNetGrowth}</span>
          </div>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="colorMembers" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorAdmissions" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis
              dataKey="monthName"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: '#64748b' }}
              tickFormatter={(val: string) => val.split('/')[0]}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={38}
              tick={{ fontSize: 10, fill: '#64748b' }}
              domain={[0, 'auto']}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(15, 23, 42, 0.95)',
                border: 'none',
                borderRadius: '8px',
                color: '#fff',
                fontSize: '12px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              }}
              formatter={(value: unknown, name: unknown) => {
                if (name === 'totalMembers') return [`${String(value)} membros`, 'Total no Rol'];
                if (name === 'newAdmissions') return [`+${String(value)} novos`, 'Admissões no Mês'];
                return [String(value), String(name)];
              }}
              labelFormatter={(label) => `Período: ${label}`}
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ fontSize: 11, paddingBottom: 10 }}
              formatter={(value) => {
                if (value === 'totalMembers') return 'Total de Membros';
                if (value === 'newAdmissions') return 'Novas Admissões';
                return value;
              }}
            />
            <Area
              type="monotone"
              dataKey="totalMembers"
              stroke="#6366f1"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorMembers)"
            />
            <Area
              type="monotone"
              dataKey="newAdmissions"
              stroke="#10b981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorAdmissions)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
