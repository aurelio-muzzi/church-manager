import React, { useEffect, useState } from 'react';
import { checkApiHealth, getTenantProfileApi } from '../services/api';
import type { ApiHealthResponse, TenantInfo } from '../types';
import { CardSkeleton } from '../components/ui/Skeleton';
import { useAuth } from '../contexts/AuthContext';
import { LoginForm } from '../components/auth/LoginForm';
import { PlatformTenantManager } from '../components/tenants/PlatformTenantManager';
import { SecretaryModule } from '../components/secretary/SecretaryModule';
import { MinistryModule } from '../components/ministry/MinistryModule';
import { EventModule } from '../components/event/EventModule';
import { FinancialModule } from '../components/financial/FinancialModule';
import { MemberPortalModule } from '../components/member-portal/MemberPortalModule';
import { ExecutiveDashboardModule } from '../components/dashboard/ExecutiveDashboardModule';
import { ProductionAuditModule } from '../components/audit/ProductionAuditModule';
import { 
  Server, 
  Database, 
  Clock, 
  ShieldCheck, 
  Layers, 
  CheckCircle2, 
  RefreshCw,
  GitBranch,
  Sparkles,
  AlertCircle,
  Church,
  Shield,
  UserCheck,
  Calendar,
  DollarSign,
  HeartHandshake,
  TrendingUp
} from 'lucide-react';

interface Stage {
  number: string;
  name: string;
  branch: string;
  status: 'concluded' | 'in_progress' | 'pending';
  desc: string;
}

const STAGES: Stage[] = [
  {
    number: '01',
    name: 'Fundação Técnica',
    branch: 'feature/etapa-01-fundacao',
    status: 'concluded',
    desc: 'Laravel 11, React+TS, Docker, MySQL, Sanctum, Skeletons, Dark Mode padrão.'
  },
  {
    number: '02',
    name: 'Multi-tenancy e Segurança',
    branch: 'feature/etapa-02-multitenancy-seguranca',
    status: 'concluded',
    desc: 'Isolamento lógico estrito por tenant, autenticação Sanctum, roles e policies.'
  },
  {
    number: '03',
    name: 'Secretaria e Membros',
    branch: 'feature/etapa-03-secretaria',
    status: 'concluded',
    desc: 'Membros, famílias, visitantes, congregações e fluxo de aprovação cadastral.'
  },
  {
    number: '04',
    name: 'Ministérios e Voluntários',
    branch: 'feature/etapa-04-ministerios-voluntarios',
    status: 'concluded',
    desc: 'Departamentos, equipes, escalas e detecção de conflitos de horários.'
  },

  {
    number: '05',
    name: 'Eventos e Presença',
    branch: 'feature/etapa-05-eventos-presenca',
    status: 'concluded',
    desc: 'Cultos, eventos, inscrições, presença manual e check-in seguro via QR Code.'
  },
  {
    number: '06',
    name: 'Financeiro Avançado',
    branch: 'feature/etapa-06-financeiro',
    status: 'concluded',
    desc: 'Dízimos/ofertas, despesas, contas, orçamentos, conciliação manual e auditoria.'
  },
  {
    number: '07',
    name: 'Portal do Membro',
    branch: 'feature/etapa-07-portal-membro',
    status: 'concluded',
    desc: 'Área do membro para solicitações, escalas, eventos e perfil restrito.'
  },
  {
    number: '08',
    name: 'Dashboard e Relatórios',
    branch: 'feature/etapa-08-dashboard-relatorios',
    status: 'concluded',
    desc: 'Indicadores administrativos, financeiros e exportações seguras em CSV/PDF.'
  },
  {
    number: '09',
    name: 'Auditoria e Produção',
    branch: 'feature/etapa-09-auditoria-producao',
    status: 'concluded',
    desc: 'Revisão geral, headers de segurança, rate limit, autoteste de isolamento e release v1.0.0.'
  }
];

export const FoundationPage: React.FC = () => {
  const { isAuthenticated, user, activeTenant, isPlatformAdmin } = useAuth();
  const [health, setHealth] = useState<ApiHealthResponse | null>(null);
  const [loadingHealth, setLoadingHealth] = useState<boolean>(true);
  const [errorHealth, setErrorHealth] = useState<string | null>(null);

  // Tenant profile do usuário comum
  const [tenantProfile, setTenantProfile] = useState<TenantInfo | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [churchActiveModule, setChurchActiveModule] = useState<'audit' | 'dashboard' | 'portal' | 'financial' | 'events' | 'ministries' | 'secretary'>('audit');

  const fetchHealth = async () => {
    setLoadingHealth(true);
    setErrorHealth(null);
    try {
      const data = await checkApiHealth();
      setHealth(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorHealth(err.message);
      } else {
        setErrorHealth('Não foi possível conectar à API.');
      }
    } finally {
      setLoadingHealth(false);
    }
  };

  const fetchTenantProfile = async () => {
    if (!isAuthenticated || isPlatformAdmin) return;
    setLoadingProfile(true);
    try {
      const data = await getTenantProfileApi();
      setTenantProfile(data);
    } catch {
      setTenantProfile(null);
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchTenantProfile();
    }
  }, [isAuthenticated, activeTenant]);

  return (
    <main className="container">
      {/* Hero Header */}
      <section style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--accent-glow)', padding: '0.4rem 1rem', borderRadius: '9999px', marginBottom: '1rem', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
          <Sparkles size={16} color="var(--accent-primary)" />
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-primary)' }}>
            Etapa 2 — Multi-Tenancy & Segurança
          </span>
        </div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.025em', marginBottom: '0.75rem' }}>
          ChurchManager
        </h1>
        <p style={{ maxWidth: '680px', margin: '0 auto', color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
          Gestão multi-tenant com isolamento lógico estrito por igreja, autenticação centralizada Sanctum e auditoria contínua.
        </p>
      </section>

      {/* ÁREA DE AUTENTICAÇÃO E CONTEXTO DE TENANT */}
      <section style={{ marginBottom: '3rem' }}>
        {!isAuthenticated ? (
          <div>
            <LoginForm />
          </div>
        ) : (
          <div>
            {/* Boas-vindas ao Usuário Logado */}
            <div className="card" style={{ marginBottom: '1.5rem', borderLeft: '4px solid var(--accent-primary)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--accent-glow)', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <UserCheck size={26} />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.3rem', fontWeight: 700 }}>Olá, {user?.name}</h2>
                    <p className="text-secondary" style={{ fontSize: '0.85rem' }}>
                      {user?.email} • {isPlatformAdmin ? (
                        <strong style={{ color: '#8b5cf6' }}>Administrador Global da Plataforma</strong>
                      ) : (
                        <span>Perfil: <strong>{activeTenant?.role}</strong> na <strong>{activeTenant?.name}</strong></span>
                      )}
                    </p>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="status-pill status-online">Sessão Autenticada</span>
                </div>
              </div>
            </div>

            {/* Se Platform Admin: Exibe o Gerenciador Global de Tenants */}
            {isPlatformAdmin ? (
              <PlatformTenantManager />
            ) : (
              /* Se Usuário de Igreja: Exibe Dados do Tenant Ativo com Prova de Isolamento */
              <div className="card" style={{ marginTop: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                  <Church size={22} color="var(--accent-primary)" />
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Ambiente da Sua Congregação</h3>
                </div>

                {loadingProfile ? (
                  <CardSkeleton />
                ) : tenantProfile ? (
                  <div>
                    <div className="grid-cols-3" style={{ marginBottom: '1.25rem' }}>
                      <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px' }}>
                        <div className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 600 }}>NOME DA IGREJA</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{tenantProfile.name}</div>
                      </div>
                      <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px' }}>
                        <div className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 600 }}>IDENTIFICADOR (SLUG)</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700 }}><code>{tenantProfile.slug}</code></div>
                      </div>
                      <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px' }}>
                        <div className="text-muted" style={{ fontSize: '0.75rem', fontWeight: 600 }}>FUSO OFICIAL</div>
                        <div style={{ fontSize: '1.1rem', fontWeight: 700 }}>{tenantProfile.timezone || 'America/Manaus'}</div>
                      </div>
                    </div>

                    <div style={{ background: 'var(--success-bg)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '0.85rem', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                      <strong style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
                        <Shield size={16} /> Isolamento Lógico Ativo
                      </strong>
                      Seu token e suas requisições estão restritos ao tenant <code>#{tenantProfile.id}</code> ({tenantProfile.name}). O backend bloqueia automaticamente qualquer tentativa de acesso aos dados de outras igrejas.
                    </div>
                  </div>
                ) : null}

                {/* Seletor de Módulos da Igreja */}
                <div style={{ marginTop: '2rem', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setChurchActiveModule('audit')}
                    style={{
                      padding: '0.6rem 1.2rem',
                      borderRadius: '8px',
                      border: 'none',
                      background: churchActiveModule === 'audit' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                      color: churchActiveModule === 'audit' ? '#fff' : 'var(--text-secondary)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.9rem'
                    }}
                  >
                    <ShieldCheck size={18} />
                    Auditoria & Produção (Etapa 09)
                  </button>

                  <button
                    onClick={() => setChurchActiveModule('dashboard')}
                    style={{
                      padding: '0.6rem 1.2rem',
                      borderRadius: '8px',
                      border: 'none',
                      background: churchActiveModule === 'dashboard' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                      color: churchActiveModule === 'dashboard' ? '#fff' : 'var(--text-secondary)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.9rem'
                    }}
                  >
                    <TrendingUp size={18} />
                    Dashboard & BI (Etapa 08)
                  </button>

                  <button
                    onClick={() => setChurchActiveModule('portal')}
                    style={{
                      padding: '0.6rem 1.2rem',
                      borderRadius: '8px',
                      border: 'none',
                      background: churchActiveModule === 'portal' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                      color: churchActiveModule === 'portal' ? '#fff' : 'var(--text-secondary)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.9rem'
                    }}
                  >
                    <HeartHandshake size={18} />
                    Portal do Membro (Etapa 07)
                  </button>

                  <button
                    onClick={() => setChurchActiveModule('financial')}
                    style={{
                      padding: '0.6rem 1.2rem',
                      borderRadius: '8px',
                      border: 'none',
                      background: churchActiveModule === 'financial' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                      color: churchActiveModule === 'financial' ? '#fff' : 'var(--text-secondary)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.9rem'
                    }}
                  >
                    <DollarSign size={18} />
                    Financeiro Avançado (Etapa 06)
                  </button>

                  <button
                    onClick={() => setChurchActiveModule('events')}
                    style={{
                      padding: '0.6rem 1.2rem',
                      borderRadius: '8px',
                      border: 'none',
                      background: churchActiveModule === 'events' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                      color: churchActiveModule === 'events' ? '#fff' : 'var(--text-secondary)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.9rem'
                    }}
                  >
                    <Calendar size={18} />
                    Eventos & Presença (Etapa 05)
                  </button>

                  <button
                    onClick={() => setChurchActiveModule('ministries')}
                    style={{
                      padding: '0.6rem 1.2rem',
                      borderRadius: '8px',
                      border: 'none',
                      background: churchActiveModule === 'ministries' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                      color: churchActiveModule === 'ministries' ? '#fff' : 'var(--text-secondary)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.9rem'
                    }}
                  >
                    <Layers size={18} />
                    Ministérios & Escalas (Etapa 04)
                  </button>

                  <button
                    onClick={() => setChurchActiveModule('secretary')}
                    style={{
                      padding: '0.6rem 1.2rem',
                      borderRadius: '8px',
                      border: 'none',
                      background: churchActiveModule === 'secretary' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                      color: churchActiveModule === 'secretary' ? '#fff' : 'var(--text-secondary)',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      fontSize: '0.9rem'
                    }}
                  >
                    <Church size={18} />
                    Secretaria & Membros (Etapa 03)
                  </button>
                </div>

                {/* Renderização do Módulo Ativo */}
                {churchActiveModule === 'audit' ? (
                  <ProductionAuditModule />
                ) : churchActiveModule === 'dashboard' ? (
                  <ExecutiveDashboardModule />
                ) : churchActiveModule === 'portal' ? (
                  <MemberPortalModule />
                ) : churchActiveModule === 'financial' ? (
                  <FinancialModule />
                ) : churchActiveModule === 'events' ? (
                  <EventModule />
                ) : churchActiveModule === 'ministries' ? (
                  <MinistryModule />
                ) : (
                  <SecretaryModule />
                )}
              </div>
            )}
          </div>
        )}

      </section>

      {/* API Health Live Status */}
      <section style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Server size={20} color="var(--accent-primary)" />
            Status da Fundação Backend & Conexão
          </h2>
          <button 
            onClick={fetchHealth} 
            disabled={loadingHealth}
            className="btn btn-secondary" 
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
          >
            <RefreshCw size={14} className={loadingHealth ? 'animate-spin' : ''} />
            Recarregar Status
          </button>
        </div>

        {loadingHealth ? (
          <div className="grid-cols-3">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : errorHealth ? (
          <div className="card" style={{ borderLeft: '4px solid var(--danger)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <AlertCircle size={22} color="var(--danger)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>API Desconectada no momento</h3>
            </div>
            <p className="text-secondary mb-3">{errorHealth}</p>
          </div>
        ) : health ? (
          <div className="grid-cols-3">
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span className="text-muted" style={{ fontSize: '0.85rem', fontWeight: 600 }}>API SERVICE</span>
                <span className="status-pill status-online">Ativo</span>
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.25rem' }}>{health.app}</h3>
              <p className="text-secondary" style={{ fontSize: '0.9rem' }}>Versão: v{health.version} ({health.environment})</p>
            </div>

            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span className="text-muted" style={{ fontSize: '0.85rem', fontWeight: 600 }}>BANCO DE DADOS</span>
                <span className={`status-pill ${health.database === 'connected' ? 'status-online' : 'status-offline'}`}>
                  {health.database === 'connected' ? 'Conectado' : 'Aguardando'}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                <Database size={20} color="var(--accent-primary)" />
                <h3 style={{ fontSize: '1.3rem', fontWeight: 700 }}>MySQL 8.0</h3>
              </div>
              <p className="text-secondary" style={{ fontSize: '0.9rem' }}>Isolamento Lógico por Tenant</p>
            </div>

            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span className="text-muted" style={{ fontSize: '0.85rem', fontWeight: 600 }}>FUSO HORÁRIO</span>
                <Clock size={16} color="var(--text-muted)" />
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '0.25rem' }}>{health.timezone}</h3>
              <p className="text-secondary" style={{ fontSize: '0.85rem' }}>
                {new Date(health.timestamp).toLocaleTimeString('pt-BR')}
              </p>
            </div>
          </div>
        ) : null}
      </section>

      {/* Critérios de Aceite da Etapa 2 */}
      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <ShieldCheck size={20} color="var(--accent-primary)" />
          Critérios de Aceite da Etapa 2: Multi-Tenancy & Segurança
        </h2>

        <div className="grid-cols-2">
          <div className="card">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <CheckCircle2 size={18} color="var(--success)" />
              Isolamento Lógico Obrigatório
            </h3>
            <ul style={{ listStyle: 'none', paddingLeft: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <li>✓ <code>TenantScope</code> global do Eloquent aplicado em models de domínio</li>
              <li>✓ Injeção automática e segura do <code>tenant_id</code> via <code>BelongsToTenant</code></li>
              <li>✓ Middleware <code>IdentifyTenant</code> com bloqueio 403 contra IDs forjados</li>
            </ul>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <CheckCircle2 size={18} color="var(--success)" />
              Autenticação & Roles
            </h3>
            <ul style={{ listStyle: 'none', paddingLeft: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <li>✓ Autenticação centralizada com Laravel Sanctum (login, logout, me)</li>
              <li>✓ Associação granular de papéis em <code>tenant_users</code></li>
              <li>✓ Suporte à alternância entre múltiplas igrejas autorizadas</li>
            </ul>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <CheckCircle2 size={18} color="var(--success)" />
              Gestão da Plataforma & Suspensão
            </h3>
            <ul style={{ listStyle: 'none', paddingLeft: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <li>✓ Cadastro de igrejas exclusivo para o Administrador da Plataforma</li>
              <li>✓ Transação atômica criando Igreja + Administrador inicial</li>
              <li>✓ Suspensão e reativação com motivo obrigatório e bloqueio operacional</li>
            </ul>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <CheckCircle2 size={18} color="var(--success)" />
              Auditoria & Testes Negativos
            </h3>
            <ul style={{ listStyle: 'none', paddingLeft: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <li>✓ Tabela <code>audit_logs</code> gravando ações com sanitização de senhas</li>
              <li>✓ Testes de vazamento entre tenants executados e aprovados (56 assertions)</li>
              <li>✓ Proteção contra rotas de plataforma para usuários comuns</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Roadmap das Etapas */}
      <section style={{ marginBottom: '3rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Layers size={20} color="var(--accent-primary)" />
          Plano de Implementação por Etapas
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {STAGES.map((s) => (
            <div key={s.number} className="card" style={{ padding: '1rem 1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.4rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span style={{ 
                    fontWeight: 700, 
                    fontSize: '0.85rem', 
                    background: s.status === 'concluded' ? 'var(--success-bg)' : s.status === 'in_progress' ? 'var(--accent-glow)' : 'var(--bg-tertiary)',
                    color: s.status === 'concluded' ? 'var(--success)' : s.status === 'in_progress' ? 'var(--accent-primary)' : 'var(--text-muted)',
                    padding: '0.2rem 0.6rem', 
                    borderRadius: '6px' 
                  }}>
                    ETAPA {s.number}
                  </span>
                  <strong style={{ fontSize: '1rem' }}>{s.name}</strong>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <GitBranch size={13} />
                    <code>{s.branch}</code>
                  </span>
                  <span className={`status-pill ${s.status === 'concluded' ? 'status-online' : s.status === 'in_progress' ? 'status-online' : ''}`} style={{
                    background: s.status === 'pending' ? 'var(--bg-tertiary)' : undefined,
                    color: s.status === 'pending' ? 'var(--text-muted)' : undefined,
                    border: s.status === 'pending' ? '1px solid var(--bg-card-border)' : undefined,
                  }}>
                    {s.status === 'concluded' ? 'Concluída' : s.status === 'in_progress' ? 'Em Validação' : 'Pendente'}
                  </span>
                </div>
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
};
