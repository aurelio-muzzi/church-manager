import { useState, useEffect, useCallback, ReactNode } from 'react';
import { AuthContext } from './AuthContext';
import { AuthUser, LoginCredentials } from './types';
import { authService } from '@/services/api/authService';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/useToast';

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const { warning } = useToast();

  // Load user session on mount
  useEffect(() => {
    let isMounted = true;

    async function checkAuthSession() {
      try {
        const currentUser = await authService.getMe();
        if (isMounted) {
          setUser(currentUser);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Erro ao validar sessão');
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    checkAuthSession();

    // Listen for global 401 unauthorized events
    const handleUnauthorized = () => {
      setUser(null);
      queryClient.clear();
      warning('Sua sessão expirou. Por favor, autentique-se novamente.', 'Sessão Expirada');
    };

    window.addEventListener('churchmanager:unauthorized', handleUnauthorized);

    return () => {
      isMounted = false;
      window.removeEventListener('churchmanager:unauthorized', handleUnauthorized);
    };
  }, [queryClient, warning]);

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<AuthUser> => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await authService.login(credentials);
        setUser(response.user);
        // Clear old tenant queries
        queryClient.clear();
        return response.user;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Falha ao autenticar';
        setError(message);
        throw err;
      } finally {
        setIsLoading(false);
      }
    },
    [queryClient]
  );

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } finally {
      setUser(null);
      queryClient.clear();
      setIsLoading(false);
    }
  }, [queryClient]);

  const switchTenant = useCallback(
    async (tenantId: string) => {
      setIsLoading(true);
      try {
        const updatedUser = await authService.switchTenant(tenantId);
        setUser(updatedUser);
        queryClient.clear();
      } finally {
        setIsLoading(false);
      }
    },
    [queryClient]
  );

  const hasRole = useCallback(
    (roles: string | string[]): boolean => {
      if (!user) return false;
      if (Array.isArray(roles)) {
        return roles.includes(user.role);
      }
      return user.role === roles;
    },
    [user]
  );

  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (!user) return false;
      // platform_admin has all permissions
      if (user.role === 'platform_admin' || user.role === 'church_admin') return true;
      return user.permissions?.includes(permission) ?? false;
    },
    [user]
  );

  const value = {
    user,
    isAuthenticated: Boolean(user),
    isLoading,
    error,
    login,
    logout,
    switchTenant,
    hasRole,
    hasPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
