import React, { useEffect, useState } from 'react';
import { checkApiHealth } from '../services/api';
import type { ApiHealthResponse } from '../types';
import { CardSkeleton } from '../components/ui/Skeleton';
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
  AlertCircle
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
    status: 'in_progress',
    desc: 'Laravel 11, React+TS, Docker, MySQL, Sanctum, Skeletons, Dark Mode padrão.'
  },
  {
    number: '02',
    name: 'Multi-tenancy e Segurança',
    branch: 'feature/etapa-02-multitenancy-seguranca',
    status: 'pending',
    desc: 'Isolamento lógico estrito por tenant, autenticação Sanctum, roles e policies.'
  },
  {
    number: '03',
    name: 'Secretaria e Membros',
    branch: 'feature/etapa-03-secretaria',
    status: 'pending',
    desc: 'Membros, famílias, visitantes, congregações e fluxo de aprovação cadastral.'
  },
  {
    number: '04',
    name: 'Ministérios e Voluntários',
    branch: 'feature/etapa-04-ministerios-voluntarios',
    status: 'pending',
    desc: 'Departamentos, equipes, escalas e detecção de conflitos de horários.'
  },
  {
    number: '05',
    name: 'Eventos e Presença',
    branch: 'feature/etapa-05-eventos-presenca',
    status: 'pending',
    desc: 'Cultos, eventos, inscrições, presença manual e check-in seguro via QR Code.'
  },
  {
    number: '06',
    name: 'Financeiro Avançado',
    branch: 'feature/etapa-06-financeiro',
    status: 'pending',
    desc: 'Dízimos/ofertas, despesas, contas, orçamentos, conciliação manual e auditoria.'
  },
  {
    number: '07',
    name: 'Portal do Membro',
    branch: 'feature/etapa-07-portal-membro',
    status: 'pending',
    desc: 'Área do membro para solicitações, escalas, eventos e perfil restrito.'
  },
  {
    number: '08',
    name: 'Dashboard e Relatórios',
    branch: 'feature/etapa-08-dashboard-relatorios',
    status: 'pending',
    desc: 'Indicadores administrativos, financeiros e exportações seguras em CSV/PDF.'
  },
  {
    number: '09',
    name: 'Auditoria e Produção',
    branch: 'feature/etapa-09-auditoria-producao',
    status: 'pending',
    desc: 'Revisão geral, otimizações, testes de carga, isolamento final e checklist.'
  }
];

export const FoundationPage: React.FC = () => {
  const [health, setHealth] = useState<ApiHealthResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await checkApiHealth();
      setHealth(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Não foi possível conectar à API.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  return (
    <main className="container">
      {/* Hero Header */}
      <section style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--accent-glow)', padding: '0.4rem 1rem', borderRadius: '9999px', marginBottom: '1rem', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
          <Sparkles size={16} color="var(--accent-primary)" />
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-primary)' }}>
            Etapa 1 — Fundação do Sistema
          </span>
        </div>
        <h1 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.025em', marginBottom: '0.75rem' }}>
          ChurchManager
        </h1>
        <p style={{ maxWidth: '680px', margin: '0 auto', color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
          Plataforma Multi-Tenant de Gestão de Igrejas Evangélicas. Arquitetura robusta com Laravel 11, React, TypeScript, MySQL e isolamento lógico seguro.
        </p>
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
            disabled={loading}
            className="btn btn-secondary" 
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Recarregar Status
          </button>
        </div>

        {loading ? (
          <div className="grid-cols-3">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : error ? (
          <div className="card" style={{ borderLeft: '4px solid var(--danger)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
              <AlertCircle size={22} color="var(--danger)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>API Desconectada no momento</h3>
            </div>
            <p className="text-secondary mb-3">{error}</p>
            <p className="text-muted" style={{ fontSize: '0.85rem' }}>
              Inicie o backend com <code>php artisan serve --port=8000</code> ou via Docker para testar a comunicação em tempo real.
            </p>
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

      {/* Technical Foundations Verified */}
      <section style={{ marginBottom: '2.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <ShieldCheck size={20} color="var(--accent-primary)" />
          Critérios de Aceite da Etapa 1
        </h2>

        <div className="grid-cols-2">
          <div className="card">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <CheckCircle2 size={18} color="var(--success)" />
              Estrutura & Versionamento Git
            </h3>
            <ul style={{ listStyle: 'none', paddingLeft: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <li>✓ Fluxo rigoroso de branches: <code>main</code>, <code>develop</code> e <code>feature/etapa-01-fundacao</code></li>
              <li>✓ Estrutura de monorepo organizada (<code>backend/</code>, <code>frontend/</code>, <code>docker/</code>, <code>docs/</code>)</li>
              <li>✓ Arquivo de progresso e tracking contínuo em <code>docs/PROGRESS.md</code></li>
            </ul>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <CheckCircle2 size={18} color="var(--success)" />
              Backend Laravel 11 & Autenticação
            </h3>
            <ul style={{ listStyle: 'none', paddingLeft: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <li>✓ API versionada sob prefixo <code>/api/v1</code></li>
              <li>✓ Laravel Sanctum instalado para tokens e cookies seguros</li>
              <li>✓ Testes automatizados executados com PHPUnit aprovados</li>
            </ul>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <CheckCircle2 size={18} color="var(--success)" />
              Frontend React + TypeScript + UX
            </h3>
            <ul style={{ listStyle: 'none', paddingLeft: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <li>✓ Mobile-First responsivo testado em múltiplas resoluções</li>
              <li>✓ Dark Mode como padrão inicial e Light Mode opcional persistido</li>
              <li>✓ Skeletons fluidos para estados assíncronos de carregamento</li>
            </ul>
          </div>

          <div className="card">
            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <CheckCircle2 size={18} color="var(--success)" />
              Infraestrutura & Docker
            </h3>
            <ul style={{ listStyle: 'none', paddingLeft: 0, fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
              <li>✓ Docker Compose configurado para Backend, Frontend e MySQL 8.0</li>
              <li>✓ Healthcheck configurado para o banco de dados MySQL</li>
              <li>✓ Arquivo <code>.env.example</code> documentado sem segredos expostos</li>
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
                    background: s.status === 'in_progress' ? 'var(--accent-glow)' : 'var(--bg-tertiary)',
                    color: s.status === 'in_progress' ? 'var(--accent-primary)' : 'var(--text-muted)',
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
                  <span className={`status-pill ${s.status === 'in_progress' ? 'status-online' : ''}`} style={{
                    background: s.status === 'pending' ? 'var(--bg-tertiary)' : undefined,
                    color: s.status === 'pending' ? 'var(--text-muted)' : undefined,
                    border: s.status === 'pending' ? '1px solid var(--bg-card-border)' : undefined,
                  }}>
                    {s.status === 'in_progress' ? 'Em Andamento' : 'Pendente'}
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
