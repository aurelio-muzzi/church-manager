import { createContext } from 'react';
import { AuthUser, LoginCredentials } from './types';

export interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<AuthUser>;
  logout: () => Promise<void>;
  switchTenant: (tenantId: string) => Promise<void>;
  hasRole: (roles: string | string[]) => boolean;
  hasPermission: (permission: string) => boolean;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
