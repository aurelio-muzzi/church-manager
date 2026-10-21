/**
 * AccountsTab — Management of Bank Accounts and Cash Boxes
 * ChurchManager Enterprise Multi-Tenant Platform
 */

import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Landmark, Wallet, Plus, Edit2, CheckCircle2 } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import type { FinancialAccount } from '../types';

interface AccountsTabProps {
  accounts: FinancialAccount[];
  onOpenNewAccount: () => void;
  onEditAccount: (account: FinancialAccount) => void;
}

export const AccountsTab: React.FC<AccountsTabProps> = ({
  accounts,
  onOpenNewAccount,
  onEditAccount,
}) => {
  const getAccountTypeLabel = (type: FinancialAccount['type']) => {
    switch (type) {
      case 'checking':
        return 'Conta Corrente';
      case 'cash':
        return 'Caixa Físico / Espécie';
      case 'savings':
        return 'Poupança / Fundo';
      case 'investment':
        return 'Investimento';
      default:
        return type;
    }
  };

  const consolidatedTotal = accounts
    .filter((a) => a.isActive)
    .reduce((sum, a) => sum + a.currentBalance, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner com Saldo Consolidado */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-xl border border-primary/20 bg-primary/5 gap-4">
        <div>
          <span className="text-xs uppercase font-semibold text-primary tracking-wider">
            Tesouraria Eclesiástica
          </span>
          <h3 className="text-2xl font-black text-foreground mt-0.5">
            {formatCurrency(consolidatedTotal)}
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Saldo total disponível consolidado em {accounts.filter((a) => a.isActive).length} contas ativas.
          </p>
        </div>

        <Button onClick={onOpenNewAccount} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          Cadastrar Conta ou Caixa
        </Button>
      </div>

      {/* Grade de Contas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((acc) => {
          const isCash = acc.type === 'cash';

          return (
            <Card
              key={acc.id}
              className="flex flex-col justify-between hover:border-primary/40 transition-all shadow-sm"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div
                      className={`h-10 w-10 rounded-xl flex items-center justify-center font-bold ${
                        isCash
                          ? 'bg-amber-500/10 text-amber-600 border border-amber-500/30'
                          : 'bg-primary/10 text-primary border border-primary/30'
                      }`}
                    >
                      {isCash ? <Wallet className="h-5 w-5" /> : <Landmark className="h-5 w-5" />}
                    </div>
                    <div>
                      <CardTitle className="text-sm font-bold line-clamp-1">
                        {acc.name}
                      </CardTitle>
                      <CardDescription className="text-xs">
                        {getAccountTypeLabel(acc.type)}
                      </CardDescription>
                    </div>
                  </div>

                  <Badge
                    variant="outline"
                    className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px]"
                  >
                    <CheckCircle2 className="h-3 w-3 mr-0.5" />
                    Ativa
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 py-2">
                <div>
                  <span className="text-xs text-muted-foreground block">Saldo Atual Disponível</span>
                  <span className="text-2xl font-black tracking-tight text-foreground font-mono">
                    {formatCurrency(acc.currentBalance)}
                  </span>
                </div>

                <div className="text-xs text-muted-foreground space-y-1 pt-2 border-t border-border">
                  {acc.bankName && (
                    <div className="flex justify-between">
                      <span>Banco:</span>
                      <strong className="text-foreground font-medium">{acc.bankName}</strong>
                    </div>
                  )}
                  {acc.agency && (
                    <div className="flex justify-between">
                      <span>Agência:</span>
                      <strong className="text-foreground font-medium">{acc.agency}</strong>
                    </div>
                  )}
                  {acc.accountNumber && (
                    <div className="flex justify-between">
                      <span>Conta:</span>
                      <strong className="text-foreground font-medium">{acc.accountNumber}</strong>
                    </div>
                  )}
                  {acc.notes && (
                    <p className="text-[11px] text-muted-foreground italic line-clamp-2 pt-1">
                      {acc.notes}
                    </p>
                  )}
                </div>
              </CardContent>

              <CardFooter className="pt-2 border-t border-border">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onEditAccount(acc)}
                  className="w-full gap-2 text-xs"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                  Editar Conta
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
