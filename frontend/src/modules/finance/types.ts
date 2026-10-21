// Finance module base definitions
export interface FinancialAccount {
  id: string;
  name: string;
  type: 'checking' | 'cash' | 'savings' | 'investment';
  balance: number;
}

export interface FinancialTransaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  date: string;
  categoryId: string;
  accountId: string;
  isReconciled: boolean;
}
