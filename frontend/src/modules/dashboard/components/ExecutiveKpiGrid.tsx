import React from 'react';
import {
  Users,
  DollarSign,
  TrendingUp,
  Calendar,
  HeartHandshake,
  UserCheck,
  ArrowUpRight,
  ArrowDownRight,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { ExecutiveMetrics } from '../types';

interface ExecutiveKpiGridProps {
  metrics: ExecutiveMetrics;
  selectedCongregationName?: string;
  isLoading?: boolean;
}

const formatBRL = (val: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);

export const ExecutiveKpiGrid: React.FC<ExecutiveKpiGridProps> = ({
  metrics,
  selectedCongregationName = 'Todas as Congregações',
  isLoading = false,
}) => {
  return (
    <div className="space-y-3" data-testid="executive-kpi-grid">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-1">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Indicadores Executivos Globais • {selectedCongregationName}
        </h3>
        {metrics.pendingSecretaryRequests > 0 && (
          <Badge variant="outline" className="text-[10px] gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 w-fit">
            <AlertCircle className="h-3 w-3 shrink-0" />
            <span>{metrics.pendingSecretaryRequests} solicitação(ões) cadastrais pendentes</span>
          </Badge>
        )}
      </div>

      <div className={cn('grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 transition-opacity duration-200', isLoading && 'opacity-60')}>
        {/* KPI 1: Membros */}
        <Card className="border-border/80 shadow-xs hover:border-primary/40 transition-all min-w-0" data-testid="kpi-card-members">
          <CardHeader className="p-4 pb-1.5 flex flex-row items-center justify-between space-y-0 gap-2">
            <CardTitle className="text-xs font-medium text-muted-foreground truncate" title="Membros Ativos">
              Membros Ativos
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-foreground" data-testid="kpi-value-members">
              {metrics.activeMembers}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
              <ArrowUpRight className="h-3 w-3 shrink-0" />
              <span>+{metrics.membersGrowthPercent}% no ano</span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 2: Receita Mensal */}
        <Card className="border-border/80 shadow-xs hover:border-primary/40 transition-all min-w-0" data-testid="kpi-card-income">
          <CardHeader className="p-4 pb-1.5 flex flex-row items-center justify-between space-y-0 gap-2">
            <CardTitle className="text-xs font-medium text-muted-foreground truncate" title="Dízimos & Ofertas (Mês)">
              Dízimos & Ofertas (Mês)
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-emerald-600 dark:text-emerald-400 truncate" data-testid="kpi-value-income">
              {formatBRL(metrics.monthlyIncome)}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
              <ArrowUpRight className="h-3 w-3 shrink-0" />
              <span>+{metrics.incomeGrowthPercent}% vs anterior</span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 3: Despesas Mensais */}
        <Card className="border-border/80 shadow-xs hover:border-primary/40 transition-all min-w-0" data-testid="kpi-card-expenses">
          <CardHeader className="p-4 pb-1.5 flex flex-row items-center justify-between space-y-0 gap-2">
            <CardTitle className="text-xs font-medium text-muted-foreground truncate" title="Despesas Pagas (Mês)">
              Despesas Pagas (Mês)
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-rose-600 dark:text-rose-400 truncate" data-testid="kpi-value-expenses">
              {formatBRL(metrics.monthlyExpenses)}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
              <ArrowDownRight className="h-3 w-3 shrink-0" />
              <span>{metrics.expensesGrowthPercent}% economia</span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 4: Superávit Líquido */}
        <Card className="border-border/80 shadow-xs hover:border-primary/40 transition-all min-w-0" data-testid="kpi-card-net">
          <CardHeader className="p-4 pb-1.5 flex flex-row items-center justify-between space-y-0 gap-2">
            <CardTitle className="text-xs font-medium text-muted-foreground truncate" title="Saldo Operacional">
              Saldo Operacional
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-indigo-600 dark:text-indigo-400 truncate" data-testid="kpi-value-net">
              {formatBRL(metrics.netOperatingBalance)}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 truncate">Superávit corrente</p>
          </CardContent>
        </Card>

        {/* KPI 5: Presença Média */}
        <Card className="border-border/80 shadow-xs hover:border-primary/40 transition-all min-w-0" data-testid="kpi-card-attendance">
          <CardHeader className="p-4 pb-1.5 flex flex-row items-center justify-between space-y-0 gap-2">
            <CardTitle className="text-xs font-medium text-muted-foreground truncate" title="Média Frequência / Culto">
              Média Frequência / Culto
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Calendar className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-foreground" data-testid="kpi-value-attendance">
              {metrics.averageServiceAttendance} pessoa(s)
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
              <ArrowUpRight className="h-3 w-3 shrink-0" />
              <span>+{metrics.attendanceGrowthPercent}% frequência</span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 6: Engajamento Voluntários */}
        <Card className="border-border/80 shadow-xs hover:border-primary/40 transition-all min-w-0" data-testid="kpi-card-volunteers">
          <CardHeader className="p-4 pb-1.5 flex flex-row items-center justify-between space-y-0 gap-2">
            <CardTitle className="text-xs font-medium text-muted-foreground truncate" title="Voluntários Servindo">
              Voluntários Servindo
            </CardTitle>
            <div className="h-8 w-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <HeartHandshake className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-foreground truncate" data-testid="kpi-value-volunteers">
              {metrics.activeVolunteers} ({metrics.volunteerEngagementRate}%)
            </div>
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-1 truncate">
              <UserCheck className="h-3 w-3 text-indigo-500 shrink-0" />
              <span>Conversão: {metrics.visitorConversionRate}%</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
