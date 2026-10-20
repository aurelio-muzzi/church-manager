export interface ApiHealthResponse {
  status: string;
  app: string;
  version: string;
  environment: string;
  timezone: string;
  database: 'connected' | 'disconnected' | string;
  timestamp: string;
}

export type Theme = 'dark' | 'light';

export interface User {
  id: number;
  name: string;
  email: string;
  is_platform_admin: boolean;
  phone?: string | null;
}

export interface TenantInfo {
  id: number;
  uuid: string;
  name: string;
  slug: string;
  role?: string;
  status: 'active' | 'suspended';
  is_default?: boolean;
  timezone?: string;
}

export interface AuthData {
  token: string;
  user: User;
  active_tenant: TenantInfo | null;
  tenants: TenantInfo[];
}

export interface PlatformTenant {
  id: number;
  uuid: string;
  name: string;
  slug: string;
  document_number?: string | null;
  email?: string | null;
  phone?: string | null;
  timezone: string;
  status: 'active' | 'suspended';
  suspended_at?: string | null;
  suspension_reason?: string | null;
  created_at: string;
  tenant_users_count?: number;
}

export interface CreateTenantPayload {
  name: string;
  slug?: string;
  document_number?: string;
  email?: string;
  phone?: string;
  timezone?: string;
  admin_name: string;
  admin_email: string;
  admin_password: string;
  admin_phone?: string;
}
