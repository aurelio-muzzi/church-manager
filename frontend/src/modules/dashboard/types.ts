/**
 * ChurchManager — Executive Dashboard & Reports Domain Types
 * Multi-Tenant SaaS Platform
 */

export interface ExecutiveMetrics {
  totalMembers: number;
  membersGrowthPercent: number;
  activeMembers: number;
  activeMembersPercent: number;
  monthlyIncome: number;
  incomeGrowthPercent: number;
  monthlyExpenses: number;
  expensesGrowthPercent: number;
  netOperatingBalance: number;
  averageServiceAttendance: number;
  attendanceGrowthPercent: number;
  activeVolunteers: number;
  volunteerEngagementRate: number;
  visitorConversionRate: number;
  pendingSecretaryRequests: number;
  unreconciledTransactionsCount: number;
}

export interface MembershipGrowthPoint {
  month: string;
  monthName: string;
  totalMembers: number;
  newAdmissions: number;
  transfers: number;
}

export interface FinancialCashflowPoint {
  month: string;
  monthName: string;
  income: number;
  tithes: number;
  offerings: number;
  expenses: number;
  net: number;
}

export interface AttendanceTrendPoint {
  date: string;
  serviceName: string;
  inPerson: number;
  online: number;
  total: number;
  capacityPercent: number;
}

export interface DemographicDataPoint {
  group: string;
  count: number;
  percentage: number;
  color: string;
}

export interface CongregationComparisonPoint {
  id: string;
  name: string;
  isMain: boolean;
  membersCount: number;
  averageAttendance: number;
  monthlyIncome: number;
  activeVolunteersCount: number;
}

export type ReportType =
  | 'members_roster'
  | 'financial_cashflow'
  | 'tithes_offerings'
  | 'attendance_summary'
  | 'ministry_volunteers';

export interface ReportColumn {
  key: string;
  label: string;
  format?: 'currency' | 'date' | 'badge' | 'text' | 'percent';
}

export interface ReportFilterParams {
  reportType: ReportType;
  startDate?: string;
  endDate?: string;
  congregationId?: string;
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface PaginatedReportResult {
  reportType: ReportType;
  title: string;
  description: string;
  columns: ReportColumn[];
  items: Record<string, string | number | boolean>[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  generatedAt: string;
  summaryTotals?: Record<string, number>;
}
