export interface ExecutiveOverview {
  total_members: number;
  new_members_this_month: number;
  new_members_prev_month: number;
  growth_rate_percentage: number;
  active_volunteers_count: number;
  volunteer_engagement_rate: number;
  attendance_last_30_days: number;
  financial: {
    total_balance: number;
    income_this_month: number;
    expense_this_month: number;
    net_result_this_month: number;
    is_surplus: boolean;
  };
}

export interface DemographicsData {
  by_gender: {
    male: number;
    female: number;
    other: number;
    not_informed: number;
  };
  by_age_group: {
    kids: number;
    teens: number;
    young_adults: number;
    adults: number;
    seniors: number;
    not_informed: number;
  };
  by_congregation: Array<{
    id: number;
    name: string;
    is_main: boolean;
    members_count: number;
  }>;
}

export interface MinistryStatsData {
  ministries: Array<{
    id: number;
    name: string;
    color: string;
    volunteers_count: number;
  }>;
  schedules_this_month: {
    total_allocations: number;
    confirmed: number;
    declined: number;
    pending: number;
    confirmation_rate: number;
  };
}

export interface FinancialEvolutionMonth {
  month: string;
  label: string;
  income: number;
  expense: number;
  net: number;
}

export interface PastoralAlertsData {
  members_absent_60_days: Array<{
    id: number;
    name: string;
    phone?: string | null;
    email?: string | null;
    congregation?: { id: number; name: string } | null;
    admission_date?: string | null;
  }>;
  pending_prayer_alerts: Array<{
    id: number;
    title: string;
    created_at: string;
    member?: { id: number; name: string } | null;
  }>;
}
