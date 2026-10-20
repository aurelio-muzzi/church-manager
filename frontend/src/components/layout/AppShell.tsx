import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import {
  BarChart3,
  Calendar,
  ChevronDown,
  Church,
  DollarSign,
  Globe,
  HeartHandshake,
  LogOut,
  Menu,
  Moon,
  ShieldCheck,
  Sun,
  User,
  Users,
  X,
} from 'lucide-react';

export type AppModule =
  | 'dashboard'
  | 'secretary'
  | 'ministries'
  | 'events'
  | 'financial'
  | 'portal'
  | 'audit'
  | 'platform';

interface AppShellProps {
  activeModule: AppModule;
  onSelectModule: (module: AppModule) => void;
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({
  activeModule,
  onSelectModule,
  children,
}) => {
  const { user, activeTenant, tenants, switchTenant, logout, isPlatformAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    {
      id: 'dashboard' as AppModule,
      label: 'Dashboard & BI',
      icon: <BarChart3 size={18} />,
      visible: !isPlatformAdmin,
    },
    {
      id: 'secretary' as AppModule,
      label: 'Secretaria & Membros',
      icon: <Users size={18} />,
      visible: !isPlatformAdmin,
    },
    {
      id: 'ministries' as AppModule,
      label: 'Ministérios & Escalas',
      icon: <HeartHandshake size={18} />,
      visible: !isPlatformAdmin,
    },
    {
      id: 'events' as AppModule,
      label: 'Cultos & Eventos',
      icon: <Calendar size={18} />,
      visible: !isPlatformAdmin,
    },
    {
      id: 'financial' as AppModule,
      label: 'Gestão Financeira',
      icon: <DollarSign size={18} />,
      visible: !isPlatformAdmin,
    },
    {
      id: 'portal' as AppModule,
      label: 'Portal do Membro',
      icon: <User size={18} />,
      visible: !isPlatformAdmin,
    },
    {
      id: 'audit' as AppModule,
      label: 'Segurança & Auditoria',
      icon: <ShieldCheck size={18} />,
      visible: true,
    },
    {
      id: 'platform' as AppModule,
      label: 'Igrejas da Plataforma',
      icon: <Globe size={18} />,
      visible: isPlatformAdmin,
    },
  ];

  const handleModuleClick = (mod: AppModule) => {
    onSelectModule(mod);
    setMobileMenuOpen(false);
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Overlay Mobile */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            zIndex: 90,
            backdropFilter: 'blur(4px)',
          }}
        />
      )}

      {/* Sidebar de Navegação */}
      <aside
        style={{
          width: '260px',
          background: 'var(--bg-secondary)',
          borderRight: '1px solid var(--bg-card-border)',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          bottom: 0,
          left: 0,
          zIndex: 100,
          transform: mobileMenuOpen ? 'translateX(0)' : undefined,
          transition: 'transform 0.25s ease',
        }}
        className={`app-sidebar ${mobileMenuOpen ? 'open' : ''}`}
      >
        {/* Topo da Sidebar: Logo & Igreja */}
        <div
          style={{
            padding: '1.25rem',
            borderBottom: '1px solid var(--bg-card-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                boxShadow: '0 4px 12px -2px rgba(59, 130, 246, 0.4)',
              }}
            >
              <Church size={22} />
            </div>
            <div>
              <div style={{ fontWeight: 800, fontSize: '1rem', letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
                ChurchManager
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {isPlatformAdmin ? 'Administração Global' : activeTenant?.name || 'Gestão da Igreja'}
              </div>
            </div>
          </div>

          <button
            onClick={() => setMobileMenuOpen(false)}
            className="hidden-desktop"
            style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Seletor de Congregação Ativa (se tiver mais de 1 igreja vinculada) */}
        {!isPlatformAdmin && activeTenant && tenants.length > 1 && (
          <div style={{ padding: '0.75rem 1.25rem', borderBottom: '1px solid var(--bg-card-border)' }}>
            <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Igreja Ativa
            </span>
            <div style={{ position: 'relative', marginTop: '0.25rem' }}>
              <select
                value={activeTenant.id}
                onChange={(e) => switchTenant(Number(e.target.value))}
                style={{
                  width: '100%',
                  padding: '0.4rem 1.5rem 0.4rem 0.6rem',
                  borderRadius: '6px',
                  background: 'var(--bg-tertiary)',
                  border: '1px solid var(--bg-card-border)',
                  color: 'var(--text-primary)',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  appearance: 'none',
                  cursor: 'pointer',
                  outline: 'none',
                }}
              >
                {tenants.map((t) => (
                  <option key={t.id} value={t.id} style={{ background: 'var(--bg-secondary)' }}>
                    {t.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={14}
                style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: 'var(--text-muted)' }}
              />
            </div>
          </div>
        )}

        {/* Links de Navegação do Menu */}
        <nav style={{ padding: '1rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1, overflowY: 'auto' }}>
          {navItems
            .filter((item) => item.visible)
            .map((item) => {
              const isActive = activeModule === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleModuleClick(item.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '10px',
                    border: 'none',
                    background: isActive ? 'var(--accent-glow)' : 'transparent',
                    color: isActive ? 'var(--accent-primary)' : 'var(--text-secondary)',
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    width: '100%',
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'var(--bg-tertiary)';
                      e.currentTarget.style.color = 'var(--text-primary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }
                  }}
                >
                  <span style={{ color: isActive ? 'var(--accent-primary)' : 'inherit' }}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              );
            })}
        </nav>

        {/* Rodapé da Sidebar: Perfil & Sair */}
        <div
          style={{
            padding: '1rem',
            borderTop: '1px solid var(--bg-card-border)',
            background: 'var(--bg-tertiary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', overflow: 'hidden' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                background: 'var(--accent-primary)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.85rem',
                flexShrink: 0,
              }}
            >
              {user?.name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.name}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {isPlatformAdmin ? (
                  <span style={{ color: '#8b5cf6', fontWeight: 600 }}>Super Admin</span>
                ) : (
                  activeTenant?.role || 'Membro'
                )}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '0.35rem',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {theme === 'dark' ? <Sun size={16} color="#f59e0b" /> : <Moon size={16} color="#3b82f6" />}
            </button>

            <button
              onClick={() => logout()}
              title="Sair do Sistema"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--danger)',
                cursor: 'pointer',
                padding: '0.35rem',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Conteúdo Principal / Workspace */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          marginLeft: '260px',
          minWidth: 0,
        }}
        className="app-main-workspace"
      >
        {/* Barra Superior Mobile */}
        <header
          style={{
            padding: '0.75rem 1rem',
            background: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--bg-card-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
          className="hidden-desktop"
        >
          <button
            onClick={() => setMobileMenuOpen(true)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <Menu size={22} />
            <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Menu</span>
          </button>

          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
            {activeTenant?.name || 'ChurchManager'}
          </div>

          <button
            onClick={() => logout()}
            style={{ background: 'transparent', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}
          >
            <LogOut size={18} />
          </button>
        </header>

        {/* Workspace do Módulo */}
        <main style={{ padding: '1.5rem', flex: 1, maxWidth: '1400px', width: '100%', margin: '0 auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
};
