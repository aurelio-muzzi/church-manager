import { http, initializeCsrfProtection } from '../http/client';
import { devMockAdapter } from '../adapters/devMockAdapter';
import {
  AuthUser,
  LoginCredentials,
  ForgotPasswordPayload,
  ResetPasswordPayload,
  AuthSessionResponse,
} from '@/modules/authentication/types';

export const authService = {
  /**
   * Realiza login no backend Laravel Sanctum ou no adaptador de desenvolvimento
   */
  async login(credentials: LoginCredentials): Promise<AuthSessionResponse> {
    if (devMockAdapter.isEnabled()) {
      devMockAdapter.logMockAction('authService.login', { email: credentials.email });

      // Determine mock user by email or password or fallback
      let user = devMockAdapter.getActiveUser();

      if (credentials.email.includes('pastor') || credentials.email.includes('admin')) {
        user = devMockAdapter.setActiveUser('admin');
      } else if (credentials.email.includes('secretaria')) {
        user = devMockAdapter.setActiveUser('secretary');
      } else if (credentials.email.includes('financeiro') || credentials.email.includes('tesour')) {
        user = devMockAdapter.setActiveUser('treasurer');
      } else if (credentials.email.includes('membro')) {
        user = devMockAdapter.setActiveUser('member');
      } else if (credentials.email.includes('platform')) {
        user = devMockAdapter.setActiveUser('platform');
      }

      if (user?.tenantId) {
        sessionStorage.setItem('churchmanager_active_tenant_id', user.tenantId);
      }

      sessionStorage.setItem('churchmanager_mock_auth_active', 'true');

      return {
        user: user as AuthUser,
        token: 'mock-sanctum-token-' + (user?.id || 'demo'),
      };
    }

    // Fluxo real com API Laravel Sanctum
    await initializeCsrfProtection();
    const response = await http.post<AuthSessionResponse>('/auth/login', credentials);

    if (response.user.tenantId) {
      sessionStorage.setItem('churchmanager_active_tenant_id', response.user.tenantId);
    }

    return response;
  },

  /**
   * Encerra a sessão ativa
   */
  async logout(): Promise<void> {
    if (devMockAdapter.isEnabled()) {
      devMockAdapter.logMockAction('authService.logout');
      sessionStorage.removeItem('churchmanager_mock_auth_active');
      sessionStorage.removeItem('churchmanager_active_tenant_id');
      return;
    }

    try {
      await http.post('/auth/logout');
    } finally {
      sessionStorage.removeItem('churchmanager_active_tenant_id');
    }
  },

  /**
   * Obtém os dados do usuário autenticado e permissões
   */
  async getMe(): Promise<AuthUser | null> {
    if (devMockAdapter.isEnabled()) {
      const isAuthActive = sessionStorage.getItem('churchmanager_mock_auth_active');
      if (isAuthActive === 'false') {
        return null;
      }
      return devMockAdapter.getActiveUser() as AuthUser;
    }

    try {
      const response = await http.get<{ user: AuthUser }>('/auth/me');
      return response.user;
    } catch {
      return null;
    }
  },

  /**
   * Solicita envio de link de recuperação de senha
   */
  async forgotPassword(payload: ForgotPasswordPayload): Promise<{ message: string }> {
    if (devMockAdapter.isEnabled()) {
      devMockAdapter.logMockAction('authService.forgotPassword', payload);
      return {
        message: 'Instruções para redefinição de senha foram enviadas ao seu e-mail.',
      };
    }

    return http.post<{ message: string }>('/auth/forgot-password', payload);
  },

  /**
   * Define nova senha com token
   */
  async resetPassword(payload: ResetPasswordPayload): Promise<{ message: string }> {
    if (devMockAdapter.isEnabled()) {
      devMockAdapter.logMockAction('authService.resetPassword', { email: payload.email });
      return {
        message: 'Sua senha foi redefinida com sucesso. Faça login para continuar.',
      };
    }

    return http.post<{ message: string }>('/auth/reset-password', payload);
  },

  /**
   * Alterna congregação ativa no escopo multi-tenant
   */
  async switchTenant(tenantId: string): Promise<AuthUser> {
    if (devMockAdapter.isEnabled()) {
      devMockAdapter.logMockAction('authService.switchTenant', { tenantId });
      sessionStorage.setItem('churchmanager_active_tenant_id', tenantId);
      const user = devMockAdapter.getActiveUser();
      if (user) {
        user.tenantId = tenantId;
      }
      return user as AuthUser;
    }

    const response = await http.post<{ user: AuthUser }>('/auth/switch-tenant', { tenant_id: tenantId });
    sessionStorage.setItem('churchmanager_active_tenant_id', tenantId);
    return response.user;
  },
};
