export interface AuditChecklistItem {
  category: string;
  name: string;
  status: 'passed' | 'warning' | 'failed';
  detail: string;
}

export interface SystemReadinessReport {
  status: string;
  readiness_score: number;
  summary: {
    total_checks: number;
    passed_checks: number;
    db_connected: boolean;
    total_tenants: number;
    total_members: number;
    total_audit_logs: number;
    php_version: string;
    laravel_version: string;
    server_time: string;
  };
  checklist: AuditChecklistItem[];
}

export interface IsolationAuditResult {
  status: string;
  verified_at: string;
  tenant: {
    id: number;
    name: string;
    slug: string;
  };
  isolation_passed: boolean;
  audit_details: {
    members_verified: number;
    members_leak_detected: boolean;
    transactions_verified: number;
    transactions_leak_detected: boolean;
    schedules_verified: number;
    schedules_leak_detected: boolean;
    events_verified: number;
    events_leak_detected: boolean;
    foreign_tenant_probe_count: number;
  };
  message: string;
}
