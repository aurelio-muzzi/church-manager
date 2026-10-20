import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import { Church, Moon, Sun, LogOut, Shield, ChevronDown } from 'lucide-react';

export const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, activeTenant, tenants, switchTenant, logout, isAuthenticated, isPlatformAdmin } = useAuth();

  return (
    <header className="header-nav">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <a href="/" className="brand-badge" aria-label="ChurchManager Início">
          <div className="brand-icon">
            <Church size={20} />
          </div>
          <span>ChurchManager</span>
        </a>

        {/* Seletor de Tenant Ativo (se logado) */}
        {isAuthenticated && activeTenant && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--bg-tertiary)', padding: '0.25rem 0.6rem', borderRadius: '8px', border: '1px solid var(--bg-card-border)' }}>
            <Church size={15} color="var(--accent-primary)" />
            {tenants.length > 1 ? (
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <select
                  value={activeTenant.id}
                  onChange={(e) => switchTenant(Number(e.target.value))}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-primary)',
                    fontWeight: 600,
                    fontSize: '0.8rem',
                    cursor: 'pointer',
                    outline: 'none',
                    paddingRight: '1.2rem',
                    appearance: 'none',
                  }}
                >
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id} style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}>
                      {t.name}
                    </option>
                  ))}
                </select>
                <ChevronDown size={12} color="var(--text-muted)" style={{ position: 'absolute', right: 0, pointerEvents: 'none' }} />
              </div>
            ) : (
              <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{activeTenant.name}</span>
            )}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Dados do Usuário Autenticado */}
        {isAuthenticated && user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div className="hidden-mobile" style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{user.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>

                {isPlatformAdmin ? (
                  <span style={{ color: '#8b5cf6', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                    <Shield size={11} /> Platform Admin
                  </span>
                ) : (
                  activeTenant?.role ?? 'Membro'
                )}
              </div>
            </div>

            <button
              onClick={() => logout()}
              className="btn btn-secondary"
              title="Encerrar Sessão"
              style={{ padding: '0.45rem 0.65rem', color: 'var(--danger)' }}
            >
              <LogOut size={16} />
              <span style={{ fontSize: '0.8rem' }}>Sair</span>
            </button>
          </div>
        )}

        {/* Alternador de Tema */}
        <button
          onClick={toggleTheme}
          className="btn btn-secondary"
          aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
          style={{ padding: '0.45rem 0.75rem' }}
        >
          {theme === 'dark' ? (
            <>
              <Sun size={16} color="#f59e0b" />
              <span style={{ fontSize: '0.8rem' }}>Claro</span>
            </>
          ) : (
            <>
              <Moon size={16} color="#3b82f6" />
              <span style={{ fontSize: '0.8rem' }}>Escuro</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
