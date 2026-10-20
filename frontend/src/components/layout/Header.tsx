import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Church, Moon, Sun } from 'lucide-react';

export const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="header-nav">
      <a href="/" className="brand-badge" aria-label="ChurchManager Início">
        <div className="brand-icon">
          <Church size={20} />
        </div>
        <span>ChurchManager</span>
      </a>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={toggleTheme}
          className="btn btn-secondary"
          aria-label={theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro'}
          style={{ padding: '0.5rem 0.8rem' }}
        >
          {theme === 'dark' ? (
            <>
              <Sun size={18} color="#f59e0b" />
              <span style={{ fontSize: '0.8rem' }}>Claro</span>
            </>
          ) : (
            <>
              <Moon size={18} color="#3b82f6" />
              <span style={{ fontSize: '0.8rem' }}>Escuro</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
};
