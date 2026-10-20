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

export interface TenantSummary {
  id: string;
  name: string;
  slug: string;
  status: 'active' | 'suspended';
}

export interface UserSummary {
  id: string;
  name: string;
  email: string;
  role: string;
}
