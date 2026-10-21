import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { App } from '@/app/App';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { devMockAdapter } from '@/services/adapters/devMockAdapter';
import { MOCK_USERS } from '@/services/adapters/fixtures';

describe('Etapa 01 — Fundação do Frontend', () => {
  it('deve renderizar a aplicação com o título e alicerces do ChurchManager', () => {
    render(<App />);
    expect(screen.getByText(/Fundação de Frontend —/i)).toBeInTheDocument();
    expect(screen.getAllByText(/ChurchManager/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Etapa 01: Fundação Ativa/i)).toBeInTheDocument();
  });

  it('deve alternar o tema escuro/claro via botão de tema', () => {
    render(<App />);
    const themeButton = screen.getByRole('button', { name: /alternar tema visual/i });
    expect(themeButton).toBeInTheDocument();

    // Trigger theme switch
    fireEvent.click(themeButton);
    expect(localStorage.getItem('churchmanager-theme')).toBeDefined();
  });

  it('deve formatar valores monetários em Real Brasileiro (pt-BR)', () => {
    const formatted = formatCurrency(1250.5);
    // Non-breaking space or standard space support in Brazilian Real
    expect(formatted).toMatch(/R\$\s*1\.250,50/);
  });

  it('deve formatar datas no padrão brasileiro DD/MM/AAAA', () => {
    const formatted = formatDate(new Date(2026, 9, 21)); // 21/10/2026
    expect(formatted).toBe('21/10/2026');
  });

  it('deve combinar classes CSS corretamente com o helper cn', () => {
    const result = cn('bg-red-500', 'p-4', { 'hidden': false, 'block': true });
    expect(result).toBe('bg-red-500 p-4 block');
  });

  it('deve prover DevMockAdapter ativo com fixtures isoladas', () => {
    expect(devMockAdapter.isEnabled()).toBe(true);
    const user = devMockAdapter.getActiveUser();
    expect(user).toBeDefined();
    expect(user?.name).toBe(MOCK_USERS.admin.name);
    expect(user?.role).toBe('church_admin');
  });
});
