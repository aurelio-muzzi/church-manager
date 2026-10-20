import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { AlertCircle, ChevronDown, ChevronUp, Church, Lock, LogIn, Mail, Shield, User } from 'lucide-react';

export const LoginForm: React.FC = () => {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Por favor, informe seu e-mail e senha.');
      return;
    }

    try {
      await login(email, password);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocorreu um erro ao realizar login.');
      }
    }
  };

  const handleQuickLogin = (quickEmail: string) => {
    setEmail(quickEmail);
    setPassword('Secret@123456');
    setError(null);
  };

  return (
    <div className="card" style={{ maxWidth: '420px', width: '100%', margin: '0 auto', padding: '2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div
          style={{
            width: '52px',
            height: '52px',
            background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem auto',
            color: '#fff',
            boxShadow: '0 8px 16px -4px rgba(59, 130, 246, 0.4)',
          }}
        >
          <Church size={28} />
        </div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
          Entrar na Plataforma
        </h2>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          Gestão integrada para sua igreja e congregação
        </p>
      </div>

      {error && (
        <div
          style={{
            background: 'var(--danger-bg)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            borderRadius: '10px',
            padding: '0.75rem 1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            marginBottom: '1.25rem',
            fontSize: '0.85rem',
            color: 'var(--danger)',
          }}
        >
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
        <div>
          <label
            htmlFor="login-email"
            style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-primary)' }}
          >
            E-mail
          </label>
          <div style={{ position: 'relative' }}>
            <span
              style={{
                position: 'absolute',
                left: '0.85rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
                pointerEvents: 'none',
              }}
            >
              <Mail size={16} />
            </span>
            <input
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu.email@igreja.com.br"
              required
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '0.7rem 0.85rem 0.7rem 2.4rem',
                borderRadius: '10px',
                border: '1px solid var(--bg-card-border)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="login-password"
            style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem', color: 'var(--text-primary)' }}
          >
            Senha
          </label>
          <div style={{ position: 'relative' }}>
            <span
              style={{
                position: 'absolute',
                left: '0.85rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
                pointerEvents: 'none',
              }}
            >
              <Lock size={16} />
            </span>
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Sua senha secreta"
              required
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '0.7rem 0.85rem 0.7rem 2.4rem',
                borderRadius: '10px',
                border: '1px solid var(--bg-card-border)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                outline: 'none',
                transition: 'border-color 0.2s',
              }}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary"
          style={{
            width: '100%',
            padding: '0.8rem',
            marginTop: '0.5rem',
            background: 'var(--accent-primary)',
            color: '#fff',
            borderRadius: '10px',
            fontSize: '0.95rem',
            fontWeight: 700,
          }}
        >
          <LogIn size={18} />
          {isLoading ? 'Conectando...' : 'Acessar Plataforma'}
        </button>
      </form>

      {/* Atalhos de Demonstração e Homologação (Colapsáveis e Discretos) */}
      <div style={{ marginTop: '1.75rem', borderTop: '1px solid var(--bg-card-border)', paddingTop: '1rem' }}>
        <button
          type="button"
          onClick={() => setShowDemoAccounts(!showDemoAccounts)}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            fontSize: '0.75rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            padding: '0.25rem 0',
          }}
        >
          <span>Ambiente de Testes / Contas Pré-configuradas</span>
          {showDemoAccounts ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {showDemoAccounts && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.75rem' }}>
            <button
              type="button"
              onClick={() => handleQuickLogin('pastor@batistacentral.local')}
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.45rem', justifyContent: 'flex-start' }}
            >
              <Church size={14} color="#3b82f6" />
              Pastor (Batista)
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('membro@batistacentral.local')}
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.45rem', justifyContent: 'flex-start' }}
            >
              <User size={14} color="#10b981" />
              Membro (Batista)
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('pastor@comunidadefe.local')}
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.45rem', justifyContent: 'flex-start' }}
            >
              <Church size={14} color="#f59e0b" />
              Pastor (Comunidade)
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@churchmanager.local')}
              className="btn btn-secondary"
              style={{ fontSize: '0.75rem', padding: '0.45rem', justifyContent: 'flex-start' }}
            >
              <Shield size={14} color="#8b5cf6" />
              Super Admin
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
