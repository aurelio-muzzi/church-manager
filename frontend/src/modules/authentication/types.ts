export type UserRole =
  | 'platform_admin'
  | 'church_admin'
  | 'pastor'
  | 'secretary'
  | 'treasurer'
  | 'leader'
  | 'member';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  tenantId?: string;
  tenantName?: string;
  avatarUrl?: string;
  permissions?: string[];
}

export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  email: string;
  password: string;
  password_confirmation: string;
}

export interface AuthSessionResponse {
  user: AuthUser;
  token?: string;
  expiresAt?: string;
}
