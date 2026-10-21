/**
 * Finance Module — Domain Types & Contracts
 * ChurchManager Enterprise Multi-Tenant Platform
 */

export type AccountType = 'checking' | 'cash' | 'savings' | 'investment';

export interface FinancialAccount {
  id: string;
  name: string;
  type: AccountType;
  bankName?: string;
  agency?: string;
  accountNumber?: string;
  currentBalance: number;
  initialBalance: number;
  isActive: boolean;
  congregationId?: string;
  notes?: string;
}

export type CategoryType = 'income' | 'expense';

export interface FinancialCategory {
  id: string;
  name: string;
  type: CategoryType;
  code: string;
  color?: string;
  description?: string;
  isActive: boolean;
}

export interface CostCenter {
  id: string;
  name: string;
  code: string;
  description?: string;
  ministryId?: string;
  isActive: boolean;
}

export type PaymentMethod =
  | 'pix'
  | 'cash'
  | 'credit_card'
  | 'debit_card'
  | 'bank_transfer'
  | 'bank_slip';

export type TransactionStatus = 'paid' | 'pending' | 'overdue' | 'cancelled';

export type TransactionCategoryType =
  | 'tithe'
  | 'offering'
  | 'general_income'
  | 'expense';

export type OfferingType =
  | 'tithe'
  | 'general'
  | 'missions'
  | 'building'
  | 'campaign'
  | 'special';

export interface FinancialTransaction {
  id: string;
  type: CategoryType; // 'income' | 'expense'
  categoryType: TransactionCategoryType;
  amount: number;
  description: string;
  date: string; // YYYY-MM-DD
  competency: string; // YYYY-MM
  status: TransactionStatus;
  paymentMethod: PaymentMethod;
  accountId: string;
  categoryId: string;
  costCenterId?: string;
  congregationId: string;
  documentNumber?: string;
  receiptNumber?: string;
  isReconciled: boolean;
  reconciledAt?: string;
  reconciledBy?: string;
  notes?: string;

  // Specific to tithes / offerings (income)
  memberId?: string;
  contributorName?: string;
  isAnonymous?: boolean;
  offeringType?: OfferingType;
  eventId?: string;

  // Specific to expenses
  supplierName?: string;
  dueDate?: string; // YYYY-MM-DD
  paidDate?: string; // YYYY-MM-DD
  penaltyAmount?: number;
  discountAmount?: number;
  attachmentUrl?: string;
}

export interface DepartmentBudget {
  id: string;
  costCenterId: string;
  costCenterName: string;
  year: number;
  plannedAmount: number;
  spentAmount: number;
  alertThresholdPercent: number; // e.g. 90
}

export interface FinancialSummaryMetrics {
  consolidatedBalance: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyNetBalance: number;
  pendingPayables: number;
  tithesTotal: number;
  offeringsTotal: number;
  reconciliationRate: number; // 0 - 100%
}

export interface TransactionFilters {
  search?: string;
  type?: 'all' | 'income' | 'expense';
  categoryType?: 'all' | 'tithe' | 'offering' | 'expense';
  status?: 'all' | TransactionStatus;
  accountId?: string;
  categoryId?: string;
  costCenterId?: string;
  startDate?: string;
  endDate?: string;
  isReconciled?: 'all' | 'reconciled' | 'pending';
}
