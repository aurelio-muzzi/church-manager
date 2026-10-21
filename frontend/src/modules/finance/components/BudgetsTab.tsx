/**
 * BudgetsTab — Departmental & Cost Center Budget Control
 * ChurchManager Enterprise Multi-Tenant Platform
 */

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  PieChart,
  Plus,
  AlertTriangle,
  Layers,
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { DepartmentBudget, CostCenter } from '../types';
import type { BudgetFormData } from '../schemas';

interface BudgetsTabProps {
  budgets: DepartmentBudget[];
  costCenters: CostCenter[];
  onCreateBudget: (data: BudgetFormData) => Promise<void>;
}

export const BudgetsTab: React.FC<BudgetsTabProps> = ({
  budgets,
  costCenters,
  onCreateBudget,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCostCenter, setSelectedCostCenter] = useState(costCenters[0]?.id || '');
  const [plannedAmount, setPlannedAmount] = useState(10000);
  const [year, setYear] = useState(2026);
  const [alertThreshold, setAlertThreshold] = useState(90);

  // Verifica se há departamentos com estouro orçamentário
  const exceededBudgets = budgets.filter((b) => b.spentAmount > b.plannedAmount);

  const handleSaveBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCreateBudget({
      costCenterId: selectedCostCenter,
      plannedAmount,
      year,
      alertThresholdPercent: alertThreshold,
    });
    setModalOpen(false);
  };

  const getHealthStatus = (spent: number, planned: number, threshold: number) => {
    const percent = planned > 0 ? (spent / planned) * 100 : 0;
    if (percent > 100) {
      return {
        label: 'Estouro Orçamentário',
        color: 'bg-destructive text-destructive-foreground',
        progressColor: 'bg-destructive',
        borderColor: 'border-destructive/50 bg-destructive/5',
        isExceeded: true,
      };
    }
    if (percent >= threshold) {
      return {
        label: 'Alerta / Limite Crítico',
        color: 'bg-amber-500 text-white',
        progressColor: 'bg-amber-500',
        borderColor: 'border-amber-500/50 bg-amber-500/5',
        isExceeded: false,
      };
    }
    return {
      label: 'Dentro do Orçamento',
      color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
      progressColor: 'bg-emerald-500',
      borderColor: 'border-border',
      isExceeded: false,
    };
  };

  return (
    <div className="space-y-6">
      {/* Banner Chamativo se houver departamento com Estouro Orçamentário */}
      {exceededBudgets.length > 0 && (
        <div
          data-testid="budget-exceeded-alert"
          className="p-4 rounded-xl border border-destructive/40 bg-destructive/10 text-destructive flex items-start gap-3 shadow-sm animate-pulse"
        >
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-sm">
              Alerta de Contingenciamento: Estouro de Teto Orçamentário Detectado!
            </h4>
            <p className="text-xs text-foreground/90">
              O departamento <strong>{exceededBudgets.map((b) => b.costCenterName).join(', ')}</strong>{' '}
              ultrapassou 100% da verba eclesiástica planejada para o exercício de 2026. Novas despesas devem ser
              submetidas à diretoria e conselho fiscal.
            </p>
          </div>
        </div>
      )}

      {/* Cabeçalho do Orçamento */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <PieChart className="h-5 w-5 text-primary" />
            Orçamento Eclesiástico por Ministério & Centro de Custo (2026)
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Acompanhamento do teto de gastos orçado versus despesas realizadas no ano.
          </p>
        </div>

        <Button onClick={() => setModalOpen(true)} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          Definir Novo Teto Orçamentário
        </Button>
      </div>

      {/* Grade de Orçamentos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {budgets.map((b) => {
          const percent = b.plannedAmount > 0 ? (b.spentAmount / b.plannedAmount) * 100 : 0;
          const status = getHealthStatus(b.spentAmount, b.plannedAmount, b.alertThresholdPercent);
          const remaining = b.plannedAmount - b.spentAmount;

          return (
            <Card
              key={b.id}
              className={`transition-all shadow-sm ${status.borderColor}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-base font-bold text-foreground">
                      {b.costCenterName}
                    </CardTitle>
                    <CardDescription className="text-xs flex items-center gap-1 mt-0.5">
                      <Layers className="h-3 w-3" />
                      Exercício {b.year} • Limite de Alerta: {b.alertThresholdPercent}%
                    </CardDescription>
                  </div>
                  <Badge className={`text-[10px] font-semibold ${status.color}`}>
                    {status.label}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 py-2">
                {/* Comparativo de Valores */}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="p-2.5 rounded-lg bg-muted/30 border border-border/50">
                    <span className="text-[11px] text-muted-foreground block font-medium">
                      Teto Planejado
                    </span>
                    <span className="font-bold text-base text-foreground font-mono">
                      {formatCurrency(b.plannedAmount)}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-muted/30 border border-border/50">
                    <span className="text-[11px] text-muted-foreground block font-medium">
                      Gasto Realizado
                    </span>
                    <span
                      className={`font-bold text-base font-mono ${
                        status.isExceeded ? 'text-destructive' : 'text-foreground'
                      }`}
                    >
                      {formatCurrency(b.spentAmount)}
                    </span>
                  </div>
                </div>

                {/* Barra de Progresso Visual */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground font-medium">Consumo da Verba</span>
                    <span className="font-bold font-mono text-foreground">
                      {percent.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full h-3 bg-muted rounded-full overflow-hidden border border-border/40">
                    <div
                      className={`h-full transition-all duration-500 ${status.progressColor}`}
                      style={{ width: `${Math.min(percent, 100)}%` }}
                    />
                  </div>
                </div>

                {/* Saldo Restante / Déficit */}
                <div className="pt-2 border-t border-border flex justify-between items-center text-xs">
                  <span className="text-muted-foreground">
                    {remaining >= 0 ? 'Saldo Disponível para Gasto:' : 'Déficit / Estouro do Teto:'}
                  </span>
                  <span
                    className={`font-bold font-mono ${
                      remaining >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'
                    }`}
                  >
                    {formatCurrency(Math.abs(remaining))}
                  </span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Modal para Definir Teto */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Definir Teto Orçamentário</DialogTitle>
            <DialogDescription>
              Planeje o orçamento anual para ministérios ou centros de custo da congregação.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveBudget} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="budCostCenter">Centro de Custo / Ministério</Label>
              <select
                id="budCostCenter"
                value={selectedCostCenter}
                onChange={(e) => setSelectedCostCenter(e.target.value)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                {costCenters.map((cc) => (
                  <option key={cc.id} value={cc.id}>
                    {cc.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="budAmount">Teto Orçado (R$)*</Label>
                <Input
                  id="budAmount"
                  type="number"
                  step="100"
                  value={plannedAmount}
                  onChange={(e) => setPlannedAmount(Number(e.target.value))}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="budYear">Exercício (Ano)*</Label>
                <Input
                  id="budYear"
                  type="number"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="budThreshold">Limiar para Alerta Visual (%)</Label>
              <Input
                id="budThreshold"
                type="number"
                min="50"
                max="100"
                value={alertThreshold}
                onChange={(e) => setAlertThreshold(Number(e.target.value))}
              />
              <p className="text-[11px] text-muted-foreground">
                Gera advertência colorida quando o departamento atingir esta porcentagem.
              </p>
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="gap-2">
                Salvar Orçamento
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
