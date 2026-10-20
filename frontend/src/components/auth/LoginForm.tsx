import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Lock, Mail, LogIn, AlertCircle, Shield, Church } from 'lucide-react';

export const LoginForm: React.FC = () => {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Preencha o e-mail e a senha.');
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
    <div className="card" style={{ maxWidth: '440px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <div style={{ 
          width: '44px', 
          height: '44px', 
          background: 'var(--accent-glow)', 
          color: 'var(--accent-primary)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 0.75rem auto',
          border: '1px solid rgba(59, 130, 246, 0.3)'
        }}>
          <Lock size={22} />
        </div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700 }}>Acesso ao Sistema</h2>
        <p className="text-secondary" style={{ fontSize: '0.85rem' }}>
          Autenticação centralizada com controle de acesso por igreja
        </p>
      </div>

      {error && (
        <div style={{
          background: 'var(--danger-bg)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          borderRadius: '8px',
          padding: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          marginBottom: '1.25rem',
          fontSize: '0.85rem',
          color: 'var(--danger)'
        }}>
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
            E-mail
          </label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
              <Mail size={16} />
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu.email@igreja.local"
              required
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '0.65rem 0.8rem 0.65rem 2.4rem',
                borderRadius: '8px',
                border: '1px solid var(--bg-card-border)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                outline: 'none',
              }}
            />
          </div>
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
            Senha
          </label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
              <Lock size={16} />
            </span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={isLoading}
              style={{
                width: '100%',
                padding: '0.65rem 0.8rem 0.65rem 2.4rem',
                borderRadius: '8px',
                border: '1px solid var(--bg-card-border)',
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
                outline: 'none',
              }}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary"
          style={{ width: '100%', padding: '0.75rem', marginTop: '0.5rem' }}
        >
          <LogIn size={18} />
          {isLoading ? 'Autenticando...' : 'Entrar na Plataforma'}
        </button>
      </form>

      {/* Atalhos para teste de perfis e isolamento */}
      <div style={{ marginTop: '1.75rem', borderTop: '1px solid var(--bg-card-border)', paddingTop: '1.25rem' }}>
        <p className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.6rem' }}>
          Atalhos de Demonstração (Seeders):
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={() => handleQuickLogin('admin@churchmanager.local')}
            className="btn btn-secondary"
            style={{ fontSize: '0.75rem', padding: '0.4rem 0.5rem', justifyContent: 'flex-start' }}
          >
            <Shield size={14} color="#8b5cf6" />
            Super Admin
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin('pastor@batistacentral.local')}
            className="btn btn-secondary"
            style={{ fontSize: '0.75rem', padding: '0.4rem 0.5rem', justifyContent: 'flex-start' }}
          >
            <Church size={14} color="#3b82f6" />
            Pastor Batista
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin('pastor@comunidadefe.local')}
            className="btn btn-secondary"
            style={{ fontSize: '0.75rem', padding: '0.4rem 0.5rem', justifyContent: 'flex-start' }}
          >
            <Church size={14} color="#10b981" />
            Pastora Comunidade
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin('membro@batistacentral.local')}
            className="btn btn-secondary"
            style={{ fontSize: '0.75rem', padding: '0.4rem 0.5rem', justifyContent: 'flex-start' }}
          >
            <Lock size={14} color="#f59e0b" />
            Membro Batista
          </button>
        </div>
      </div>
    </div>
  );
};
