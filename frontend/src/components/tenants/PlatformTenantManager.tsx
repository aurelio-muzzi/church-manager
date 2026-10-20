import React, { useEffect, useState } from 'react';
import type { CreateTenantPayload, PlatformTenant } from '../../types';
import { createPlatformTenantApi, getPlatformTenantsApi, updateTenantStatusApi } from '../../services/api';
import { CardSkeleton } from '../ui/Skeleton';
import { 
  Building2, 
  Plus, 
  Search, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Users, 
  Globe, 
  Phone, 
  X,
  AlertCircle
} from 'lucide-react';

export const PlatformTenantManager: React.FC = () => {
  const [tenants, setTenants] = useState<PlatformTenant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  
  // Modal de cadastro
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<CreateTenantPayload>({
    name: '',
    slug: '',
    document_number: '',
    email: '',
    phone: '',
    timezone: 'America/Manaus',
    admin_name: '',
    admin_email: '',
    admin_password: '',
  });
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Modal de suspensão
  const [suspendModalTenant, setSuspendModalTenant] = useState<PlatformTenant | null>(null);
  const [suspensionReason, setSuspensionReason] = useState('');
  const [suspending, setSuspending] = useState(false);

  const fetchTenants = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getPlatformTenantsApi(search);
      setTenants(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erro ao carregar igrejas.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, [search]);

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitting(true);
    setFormError(null);

    try {
      await createPlatformTenantApi(formData);
      setShowModal(false);
      setFormData({
        name: '',
        slug: '',
        document_number: '',
        email: '',
        phone: '',
        timezone: 'America/Manaus',
        admin_name: '',
        admin_email: '',
        admin_password: '',
      });
      fetchTenants();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setFormError(err.message);
      } else {
        setFormError('Erro ao cadastrar igreja.');
      }
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleToggleStatus = async (tenant: PlatformTenant) => {
    if (tenant.status === 'active') {
      // Abre modal para pedir motivo da suspensão
      setSuspendModalTenant(tenant);
      setSuspensionReason('');
    } else {
      // Reativa diretamente
      try {
        await updateTenantStatusApi(tenant.id, 'active');
        fetchTenants();
      } catch (err: unknown) {
        alert(err instanceof Error ? err.message : 'Falha ao reativar igreja.');
      }
    }
  };

  const confirmSuspension = async () => {
    if (!suspendModalTenant) return;
    if (!suspensionReason.trim()) {
      alert('Por favor, informe a justificativa da suspensão.');
      return;
    }

    setSuspending(true);
    try {
      await updateTenantStatusApi(suspendModalTenant.id, 'suspended', suspensionReason);
      setSuspendModalTenant(null);
      fetchTenants();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Falha ao suspender igreja.');
    } finally {
      setSuspending(false);
    }
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      {/* Header da Seção de Gestão */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Building2 size={24} color="var(--accent-primary)" />
            Gestão Multi-Tenant de Igrejas
          </h2>
          <p className="text-secondary" style={{ fontSize: '0.85rem' }}>
            Administração global de organizações contratantes (exclusivo para Platform Admin)
          </p>
        </div>

        <button 
          onClick={() => setShowModal(true)} 
          className="btn btn-primary"
        >
          <Plus size={18} />
          Cadastrar Nova Igreja
        </button>
      </div>

      {/* Barra de Pesquisa */}
      <div className="card" style={{ padding: '0.75rem 1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <Search size={18} color="var(--text-muted)" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Pesquisar por nome da igreja, slug, CNPJ ou e-mail..."
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-primary)',
            fontSize: '0.9rem',
            width: '100%',
            outline: 'none',
          }}
        />
      </div>

      {/* Lista de Tenants */}
      {loading ? (
        <div className="grid-cols-2">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : error ? (
        <div className="card" style={{ borderLeft: '4px solid var(--danger)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--danger)', marginBottom: '0.5rem' }}>
            <AlertCircle size={20} />
            <strong>Erro ao carregar organizações</strong>
          </div>
          <p className="text-secondary">{error}</p>
        </div>
      ) : tenants.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1rem' }}>
          <Building2 size={40} color="var(--text-muted)" style={{ margin: '0 auto 1rem auto' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Nenhuma igreja cadastrada</h3>
          <p className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>
            Clique em "Cadastrar Nova Igreja" para adicionar a primeira congregação.
          </p>
        </div>
      ) : (
        <div className="grid-cols-2">
          {tenants.map((tenant) => (
            <div key={tenant.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{tenant.name}</h3>
                    <span className="text-muted" style={{ fontSize: '0.8rem' }}>slug: <code>{tenant.slug}</code></span>
                  </div>
                  <span className={`status-pill ${tenant.status === 'active' ? 'status-online' : 'status-offline'}`}>
                    {tenant.status === 'active' ? 'Ativa' : 'Suspensa'}
                  </span>
                </div>

                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1.25rem' }}>
                  {tenant.document_number && <div>CNPJ: <strong>{tenant.document_number}</strong></div>}
                  {tenant.email && <div>E-mail: {tenant.email}</div>}
                  {tenant.phone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Phone size={14} /> {tenant.phone}
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Globe size={14} /> Fuso: {tenant.timezone}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Users size={14} /> Usuários: {tenant.tenant_users_count ?? 1} associado(s)
                  </div>
                </div>

                {tenant.status === 'suspended' && tenant.suspension_reason && (
                  <div style={{
                    background: 'var(--danger-bg)',
                    border: '1px solid rgba(239, 68, 68, 0.25)',
                    padding: '0.6rem',
                    borderRadius: '6px',
                    fontSize: '0.8rem',
                    color: 'var(--danger)',
                    marginBottom: '1rem'
                  }}>
                    <strong>Motivo da suspensão:</strong> {tenant.suspension_reason}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--bg-card-border)', paddingTop: '0.75rem' }}>
                <button
                  onClick={() => handleToggleStatus(tenant)}
                  className={`btn ${tenant.status === 'active' ? 'btn-secondary' : 'btn-primary'}`}
                  style={{
                    fontSize: '0.8rem',
                    padding: '0.4rem 0.8rem',
                    color: tenant.status === 'active' ? 'var(--danger)' : undefined,
                  }}
                >
                  {tenant.status === 'active' ? (
                    <>
                      <XCircle size={15} />
                      Suspender Igreja
                    </>
                  ) : (
                    <>
                      <CheckCircle size={15} />
                      Reativar Igreja
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de Cadastro de Igreja */}
      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          zIndex: 100,
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '540px', maxHeight: '90vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Cadastrar Nova Igreja</h3>
              <button 
                onClick={() => setShowModal(false)}
                className="btn btn-secondary"
                style={{ padding: '0.3rem 0.5rem' }}
              >
                <X size={18} />
              </button>
            </div>

            {formError && (
              <div style={{
                background: 'var(--danger-bg)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                borderRadius: '8px',
                padding: '0.75rem',
                marginBottom: '1rem',
                fontSize: '0.85rem',
                color: 'var(--danger)'
              }}>
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateTenant} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <strong style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', textTransform: 'uppercase' }}>
                  1. Dados da Organização
                </strong>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                  Nome da Igreja *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Igreja Batista Renovada"
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.8rem',
                    borderRadius: '8px',
                    border: '1px solid var(--bg-card-border)',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                    CNPJ (Opcional)
                  </label>
                  <input
                    type="text"
                    value={formData.document_number}
                    onChange={(e) => setFormData({ ...formData, document_number: e.target.value })}
                    placeholder="00.000.000/0001-00"
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.8rem',
                      borderRadius: '8px',
                      border: '1px solid var(--bg-card-border)',
                      background: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                    Telefone
                  </label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="(92) 99999-9999"
                    style={{
                      width: '100%',
                      padding: '0.6rem 0.8rem',
                      borderRadius: '8px',
                      border: '1px solid var(--bg-card-border)',
                      background: 'var(--bg-secondary)',
                      color: 'var(--text-primary)',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--bg-card-border)', paddingTop: '0.75rem' }}>
                <strong style={{ fontSize: '0.85rem', color: 'var(--accent-primary)', textTransform: 'uppercase' }}>
                  2. Administrador Inicial da Igreja
                </strong>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                  Nome do Administrador / Pastor *
                </label>
                <input
                  type="text"
                  required
                  value={formData.admin_name}
                  onChange={(e) => setFormData({ ...formData, admin_name: e.target.value })}
                  placeholder="Nome completo do responsável"
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.8rem',
                    borderRadius: '8px',
                    border: '1px solid var(--bg-card-border)',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                  E-mail do Administrador *
                </label>
                <input
                  type="email"
                  required
                  value={formData.admin_email}
                  onChange={(e) => setFormData({ ...formData, admin_email: e.target.value })}
                  placeholder="pastor@igreja.local"
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.8rem',
                    borderRadius: '8px',
                    border: '1px solid var(--bg-card-border)',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                  Senha Inicial do Administrador *
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={formData.admin_password}
                  onChange={(e) => setFormData({ ...formData, admin_password: e.target.value })}
                  placeholder="Mínimo 8 caracteres"
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.8rem',
                    borderRadius: '8px',
                    border: '1px solid var(--bg-card-border)',
                    background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-secondary"
                  disabled={formSubmitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="btn btn-primary"
                >
                  {formSubmitting ? 'Salvando...' : 'Cadastrar Igreja'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Suspensão */}
      {suspendModalTenant && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          zIndex: 100,
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '460px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: 'var(--danger)', marginBottom: '1rem' }}>
              <AlertTriangle size={24} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Suspender Igreja</h3>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Você está prestes a suspender <strong>{suspendModalTenant.name}</strong>. Os usuários e membros desta igreja serão bloqueados de realizar qualquer operação no sistema.
            </p>

            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                Justificativa da Suspensão *
              </label>
              <textarea
                value={suspensionReason}
                onChange={(e) => setSuspensionReason(e.target.value)}
                placeholder="Informe o motivo administrativo ou judicial da suspensão..."
                rows={3}
                required
                style={{
                  width: '100%',
                  padding: '0.6rem 0.8rem',
                  borderRadius: '8px',
                  border: '1px solid var(--bg-card-border)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  outline: 'none',
                  fontSize: '0.85rem',
                }}
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                onClick={() => setSuspendModalTenant(null)}
                className="btn btn-secondary"
                disabled={suspending}
              >
                Cancelar
              </button>
              <button
                onClick={confirmSuspension}
                disabled={suspending || !suspensionReason.trim()}
                className="btn btn-primary"
                style={{ background: 'var(--danger)' }}
              >
                {suspending ? 'Suspendendo...' : 'Confirmar Suspensão'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
