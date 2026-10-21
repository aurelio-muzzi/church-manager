import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/modules/authentication/AuthProvider';
import { ToastProvider } from '@/components/feedback/ToastProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LoginPage } from '@/modules/authentication/pages/LoginPage';
import { ForgotPasswordPage } from '@/modules/authentication/pages/ForgotPasswordPage';
import { AccessDeniedPage } from '@/modules/authentication/pages/AccessDeniedPage';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { devMockAdapter } from '@/services/adapters/devMockAdapter';

function renderWithProviders(ui: React.ReactElement, initialPath = '/') {
  window.history.pushState({}, 'Test page', initialPath);
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <ToastProvider>
        <AuthProvider>
          <BrowserRouter>{ui}</BrowserRouter>
        </AuthProvider>
      </ToastProvider>
    </QueryClientProvider>
  );
}

describe('Etapa 03 — Autenticação e Navegação Protegida', () => {
  beforeEach(() => {
    sessionStorage.clear();
    devMockAdapter.setActiveUser('admin');
  });

  it('deve renderizar a tela de login com campos de e-mail e senha', () => {
    renderWithProviders(<LoginPage />, '/login');
    expect(screen.getByText('Entrar na Plataforma')).toBeInTheDocument();
    expect(screen.getByLabelText(/e-mail cadastrado/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha de acesso/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /acessar churchmanager/i })).toBeInTheDocument();
  });

  it('deve exibir erro de validação com e-mail inválido', async () => {
    renderWithProviders(<LoginPage />, '/login');
    const emailInput = screen.getByLabelText(/e-mail cadastrado/i);
    const submitBtn = screen.getByRole('button', { name: /acessar churchmanager/i });

    fireEvent.change(emailInput, { target: { value: 'email-invalido' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Informe um endereço de e-mail válido.')).toBeInTheDocument();
    });
  });

  it('deve alternar a visibilidade da senha no campo de login', () => {
    renderWithProviders(<LoginPage />, '/login');
    const passwordInput = screen.getByLabelText(/senha de acesso/i) as HTMLInputElement;
    const toggleButton = screen.getByLabelText(/exibir senha/i);

    expect(passwordInput.type).toBe('password');
    fireEvent.click(toggleButton);
    expect(passwordInput.type).toBe('text');
  });

  it('deve renderizar e validar a tela de recuperação de senha', async () => {
    renderWithProviders(<ForgotPasswordPage />, '/recuperar-senha');
    expect(screen.getByText('Recuperar Acesso')).toBeInTheDocument();

    const emailInput = screen.getByLabelText(/e-mail cadastrado/i);
    const submitBtn = screen.getByRole('button', { name: /enviar link de recuperação/i });

    fireEvent.change(emailInput, { target: { value: 'membro@igreja.com.br' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText('Instruções Enviadas!')).toBeInTheDocument();
      expect(screen.getByText(/membro@igreja.com.br/i)).toBeInTheDocument();
    });
  });

  it('deve renderizar a tela de acesso negado (403) informando restrição de perfil', () => {
    renderWithProviders(<AccessDeniedPage />, '/403');
    expect(screen.getByText(/403 — Acesso Restrito/i)).toBeInTheDocument();
    expect(screen.getByText(/Você não possui autorização/i)).toBeInTheDocument();
  });

  it('deve permitir acesso em ProtectedRoute para papel autorizado', async () => {
    devMockAdapter.setActiveUser('admin');

    renderWithProviders(
      <Routes>
        <Route
          path="/admin-test"
          element={
            <ProtectedRoute allowedRoles={['church_admin']}>
              <div>Área Administrativa Concedida</div>
            </ProtectedRoute>
          }
        />
      </Routes>,
      '/admin-test'
    );

    await waitFor(() => {
      expect(screen.getByText('Área Administrativa Concedida')).toBeInTheDocument();
    });
  });

  it('deve bloquear acesso em ProtectedRoute quando o papel for não autorizado e redirecionar para 403', async () => {
    // Configura usuário ativo como membro comum
    devMockAdapter.setActiveUser('member');

    renderWithProviders(
      <Routes>
        <Route
          path="/admin-restrito"
          element={
            <ProtectedRoute allowedRoles={['church_admin', 'pastor']}>
              <div>Área Não Acessível ao Membro</div>
            </ProtectedRoute>
          }
        />
        <Route path="/403" element={<div>Página 403 Bloqueada</div>} />
      </Routes>,
      '/admin-restrito'
    );

    await waitFor(() => {
      expect(screen.getByText('Página 403 Bloqueada')).toBeInTheDocument();
      expect(screen.queryByText('Área Não Acessível ao Membro')).not.toBeInTheDocument();
    });
  });
});
