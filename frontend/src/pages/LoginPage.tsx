import React from 'react';
import { LoginForm } from '../components/auth/LoginForm';
import { useTheme } from '../contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'radial-gradient(ellipse at top, var(--bg-secondary) 0%, var(--bg-primary) 100%)',
        padding: '1.5rem',
        position: 'relative',
      }}
    >
      {/* Botão de Tema no Topo Direito */}
      <button
        onClick={toggleTheme}
        style={{
          position: 'absolute',
          top: '1.5rem',
          right: '1.5rem',
          background: 'var(--bg-card)',
          border: '1px solid var(--bg-card-border)',
          borderRadius: '10px',
          padding: '0.5rem 0.75rem',
          cursor: 'pointer',
          color: 'var(--text-secondary)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          fontSize: '0.8rem',
          fontWeight: 600,
        }}
      >
        {theme === 'dark' ? (
          <>
            <Sun size={15} color="#f59e0b" />
            <span>Claro</span>
          </>
        ) : (
          <>
            <Moon size={15} color="#3b82f6" />
            <span>Escuro</span>
          </>
        )}
      </button>

      {/* Formulário Centralizado */}
      <main style={{ width: '100%', maxWidth: '440px' }}>
        <LoginForm />
      </main>

      {/* Rodapé Discreto */}
      <footer style={{ marginTop: '2.5rem', textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
        ChurchManager © 2026 • Plataforma Segura de Gestão Eclesiástica
      </footer>
    </div>
  );
};
