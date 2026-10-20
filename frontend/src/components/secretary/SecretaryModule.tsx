import React, { useEffect, useState } from 'react';
import type { Congregation, Member, MemberChangeRequest, Visitor } from '../../types/secretary';
import { 
  convertVisitorToMemberApi, 
  createCongregationApi, 
  createMemberApi, 
  createVisitorApi, 
  getCongregationsApi, 
  getMembersApi, 
  getVisitorsApi, 
  getChangeRequestsApi, 
  reviewChangeRequestApi 
} from '../../services/secretaryApi';
import { CardSkeleton } from '../ui/Skeleton';
import { 
  Users, 
  Building2, 
  UserCheck, 
  FileCheck2, 
  Plus, 
  Search, 
  Phone, 
  Mail, 
  MapPin, 
  Check, 
  X, 
  ShieldAlert, 
  UserPlus, 
  ArrowRight
} from 'lucide-react';

type TabType = 'members' | 'congregations' | 'visitors' | 'approvals';

export const SecretaryModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('members');

  // Estados de Membros
  const [members, setMembers] = useState<Member[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [searchMember, setSearchMember] = useState('');
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [newMember, setNewMember] = useState<Partial<Member>>({
    name: '',
    email: '',
    phone: '',
    birth_date: '',
    gender: 'male',
    marital_status: 'single',
    membership_status: 'active',
  });

  // Estados de Congregações
  const [congregations, setCongregations] = useState<Congregation[]>([]);
  const [loadingCongregations, setLoadingCongregations] = useState(false);
  const [showCongregationModal, setShowCongregationModal] = useState(false);
  const [newCongregation, setNewCongregation] = useState<Partial<Congregation>>({
    name: '',
    city: 'Manaus',
    state: 'AM',
    is_main: false,
  });

  // Estados de Visitantes
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [loadingVisitors, setLoadingVisitors] = useState(false);
  const [showVisitorModal, setShowVisitorModal] = useState(false);
  const [newVisitor, setNewVisitor] = useState<Partial<Visitor>>({
    name: '',
    phone: '',
    email: '',
    prayer_request: '',
  });

  // Estados de Aprovações Cadastrais
  const [requests, setRequests] = useState<MemberChangeRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [reviewNotes, setReviewNotes] = useState('');

  // Carregar dados de acordo com a aba ativa
  const loadTabData = async () => {
    if (activeTab === 'members') {
      setLoadingMembers(true);
      try {
        const data = await getMembersApi(searchMember);
        setMembers(data);
      } finally {
        setLoadingMembers(false);
      }
    } else if (activeTab === 'congregations') {
      setLoadingCongregations(true);
      try {
        const data = await getCongregationsApi();
        setCongregations(data);
      } finally {
        setLoadingCongregations(false);
      }
    } else if (activeTab === 'visitors') {
      setLoadingVisitors(true);
      try {
        const data = await getVisitorsApi();
        setVisitors(data);
      } finally {
        setLoadingVisitors(false);
      }
    } else if (activeTab === 'approvals') {
      setLoadingRequests(true);
      try {
        const data = await getChangeRequestsApi();
        setRequests(data);
      } finally {
        setLoadingRequests(false);
      }
    }
  };

  useEffect(() => {
    loadTabData();
  }, [activeTab, searchMember]);

  // Ações de Membros
  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMemberApi(newMember);
      setShowMemberModal(false);
      setNewMember({ name: '', email: '', phone: '', birth_date: '', gender: 'male' });
      loadTabData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erro ao cadastrar membro.');
    }
  };

  // Ações de Congregações
  const handleCreateCongregation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createCongregationApi(newCongregation);
      setShowCongregationModal(false);
      setNewCongregation({ name: '', city: 'Manaus', state: 'AM', is_main: false });
      loadTabData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erro ao cadastrar congregação.');
    }
  };

  // Ações de Visitantes
  const handleCreateVisitor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createVisitorApi(newVisitor);
      setShowVisitorModal(false);
      setNewVisitor({ name: '', phone: '', email: '', prayer_request: '' });
      loadTabData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erro ao cadastrar visitante.');
    }
  };

  const handleConvertVisitor = async (visitorId: number) => {
    if (!confirm('Deseja realmente converter este visitante em membro oficial da igreja?')) return;
    try {
      await convertVisitorToMemberApi(visitorId);
      alert('Visitante convertido em membro com sucesso!');
      loadTabData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erro na conversão.');
    }
  };

  // Ações de Aprovação
  const handleReviewRequest = async (requestId: number, action: 'approve' | 'reject') => {
    try {
      await reviewChangeRequestApi(requestId, action, reviewNotes);
      setReviewNotes('');
      alert(action === 'approve' ? 'Solicitação aprovada e dados do membro atualizados!' : 'Solicitação rejeitada.');
      loadTabData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Erro ao processar solicitação.');
    }
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      {/* Cabeçalho do Módulo */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Users size={24} color="var(--accent-primary)" />
          Secretaria Geral & Rol de Membros
        </h2>
        <p className="text-secondary" style={{ fontSize: '0.85rem' }}>
          Gestão eclesiástica de congregações, membros, famílias, visitantes e aprovação cadastral
        </p>
      </div>

      {/* Navegação por Abas */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--bg-card-border)', paddingBottom: '0.75rem', marginBottom: '1.5rem', overflowX: 'auto' }}>
        <button
          onClick={() => setActiveTab('members')}
          className={`btn ${activeTab === 'members' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
        >
          <Users size={16} />
          Membros ({members.length})
        </button>

        <button
          onClick={() => setActiveTab('congregations')}
          className={`btn ${activeTab === 'congregations' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
        >
          <Building2 size={16} />
          Congregações
        </button>

        <button
          onClick={() => setActiveTab('visitors')}
          className={`btn ${activeTab === 'visitors' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
        >
          <UserPlus size={16} />
          Visitantes
        </button>

        <button
          onClick={() => setActiveTab('approvals')}
          className={`btn ${activeTab === 'approvals' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
        >
          <FileCheck2 size={16} />
          Aprovações Cadastrais
          {requests.filter(r => r.status === 'pending').length > 0 && (
            <span style={{ 
              background: 'var(--danger)', 
              color: 'white', 
              fontSize: '0.7rem', 
              padding: '0.1rem 0.4rem', 
              borderRadius: '9999px',
              marginLeft: '0.3rem' 
            }}>
              {requests.filter(r => r.status === 'pending').length}
            </span>
          )}
        </button>
      </div>

      {/* ABA 1: MEMBROS */}
      {activeTab === 'members' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
            <div className="card" style={{ padding: '0.5rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.6rem', flex: 1, maxWidth: '400px' }}>
              <Search size={16} color="var(--text-muted)" />
              <input
                type="text"
                value={searchMember}
                onChange={(e) => setSearchMember(e.target.value)}
                placeholder="Pesquisar por nome, email ou telefone..."
                style={{ background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', width: '100%', fontSize: '0.85rem' }}
              />
            </div>

            <button onClick={() => setShowMemberModal(true)} className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
              <Plus size={16} />
              Novo Membro
            </button>
          </div>

          {loadingMembers ? (
            <div className="grid-cols-3">
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : members.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '2.5rem' }}>
              <Users size={36} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem auto' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Nenhum membro encontrado</h3>
              <p className="text-muted" style={{ fontSize: '0.85rem' }}>Cadastre os primeiros membros da sua congregação.</p>
            </div>
          ) : (
            <div className="grid-cols-3">
              {members.map((m) => (
                <div key={m.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{m.name}</h4>
                      <span className={`status-pill ${m.membership_status === 'active' ? 'status-online' : 'status-offline'}`}>
                        {m.membership_status === 'active' ? 'Ativo' : m.membership_status}
                      </span>
                    </div>

                    {m.is_minor && (
                      <div style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '0.3rem', 
                        background: 'var(--warning-bg)', 
                        color: 'var(--warning)', 
                        fontSize: '0.75rem', 
                        padding: '0.2rem 0.5rem', 
                        borderRadius: '6px',
                        marginBottom: '0.75rem' 
                      }}>
                        <ShieldAlert size={12} />
                        Menor de Idade (Proteção LGPD)
                      </div>
                    )}

                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      {m.email && <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Mail size={13} /> {m.email}</div>}
                      {m.phone && <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Phone size={13} /> {m.phone}</div>}
                      {m.congregation && <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Building2 size={13} /> {m.congregation.name}</div>}
                      {m.family && <div>Família: <strong>{m.family.name}</strong> ({m.family_role})</div>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ABA 2: CONGREGAÇÕES */}
      {activeTab === 'congregations' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            <button onClick={() => setShowCongregationModal(true)} className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
              <Plus size={16} />
              Nova Congregação
            </button>
          </div>

          {loadingCongregations ? (
            <div className="grid-cols-2">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : (
            <div className="grid-cols-2">
              {congregations.map((c) => (
                <div key={c.id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div>
                      <h4 style={{ fontSize: '1.2rem', fontWeight: 700 }}>{c.name}</h4>
                      <span className="text-muted" style={{ fontSize: '0.8rem' }}>slug: <code>{c.slug}</code></span>
                    </div>
                    {c.is_main ? (
                      <span className="status-pill status-online" style={{ background: 'var(--accent-glow)', color: 'var(--accent-primary)', border: '1px solid rgba(59, 130, 246, 0.4)' }}>
                        SEDE
                      </span>
                    ) : (
                      <span className="status-pill status-online">Filial</span>
                    )}
                  </div>

                  <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {c.leader_name && <div>Dirigente / Pastor: <strong>{c.leader_name}</strong></div>}
                    {c.address && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <MapPin size={14} /> {c.address}, {c.neighborhood} - {c.city}/{c.state}
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.5rem', fontWeight: 600 }}>
                      <Users size={14} color="var(--accent-primary)" />
                      Membros Ativos: {c.members_count ?? 0}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ABA 3: VISITANTES */}
      {activeTab === 'visitors' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            <button onClick={() => setShowVisitorModal(true)} className="btn btn-primary" style={{ fontSize: '0.85rem' }}>
              <Plus size={16} />
              Novo Visitante
            </button>
          </div>

          {loadingVisitors ? (
            <div className="grid-cols-2">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : visitors.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '2.5rem' }}>
              <UserPlus size={36} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem auto' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Nenhum visitante registrado</h3>
              <p className="text-muted" style={{ fontSize: '0.85rem' }}>Cadastre os visitantes para acolhimento e integração.</p>
            </div>
          ) : (
            <div className="grid-cols-2">
              {visitors.map((v) => (
                <div key={v.id} className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{v.name}</h4>
                      <span className={`status-pill ${v.status === 'converted' ? 'status-online' : ''}`} style={{
                        background: v.status === 'converted' ? 'var(--success-bg)' : 'var(--bg-tertiary)',
                        color: v.status === 'converted' ? 'var(--success)' : 'var(--accent-primary)',
                      }}>
                        {v.status === 'converted' ? 'Membro Integrado' : 'Visitante'}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.35rem', marginBottom: '1rem' }}>
                      {v.phone && <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Phone size={13} /> {v.phone}</div>}
                      {v.email && <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}><Mail size={13} /> {v.email}</div>}
                      {v.prayer_request && <div style={{ fontStyle: 'italic' }}>"{v.prayer_request}"</div>}
                      <div>Visitas Registradas: <strong>{v.visits?.length ?? 1}</strong></div>
                    </div>
                  </div>

                  {v.status !== 'converted' && (
                    <div style={{ borderTop: '1px solid var(--bg-card-border)', paddingTop: '0.75rem' }}>
                      <button
                        onClick={() => handleConvertVisitor(v.id)}
                        className="btn btn-secondary"
                        style={{ width: '100%', fontSize: '0.8rem', color: 'var(--success)', borderColor: 'rgba(16, 185, 129, 0.4)' }}
                      >
                        <UserCheck size={15} />
                        Converter em Membro Oficial
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ABA 4: APROVAÇÕES CADASTRAIS (FLUXO SECRETARIA) */}
      {activeTab === 'approvals' && (
        <div>
          {loadingRequests ? (
            <CardSkeleton />
          ) : requests.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '2.5rem' }}>
              <FileCheck2 size={36} color="var(--text-muted)" style={{ margin: '0 auto 0.75rem auto' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Nenhuma solicitação cadastral pendente</h3>
              <p className="text-muted" style={{ fontSize: '0.85rem' }}>Quando os membros solicitarem alterações de dados no portal, elas aparecerão aqui para análise.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {requests.map((req) => (
                <div key={req.id} className="card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
                    <div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                        Solicitação de Alteração: {req.member?.name}
                      </h4>
                      <span className="text-muted" style={{ fontSize: '0.8rem' }}>
                        Solicitado por: {req.requested_by?.email} • {new Date(req.created_at).toLocaleDateString('pt-BR')}
                      </span>
                    </div>

                    <span className={`status-pill ${
                      req.status === 'approved' ? 'status-online' : req.status === 'rejected' ? 'status-offline' : ''
                    }`} style={{
                      background: req.status === 'pending' ? 'var(--warning-bg)' : undefined,
                      color: req.status === 'pending' ? 'var(--warning)' : undefined,
                    }}>
                      {req.status === 'pending' ? 'Pendente de Análise' : req.status === 'approved' ? 'Aprovado' : 'Rejeitado'}
                    </span>
                  </div>

                  {/* Comparativo Antes vs Depois */}
                  <div style={{ background: 'var(--bg-secondary)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>
                    <strong style={{ fontSize: '0.8rem', textTransform: 'uppercase', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>
                      Campos Propostos vs Valor Anterior:
                    </strong>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {Object.entries(req.proposed_changes).map(([field, newVal]) => {
                        const originalVal = req.original_data ? req.original_data[field] : 'N/A';
                        return (
                          <div key={field} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.85rem' }}>
                            <code style={{ width: '120px', color: 'var(--accent-primary)' }}>{field}:</code>
                            <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)' }}>{originalVal || '(vazio)'}</span>
                            <ArrowRight size={14} color="var(--text-muted)" />
                            <strong style={{ color: 'var(--success)' }}>{newVal}</strong>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {req.status === 'pending' ? (
                    <div>
                      <div style={{ marginBottom: '0.75rem' }}>
                        <input
                          type="text"
                          value={reviewNotes}
                          onChange={(e) => setReviewNotes(e.target.value)}
                          placeholder="Observação da secretaria (obrigatório em caso de rejeição)..."
                          style={{
                            width: '100%',
                            padding: '0.55rem 0.75rem',
                            borderRadius: '8px',
                            border: '1px solid var(--bg-card-border)',
                            background: 'var(--bg-tertiary)',
                            color: 'var(--text-primary)',
                            fontSize: '0.85rem',
                            outline: 'none',
                          }}
                        />
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        <button
                          onClick={() => handleReviewRequest(req.id, 'reject')}
                          className="btn btn-secondary"
                          style={{ color: 'var(--danger)', fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                        >
                          <X size={15} />
                          Rejeitar
                        </button>
                        <button
                          onClick={() => handleReviewRequest(req.id, 'approve')}
                          className="btn btn-primary"
                          style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem' }}
                        >
                          <Check size={15} />
                          Aprovar Alteração
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      Analisado por: <strong>{req.reviewed_by?.name ?? 'Secretaria'}</strong> • Observação: {req.review_notes || 'Sem observações.'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal Cadastro de Membro */}
      {showMemberModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 100 }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>Cadastrar Novo Membro</h3>
            <form onSubmit={handleCreateMember} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Nome Completo *</label>
                <input
                  type="text"
                  required
                  value={newMember.name}
                  onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', background: 'var(--bg-secondary)', border: '1px solid var(--bg-card-border)', color: 'var(--text-primary)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Data de Nascimento</label>
                  <input
                    type="date"
                    value={newMember.birth_date || ''}
                    onChange={(e) => setNewMember({ ...newMember, birth_date: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', background: 'var(--bg-secondary)', border: '1px solid var(--bg-card-border)', color: 'var(--text-primary)' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Gênero</label>
                  <select
                    value={newMember.gender || 'male'}
                    onChange={(e) => setNewMember({ ...newMember, gender: e.target.value as 'male' | 'female' | 'other' })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', background: 'var(--bg-secondary)', border: '1px solid var(--bg-card-border)', color: 'var(--text-primary)' }}
                  >
                    <option value="male">Masculino</option>
                    <option value="female">Feminino</option>
                    <option value="other">Outro</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Telefone</label>
                  <input
                    type="text"
                    value={newMember.phone || ''}
                    onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
                    placeholder="(92) 99999-9999"
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', background: 'var(--bg-secondary)', border: '1px solid var(--bg-card-border)', color: 'var(--text-primary)' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>E-mail</label>
                  <input
                    type="email"
                    value={newMember.email || ''}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                    placeholder="membro@email.local"
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', background: 'var(--bg-secondary)', border: '1px solid var(--bg-card-border)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>


              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowMemberModal(false)} className="btn btn-secondary">Cancelar</button>
                <button type="submit" className="btn btn-primary">Salvar Membro</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Cadastro de Congregação */}
      {showCongregationModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 100 }}>
          <div className="card" style={{ width: '100%', maxWidth: '440px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>Cadastrar Nova Congregação</h3>
            <form onSubmit={handleCreateCongregation} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Nome da Congregação *</label>
                <input
                  type="text"
                  required
                  value={newCongregation.name}
                  onChange={(e) => setNewCongregation({ ...newCongregation, name: e.target.value })}
                  placeholder="Ex: Congregação Alvorada"
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', background: 'var(--bg-secondary)', border: '1px solid var(--bg-card-border)', color: 'var(--text-primary)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Cidade</label>
                  <input
                    type="text"
                    value={newCongregation.city || ''}
                    onChange={(e) => setNewCongregation({ ...newCongregation, city: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', background: 'var(--bg-secondary)', border: '1px solid var(--bg-card-border)', color: 'var(--text-primary)' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>UF</label>
                  <input
                    type="text"
                    maxLength={2}
                    value={newCongregation.state || ''}
                    onChange={(e) => setNewCongregation({ ...newCongregation, state: e.target.value })}
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', background: 'var(--bg-secondary)', border: '1px solid var(--bg-card-border)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                <input
                  type="checkbox"
                  id="is_main"
                  checked={newCongregation.is_main || false}
                  onChange={(e) => setNewCongregation({ ...newCongregation, is_main: e.target.checked })}
                />
                <label htmlFor="is_main" style={{ fontSize: '0.85rem' }}>Esta é a Sede Principal</label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowCongregationModal(false)} className="btn btn-secondary">Cancelar</button>
                <button type="submit" className="btn btn-primary">Salvar Congregação</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Cadastro de Visitante */}
      {showVisitorModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', zIndex: 100 }}>
          <div className="card" style={{ width: '100%', maxWidth: '440px' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>Registrar Novo Visitante</h3>
            <form onSubmit={handleCreateVisitor} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Nome do Visitante *</label>
                <input
                  type="text"
                  required
                  value={newVisitor.name || ''}
                  onChange={(e) => setNewVisitor({ ...newVisitor, name: e.target.value })}
                  placeholder="Nome do visitante"
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', background: 'var(--bg-secondary)', border: '1px solid var(--bg-card-border)', color: 'var(--text-primary)' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Telefone / WhatsApp</label>
                  <input
                    type="text"
                    value={newVisitor.phone || ''}
                    onChange={(e) => setNewVisitor({ ...newVisitor, phone: e.target.value })}
                    placeholder="(92) 99999-9999"
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', background: 'var(--bg-secondary)', border: '1px solid var(--bg-card-border)', color: 'var(--text-primary)' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>E-mail</label>
                  <input
                    type="email"
                    value={newVisitor.email || ''}
                    onChange={(e) => setNewVisitor({ ...newVisitor, email: e.target.value })}
                    placeholder="visitante@email.local"
                    style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', background: 'var(--bg-secondary)', border: '1px solid var(--bg-card-border)', color: 'var(--text-primary)' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: 600 }}>Pedido de Oração (Opcional)</label>
                <input
                  type="text"
                  value={newVisitor.prayer_request || ''}
                  onChange={(e) => setNewVisitor({ ...newVisitor, prayer_request: e.target.value })}
                  placeholder="Motivo de oração compartilhado"
                  style={{ width: '100%', padding: '0.55rem', borderRadius: '6px', background: 'var(--bg-secondary)', border: '1px solid var(--bg-card-border)', color: 'var(--text-primary)' }}
                />
              </div>


              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowVisitorModal(false)} className="btn btn-secondary">Cancelar</button>
                <button type="submit" className="btn btn-primary">Salvar Visitante</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
