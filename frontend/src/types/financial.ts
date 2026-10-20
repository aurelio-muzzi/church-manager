export type AccountType = 'checking' | 'savings' | 'cash' | 'investment';
export type TransactionType = 'income' | 'expense';
export type TransactionStatus = 'pending' | 'confirmed' | 'cancelled';
export type PaymentMethod = 'pix' | 'cash' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'bank_slip' | 'check';

export interface FinancialAccount {
  id: number;
  tenant_id: number;
  congregation_id?: number | null;
  name: string;
  type: AccountType;
  bank_name?: string | null;
  agency_number?: string | null;
  account_number?: string | null;
  initial_balance: number;
  current_balance: number;
  status: 'active' | 'inactive';
  notes?: string | null;
  congregation?: { id: number; name: string };
  created_at?: string;
  updated_at?: string;
}

export interface FinancialCategory {
  id: number;
  tenant_id: number;
  parent_id?: number | null;
  name: string;
  code?: string | null;
  type: TransactionType;
  color: string;
  is_active: boolean;
  parent?: FinancialCategory | null;
  children?: FinancialCategory[];
  created_at?: string;
  updated_at?: string;
}

export interface FinancialTransaction {
  id: number;
  tenant_id: number;
  account_id: number;
  category_id: number;
  member_id?: number | null;
  type: TransactionType;
  amount: number;
  transaction_date: string;
  payment_method: PaymentMethod;
  status: TransactionStatus;
  description: string;
  document_number?: string | null;
  reconciled: boolean;
  reconciled_at?: string | null;
  account?: { id: number; name: string };
  category?: { id: number; name: string; color: string; type: TransactionType };
  member?: { id: number; name: string };
  created_at?: string;
  updated_at?: string;
}

export interface FinancialBudget {
  id: number;
  tenant_id: number;
  category_id: number;
  year: number;
  month?: number | null;
  planned_amount: number;
  executed_amount: number;
  difference?: number;
  percentage_used?: number;
  status?: 'under' | 'warning' | 'exceeded';
  notes?: string | null;
  category?: { id: number; name: string; color: string; type: TransactionType };
  created_at?: string;
  updated_at?: string;
}

export interface FinancialSummaryReport {
  period: {
    start_date: string;
    end_date: string;
  };
  total_balance: number;
  total_income: number;
  total_expense: number;
  net_result: number;
  pending_reconciliation_count: number;
  accounts: Array<{
    id: number;
    name: string;
    type: string;
    current_balance: number;
  }>;
  income_by_category: Array<{
    id: number;
    name: string;
    color: string;
    total: number;
  }>;
  expense_by_category: Array<{
    id: number;
    name: string;
    color: string;
    total: number;
  }>;
}

export interface MemberContributionReport {
  member: {
    id: number;
    name: string;
    email?: string;
    phone?: string;
  };
  year: number;
  total_contributed: number;
  contributions: FinancialTransaction[];
}
