import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Line,
} from 'recharts';
import { DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import type { FinancialCashflowPoint } from '../types';

interface FinancialCashflowChartProps {
  data: FinancialCashflowPoint[];
  isLoading?: boolean;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(value);
};

export const FinancialCashflowChart: React.FC<FinancialCashflowChartProps> = ({
  data,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div
        data-testid="financial-cashflow-chart"
        className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
      >
        <div className="flex items-center justify-between pb-4">
          <div className="h-6 w-48 animate-pulse rounded bg-slate-200 dark:bg-slate-700" />
        </div>
        <div className="h-72 w-full animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
      </div>
    );
  }

  const totalIncome = data.reduce((sum, item) => sum + item.income, 0);
  const totalExpenses = data.reduce((sum, item) => sum + item.expenses, 0);
  const totalNet = totalIncome - totalExpenses;

  return (
    <div
      data-testid="financial-cashflow-chart"
      className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <div className="rounded-lg bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
              <DollarSign className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Fluxo de Caixa Consolidado
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Comparativo mensal de receitas, despesas e resultado operacional
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1.5 dark:border-emerald-800 dark:bg-emerald-950/40">
            <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-slate-600 dark:text-slate-300">Entradas:</span>
            <span className="font-semibold text-emerald-700 dark:text-emerald-300">
              {formatCurrency(totalIncome)}
            </span>
          </div>
          <div className="flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1.5 dark:border-rose-800 dark:bg-rose-950/40">
            <ArrowDownRight className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
            <span className="text-slate-600 dark:text-slate-300">Saídas:</span>
            <span className="font-semibold text-rose-700 dark:text-rose-300">
              {formatCurrency(totalExpenses)}
            </span>
          </div>
          <div className="hidden md:flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-2.5 py-1.5 dark:border-indigo-800 dark:bg-indigo-950/40">
            <span className="text-slate-600 dark:text-slate-300">Superávit:</span>
            <span className="font-semibold text-indigo-700 dark:text-indigo-300">
              {formatCurrency(totalNet)}
            </span>
          </div>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%" minWidth={300} minHeight={280}>
          <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis
              dataKey="monthName"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: '#64748b' }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: '#64748b' }}
              tickFormatter={(val) => `R$ ${(val / 1000).toFixed(0)}k`}
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
                if (name === 'income') return [formatCurrency(Number(value)), 'Receitas'];
                if (name === 'expenses') return [formatCurrency(Number(value)), 'Despesas'];
                if (name === 'net') return [formatCurrency(Number(value)), 'Resultado Líquido'];
                return [String(value), String(name)];
              }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ fontSize: 11, paddingBottom: 12 }}
              formatter={(value) => {
                if (value === 'income') return 'Receitas';
                if (value === 'expenses') return 'Despesas';
                if (value === 'net') return 'Superávit Líquido';
                return value;
              }}
            />
            <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={32} />
            <Bar dataKey="expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={32} />
            <Line
              type="monotone"
              dataKey="net"
              stroke="#6366f1"
              strokeWidth={2}
              dot={{ r: 3, fill: '#6366f1' }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
