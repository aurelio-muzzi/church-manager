import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Church, Monitor, MapPin } from 'lucide-react';
import type { AttendanceTrendPoint } from '../types';

interface AttendanceTrendsChartProps {
  data: AttendanceTrendPoint[];
  isLoading?: boolean;
}

export const AttendanceTrendsChart: React.FC<AttendanceTrendsChartProps> = ({
  data,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div
        data-testid="attendance-trends-chart"
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
  const totalInPerson = data.reduce((sum, item) => sum + item.inPerson, 0);
  const totalOnline = data.reduce((sum, item) => sum + item.online, 0);

  return (
    <div
      data-testid="attendance-trends-chart"
      className="h-full flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 sm:p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900"
    >
      <div className="flex flex-col gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="rounded-lg bg-sky-50 p-2 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400 shrink-0">
            <Church className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              Tendências de Frequência nos Cultos
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Comparativo de participação presencial e transmissões online
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 dark:border-slate-700 dark:bg-slate-800/60">
            <MapPin className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
            <span className="text-slate-600 dark:text-slate-300">Presencial Total:</span>
            <span className="font-semibold text-slate-900 dark:text-white">{totalInPerson}</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 dark:border-slate-700 dark:bg-slate-800/60">
            <Monitor className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
            <span className="text-slate-600 dark:text-slate-300">Online Total:</span>
            <span className="font-semibold text-slate-900 dark:text-white">{totalOnline}</span>
          </div>
          {latest && (
            <div className="flex items-center gap-1 rounded-lg border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
              <span className="text-xs font-medium">Capacidade: {latest.capacityPercent}%</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 w-full min-h-[250px] my-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 10, fill: '#64748b' }}
              tickFormatter={(date) => {
                const parts = date.split('-');
                return parts.length >= 3 ? `${parts[2]}/${parts[1]}` : date;
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={38}
              tick={{ fontSize: 10, fill: '#64748b' }}
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
                if (name === 'inPerson') return [`${String(value)} presentes`, 'Presencial'];
                if (name === 'online') return [`${String(value)} conexões`, 'Online'];
                if (name === 'total') return [`${String(value)} total`, 'Geral'];
                return [String(value), String(name)];
              }}
              labelFormatter={(label, items) => {
                const item = items?.[0]?.payload as AttendanceTrendPoint | undefined;
                return item ? `${item.serviceName} (${label})` : String(label);
              }}
            />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ fontSize: 11, paddingBottom: 10 }}
              formatter={(value) => {
                if (value === 'inPerson') return 'Presencial';
                if (value === 'online') return 'Online';
                if (value === 'total') return 'Consolidado';
                return value;
              }}
            />
            <Line
              type="monotone"
              dataKey="inPerson"
              stroke="#2563eb"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#2563eb' }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="online"
              stroke="#f59e0b"
              strokeWidth={2}
              strokeDasharray="4 4"
              dot={{ r: 3, fill: '#f59e0b' }}
            />
            <Line
              type="monotone"
              dataKey="total"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ r: 3, fill: '#10b981' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Rodapé Informativo de Frequência */}
      <div className="pt-3 mt-auto border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between text-xs text-muted-foreground gap-2">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-emerald-500 shrink-0" />
          <span>Média por culto: <strong className="text-foreground">{Math.round((totalInPerson + totalOnline) / (data.length || 1))} participantes</strong></span>
        </span>
        {latest && (
          <span className="text-[11px]">
            Último culto ({latest.date.split('-').reverse().slice(0, 2).join('/')}): <strong className="text-foreground">{latest.total} pessoas</strong> ({latest.capacityPercent}% da nave)
          </span>
        )}
      </div>
    </div>
  );
};
