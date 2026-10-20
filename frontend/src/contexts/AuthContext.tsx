import React, { createContext, useContext, useEffect, useState } from 'react';
import type { TenantInfo, User } from '../types';
import { getMeApi, loginApi, logoutApi, switchTenantApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  activeTenant: TenantInfo | null;
  tenants: TenantInfo[];
  token: string | null;
  isAuthenticated: boolean;
  isPlatformAdmin: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  switchTenant: (tenantId: number) => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [activeTenant, setActiveTenant] = useState<TenantInfo | null>(null);
  const [tenants, setTenants] = useState<TenantInfo[]>([]);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('cm_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const initAuth = async () => {
    const savedToken = localStorage.getItem('cm_token');
    if (!savedToken) {
      setIsLoading(false);
      return;
    }

    try {
      const data = await getMeApi();
      setUser(data.user);
      setActiveTenant(data.active_tenant);
      if (data.active_tenant) {
        localStorage.setItem('cm_active_tenant_id', String(data.active_tenant.id));
      }
    } catch {
      localStorage.removeItem('cm_token');
      localStorage.removeItem('cm_active_tenant_id');
      setToken(null);
      setUser(null);
      setActiveTenant(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const authData = await loginApi(email, password);
      localStorage.setItem('cm_token', authData.token);
      setToken(authData.token);
      setUser(authData.user);
      setActiveTenant(authData.active_tenant);
      setTenants(authData.tenants);

      if (authData.active_tenant) {
        localStorage.setItem('cm_active_tenant_id', String(authData.active_tenant.id));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await logoutApi();
    } finally {
      localStorage.removeItem('cm_token');
      localStorage.removeItem('cm_active_tenant_id');
      setToken(null);
      setUser(null);
      setActiveTenant(null);
      setTenants([]);
      setIsLoading(false);
    }
  };

  const switchTenant = async (tenantId: number) => {
    setIsLoading(true);
    try {
      const newActiveTenant = await switchTenantApi(tenantId);
      setActiveTenant(newActiveTenant);
      localStorage.setItem('cm_active_tenant_id', String(newActiveTenant.id));
    } finally {
      setIsLoading(false);
    }
  };

  const refreshProfile = async () => {
    await initAuth();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        activeTenant,
        tenants,
        token,
        isAuthenticated: !!user && !!token,
        isPlatformAdmin: !!user?.is_platform_admin,
        isLoading,
        login,
        logout,
        switchTenant,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
