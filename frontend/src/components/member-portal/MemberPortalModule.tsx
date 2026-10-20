import React, { useEffect, useState } from 'react';
import type {
  ChurchNotice,
  MemberContributionsData,
  MemberDashboardData,
  MemberEventsData,
  MemberFullProfile,
  MemberPortalSchedule,
  PrayerRequest,
} from '../../types/memberPortal';
import {
  createMemberPrayerRequestApi,
  getChurchNoticesApi,
  getMemberContributionsApi,
  getMemberDashboardApi,
  getMemberEventsApi,
  getMemberPrayerRequestsApi,
  getMemberProfileApi,
  getMemberSchedulesApi,
  registerMemberEventApi,
  requestMemberProfileUpdateApi,
  respondMemberScheduleApi,
} from '../../services/memberPortalApi';
import {
  AlertCircle,
  Bell,
  Calendar,
  CheckCircle2,
  Clock,
  Copy,
  DollarSign,
  HeartHandshake,
  Layers,
  MapPin,
  Pin,
  Plus,
  QrCode,
  RefreshCw,
  Send,
  Shield,
  Tag,
  User,
  UserCheck,
  XCircle,
} from 'lucide-react';

type PortalTab = 'dashboard' | 'schedules' | 'events' | 'prayers' | 'notices' | 'contributions' | 'profile';

export const MemberPortalModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<PortalTab>('dashboard');
  const [loading, setLoading] = useState(false);

  // Estados principais
  const [dashboard, setDashboard] = useState<MemberDashboardData | null>(null);
  const [schedules, setSchedules] = useState<MemberPortalSchedule[]>([]);
  const [eventsData, setEventsData] = useState<MemberEventsData | null>(null);
  const [prayers, setPrayers] = useState<PrayerRequest[]>([]);
  const [notices, setNotices] = useState<ChurchNotice[]>([]);
  const [contributions, setContributions] = useState<MemberContributionsData | null>(null);
  const [profile, setProfile] = useState<MemberFullProfile | null>(null);

  // Filtro de avisos
  const [selectedNoticeCategory, setSelectedNoticeCategory] = useState<string>('all');

  // Modais
  const [showPrayerModal, setShowPrayerModal] = useState(false);
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [selectedScheduleId, setSelectedScheduleId] = useState<number | null>(null);
  const [declineReason, setDeclineReason] = useState('');

  // Form de Oração
  const [newPrayer, setNewPrayer] = useState({
    title: '',
    description: '',
    is_confidential: false,
  });

  // Form de Perfil
  const [profileForm, setProfileForm] = useState({
    phone: '',
    marital_status: '',
    address: '',
    neighborhood: '',
    city: '',
    state: '',
    postal_code: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
  });

  // Notificações
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  const notify = (msg: string, isError = false) => {
    if (isError) {
      setErrorMessage(msg);
      setTimeout(() => setErrorMessage(null), 5000);
    } else {
      setSuccessMessage(msg);
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  const formatBRL = (val: number | string) => {
    const num = typeof val === 'string' ? parseFloat(val) : val;
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(isNaN(num) ? 0 : num);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    const parts = dateStr.split('T')[0].split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return dateStr;
  };

  const loadAll = async () => {
    setLoading(true);
    try {
      const [dashData, schedData, evData, prayData, notData, contData, profData] = await Promise.all([
        getMemberDashboardApi(),
        getMemberSchedulesApi(),
        getMemberEventsApi(),
        getMemberPrayerRequestsApi(),
        getChurchNoticesApi(),
        getMemberContributionsApi(),
        getMemberProfileApi(),
      ]);

      setDashboard(dashData);
      setSchedules(schedData);
      setEventsData(evData);
      setPrayers(prayData);
      setNotices(notData);
      setContributions(contData);
      setProfile(profData);

      if (profData) {
        setProfileForm({
          phone: profData.phone || '',
          marital_status: profData.marital_status || '',
          address: profData.address || '',
          neighborhood: profData.neighborhood || '',
          city: profData.city || '',
          state: profData.state || '',
          postal_code: profData.postal_code || '',
          emergency_contact_name: profData.emergency_contact_name || '',
          emergency_contact_phone: profData.emergency_contact_phone || '',
        });
      }
    } catch (err: unknown) {
      const error = err as Error;
      notify(error.message || 'Erro ao carregar dados do portal do membro.', true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleConfirmSchedule = async (scheduleVolunteerId: number) => {
    try {
      await respondMemberScheduleApi(scheduleVolunteerId, 'confirmed');
      notify('Presença na escala confirmada com sucesso!');
      await loadAll();
    } catch (err: unknown) {
      const error = err as Error;
      notify(error.message || 'Erro ao confirmar escala.', true);
    }
  };

  const handleDeclineSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedScheduleId || !declineReason.trim()) {
      notify('Por favor, informe a justificativa da recusa.', true);
      return;
    }

    try {
      await respondMemberScheduleApi(selectedScheduleId, 'declined', declineReason);
      notify('Escala recusada. Sua liderança ministerial foi notificada.');
      setShowDeclineModal(false);
      setSelectedScheduleId(null);
      setDeclineReason('');
      await loadAll();
    } catch (err: unknown) {
      const error = err as Error;
      notify(error.message || 'Erro ao recusar escala.', true);
    }
  };

  const handleRegisterEvent = async (eventId: number) => {
    try {
      const reg = await registerMemberEventApi(eventId);
      notify(`Inscrição confirmada com sucesso! Código: ${reg.qr_code_token}`);
      await loadAll();
    } catch (err: unknown) {
      const error = err as Error;
      notify(error.message || 'Erro ao inscrever-se no evento.', true);
    }
  };

  const handleCreatePrayer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrayer.title.trim() || !newPrayer.description.trim()) {
      notify('Preencha o título e a descrição do pedido de oração.', true);
      return;
    }

    try {
      await createMemberPrayerRequestApi(newPrayer);
      notify('Seu pedido de oração foi enviado para nossa equipe de intercessão!');
      setShowPrayerModal(false);
      setNewPrayer({ title: '', description: '', is_confidential: false });
      await loadAll();
    } catch (err: unknown) {
      const error = err as Error;
      notify(error.message || 'Erro ao enviar pedido de oração.', true);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await requestMemberProfileUpdateApi(profileForm);
      notify('Solicitação de atualização enviada para a secretaria da igreja!');
    } catch (err: unknown) {
      const error = err as Error;
      notify(error.message || 'Erro ao solicitar atualização.', true);
    }
  };

  const copyToClipboard = (token: string) => {
    navigator.clipboard.writeText(token);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 3000);
  };

  const filteredNotices = notices.filter((n) => {
    if (selectedNoticeCategory === 'all') return true;
    return n.category === selectedNoticeCategory;
  });

  return (
    <div className="space-y-6">
      {/* Mensagens de Notificação */}
      {successMessage && (
        <div className="bg-emerald-900/40 border border-emerald-500/50 text-emerald-200 px-4 py-3 rounded-xl flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span className="text-sm font-medium">{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-400 hover:text-emerald-200 text-sm">
            &times;
          </button>
        </div>
      )}

      {errorMessage && (
        <div className="bg-rose-900/40 border border-rose-500/50 text-rose-200 px-4 py-3 rounded-xl flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-400" />
            <span className="text-sm font-medium">{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-rose-400 hover:text-rose-200 text-sm">
            &times;
          </button>
        </div>
      )}

      {/* Header do Portal do Membro */}
      <div className="dash-header flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-300 border border-blue-500/20">
              Portal do Membro
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">Ambiente de Autoatendimento</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mt-1.5 flex items-center gap-2">
            Olá, {dashboard?.member.name || 'Irmão(ã)'}!
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Acompanhe suas escalas ministeriais, inscrições em cultos, pedidos de oração e comunicados da liderança.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadAll}
            disabled={loading}
            className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs flex items-center gap-2 font-medium transition shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
        </div>
      </div>

      {/* Navegação de Abas */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 overflow-x-auto pb-2">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`dash-tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
        >
          <User className="w-4 h-4" />
          Visão Geral & Cartão
        </button>

        <button
          onClick={() => setActiveTab('schedules')}
          className={`dash-tab-btn ${activeTab === 'schedules' ? 'active' : ''}`}
        >
          <Layers className="w-4 h-4" />
          Minhas Escalas
          {(dashboard?.pending_schedules_count ?? 0) > 0 && (
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30">
              {dashboard?.pending_schedules_count}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('events')}
          className={`dash-tab-btn ${activeTab === 'events' ? 'active' : ''}`}
        >
          <QrCode className="w-4 h-4" />
          Meus Eventos & QR Code
        </button>

        <button
          onClick={() => setActiveTab('prayers')}
          className={`dash-tab-btn ${activeTab === 'prayers' ? 'active' : ''}`}
        >
          <HeartHandshake className="w-4 h-4" />
          Pedidos de Oração
        </button>

        <button
          onClick={() => setActiveTab('notices')}
          className={`dash-tab-btn ${activeTab === 'notices' ? 'active' : ''}`}
        >
          <Bell className="w-4 h-4" />
          Mural de Avisos
        </button>

        <button
          onClick={() => setActiveTab('contributions')}
          className={`dash-tab-btn ${activeTab === 'contributions' ? 'active' : ''}`}
        >
          <DollarSign className="w-4 h-4" />
          Meu Extrato de Dízimos
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`dash-tab-btn ${activeTab === 'profile' ? 'active' : ''}`}
        >
          <UserCheck className="w-4 h-4" />
          Atualização Cadastral
        </button>
      </div>

      {/* ABA 1: Visão Geral & Cartão Digital */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cartão Digital do Membro */}
            <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-900 border border-indigo-400/30 rounded-2xl p-6 relative overflow-hidden shadow-xl flex flex-col justify-between text-white">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400/10 rounded-full blur-2xl pointer-events-none" />
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-300" />
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-200">
                      Cartão Digital de Membro
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    Ativo
                  </span>
                </div>

                <div className="mt-6">
                  <h2 className="text-xl font-bold text-white tracking-wide">{dashboard?.member.name}</h2>
                  <p className="text-xs text-blue-200/80 mt-1">{dashboard?.member.email || 'Email não informado'}</p>
                  <p className="text-xs text-blue-200/80">{dashboard?.member.phone || 'Telefone não informado'}</p>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-blue-200/80">
                <div>
                  <span className="text-[10px] text-blue-300/70 block uppercase">Membro Desde</span>
                  <span className="text-white font-medium">{dashboard?.member.admission_date || '-'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-blue-300/70 block uppercase">ID do Membro</span>
                  <span className="text-white font-mono font-bold">#{dashboard?.member.id}</span>
                </div>
              </div>
            </div>

            {/* Próximas Escalas */}
            <div className="dash-card p-5 space-y-3 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm">Próximas Escalas</h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('schedules')}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                  >
                    Ver todas
                  </button>
                </div>

                <div className="mt-3 space-y-2.5">
                  {dashboard?.upcoming_schedules.length === 0 ? (
                    <p className="text-xs text-slate-500 dark:text-slate-400 py-4 text-center">Nenhuma escala agendada para os próximos dias.</p>
                  ) : (
                    dashboard?.upcoming_schedules.map((sc) => (
                      <div
                        key={sc.id}
                        className="p-3 dash-subcard flex items-center justify-between"
                      >
                        <div>
                          <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                            {sc.schedule.title}
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                            {formatDate(sc.schedule.date)} às {sc.schedule.start_time.substring(0, 5)} - {sc.role?.name || 'Voluntário'}
                          </span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            sc.status === 'confirmed'
                              ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                              : sc.status === 'declined'
                              ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
                              : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          {sc.status === 'confirmed' ? 'Confirmada' : sc.status === 'declined' ? 'Recusada' : 'Aguardando'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {dashboard?.pending_schedules_count ? (
                <div className="mt-3 bg-amber-500/10 border border-amber-500/30 p-2.5 rounded-xl flex items-center justify-between text-xs text-amber-700 dark:text-amber-300 font-medium">
                  <span>Você tem escalas pendentes de confirmação!</span>
                  <button
                    onClick={() => setActiveTab('schedules')}
                    className="font-bold underline text-amber-800 dark:text-amber-200"
                  >
                    Responder
                  </button>
                </div>
              ) : null}
            </div>

            {/* Avisos Fixados em Destaque */}
            <div className="dash-card p-5 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Pin className="w-4 h-4 text-rose-500 dark:text-rose-400" />
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">Mural de Avisos da Igreja</h3>
                </div>
                <button
                  onClick={() => setActiveTab('notices')}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-medium"
                >
                  Ver todos
                </button>
              </div>

              <div className="space-y-2.5">
                {dashboard?.pinned_notices.length === 0 ? (
                  <p className="text-xs text-slate-500 dark:text-slate-400 py-4 text-center">Nenhum aviso em destaque no momento.</p>
                ) : (
                  dashboard?.pinned_notices.map((n) => (
                    <div
                      key={n.id}
                      className="p-3 dash-subcard space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{n.title}</span>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">{formatDate(n.published_at)}</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2">{n.content}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 2: Minhas Escalas de Serviço */}
      {activeTab === 'schedules' && (
        <div className="space-y-4">
          <div className="dash-card p-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-500 dark:text-amber-400" />
              Minhas Escalas de Serviço
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Confirme sua presença com antecedência para que sua liderança possa organizar o culto, ou informe seu
              impedimento com justificativa para que possamos providenciar um substituto.
            </p>
          </div>

          <div className="space-y-3">
            {schedules.length === 0 ? (
              <div className="dash-card p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                Você não está escalado em nenhum departamento no momento.
              </div>
            ) : (
              schedules.map((sc) => (
                <div
                  key={sc.id}
                  className="dash-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="px-2.5 py-0.5 rounded-full text-xs font-bold"
                        style={{
                          backgroundColor: `${sc.schedule.ministry?.color || '#3b82f6'}20`,
                          color: sc.schedule.ministry?.color || '#3b82f6',
                          border: `1px solid ${sc.schedule.ministry?.color || '#3b82f6'}40`,
                        }}
                      >
                        {sc.schedule.ministry?.name || 'Ministério'}
                      </span>
                      <h4 className="font-bold text-slate-900 dark:text-white text-base">{sc.schedule.title}</h4>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                      <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                        <Calendar className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                        {formatDate(sc.schedule.date)}
                      </span>
                      <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                        <Clock className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                        {sc.schedule.start_time.substring(0, 5)} às {sc.schedule.end_time.substring(0, 5)}
                      </span>
                      <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                        <Tag className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                        Função: <strong className="text-slate-900 dark:text-white">{sc.role?.name || 'Voluntário'}</strong>
                      </span>
                    </div>

                    {sc.schedule.notes && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 italic mt-1">Obs: {sc.schedule.notes}</p>
                    )}

                    {sc.decline_reason && (
                      <p className="text-xs text-rose-600 dark:text-rose-400 mt-1">
                        <strong>Motivo da Recusa:</strong> {sc.decline_reason}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2.5 flex-wrap">
                    {sc.status === 'confirmed' ? (
                      <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> Presença Confirmada
                      </span>
                    ) : sc.status === 'declined' ? (
                      <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-500/20 text-rose-700 dark:text-rose-400 border border-rose-500/30 flex items-center gap-1.5">
                        <XCircle className="w-4 h-4" /> Escala Recusada
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => handleConfirmSchedule(sc.id)}
                          className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs flex items-center gap-1.5 shadow transition"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Confirmar Presença
                        </button>
                        <button
                          onClick={() => {
                            setSelectedScheduleId(sc.id);
                            setShowDeclineModal(true);
                          }}
                          className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-slate-700 dark:text-slate-300 hover:text-rose-700 dark:hover:text-rose-300 border border-slate-200 dark:border-slate-700 hover:border-rose-300 dark:hover:border-rose-500/40 font-medium text-xs flex items-center gap-1.5 transition"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          Não Poderei
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ABA 3: Meus Eventos & QR Code */}
      {activeTab === 'events' && (
        <div className="space-y-6">
          {/* Minhas Inscrições com QR Code */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <QrCode className="w-5 h-5 text-blue-500 dark:text-blue-400" />
              Minhas Inscrições & Cartões de Acesso (QR Code)
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Apresente o QR Code ou informe o código alfanumérico no terminal de check-in na entrada da igreja.
            </p>

            {eventsData?.my_registrations.length === 0 ? (
              <div className="dash-card p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                Você ainda não se inscreveu em nenhum evento ou conferência.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {eventsData?.my_registrations.map((reg) => (
                  <div
                    key={reg.id}
                    className="dash-card p-5 space-y-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
                          {reg.event?.type || 'Evento'}
                        </span>
                        <h4 className="font-bold text-slate-900 dark:text-white text-base mt-1.5">{reg.event?.title}</h4>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                          reg.status === 'confirmed'
                            ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                            : 'bg-amber-500/20 text-amber-700 dark:text-amber-400'
                        }`}
                      >
                        {reg.status === 'confirmed' ? 'Confirmado' : 'Lista de Espera'}
                      </span>
                    </div>

                    <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
                      <p className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                        {formatDate(reg.event?.start_date)} às {reg.event?.start_time.substring(0, 5)}
                      </p>
                      {reg.event?.location && (
                        <p className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                          {reg.event.location}
                        </p>
                      )}
                    </div>

                    {/* QR Code Token Badge */}
                    <div className="p-4 rounded-xl dash-subcard flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold block">Código de Check-in</span>
                        <span className="text-lg font-mono font-bold text-blue-600 dark:text-blue-400 tracking-wider">
                          {reg.qr_code_token}
                        </span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(reg.qr_code_token)}
                        className="px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs flex items-center gap-1.5 transition"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        {copiedToken === reg.qr_code_token ? 'Copiado!' : 'Copiar'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Eventos Disponíveis para Inscrição */}
          <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
              Eventos Disponíveis para Inscrição
            </h3>

            {eventsData?.available_events.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400">Nenhum novo evento aberto no momento.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {eventsData?.available_events.map((ev) => (
                  <div
                    key={ev.id}
                    className="dash-card p-5 flex flex-col justify-between space-y-4 transition"
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block mb-1">
                        {ev.type}
                      </span>
                      <h4 className="font-bold text-slate-900 dark:text-white text-base">{ev.title}</h4>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">{ev.description}</p>

                      <div className="mt-3 space-y-1 text-xs text-slate-600 dark:text-slate-400">
                        <p className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                          {formatDate(ev.start_date)} às {ev.start_time.substring(0, 5)}
                        </p>
                        {ev.location && (
                          <p className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                            {ev.location}
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => handleRegisterEvent(ev.id)}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-xs transition shadow"
                    >
                      Inscrever-se Gratuitamente
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ABA 4: Pedidos de Oração */}
      {activeTab === 'prayers' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-rose-500 dark:text-rose-400" />
                Intercessão & Pedidos de Oração
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Compartilhe suas necessidades e motivos de gratidão. Nossa equipe pastoral e grupo de intercessão oram por cada pedido.
              </p>
            </div>
            <button
              onClick={() => setShowPrayerModal(true)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-medium text-xs flex items-center gap-1.5 shadow transition"
            >
              <Plus className="w-4 h-4" />
              Novo Pedido de Oração
            </button>
          </div>

          <div className="space-y-3">
            {prayers.length === 0 ? (
              <div className="dash-card p-8 text-center text-slate-500 dark:text-slate-400 text-sm">
                Você ainda não enviou nenhum pedido de oração.
              </div>
            ) : (
              prayers.map((p) => (
                <div
                  key={p.id}
                  className="dash-card p-5 space-y-2 transition"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 dark:text-white text-base">{p.title}</h4>
                        {p.is_confidential && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                            Confidencial (Apenas Pastores)
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">{formatDate(p.created_at)}</span>
                    </div>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        p.status === 'answered'
                          ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400'
                          : p.status === 'praying'
                          ? 'bg-blue-500/20 text-blue-700 dark:text-blue-400'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {p.status === 'answered' && '✓ Oração Respondida'}
                      {p.status === 'praying' && 'Em Intercessão'}
                      {p.status === 'pending' && 'Recebido'}
                      {p.status === 'archived' && 'Arquivado'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300">{p.description}</p>

                  {p.pastoral_notes && (
                    <div className="mt-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/30 p-3 rounded-xl text-xs text-blue-800 dark:text-blue-300">
                      <strong>Palavra Pastoral:</strong> {p.pastoral_notes}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ABA 5: Mural de Avisos */}
      {activeTab === 'notices' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-500 dark:text-amber-400" />
                Mural de Avisos da Igreja
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Comunicados oficiais, avisos de cultos, ministérios e convocações da liderança.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-slate-400">Filtrar:</span>
              <select
                value={selectedNoticeCategory}
                onChange={(e) => setSelectedNoticeCategory(e.target.value)}
                className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              >
                <option value="all">Todas as Categorias</option>
                <option value="general">Geral</option>
                <option value="youth">Juventude</option>
                <option value="kids">Infantil (Kids)</option>
                <option value="urgent">Urgente</option>
                <option value="events">Eventos</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredNotices.map((n) => (
              <div
                key={n.id}
                className={`dash-card p-5 space-y-2 relative transition ${
                  n.is_pinned ? 'border-amber-500/40' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {n.is_pinned && <Pin className="w-4 h-4 text-amber-500 dark:text-amber-400" />}
                    <h4 className="font-bold text-slate-900 dark:text-white text-base">{n.title}</h4>
                  </div>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">{formatDate(n.published_at)}</span>
                </div>

                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">{n.content}</p>

                <div className="pt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="capitalize">Categoria: {n.category}</span>
                  {n.congregation && <span>{n.congregation.name}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ABA 6: Meu Extrato de Dízimos */}
      {activeTab === 'contributions' && (
        <div className="space-y-4">
          <div className="dash-card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
                Histórico Pessoal de Dízimos e Ofertas
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Transparência e registro de suas contribuições para acompanhamento e informe de rendimentos.
              </p>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/30 px-5 py-3 rounded-2xl text-right">
              <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">
                Total Contribuído no Exercício
              </span>
              <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {formatBRL(contributions?.total_contributed ?? 0)}
              </span>
            </div>
          </div>

          <div className="dash-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-700 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-950/60 text-xs uppercase text-slate-500 dark:text-slate-400 font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Data</th>
                    <th className="px-4 py-3">Descrição</th>
                    <th className="px-4 py-3">Categoria</th>
                    <th className="px-4 py-3">Forma</th>
                    <th className="px-4 py-3 text-right">Valor</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {contributions?.contributions.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400 text-xs">
                        Nenhuma contribuição nominal registrada para este membro no exercício.
                      </td>
                    </tr>
                  ) : (
                    contributions?.contributions.map((c) => (
                      <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                        <td className="px-4 py-2.5 text-xs text-slate-500 dark:text-slate-400">{formatDate(c.transaction_date)}</td>
                        <td className="px-4 py-2.5 font-medium text-slate-900 dark:text-white">{c.description}</td>
                        <td className="px-4 py-2.5 text-xs text-slate-600 dark:text-slate-300">{c.category?.name || '-'}</td>
                        <td className="px-4 py-2.5 text-xs uppercase text-slate-500 dark:text-slate-400">{c.payment_method}</td>
                        <td className="px-4 py-2.5 text-right font-bold text-emerald-600 dark:text-emerald-400">{formatBRL(c.amount)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ABA 7: Atualização Cadastral */}
      {activeTab === 'profile' && (
        <div className="dash-card p-6 space-y-6">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-blue-500 dark:text-blue-400" />
              Solicitação de Atualização Cadastral
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
              Mantenha seus dados de contato e endereço em dia. Para preservar a integridade cadastral da igreja, as
              alterações solicitadas são revisadas pela Secretaria antes de entrarem em vigor.
            </p>
          </div>

          {profile && (
            <div className="p-4 dash-subcard flex flex-wrap items-center justify-between gap-3 text-xs text-slate-700 dark:text-slate-300">
              <div>
                <span className="text-slate-500 dark:text-slate-400 block uppercase text-[10px]">Congregação</span>
                <strong className="text-slate-900 dark:text-white">{profile.congregation?.name || 'Sede Central'}</strong>
              </div>
              {profile.family && (
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block uppercase text-[10px]">Família</span>
                  <strong className="text-slate-900 dark:text-white">{profile.family.name}</strong>
                </div>
              )}
              {profile.ministryVolunteers && profile.ministryVolunteers.length > 0 && (
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block uppercase text-[10px]">Ministérios em Atuação</span>
                  <strong className="text-slate-900 dark:text-white">
                    {profile.ministryVolunteers.map((mv) => mv.ministry?.name).filter(Boolean).join(', ')}
                  </strong>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-2xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Telefone / WhatsApp</label>
                <input
                  type="text"
                  value={profileForm.phone}
                  onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                  placeholder="(92) 99999-9999"
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Estado Civil</label>
                <select
                  value={profileForm.marital_status}
                  onChange={(e) => setProfileForm({ ...profileForm, marital_status: e.target.value })}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">Selecione...</option>
                  <option value="single">Solteiro(a)</option>
                  <option value="married">Casado(a)</option>
                  <option value="divorced">Divorciado(a)</option>
                  <option value="widowed">Viúvo(a)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Endereço Residencial</label>
              <input
                type="text"
                value={profileForm.address}
                onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                placeholder="Rua, número, complemento"
                className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Bairro</label>
                <input
                  type="text"
                  value={profileForm.neighborhood}
                  onChange={(e) => setProfileForm({ ...profileForm, neighborhood: e.target.value })}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Cidade</label>
                <input
                  type="text"
                  value={profileForm.city}
                  onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">CEP</label>
                <input
                  type="text"
                  value={profileForm.postal_code}
                  onChange={(e) => setProfileForm({ ...profileForm, postal_code: e.target.value })}
                  placeholder="69000-000"
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Contato de Emergência (Nome)</label>
                <input
                  type="text"
                  value={profileForm.emergency_contact_name}
                  onChange={(e) => setProfileForm({ ...profileForm, emergency_contact_name: e.target.value })}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Contato de Emergência (Telefone)</label>
                <input
                  type="text"
                  value={profileForm.emergency_contact_phone}
                  onChange={(e) => setProfileForm({ ...profileForm, emergency_contact_phone: e.target.value })}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs flex items-center gap-2 shadow transition"
              >
                <Send className="w-3.5 h-3.5" />
                Enviar Solicitação para a Secretaria
              </button>
            </div>
          </form>
        </div>
      )}

      {/* MODAL: Novo Pedido de Oração */}
      {showPrayerModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-rose-500 dark:text-rose-400" />
                Enviar Pedido de Oração
              </h3>
              <button onClick={() => setShowPrayerModal(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-lg">
                &times;
              </button>
            </div>

            <form onSubmit={handleCreatePrayer} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Título do Pedido *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Restauração da saúde, Direção profissional..."
                  value={newPrayer.title}
                  onChange={(e) => setNewPrayer({ ...newPrayer, title: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Detalhes e Motivo *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Descreva seu motivo de oração ou gratidão com sinceridade..."
                  value={newPrayer.description}
                  onChange={(e) => setNewPrayer({ ...newPrayer, description: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-rose-500 resize-none"
                />
              </div>

              <div className="dash-subcard p-3 rounded-xl flex items-start gap-2.5">
                <input
                  type="checkbox"
                  id="confidentialCheck"
                  checked={newPrayer.is_confidential}
                  onChange={(e) => setNewPrayer({ ...newPrayer, is_confidential: e.target.checked })}
                  className="mt-0.5 rounded text-rose-500 focus:ring-0"
                />
                <label htmlFor="confidentialCheck" className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  <strong>Confidencial:</strong> Visível apenas para o Pastor Titular e liderança pastoral
                  (não compartilhar com o grupo geral de intercessão).
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPrayerModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-medium text-xs transition shadow"
                >
                  Enviar Pedido
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Recusa de Escala com Justificativa */}
      {showDeclineModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <XCircle className="w-5 h-5 text-rose-500 dark:text-rose-400" />
                Informar Impedimento na Escala
              </h3>
              <button onClick={() => setShowDeclineModal(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-white text-lg">
                &times;
              </button>
            </div>

            <form onSubmit={handleDeclineSchedule} className="space-y-4">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Entendemos que imprevistos acontecem. Por favor, descreva o motivo do seu impedimento para que seu líder
                ministerial possa providenciar a substituição.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Motivo do Impedimento *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Ex: Viagem de trabalho inadiável, escala médica, problema de saúde..."
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-rose-500 resize-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowDeclineModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white text-xs font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-medium text-xs transition shadow"
                >
                  Confirmar Recusa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberPortalModule;
