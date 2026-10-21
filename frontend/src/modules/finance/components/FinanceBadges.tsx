/**
 * Finance Module — Visual Semantic Badges
 * ChurchManager Enterprise Multi-Tenant Platform
 */

import React from 'react';
import { Badge } from '@/components/ui/badge';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  TrendingUp,
  TrendingDown,
  Heart,
  Landmark,
  ShieldCheck,
} from 'lucide-react';
import type {
  TransactionStatus,
  TransactionCategoryType,
  PaymentMethod,
} from '../types';

interface TransactionStatusBadgeProps {
  status: TransactionStatus;
}

export const TransactionStatusBadge: React.FC<TransactionStatusBadgeProps> = ({ status }) => {
  switch (status) {
    case 'paid':
      return (
        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1 font-medium">
          <CheckCircle2 className="h-3 w-3" />
          Liquidado / Pago
        </Badge>
      );
    case 'pending':
      return (
        <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 gap-1 font-medium">
          <Clock className="h-3 w-3" />
          Pendente
        </Badge>
      );
    case 'overdue':
      return (
        <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30 gap-1 font-medium">
          <AlertTriangle className="h-3 w-3" />
          Atrasado
        </Badge>
      );
    case 'cancelled':
      return (
        <Badge variant="outline" className="bg-muted text-muted-foreground border-border gap-1 font-medium">
          <XCircle className="h-3 w-3" />
          Cancelado
        </Badge>
      );
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
};

interface TransactionCategoryBadgeProps {
  categoryType: TransactionCategoryType;
}

export const TransactionCategoryBadge: React.FC<TransactionCategoryBadgeProps> = ({ categoryType }) => {
  switch (categoryType) {
    case 'tithe':
      return (
        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1 font-medium">
          <Heart className="h-3 w-3 fill-emerald-500/20" />
          Dízimo
        </Badge>
      );
    case 'offering':
      return (
        <Badge variant="outline" className="bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30 gap-1 font-medium">
          <TrendingUp className="h-3 w-3" />
          Oferta
        </Badge>
      );
    case 'general_income':
      return (
        <Badge variant="outline" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30 gap-1 font-medium">
          <TrendingUp className="h-3 w-3" />
          Receita
        </Badge>
      );
    case 'expense':
      return (
        <Badge variant="outline" className="bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30 gap-1 font-medium">
          <TrendingDown className="h-3 w-3" />
          Despesa
        </Badge>
      );
    default:
      return <Badge variant="outline">{categoryType}</Badge>;
  }
};

interface ReconciliationBadgeProps {
  isReconciled: boolean;
}

export const ReconciliationBadge: React.FC<ReconciliationBadgeProps> = ({ isReconciled }) => {
  if (isReconciled) {
    return (
      <Badge variant="outline" className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30 gap-1 font-medium text-[11px]">
        <ShieldCheck className="h-3 w-3" />
        Conciliado
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="bg-muted text-muted-foreground border-border gap-1 font-medium text-[11px]">
      <Clock className="h-3 w-3" />
      A Conciliar
    </Badge>
  );
};

interface PaymentMethodBadgeProps {
  method: PaymentMethod;
}

export const PaymentMethodBadge: React.FC<PaymentMethodBadgeProps> = ({ method }) => {
  const methodMap: Record<PaymentMethod, { label: string; icon: typeof Landmark }> = {
    pix: { label: 'PIX', icon: Landmark },
    cash: { label: 'Dinheiro', icon: Landmark },
    credit_card: { label: 'Cartão de Crédito', icon: Landmark },
    debit_card: { label: 'Cartão de Débito', icon: Landmark },
    bank_transfer: { label: 'Transferência', icon: Landmark },
    bank_slip: { label: 'Boleto', icon: Landmark },
  };

  const info = methodMap[method] || { label: method, icon: Landmark };

  return (
    <span className="text-xs text-muted-foreground inline-flex items-center gap-1">
      {info.label}
    </span>
  );
};
