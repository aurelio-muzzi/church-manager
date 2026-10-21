export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: string;
  tenantId?: string;
  tenantName?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthSessionResponse {
  user: AuthUser;
  token?: string;
}
