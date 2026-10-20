import React, { useEffect, useState } from 'react';
import type { Event, EventRegistration, EventStats } from '../../types/event';
import type { Member } from '../../types/secretary';
import { 
  checkInEventApi, 
  createEventApi, 
  getEventRegistrationsApi, 
  getEventsApi, 
  getEventStatsApi, 
  registerForEventApi 
} from '../../services/eventApi';
import { getMembersApi } from '../../services/secretaryApi';
import { CardSkeleton } from '../ui/Skeleton';
import { 
  Calendar, 
  QrCode, 
  UserCheck, 
  BarChart3, 
  Plus, 
  Clock, 
  MapPin, 
  Users, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Ticket,
  Search,
  ScanLine
} from 'lucide-react';

type TabType = 'events' | 'checkin' | 'registrations' | 'stats';

export const EventModule: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('events');

  // Estados de Eventos
  const [events, setEvents] = useState<Event[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [newEvent, setNewEvent] = useState({
    title: '',
    type: 'service' as const,
    description: '',
    location: '',
    start_date: new Date().toISOString().split('T')[0],
    start_time: '19:30',
    max_capacity: 100,
    requires_registration: false,
    is_free: true,
  });

  // Estados de Inscrições
  const [registrations, setRegistrations] = useState<EventRegistration[]>([]);
  const [loadingRegistrations, setLoadingRegistrations] = useState(false);
  const [showRegModal, setShowRegModal] = useState(false);
  const [newReg, setNewReg] = useState({
    name: '',
    email: '',
    phone: '',
    member_id: '',
  });

  // Estados do Terminal de Check-in
  const [qrTokenInput, setQrTokenInput] = useState('');
  const [manualMemberSearch, setManualMemberSearch] = useState('');
  const [members, setMembers] = useState<Member[]>([]);
  const [checkInResult, setCheckInResult] = useState<{
    status: 'success' | 'already_checked_in' | 'error';
    message: string;
  } | null>(null);
  const [processingCheckIn, setProcessingCheckIn] = useState(false);

  // Estados de Estatísticas
  const [stats, setStats] = useState<EventStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  // Estados globais de feedback
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const loadEvents = async () => {
    setLoadingEvents(true);
    setActionError(null);
    try {
      const data = await getEventsApi();
      setEvents(data);
      if (data.length > 0 && !selectedEventId) {
        setSelectedEventId(data[0].id);
      }
    } catch (err: any) {
      setActionError(err.message || 'Falha ao carregar eventos.');
    } finally {
      setLoadingEvents(false);
    }
  };

  const loadRegistrations = async (eventId: number) => {
    setLoadingRegistrations(true);
    try {
      const data = await getEventRegistrationsApi(eventId);
      setRegistrations(data);
    } catch (err: any) {
      setActionError(err.message || 'Falha ao carregar lista de inscritos.');
    } finally {
      setLoadingRegistrations(false);
    }
  };

  const loadStats = async (eventId: number) => {
    setLoadingStats(true);
    try {
      const data = await getEventStatsApi(eventId);
      setStats(data);
    } catch (err: any) {
      setActionError(err.message || 'Falha ao carregar métricas.');
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    loadEvents();
    getMembersApi().then(setMembers).catch(() => {});
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      if (activeTab === 'registrations') {
        loadRegistrations(selectedEventId);
      }
      if (activeTab === 'stats') {
        loadStats(selectedEventId);
      }
    }
  }, [activeTab, selectedEventId]);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionError(null);
    try {
      await createEventApi({
        title: newEvent.title,
        type: newEvent.type,
        description: newEvent.description,
        location: newEvent.location,
        start_date: newEvent.start_date,
        start_time: newEvent.start_time,
        max_capacity: newEvent.max_capacity ? Number(newEvent.max_capacity) : null,
        requires_registration: newEvent.requires_registration,
        is_free: newEvent.is_free,
      });

      setActionSuccess('Evento cadastrado e publicado com sucesso!');
      setShowEventModal(false);
      setNewEvent({
        title: '',
        type: 'service',
        description: '',
        location: '',
        start_date: new Date().toISOString().split('T')[0],
        start_time: '19:30',
        max_capacity: 100,
        requires_registration: false,
        is_free: true,
      });
      loadEvents();
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventId) return;

    setActionError(null);
    try {
      const result = await registerForEventApi(selectedEventId, {
        member_id: newReg.member_id ? Number(newReg.member_id) : null,
        name: newReg.name,
        email: newReg.email || null,
        phone: newReg.phone || null,
      });

      setActionSuccess(result.message);
      setShowRegModal(false);
      setNewReg({ name: '', email: '', phone: '', member_id: '' });
      loadRegistrations(selectedEventId);
      loadEvents();
    } catch (err: any) {
      setActionError(err.message);
    }
  };

  const handleCheckInByToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEventId || !qrTokenInput) return;

    setProcessingCheckIn(true);
    setCheckInResult(null);
    try {
      const res = await checkInEventApi(selectedEventId, {
        qr_code_token: qrTokenInput.trim(),
        check_in_type: 'qr_code',
      });

      if (res.status === 'already_checked_in') {
        setCheckInResult({
          status: 'already_checked_in',
          message: res.message,
        });
      } else {
        setCheckInResult({
          status: 'success',
          message: res.message,
        });
      }
      setQrTokenInput('');
      loadEvents();
    } catch (err: any) {
      setCheckInResult({
        status: 'error',
        message: err.message || 'Token de QR Code inválido.',
      });
    } finally {
      setProcessingCheckIn(false);
    }
  };

  const handleManualCheckIn = async (member: Member) => {
    if (!selectedEventId) return;

    setProcessingCheckIn(true);
    setCheckInResult(null);
    try {
      const res = await checkInEventApi(selectedEventId, {
        member_id: member.id,
        name: member.name,
        check_in_type: 'manual',
      });

      if (res.status === 'already_checked_in') {
        setCheckInResult({
          status: 'already_checked_in',
          message: res.message,
        });
      } else {
        setCheckInResult({
          status: 'success',
          message: res.message,
        });
      }
      setManualMemberSearch('');
      loadEvents();
    } catch (err: any) {
      setCheckInResult({
        status: 'error',
        message: err.message || 'Falha ao realizar check-in manual.',
      });
    } finally {
      setProcessingCheckIn(false);
    }
  };

  const activeEventObj = events.find(e => e.id === selectedEventId);

  return (
    <div className="space-y-6">
      {/* Cabeçalho do Módulo */}
      <div className="dash-header flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              Etapa 05
            </span>
            <span className="text-slate-500 dark:text-slate-400 text-xs">Eventos, Inscrições & Quórum</span>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Calendar className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
            Eventos e Presença
          </h2>
          <p className="text-slate-600 dark:text-slate-400 text-sm mt-1">
            Gestão de cultos e conferências, controle de vagas, check-in seguro com leitor QR Code e quórum em tempo real.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowEventModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-emerald-600/20"
          >
            <Plus className="w-4 h-4" />
            Novo Evento
          </button>
          <button
            onClick={loadEvents}
            title="Sincronizar eventos"
            className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-xl transition-all"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Alertas */}
      {actionSuccess && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-3 text-emerald-700 dark:text-emerald-400 text-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}
      {actionError && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-700 dark:text-rose-400 text-sm">
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Seletor de Evento Ativo no Módulo */}
      {events.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 dash-subcard p-3.5 rounded-xl">
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            <Ticket className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span className="font-medium">Evento em Foco:</span>
          </div>

          <select
            value={selectedEventId || ''}
            onChange={e => setSelectedEventId(Number(e.target.value))}
            className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-900 dark:text-slate-200 font-medium focus:outline-none focus:border-emerald-500"
          >
            {events.map(ev => (
              <option key={ev.id} value={ev.id}>
                {ev.title} ({ev.start_date})
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Navegação por Abas */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto gap-2 pb-2">
        <button
          onClick={() => setActiveTab('events')}
          className={`dash-tab-btn ${activeTab === 'events' ? 'active' : ''}`}
        >
          <Calendar className="w-4 h-4" />
          Cultos & Eventos ({events.length})
        </button>

        <button
          onClick={() => setActiveTab('checkin')}
          className={`dash-tab-btn ${activeTab === 'checkin' ? 'active' : ''}`}
        >
          <QrCode className="w-4 h-4" />
          Terminal de Check-in (QR Code)
        </button>

        <button
          onClick={() => setActiveTab('registrations')}
          className={`dash-tab-btn ${activeTab === 'registrations' ? 'active' : ''}`}
        >
          <Users className="w-4 h-4" />
          Inscrições & Participantes
        </button>

        <button
          onClick={() => setActiveTab('stats')}
          className={`dash-tab-btn ${activeTab === 'stats' ? 'active' : ''}`}
        >
          <BarChart3 className="w-4 h-4" />
          Quórum & Métricas
        </button>
      </div>

      {/* ABA 1: CULTOS E EVENTOS */}
      {activeTab === 'events' && (
        <div className="space-y-4">
          {loadingEvents ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-16 dash-card">
              <Calendar className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-900 dark:text-slate-200 font-semibold text-lg">Nenhum evento agendado</p>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1 max-w-md mx-auto">
                Cadastre o primeiro culto, conferência ou retiro no botão "Novo Evento" acima.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {events.map(ev => (
                <div
                  key={ev.id}
                  className={`dash-card p-5 transition-all flex flex-col justify-between ${
                    selectedEventId === ev.id ? 'ring-2 ring-emerald-500/40' : ''
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider block mb-1">
                          {ev.type === 'conference' ? 'Conferência' :
                           ev.type === 'service' ? 'Culto Regular' :
                           ev.type === 'workshop' ? 'Workshop' : 'Evento Especial'}
                        </span>
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white">{ev.title}</h3>
                      </div>

                      <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-xs rounded-full font-medium">
                        Publicado
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
                      {ev.description || 'Sem descrição cadastrada.'}
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-400 mb-4 dash-subcard p-3 rounded-xl">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>{ev.start_date}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                        <span>{ev.start_time}</span>
                      </div>
                      <div className="flex items-center gap-1.5 col-span-2">
                        <MapPin className="w-3.5 h-3.5 text-violet-600 dark:text-violet-400" />
                        <span>{ev.location || 'Sede Principal'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-3">
                      <span>{ev.registrations_count || 0} inscritos</span>
                      <span>•</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-medium">{ev.attendances_count || 0} presenças</span>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedEventId(ev.id);
                        setActiveTab('checkin');
                      }}
                      className="text-emerald-600 dark:text-emerald-400 hover:underline font-semibold flex items-center gap-1"
                    >
                      <ScanLine className="w-3.5 h-3.5" />
                      Fazer Check-in
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ABA 2: TERMINAL DE CHECK-IN (QR CODE & MANUAL) */}
      {activeTab === 'checkin' && activeEventObj && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Validador de QR Code Token */}
          <div className="dash-card p-6 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <QrCode className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Leitor de QR Code</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Valide o token do crachá/ingresso digital do participante</p>
              </div>
            </div>

            <form onSubmit={handleCheckInByToken} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Token do QR Code (Ex: EVT-CARLOS2026)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Cole ou digite o código do QR Code..."
                    value={qrTokenInput}
                    onChange={e => setQrTokenInput(e.target.value)}
                    className="flex-1 bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-slate-100 uppercase tracking-wider focus:outline-none focus:border-emerald-500 font-mono"
                  />
                  <button
                    type="submit"
                    disabled={processingCheckIn || !qrTokenInput.trim()}
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-emerald-600/20"
                  >
                    {processingCheckIn ? 'Validando...' : 'Confirmar'}
                  </button>
                </div>
              </div>
            </form>

            {/* Feedback Visual do Check-in */}
            {checkInResult && (
              <div className={`p-4 rounded-xl border text-sm flex items-start gap-3 transition-all ${
                checkInResult.status === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400'
                  : checkInResult.status === 'already_checked_in'
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-400'
              }`}>
                {checkInResult.status === 'success' ? (
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                )}
                <div>
                  <strong className="block font-semibold">
                    {checkInResult.status === 'success' ? 'PRESENÇA CONFIRMADA!' :
                     checkInResult.status === 'already_checked_in' ? 'ATENÇÃO: JÁ REGISTRADO' : 'ERRO NO CHECK-IN'}
                  </strong>
                  <span className="text-xs">{checkInResult.message}</span>
                </div>
              </div>
            )}
          </div>

          {/* Check-in Manual por Busca de Membros */}
          <div className="dash-card p-6 space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Check-in Manual</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Localize o membro pelo nome para registrar presença</p>
              </div>
            </div>

            <div>
              <div className="relative mb-3">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Buscar pelo nome do membro..."
                  value={manualMemberSearch}
                  onChange={e => setManualMemberSearch(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-violet-500"
                />
              </div>

              <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl">
                {members
                  .filter(m => !manualMemberSearch || m.name.toLowerCase().includes(manualMemberSearch.toLowerCase()))
                  .slice(0, 5)
                  .map(m => (
                    <div key={m.id} className="p-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all">
                      <div>
                        <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">{m.name}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">{m.email || m.phone || 'Sem contato'}</p>
                      </div>

                      <button
                        onClick={() => handleManualCheckIn(m)}
                        disabled={processingCheckIn}
                        className="px-3 py-1 bg-violet-500/15 hover:bg-violet-500/25 text-violet-700 dark:text-violet-300 border border-violet-500/30 rounded-lg text-xs font-medium transition-all"
                      >
                        Check-in
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ABA 3: INSCRIÇÕES E PARTICIPANTES */}
      {activeTab === 'registrations' && activeEventObj && (
        <div className="dash-card p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{activeEventObj.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Lista oficial de inscritos ({registrations.length} participantes registrados)
              </p>
            </div>

            <button
              onClick={() => setShowRegModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold transition-all shadow-md shadow-emerald-600/20"
            >
              <Plus className="w-4 h-4" />
              Inscrever Participante
            </button>
          </div>

          {loadingRegistrations ? (
            <CardSkeleton />
          ) : registrations.length === 0 ? (
            <div className="text-center py-12 text-slate-500 dark:text-slate-400 text-sm">
              Nenhuma inscrição realizada para este evento ainda.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold">
                    <th className="pb-3">Participante</th>
                    <th className="pb-3">Contato</th>
                    <th className="pb-3">Token QR Code</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Presença</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {registrations.map(reg => (
                    <tr key={reg.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-all">
                      <td className="py-3 font-medium text-slate-800 dark:text-slate-200">
                        {reg.name}
                        {reg.member_id && (
                          <span className="ml-1.5 px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded text-[10px]">
                            Membro
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-slate-500 dark:text-slate-400">{reg.email || reg.phone || '-'}</td>
                      <td className="py-3 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        <span
                          onClick={() => {
                            navigator.clipboard.writeText(reg.qr_code_token);
                            setActionSuccess(`Token ${reg.qr_code_token} copiado!`);
                          }}
                          title="Clique para copiar token"
                          className="cursor-pointer bg-slate-100 dark:bg-slate-950 px-2 py-1 rounded border border-slate-200 dark:border-slate-800 hover:border-emerald-500"
                        >
                          {reg.qr_code_token}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${
                          reg.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20' :
                          reg.status === 'waitlist' ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20' :
                          'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                        }`}>
                          {reg.status === 'confirmed' ? 'Confirmado' :
                           reg.status === 'waitlist' ? 'Lista de Espera' : reg.status}
                        </span>
                      </td>
                      <td className="py-3">
                        {reg.attendance ? (
                          <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Presente
                          </span>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-500 text-[11px]">Não compareceu</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ABA 4: QUÓRUM & MÉTRICAS EM TEMPO REAL */}
      {activeTab === 'stats' && activeEventObj && (
        <div className="space-y-6">
          {loadingStats ? (
            <CardSkeleton />
          ) : stats ? (
            <div className="space-y-6">
              {/* Indicadores Principais */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="dash-kpi">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Inscritos Confirmados</span>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.total_confirmed_registrations}</p>
                </div>

                <div className="dash-kpi">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Presenças (Check-in)</span>
                  <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{stats.total_attendances}</p>
                </div>

                <div className="dash-kpi">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Taxa de Presença</span>
                  <p className="text-2xl font-bold text-violet-600 dark:text-violet-400 mt-1">{stats.attendance_rate}%</p>
                </div>

                <div className="dash-kpi">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Capacidade Máxima</span>
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
                    {stats.max_capacity ? `${stats.max_capacity} vagas` : 'Ilimitada'}
                  </p>
                </div>
              </div>

              {/* Detalhes de Tipo de Check-in */}
              <div className="dash-card p-6">
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-200 mb-3">Método de Check-in Utilizado</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="dash-subcard p-4 rounded-xl">
                    <span className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                      <QrCode className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      Check-in via QR Code Token
                    </span>
                    <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{stats.check_in_by_type.qr_code}</p>
                  </div>

                  <div className="dash-subcard p-4 rounded-xl">
                    <span className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                      <UserCheck className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                      Check-in Manual por Operador
                    </span>
                    <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{stats.check_in_by_type.manual}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-slate-500 dark:text-slate-400 text-sm text-center py-8">Nenhum dado estatístico disponível.</p>
          )}
        </div>
      )}

      {/* MODAL: NOVO EVENTO */}
      {showEventModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Calendar className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                Cadastrar Evento / Culto
              </h3>
              <button onClick={() => setShowEventModal(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateEvent} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Título do Evento *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Conferência da Família 2026"
                  value={newEvent.title}
                  onChange={e => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Tipo de Evento</label>
                  <select
                    value={newEvent.type}
                    onChange={e => setNewEvent(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="service">Culto Regular</option>
                    <option value="conference">Conferência</option>
                    <option value="workshop">Workshop / Treinamento</option>
                    <option value="course">Curso Bíblico</option>
                    <option value="retreat">Retiro</option>
                    <option value="other">Outro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Capacidade de Vagas</label>
                  <input
                    type="number"
                    min="1"
                    placeholder="Ex: 150 (opcional)"
                    value={newEvent.max_capacity}
                    onChange={e => setNewEvent(prev => ({ ...prev, max_capacity: Number(e.target.value) }))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Data *</label>
                  <input
                    type="date"
                    required
                    value={newEvent.start_date}
                    onChange={e => setNewEvent(prev => ({ ...prev, start_date: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Horário de Início *</label>
                  <input
                    type="time"
                    required
                    value={newEvent.start_time}
                    onChange={e => setNewEvent(prev => ({ ...prev, start_time: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Local</label>
                <input
                  type="text"
                  placeholder="Ex: Templo Sede - Auditório Principal"
                  value={newEvent.location}
                  onChange={e => setNewEvent(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Descrição</label>
                <textarea
                  rows={2}
                  placeholder="Detalhes sobre preletores, programações ou temas..."
                  value={newEvent.description}
                  onChange={e => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="req_reg"
                  checked={newEvent.requires_registration}
                  onChange={e => setNewEvent(prev => ({ ...prev, requires_registration: e.target.checked }))}
                  className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4 bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-800"
                />
                <label htmlFor="req_reg" className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  Exige inscrição prévia com emissão de QR Code
                </label>
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowEventModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-emerald-600/20"
                >
                  Salvar Evento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: NOVA INSCRIÇÃO */}
      {showRegModal && activeEventObj && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Ticket className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                Inscrever no Evento
              </h3>
              <button onClick={() => setShowRegModal(false)} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
                ✕
              </button>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Selecione um Membro (opcional)</label>
                <select
                  value={newReg.member_id}
                  onChange={e => {
                    const id = e.target.value;
                    const found = members.find(m => m.id === Number(id));
                    setNewReg(prev => ({
                      ...prev,
                      member_id: id,
                      name: found ? found.name : prev.name,
                      email: found?.email || prev.email,
                      phone: found?.phone || prev.phone,
                    }));
                  }}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                >
                  <option value="">Inscrever participante avulso/visitante...</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Nome Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Nome do participante..."
                  value={newReg.name}
                  onChange={e => setNewReg(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">E-mail</label>
                <input
                  type="email"
                  placeholder="email@participante.com"
                  value={newReg.email}
                  onChange={e => setNewReg(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Telefone / WhatsApp</label>
                <input
                  type="text"
                  placeholder="(92) 99999-9999"
                  value={newReg.phone}
                  onChange={e => setNewReg(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowRegModal(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-semibold transition-all shadow-md shadow-emerald-600/20"
                >
                  Confirmar Inscrição
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
