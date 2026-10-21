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
}) => {
  return (
    <div className="space-y-3" data-testid="executive-kpi-grid">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Indicadores Executivos Globais • {selectedCongregationName}
        </h3>
        {metrics.pendingSecretaryRequests > 0 && (
          <Badge variant="outline" className="text-[10px] gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30">
            <AlertCircle className="h-3 w-3" />
            {metrics.pendingSecretaryRequests} solicitação(ões) cadastrais pendentes
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {/* KPI 1: Membros */}
        <Card className="border-border/80 shadow-xs hover:border-primary/40 transition-all" data-testid="kpi-card-members">
          <CardHeader className="p-3.5 pb-1 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Membros Ativos
            </CardTitle>
            <div className="h-7 w-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Users className="h-3.5 w-3.5" />
            </div>
          </CardHeader>
          <CardContent className="p-3.5 pt-0">
            <div className="text-xl font-bold font-mono text-foreground" data-testid="kpi-value-members">
              {metrics.activeMembers}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
              <ArrowUpRight className="h-3 w-3" />
              <span>+{metrics.membersGrowthPercent}% no ano</span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 2: Receita Mensal */}
        <Card className="border-border/80 shadow-xs hover:border-primary/40 transition-all" data-testid="kpi-card-income">
          <CardHeader className="p-3.5 pb-1 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Dízimos & Ofertas (Mês)
            </CardTitle>
            <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <DollarSign className="h-3.5 w-3.5" />
            </div>
          </CardHeader>
          <CardContent className="p-3.5 pt-0">
            <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400" data-testid="kpi-value-income">
              {formatBRL(metrics.monthlyIncome)}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
              <ArrowUpRight className="h-3 w-3" />
              <span>+{metrics.incomeGrowthPercent}% vs anterior</span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 3: Despesas Mensais */}
        <Card className="border-border/80 shadow-xs hover:border-primary/40 transition-all" data-testid="kpi-card-expenses">
          <CardHeader className="p-3.5 pb-1 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Despesas Pagas (Mês)
            </CardTitle>
            <div className="h-7 w-7 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <TrendingUp className="h-3.5 w-3.5" />
            </div>
          </CardHeader>
          <CardContent className="p-3.5 pt-0">
            <div className="text-xl font-bold font-mono text-rose-600 dark:text-rose-400" data-testid="kpi-value-expenses">
              {formatBRL(metrics.monthlyExpenses)}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
              <ArrowDownRight className="h-3 w-3" />
              <span>{metrics.expensesGrowthPercent}% economia</span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 4: Superávit Líquido */}
        <Card className="border-border/80 shadow-xs hover:border-primary/40 transition-all" data-testid="kpi-card-net">
          <CardHeader className="p-3.5 pb-1 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Saldo Operacional
            </CardTitle>
            <div className="h-7 w-7 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <CheckCircle2 className="h-3.5 w-3.5" />
            </div>
          </CardHeader>
          <CardContent className="p-3.5 pt-0">
            <div className="text-xl font-bold font-mono text-indigo-600 dark:text-indigo-400" data-testid="kpi-value-net">
              {formatBRL(metrics.netOperatingBalance)}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Superávit corrente</p>
          </CardContent>
        </Card>

        {/* KPI 5: Presença Média */}
        <Card className="border-border/80 shadow-xs hover:border-primary/40 transition-all" data-testid="kpi-card-attendance">
          <CardHeader className="p-3.5 pb-1 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Média Frequência / Culto
            </CardTitle>
            <div className="h-7 w-7 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Calendar className="h-3.5 w-3.5" />
            </div>
          </CardHeader>
          <CardContent className="p-3.5 pt-0">
            <div className="text-xl font-bold font-mono text-foreground" data-testid="kpi-value-attendance">
              {metrics.averageServiceAttendance} pess.
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 mt-1 font-medium">
              <ArrowUpRight className="h-3 w-3" />
              <span>+{metrics.attendanceGrowthPercent}% frequência</span>
            </div>
          </CardContent>
        </Card>

        {/* KPI 6: Engajamento Voluntários */}
        <Card className="border-border/80 shadow-xs hover:border-primary/40 transition-all" data-testid="kpi-card-volunteers">
          <CardHeader className="p-3.5 pb-1 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground">
              Voluntários Servindo
            </CardTitle>
            <div className="h-7 w-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <HeartHandshake className="h-3.5 w-3.5" />
            </div>
          </CardHeader>
          <CardContent className="p-3.5 pt-0">
            <div className="text-xl font-bold font-mono text-foreground" data-testid="kpi-value-volunteers">
              {metrics.activeVolunteers} ({metrics.volunteerEngagementRate}%)
            </div>
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-1">
              <UserCheck className="h-3 w-3 text-indigo-500" />
              <span>Conversão: {metrics.visitorConversionRate}%</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
