import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import {
  IdCard,
  Calendar,
  CheckSquare,
  DollarSign,
  Users,
  Bell,
  User,
  Clock,
  FileText,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

import { portalService } from '@/services/api/portalService';
import type {
  MemberCredential,
  MemberContributionSummary,
  MemberAnnualTaxStatement,
  MemberScheduleItem,
  MemberRegistrationItem,
  MemberFamilyNucleus,
  MemberAnnouncement,
} from '../types';
import type {
  MemberUpdateRegistrationFormData,
  MemberScheduleResponseFormData,
} from '../schemas';
import type { MemberChangeRequest } from '@/modules/members/types';

import { DigitalMembershipCard } from '../components/DigitalMembershipCard';
import { MemberContributionsView } from '../components/MemberContributionsView';
import { AnnualTaxStatementModal } from '../components/AnnualTaxStatementModal';
import { MemberSchedulesView } from '../components/MemberSchedulesView';
import { MemberRegistrationsView } from '../components/MemberRegistrationsView';
import { MemberFamilyView } from '../components/MemberFamilyView';
import { MemberProfileUpdateModal } from '../components/MemberProfileUpdateModal';
import { MemberAnnouncementsView } from '../components/MemberAnnouncementsView';

export const MemberPortalPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();

  // Active Tab synchronized with route or state
  const getInitialTab = () => {
    const path = location.pathname;
    if (path.includes('/schedules')) return 'schedules';
    if (path.includes('/events')) return 'events';
    if (path.includes('/contributions')) return 'contributions';
    if (path.includes('/family')) return 'family';
    if (path.includes('/announcements')) return 'announcements';
    if (path.includes('/profile')) return 'profile';
    return 'overview';
  };

  const [activeTab, setActiveTab] = useState<string>(getInitialTab());

  // Data states
  const [credential, setCredential] = useState<MemberCredential | null>(null);
  const [contributions, setContributions] = useState<MemberContributionSummary | null>(null);
  const [taxStatement, setTaxStatement] = useState<MemberAnnualTaxStatement | null>(null);
  const [schedules, setSchedules] = useState<MemberScheduleItem[]>([]);
  const [registrations, setRegistrations] = useState<MemberRegistrationItem[]>([]);
  const [family, setFamily] = useState<MemberFamilyNucleus | null>(null);
  const [announcements, setAnnouncements] = useState<MemberAnnouncement[]>([]);
  const [changeRequests, setChangeRequests] = useState<MemberChangeRequest[]>([]);

  const [selectedTaxYear, setSelectedTaxYear] = useState<number>(2026);
  const [isTaxModalOpen, setIsTaxModalOpen] = useState(false);
  const [isUpdateProfileModalOpen, setIsUpdateProfileModalOpen] = useState(false);

  // Load all member portal data
  const loadPortalData = useCallback(async () => {
    try {
      const memberId = 'mem-06'; // default member Gabriel Ferreira Lima
      const [
        _sumData,
        credData,
        contribData,
        taxData,
        schedData,
        regData,
        famData,
        ancData,
        reqData,
      ] = await Promise.all([
        portalService.getMemberPortalSummary(memberId),
        portalService.getDigitalCredential(memberId),
        portalService.getMemberContributions(memberId),
        portalService.getMemberTaxStatement(memberId, selectedTaxYear),
        portalService.getMemberSchedules(memberId),
        portalService.getMemberRegistrations(memberId),
        portalService.getMemberFamily(memberId),
        portalService.getMemberAnnouncements(),
        portalService.getMemberChangeRequests(memberId),
      ]);

      setCredential(credData);
      setContributions(contribData);
      setTaxStatement(taxData);
      setSchedules(schedData);
      setRegistrations(regData);
      setFamily(famData);
      setAnnouncements(ancData);
      setChangeRequests(reqData);
    } catch {
      toast({
        title: 'Erro ao carregar dados do portal',
        description: 'Não foi possível carregar as informações do membro.',
        variant: 'error',
      });
    }
  }, [selectedTaxYear, toast]);

  useEffect(() => {
    loadPortalData();
  }, [loadPortalData]);

  // Handle volunteer schedule response
  const handleRespondSchedule = async (
    scheduleId: string,
    data: MemberScheduleResponseFormData
  ) => {
    try {
      const updated = await portalService.respondSchedule(scheduleId, data, 'mem-06');
      setSchedules((prev) =>
        prev.map((s) => (s.scheduleId === scheduleId ? updated : s))
      );

      toast({
        title:
          data.status === 'confirmed'
            ? 'Presença confirmada!'
            : 'Ausência comunicada à liderança',
        description:
          data.status === 'confirmed'
            ? 'Obrigado por servir na obra do Senhor!'
            : 'Sua justificativa foi registrada com sucesso.',
        variant: data.status === 'confirmed' ? 'success' : 'warning',
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Ocorreu uma falha ao enviar sua resposta.';
      toast({
        title: 'Erro ao responder escala',
        description: message,
        variant: 'error',
      });
    }
  };

  // Handle submit change request to secretariat
  const handleSubmitChangeRequest = async (data: MemberUpdateRegistrationFormData) => {
    try {
      const newReq = await portalService.submitChangeRequest('mem-06', data);
      setChangeRequests((prev) => [newReq, ...prev]);
      toast({
        title: 'Solicitação enviada com sucesso!',
        description:
          'A Secretaria Eclesiástica analisará suas alterações em breve.',
        variant: 'success',
      });
    } catch (error: unknown) {
      const message =
        error instanceof Error
          ? error.message
          : 'Falha ao registrar seu pedido de alteração.';
      toast({
        title: 'Erro ao enviar solicitação',
        description: message,
        variant: 'error',
      });
    }
  };

  const handleTabChange = (val: string) => {
    setActiveTab(val);
    if (val === 'overview') navigate('/portal');
    else if (val === 'schedules') navigate('/portal/schedules');
    else if (val === 'events') navigate('/portal/events');
    else if (val === 'contributions') navigate('/portal/contributions');
    else if (val === 'family') navigate('/portal/family');
    else if (val === 'announcements') navigate('/portal/announcements');
    else if (val === 'profile') navigate('/portal/profile');
  };

  const pendingSchedule = schedules.find((s) => s.status === 'pending');

  return (
    <div className="space-y-6">
      {/* Welcome & Member Status Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-card p-5 rounded-2xl border border-border/80 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground" data-testid="portal-welcome-title">
              Olá, {credential?.fullName || user?.name || 'Membro'}!
            </h1>
            <Badge
              variant="success"
              className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-xs hidden sm:inline-flex"
            >
              Comunhão Ativa
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Matrícula:{' '}
            <span className="font-mono font-medium text-foreground">
              {credential?.matricula || 'ROL-2026-0006'}
            </span>{' '}
            • Congregação:{' '}
            <span className="font-medium text-foreground">
              {credential?.congregationName || 'Filial Ponta Negra'}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsUpdateProfileModalOpen(true)}
            className="w-full sm:w-auto gap-1.5 text-xs shadow-xs"
            data-testid="open-update-profile-btn"
          >
            <User className="h-3.5 w-3.5 text-primary" />
            Atualizar Meu Cadastro
          </Button>

          <Button
            size="sm"
            variant="default"
            onClick={() => setIsTaxModalOpen(true)}
            className="w-full sm:w-auto gap-1.5 text-xs shadow-xs bg-emerald-600 hover:bg-emerald-700 text-white"
            data-testid="header-irpf-btn"
          >
            <FileText className="h-3.5 w-3.5" />
            Declaração IRPF
          </Button>
        </div>
      </div>

      {/* Pending Schedule Warning Banner */}
      {pendingSchedule && (
        <div
          className="bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent border border-amber-500/30 p-4 rounded-xl flex items-center justify-between gap-4"
          data-testid="pending-schedule-banner"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Clock className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-foreground">
                Você tem uma escala ministerial aguardando sua confirmação!
              </p>
              <p className="text-[11px] text-muted-foreground">
                {pendingSchedule.ministryName} ({pendingSchedule.roleName}) em{' '}
                {new Date(pendingSchedule.date).toLocaleDateString('pt-BR')} às{' '}
                {pendingSchedule.startTime}.
              </p>
            </div>
          </div>

          <Button
            size="sm"
            onClick={() => handleTabChange('schedules')}
            className="gap-1.5 text-xs bg-amber-600 hover:bg-amber-700 text-white shrink-0"
            data-testid="view-pending-schedule-btn"
          >
            Responder Escala
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {/* Main Tabbed Interface */}
      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full space-y-6">
        <TabsList className="w-full justify-start overflow-x-auto border-b border-border/80 bg-transparent p-0 h-auto gap-2 rounded-none">
          <TabsTrigger
            value="overview"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-3 py-2 text-xs font-medium"
            data-testid="tab-overview"
          >
            <IdCard className="h-3.5 w-3.5 mr-1.5" />
            Visão Geral & Credencial
          </TabsTrigger>
          <TabsTrigger
            value="schedules"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-3 py-2 text-xs font-medium"
            data-testid="tab-schedules"
          >
            <CheckSquare className="h-3.5 w-3.5 mr-1.5" />
            Minhas Escalas
            {pendingSchedule && (
              <span className="ml-1.5 h-2 w-2 rounded-full bg-amber-500 inline-block" />
            )}
          </TabsTrigger>
          <TabsTrigger
            value="events"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-3 py-2 text-xs font-medium"
            data-testid="tab-events"
          >
            <Calendar className="h-3.5 w-3.5 mr-1.5" />
            Eventos & Ingressos
          </TabsTrigger>
          <TabsTrigger
            value="contributions"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-3 py-2 text-xs font-medium"
            data-testid="tab-contributions"
          >
            <DollarSign className="h-3.5 w-3.5 mr-1.5" />
            Contribuições & IRPF
          </TabsTrigger>
          <TabsTrigger
            value="family"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-3 py-2 text-xs font-medium"
            data-testid="tab-family"
          >
            <Users className="h-3.5 w-3.5 mr-1.5" />
            Núcleo Familiar
          </TabsTrigger>
          <TabsTrigger
            value="announcements"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-3 py-2 text-xs font-medium"
            data-testid="tab-announcements"
          >
            <Bell className="h-3.5 w-3.5 mr-1.5" />
            Comunicados
          </TabsTrigger>
        </TabsList>

        {/* TAB 1: OVERVIEW & CREDENTIAL */}
        <TabsContent value="overview" className="space-y-6 mt-0">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Digital Credential Card */}
            <div className="lg:col-span-5 flex flex-col items-center">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3 self-start">
                Sua Credencial Eclesiástica
              </h3>
              {credential && <DigitalMembershipCard credential={credential} />}
            </div>

            {/* Right Column: Portal Quick Status & Tiles */}
            <div className="lg:col-span-7 space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Acesso Rápido & Resumo
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Tile 1: Escalas */}
                <Card
                  onClick={() => handleTabChange('schedules')}
                  className="cursor-pointer hover:border-primary/50 transition-all p-4 space-y-2 border-border/80 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">Minhas Escalas</span>
                    <CheckSquare className="h-4 w-4 text-violet-500" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {schedules.length > 0
                      ? `${schedules.length} escala(s) registradas`
                      : 'Nenhuma escala no momento'}
                  </p>
                  <div className="text-[11px] text-primary flex items-center gap-1 font-medium pt-1">
                    Ver detalhes <ChevronRight className="h-3 w-3" />
                  </div>
                </Card>

                {/* Tile 2: Ingressos */}
                <Card
                  onClick={() => handleTabChange('events')}
                  className="cursor-pointer hover:border-primary/50 transition-all p-4 space-y-2 border-border/80 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">Eventos & Ingressos</span>
                    <Calendar className="h-4 w-4 text-blue-500" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {registrations.length > 0
                      ? `${registrations.length} ingresso(s) com QR Code`
                      : 'Nenhum evento inscrito'}
                  </p>
                  <div className="text-[11px] text-primary flex items-center gap-1 font-medium pt-1">
                    Abrir ingressos <ChevronRight className="h-3 w-3" />
                  </div>
                </Card>

                {/* Tile 3: Dízimos & IRPF */}
                <Card
                  onClick={() => handleTabChange('contributions')}
                  className="cursor-pointer hover:border-primary/50 transition-all p-4 space-y-2 border-border/80 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">Dízimos & Ofertas</span>
                    <DollarSign className="h-4 w-4 text-emerald-500" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {contributions?.yearlyTotal
                      ? `R$ ${contributions.yearlyTotal.toFixed(2)} em 2026`
                      : 'Consultar histórico e recibos'}
                  </p>
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium pt-1">
                    Acessar comprovantes <ChevronRight className="h-3 w-3" />
                  </div>
                </Card>

                {/* Tile 4: Família */}
                <Card
                  onClick={() => handleTabChange('family')}
                  className="cursor-pointer hover:border-primary/50 transition-all p-4 space-y-2 border-border/80 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">Núcleo Familiar</span>
                    <Users className="h-4 w-4 text-pink-500" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {family
                      ? `${family.familyName} (${family.members.length} membros)`
                      : 'Vínculo familiar'}
                  </p>
                  <div className="text-[11px] text-primary flex items-center gap-1 font-medium pt-1">
                    Ver componentes <ChevronRight className="h-3 w-3" />
                  </div>
                </Card>
              </div>

              {/* Announcements Preview */}
              {announcements.length > 0 && (
                <div className="p-4 rounded-xl border border-border/80 bg-muted/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                      <Bell className="h-3.5 w-3.5 text-amber-500" />
                      Último Comunicado da Igreja
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleTabChange('announcements')}
                      className="h-6 text-[11px] p-0 text-primary"
                    >
                      Ver todos
                    </Button>
                  </div>
                  <h4 className="text-xs font-semibold text-foreground">
                    {announcements[0].title}
                  </h4>
                  <p className="text-[11px] text-muted-foreground line-clamp-2">
                    {announcements[0].content}
                  </p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* TAB 2: SCHEDULES */}
        <TabsContent value="schedules" className="mt-0">
          <MemberSchedulesView
            schedules={schedules}
            onRespond={handleRespondSchedule}
          />
        </TabsContent>

        {/* TAB 3: EVENTS */}
        <TabsContent value="events" className="mt-0">
          <MemberRegistrationsView registrations={registrations} />
        </TabsContent>

        {/* TAB 4: CONTRIBUTIONS & IRPF */}
        <TabsContent value="contributions" className="mt-0">
          {contributions && (
            <MemberContributionsView
              summary={contributions}
              onOpenTaxStatement={() => setIsTaxModalOpen(true)}
            />
          )}
        </TabsContent>

        {/* TAB 5: FAMILY */}
        <TabsContent value="family" className="mt-0">
          <MemberFamilyView
            family={family}
            onRequestUpdate={() => setIsUpdateProfileModalOpen(true)}
          />
        </TabsContent>

        {/* TAB 6: ANNOUNCEMENTS */}
        <TabsContent value="announcements" className="mt-0">
          <MemberAnnouncementsView announcements={announcements} />
        </TabsContent>

        {/* TAB 7: PROFILE / REGISTRATION (fallback if user opens /portal/profile) */}
        <TabsContent value="profile" className="mt-0 space-y-4">
          <div className="flex items-center justify-between bg-card p-4 rounded-xl border border-border">
            <div>
              <h3 className="font-bold text-sm text-foreground">Cadastro Eclesiástico</h3>
              <p className="text-xs text-muted-foreground">
                Consulte seus dados cadastrais e solicite alterações diretamente à secretaria.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => setIsUpdateProfileModalOpen(true)}
              className="gap-1.5 text-xs"
            >
              <User className="h-3.5 w-3.5" />
              Solicitar Alteração
            </Button>
          </div>
          {family && (
            <MemberFamilyView
              family={family}
              onRequestUpdate={() => setIsUpdateProfileModalOpen(true)}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Annual Tax Statement Modal (IRPF) */}
      <AnnualTaxStatementModal
        isOpen={isTaxModalOpen}
        onClose={() => setIsTaxModalOpen(false)}
        statement={taxStatement}
        selectedYear={selectedTaxYear}
        onYearChange={(year) => setSelectedTaxYear(year)}
      />

      {/* Profile / Address Update Modal */}
      <MemberProfileUpdateModal
        isOpen={isUpdateProfileModalOpen}
        onClose={() => setIsUpdateProfileModalOpen(false)}
        memberId="mem-06"
        initialData={{
          phone: credential?.cpfMasked ? '(92) 98555-6677' : '',
          email: 'gabriel.membro@gmail.com',
          maritalStatus: 'married',
          address: 'Rua das Palmeiras, 55',
          neighborhood: 'Ponta Negra',
          city: 'Manaus',
          state: 'AM',
          postalCode: '69037-120',
        }}
        onSubmitRequest={handleSubmitChangeRequest}
        existingRequests={changeRequests}
      />
    </div>
  );
};
