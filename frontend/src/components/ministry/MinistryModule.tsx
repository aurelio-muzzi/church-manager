import React, { useEffect, useState } from 'react';
import type { 
  ConflictCheckResult, 
  Ministry, 
  Schedule 
} from '../../types/ministry';
import type { Member } from '../../types/secretary';
import { 
  addMinistryVolunteerApi,
  checkScheduleConflictApi,
  createMinistryApi,
  createScheduleApi,
  getMinistriesApi,
  getSchedulesApi,
  respondScheduleApi
} from '../../services/ministryApi';
import { getMembersApi } from '../../services/secretaryApi';
import { CardSkeleton } from '../ui/Skeleton';
import { 
  Users, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  UserCheck, 
  RefreshCw, 
  Layers 
} from 'lucide-react';

type TabType = 'ministries' | 'schedules' | 'volunteers' | 'confirmations';

export const MinistryModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('schedules');

  // Estados de Ministérios
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [loadingMinistries, setLoadingMinistries] = useState(false);
  const [showMinistryModal, setShowMinistryModal] = useState(false);
  const [newMinistry, setNewMinistry] = useState({
    name: '',
    description: '',
    color: '#3b82f6',
    roles: '',
  });

  // Estados de Escalas
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loadingSchedules, setLoadingSchedules] = useState(false);
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [newSchedule, setNewSchedule] = useState({
    ministry_id: '',
    title: '',
    date: new Date().toISOString().split('T')[0],
    start_time: '18:00',
    end_time: '20:00',
    notes: '',
    selectedMemberId: '',
  });
  const [stagedVolunteers, setStagedVolunteers] = useState<{ member_id: number; name: string }[]>([]);
  const [conflictWarning, setConflictWarning] = useState<ConflictCheckResult | null>(null);
  const [checkingConflict, setCheckingConflict] = useState(false);
  const [submittingSchedule, setSubmittingSchedule] = useState(false);

  // Estados de Associação de Voluntário
  const [showVolunteerModal, setShowVolunteerModal] = useState(false);
  const [selectedMinistryId, setSelectedMinistryId] = useState('');
  const [volunteerMemberId, setVolunteerMemberId] = useState('');

  // Estados de Confirmação / Recusa
  const [declineReason, setDeclineReason] = useState('');
  const [selectedVolunteerForAction, setSelectedVolunteerForAction] = useState<number | null>(null);

  // Estados globais de feedback
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadData = async () => {
    setActionSuccess(null);
    setActionError(null);

    try {
      if (activeTab === 'ministries' || activeTab === 'volunteers') {
        setLoadingMinistries(true);
        const minData = await getMinistriesApi();
        setMinistries(minData);
      }

      if (activeTab === 'schedules' || activeTab === 'confirmations') {
        setLoadingSchedules(true);
        const schedData = await getSchedulesApi();
        setSchedules(schedData);
      }

      // Pré-carrega membros e ministérios se modal for aberto
      const memData = await getMembersApi();
      setMembers(memData);
      const minData = await getMinistriesApi();
      setMinistries(minData);
    } catch (err: any) {
      setActionError(err.message || 'Falha ao sincronizar dados do módulo.');
    } finally {
      setLoadingMinistries(false);
      setLoadingSchedules(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeTab]);

  // Verificar conflito em tempo real ao selecionar voluntário para a nova escala
  const handleCheckVolunteerConflict = async (memberId: number) => {
    if (!memberId || !newSchedule.date || !newSchedule.start_time || !newSchedule.end_time) return;

    setCheckingConflict(true);
    setConflictWarning(null);
    try {
      const result = await checkScheduleConflictApi({
        member_id: memberId,
        date: newSchedule.date,
        start_time: newSchedule.start_time,
        end_time: newSchedule.end_time,
      });

      if (result.has_conflict) {
        setConflictWarning(result);
      } else {
        setConflictWarning(null);
      }
    } catch {
      // Ignora erro silencioso no check prévio
    } finally {
      setCheckingConflict(false);
    }
  };

  const handleAddVolunteerToStage = async () => {
    const memId = Number(newSchedule.selectedMemberId);
    if (!memId) return;

    const memberObj = members.find(m => m.id === memId);
    if (!memberObj) return;

    if (stagedVolunteers.some(v => v.member_id === memId)) {
      setActionError('Este membro já foi adicionado na lista desta escala.');
      return;
    }

    setStagedVolunteers(prev => [...prev, { member_id: memId, name: memberObj.name }]);
    setNewSchedule(prev => ({ ...prev, selectedMemberId: '' }));
  };

  const handleCreateMinistry = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    try {
      const rolesArray = newMinistry.roles
        .split(',')
        .map(r => r.trim())
        .filter(r => r.length > 0)
        .map(name => ({ name }));

      await createMinistryApi({
        name: newMinistry.name,
        description: newMinistry.description,
        color: newMinistry.color,
        roles: rolesArray,
      });

      setActionSuccess('Ministério cadastrado com sucesso!');
      setShowMinistryModal(false);
      setNewMinistry({ name: '', description: '', color: '#3b82f6', roles: '' });
      loadData();
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  const handleCreateSchedule = async (allowForcedConflict = false) => {
    setActionError(null);
    if (!newSchedule.ministry_id) {
      setActionError('Selecione o ministério.');
      return;
    }
    if (!newSchedule.title) {
      setActionError('Informe o título da escala.');
      return;
    }

    setSubmittingSchedule(true);
    try {
      await createScheduleApi({
        ministry_id: Number(newSchedule.ministry_id),
        title: newSchedule.title,
        date: newSchedule.date,
        start_time: newSchedule.start_time,
        end_time: newSchedule.end_time,
        notes: newSchedule.notes,
        volunteers: stagedVolunteers.map(v => ({ member_id: v.member_id })),
        allow_conflicts: allowForcedConflict,
      });

      setActionSuccess('Escala criada e publicada com sucesso!');
      setShowScheduleModal(false);
      setConflictWarning(null);
      setStagedVolunteers([]);
      setNewSchedule({
        ministry_id: '',
        title: '',
        date: new Date().toISOString().split('T')[0],
        start_time: '18:00',
        end_time: '20:00',
        notes: '',
        selectedMemberId: '',
      });
      loadData();
    } catch (err: any) {
      if (err.conflict) {
        setConflictWarning({ has_conflict: true, conflict: err.conflict });
      }
      setActionError(err.message);
    } finally {
      setSubmittingSchedule(false);
    }
  };

  const handleAddVolunteerToMinistry = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    try {
      const minId = Number(selectedMinistryId);
      const memId = Number(volunteerMemberId);
      if (!minId || !memId) return;

      await addMinistryVolunteerApi(minId, { member_id: memId });
      setActionSuccess('Voluntário associado ao ministério com sucesso!');
      setShowVolunteerModal(false);
      setSelectedMinistryId('');
      setVolunteerMemberId('');
      loadData();
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  const handleRespondSchedule = async (scheduleId: number, volunteerId: number, action: 'confirm' | 'decline') => {
    setActionError(null);
    try {
      if (action === 'decline' && !declineReason) {
        setActionError('Por favor informe o motivo da recusa.');
        return;
      }

      await respondScheduleApi(scheduleId, volunteerId, {
        action,
        decline_reason: action === 'decline' ? declineReason : undefined,
      });

      setActionSuccess(action === 'confirm' ? 'Presença confirmada na escala!' : 'Recusa registrada com sucesso.');
      setSelectedVolunteerForAction(null);
      setDeclineReason('');
      loadData();
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho do Módulo */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-violet-500/10 text-violet-400 border border-violet-500/20">
              Etapa 04
            </span>
            <span className="text-slate-400 text-xs">Gestão Ministerial & Escalas</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-100 flex items-center gap-3">
            <Layers className="w-7 h-7 text-violet-400" />
            Ministérios e Voluntários
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Gestão de departamentos, equipes de servos, escalas inteligentes e prevenção de sobreposição de horários.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowScheduleModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-violet-600/20"
          >
            <Plus className="w-4 h-4" />
            Nova Escala
          </button>
          <button
            onClick={() => setShowMinistryModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-sm font-semibold transition-all"
          >
            <Plus className="w-4 h-4" />
            Novo Ministério
          </button>
          <button
            onClick={loadData}
            title="Sincronizar dados"
            className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 rounded-xl transition-all"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Alertas de Ação */}
      {actionSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 text-emerald-400 text-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}
      {actionError && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-400 text-sm">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Navegação por Abas */}
      <div className="flex border-b border-slate-800 overflow-x-auto gap-2">
        <button
          onClick={() => setActiveTab('schedules')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'schedules'
              ? 'border-violet-500 text-violet-400 bg-violet-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          Escalas de Serviço ({schedules.length})
        </button>

        <button
          onClick={() => setActiveTab('ministries')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'ministries'
              ? 'border-violet-500 text-violet-400 bg-violet-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          Ministérios ({ministries.length})
        </button>

        <button
          onClick={() => setActiveTab('volunteers')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'volunteers'
              ? 'border-violet-500 text-violet-400 bg-violet-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-4 h-4" />
          Equipes & Voluntários
        </button>

        <button
          onClick={() => setActiveTab('confirmations')}
          className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'confirmations'
              ? 'border-violet-500 text-violet-400 bg-violet-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          Confirmações de Presença
        </button>
      </div>

      {/* ABA 1: ESCALAS DE SERVIÇO */}
      {activeTab === 'schedules' && (
        <div className="space-y-4">
          {loadingSchedules ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : schedules.length === 0 ? (
            <div className="text-center py-16 bg-slate-900 border border-slate-800 rounded-2xl">
              <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-300 font-semibold text-lg">Nenhuma escala cadastrada</p>
              <p className="text-slate-500 text-sm mt-1 max-w-md mx-auto">
                Crie a primeira escala clicando em "Nova Escala" acima. O sistema alertará automaticamente se houver voluntários com conflito de horário.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {schedules.map(sch => (
                <div
                  key={sch.id}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all shadow-md flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: sch.ministry?.color || '#3b82f6' }}
                          />
                          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                            {sch.ministry?.name || 'Ministério'}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-100">{sch.title}</h3>
                      </div>

                      <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                        sch.status === 'published' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        sch.status === 'completed' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                        'bg-slate-800 text-slate-400 border border-slate-700'
                      }`}>
                        {sch.status === 'published' ? 'Publicada' : sch.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-400 mb-4 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-violet-400" />
                        <span>{sch.date}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        <span>{sch.start_time} às {sch.end_time}</span>
                      </div>
                    </div>

                    {sch.notes && (
                      <p className="text-xs text-slate-400 italic mb-4 bg-slate-950/30 p-2 rounded-lg border border-slate-800/50">
                        "{sch.notes}"
                      </p>
                    )}

                    {/* Voluntários Escalados */}
                    <div>
                      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-violet-400" />
                        Voluntários Escalados ({sch.volunteers?.length || 0})
                      </h4>
                      <div className="space-y-2">
                        {sch.volunteers && sch.volunteers.length > 0 ? (
                          sch.volunteers.map(vol => (
                            <div
                              key={vol.id}
                              className="flex items-center justify-between p-2.5 bg-slate-950/40 rounded-xl border border-slate-800/70 text-sm"
                            >
                              <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300 text-xs">
                                  {vol.member?.name.charAt(0)}
                                </div>
                                <div>
                                  <p className="text-slate-200 font-medium text-xs">{vol.member?.name}</p>
                                  <p className="text-[11px] text-slate-500">{vol.role?.name || 'Voluntário'}</p>
                                </div>
                              </div>

                              <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                                vol.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                                vol.status === 'declined' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                                vol.status === 'substituted' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                                'bg-slate-800 text-slate-400 border border-slate-700'
                              }`}>
                                {vol.status === 'confirmed' ? 'Confirmado' :
                                 vol.status === 'declined' ? 'Recusou' :
                                 vol.status === 'substituted' ? 'Substituído' : 'Pendente'}
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-slate-500">Nenhum voluntário escalado ainda.</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ABA 2: MINISTÉRIOS */}
      {activeTab === 'ministries' && (
        loadingMinistries ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ministries.map(min => (
            <div
              key={min.id}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition-all shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-4 h-4 rounded-full shadow-sm"
                      style={{ backgroundColor: min.color }}
                    />
                    <h3 className="text-base font-bold text-slate-100">{min.name}</h3>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 text-xs rounded-full border border-emerald-500/20">
                    Ativo
                  </span>
                </div>

                <p className="text-xs text-slate-400 line-clamp-2 mb-4">
                  {min.description || 'Sem descrição cadastrada.'}
                </p>

                {/* Líder */}
                <div className="mb-4 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800">
                  <span className="text-[11px] text-slate-500 block uppercase font-semibold">Líder</span>
                  <p className="text-xs font-medium text-slate-200">
                    {min.leader?.name || 'Não atribuído'}
                  </p>
                </div>

                {/* Funções do Ministério */}
                {min.roles && min.roles.length > 0 && (
                  <div className="mb-4">
                    <span className="text-[11px] text-slate-500 block uppercase font-semibold mb-1.5">Funções Cadastradas</span>
                    <div className="flex flex-wrap gap-1.5">
                      {min.roles.map(r => (
                        <span key={r.id} className="px-2 py-0.5 bg-slate-800/80 text-slate-300 rounded text-[11px] border border-slate-700/60">
                          {r.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
                <span>{min.volunteers_count || 0} voluntários associados</span>
                <button
                  onClick={() => {
                    setSelectedMinistryId(String(min.id));
                    setShowVolunteerModal(true);
                  }}
                  className="text-violet-400 hover:text-violet-300 font-medium flex items-center gap-1"
                >
                  + Adicionar Voluntário
                </button>
              </div>
            </div>
          ))}
        </div>
        )
      )}

      {/* ABA 3: EQUIPES & VOLUNTÁRIOS */}
      {activeTab === 'volunteers' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-slate-100">Quadro de Servos e Voluntários</h3>
              <p className="text-slate-400 text-xs">Membros cadastrados aptos a servir nos departamentos da igreja</p>
            </div>
            <button
              onClick={() => setShowVolunteerModal(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-semibold transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              Associar Membro
            </button>
          </div>

          <div className="divide-y divide-slate-800">
            {members.slice(0, 10).map(m => (
              <div key={m.id} className="py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center font-bold text-violet-400 text-sm">
                    {m.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-200">{m.name}</p>
                    <p className="text-xs text-slate-500">{m.email || m.phone || 'Sem contato direto'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full text-xs font-medium">
                    Membro Ativo
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ABA 4: CONFIRMAÇÕES DE ESCALA (PORTAL DO VOLUNTÁRIO) */}
      {activeTab === 'confirmations' && (
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-100 mb-1">Central de Confirmação de Escalas</h3>
            <p className="text-slate-400 text-xs mb-6">
              Simule a resposta dos voluntários escalados: confirme presença ou recuse informando justificativa formal.
            </p>

            <div className="space-y-4">
              {schedules.map(sch => (
                <div key={sch.id} className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="text-sm font-bold text-slate-200">{sch.title}</h4>
                      <p className="text-xs text-slate-400">{sch.date} • {sch.start_time} às {sch.end_time}</p>
                    </div>
                    <span className="text-xs text-slate-400 bg-slate-900 px-2 py-1 rounded border border-slate-800">
                      {sch.ministry?.name}
                    </span>
                  </div>

                  <div className="space-y-2.5 pt-2 border-t border-slate-800/80">
                    {sch.volunteers?.map(vol => (
                      <div key={vol.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-slate-900 rounded-lg border border-slate-800">
                        <div className="flex items-center gap-2.5">
                          <UserCheck className="w-4 h-4 text-violet-400" />
                          <div>
                            <span className="text-xs font-semibold text-slate-200">{vol.member?.name}</span>
                            <span className="text-[11px] text-slate-500 block">Status: {vol.status}</span>
                            {vol.decline_reason && (
                              <span className="text-[11px] text-rose-400 italic block">Motivo: "{vol.decline_reason}"</span>
                            )}
                          </div>
                        </div>

                        {vol.status === 'pending' ? (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleRespondSchedule(sch.id, vol.id, 'confirm')}
                              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-medium flex items-center gap-1 transition-all"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Confirmar
                            </button>

                            {selectedVolunteerForAction === vol.id ? (
                              <div className="flex items-center gap-1">
                                <input
                                  type="text"
                                  placeholder="Motivo da recusa..."
                                  value={declineReason}
                                  onChange={e => setDeclineReason(e.target.value)}
                                  className="px-2 py-1 bg-slate-950 border border-slate-700 rounded text-xs text-slate-200"
                                />
                                <button
                                  onClick={() => handleRespondSchedule(sch.id, vol.id, 'decline')}
                                  className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded text-xs"
                                >
                                  Salvar
                                </button>
                                <button
                                  onClick={() => setSelectedVolunteerForAction(null)}
                                  className="px-2 py-1 text-slate-400 text-xs"
                                >
                                  Cancelar
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setSelectedVolunteerForAction(vol.id)}
                                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-rose-400 border border-slate-700 rounded text-xs font-medium flex items-center gap-1 transition-all"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                Recusar
                              </button>
                            )}
                          </div>
                        ) : (
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                            vol.status === 'confirmed' ? 'text-emerald-400 bg-emerald-500/10' : 'text-rose-400 bg-rose-500/10'
                          }`}>
                            Respondido ({vol.status})
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NOVA ESCALA COM DETECTOR DE CONFLITOS */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-violet-400" />
                Nova Escala de Serviço
              </h3>
              <button
                onClick={() => {
                  setShowScheduleModal(false);
                  setConflictWarning(null);
                }}
                className="text-slate-400 hover:text-slate-200"
              >
                ✕
              </button>
            </div>

            {/* Aviso Chamativo de Conflito de Horário */}
            {conflictWarning?.has_conflict && conflictWarning.conflict && (
              <div className="p-4 bg-amber-500/10 border-2 border-amber-500/30 rounded-xl space-y-2">
                <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
                  <AlertTriangle className="w-5 h-5 shrink-0 animate-bounce" />
                  <span>CONFLITO DE ESCALA DETECTADO!</span>
                </div>
                <p className="text-xs text-slate-300">
                  {conflictWarning.conflict.message}
                </p>
                <div className="bg-slate-950/60 p-2.5 rounded-lg border border-amber-500/20 text-xs text-slate-400">
                  <p><strong className="text-slate-200">Escala em conflito:</strong> {conflictWarning.conflict.schedule_title}</p>
                  <p><strong className="text-slate-200">Ministério:</strong> {conflictWarning.conflict.ministry_name}</p>
                  <p><strong className="text-slate-200">Horário:</strong> {conflictWarning.conflict.start_time} às {conflictWarning.conflict.end_time}</p>
                </div>
                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setConflictWarning(null)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs"
                  >
                    Ajustar Voluntários
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCreateSchedule(true)}
                    className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold"
                  >
                    Forçar Gravação Mesmo com Conflito
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Ministério *</label>
                <select
                  value={newSchedule.ministry_id}
                  onChange={e => setNewSchedule(prev => ({ ...prev, ministry_id: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500"
                >
                  <option value="">Selecione o ministério...</option>
                  {ministries.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Título do Evento / Culto *</label>
                <input
                  type="text"
                  placeholder="Ex: Culto de Celebração Noturno"
                  value={newSchedule.title}
                  onChange={e => setNewSchedule(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Data *</label>
                  <input
                    type="date"
                    value={newSchedule.date}
                    onChange={e => setNewSchedule(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Início *</label>
                  <input
                    type="time"
                    value={newSchedule.start_time}
                    onChange={e => setNewSchedule(prev => ({ ...prev, start_time: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Término *</label>
                  <input
                    type="time"
                    value={newSchedule.end_time}
                    onChange={e => setNewSchedule(prev => ({ ...prev, end_time: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500"
                  />
                </div>
              </div>

              {/* Seletor de Voluntários com verificação de conflito */}
              <div className="border border-slate-800 bg-slate-950/40 p-3.5 rounded-xl space-y-3">
                <label className="block text-xs font-semibold text-slate-300">Adicionar Voluntários na Escala</label>
                <div className="flex gap-2">
                  <select
                    value={newSchedule.selectedMemberId}
                    onChange={e => {
                      const id = e.target.value;
                      setNewSchedule(prev => ({ ...prev, selectedMemberId: id }));
                      if (id) handleCheckVolunteerConflict(Number(id));
                    }}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500"
                  >
                    <option value="">Selecione um membro...</option>
                    {members.map(m => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleAddVolunteerToStage}
                    disabled={!newSchedule.selectedMemberId || checkingConflict}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 rounded-xl text-xs font-semibold"
                  >
                    {checkingConflict ? 'Verificando...' : 'Adicionar'}
                  </button>
                </div>

                {/* Lista de Voluntários Estagiados */}
                {stagedVolunteers.length > 0 && (
                  <div className="space-y-1.5 pt-2">
                    <span className="text-[11px] text-slate-500 block">Voluntários escalados:</span>
                    <div className="flex flex-wrap gap-2">
                      {stagedVolunteers.map(v => (
                        <span
                          key={v.member_id}
                          className="flex items-center gap-1.5 px-2.5 py-1 bg-violet-500/10 text-violet-300 border border-violet-500/20 rounded-lg text-xs"
                        >
                          {v.name}
                          <button
                            type="button"
                            onClick={() => setStagedVolunteers(prev => prev.filter(x => x.member_id !== v.member_id))}
                            className="text-violet-400 hover:text-rose-400 font-bold ml-1"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Orientações / Notas</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Chegar com 30min de antecedência para ensaio..."
                  value={newSchedule.notes}
                  onChange={e => setNewSchedule(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-semibold transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => handleCreateSchedule(false)}
                  disabled={submittingSchedule}
                  className="px-5 py-2 bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-violet-600/20"
                >
                  {submittingSchedule ? 'Salvando...' : 'Publicar Escala'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: NOVO MINISTÉRIO */}
      {showMinistryModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Layers className="w-5 h-5 text-violet-400" />
                Cadastrar Ministério
              </h3>
              <button onClick={() => setShowMinistryModal(false)} className="text-slate-400 hover:text-slate-200">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateMinistry} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Nome do Ministério *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Louvor & Adoração"
                  value={newMinistry.name}
                  onChange={e => setNewMinistry(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Descrição</label>
                <textarea
                  rows={2}
                  placeholder="Objetivo e atribuições do ministério..."
                  value={newMinistry.description}
                  onChange={e => setNewMinistry(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Funções Iniciais (separadas por vírgula)</label>
                <input
                  type="text"
                  placeholder="Ex: Vocal, Guitarra, Bateria, Teclado"
                  value={newMinistry.roles}
                  onChange={e => setNewMinistry(prev => ({ ...prev, roles: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Cor de Destaque</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={newMinistry.color}
                    onChange={e => setNewMinistry(prev => ({ ...prev, color: e.target.value }))}
                    className="w-10 h-10 rounded-lg cursor-pointer bg-transparent border-0"
                  />
                  <span className="text-xs text-slate-400">{newMinistry.color}</span>
                </div>
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowMinistryModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-semibold transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-violet-600/20"
                >
                  Salvar Ministério
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ASSOCIAR VOLUNTÁRIO AO MINISTÉRIO */}
      {showVolunteerModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Users className="w-5 h-5 text-violet-400" />
                Associar Voluntário
              </h3>
              <button onClick={() => setShowVolunteerModal(false)} className="text-slate-400 hover:text-slate-200">
                ✕
              </button>
            </div>

            <form onSubmit={handleAddVolunteerToMinistry} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Ministério *</label>
                <select
                  required
                  value={selectedMinistryId}
                  onChange={e => setSelectedMinistryId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500"
                >
                  <option value="">Selecione o ministério...</option>
                  {ministries.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Membro *</label>
                <select
                  required
                  value={volunteerMemberId}
                  onChange={e => setVolunteerMemberId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-violet-500"
                >
                  <option value="">Selecione o membro...</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowVolunteerModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-sm font-semibold transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-violet-600/20"
                >
                  Confirmar Associação
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
