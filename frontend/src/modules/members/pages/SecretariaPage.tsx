import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { secretariaService } from '@/services/api/secretariaService';
import type {
  MemberFormData,
  CongregationFormData,
  FamilyFormData,
  VisitorFormData,
  VisitorVisitFormData,
} from '@/modules/members/schemas';
import { PageHeader } from '@/components/shared/PageHeader';
import { MetricKpiCard } from '@/components/shared/MetricKpiCard';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/useToast';
import { MembersTab } from '../components/MembersTab';
import { FamiliesTab } from '../components/FamiliesTab';
import { VisitorsTab } from '../components/VisitorsTab';
import { CongregationsTab } from '../components/CongregationsTab';
import { ChangeRequestsTab } from '../components/ChangeRequestsTab';
import {
  Users,
  UserCheck,
  ShieldAlert,
  Building2,
  Heart,
  Clock,
  Sparkles,
} from 'lucide-react';

export function SecretariaPage() {
  const [activeTab, setActiveTab] = useState('members');
  const { success, error } = useToast();
  const queryClient = useQueryClient();

  // Queries
  const { data: metrics, isLoading: isMetricsLoading } = useQuery({
    queryKey: ['secretaria', 'metrics'],
    queryFn: () => secretariaService.getSummaryMetrics(),
  });

  const { data: members = [], isLoading: isMembersLoading } = useQuery({
    queryKey: ['secretaria', 'members'],
    queryFn: () => secretariaService.getMembers(),
  });

  const { data: congregations = [], isLoading: isCongregationsLoading } = useQuery({
    queryKey: ['secretaria', 'congregations'],
    queryFn: () => secretariaService.getCongregations(),
  });

  const { data: families = [], isLoading: isFamiliesLoading } = useQuery({
    queryKey: ['secretaria', 'families'],
    queryFn: () => secretariaService.getFamilies(),
  });

  const { data: visitors = [], isLoading: isVisitorsLoading } = useQuery({
    queryKey: ['secretaria', 'visitors'],
    queryFn: () => secretariaService.getVisitors(),
  });

  const { data: changeRequests = [], isLoading: isChangeRequestsLoading } = useQuery({
    queryKey: ['secretaria', 'change-requests'],
    queryFn: () => secretariaService.getChangeRequests(),
  });

  // Mutations
  const saveMemberMutation = useMutation({
    mutationFn: async ({ data, id }: { data: MemberFormData; id?: string }) => {
      if (id) {
        return secretariaService.updateMember(id, data);
      }
      return secretariaService.createMember(data);
    },
    onSuccess: (member, variables) => {
      queryClient.invalidateQueries({ queryKey: ['secretaria'] });
      if (variables.id) {
        success('Cadastro Atualizado', `Os dados de ${member.name} foram atualizados com sucesso.`);
      } else {
        success('Membro Cadastrado', `${member.name} foi cadastrado com sucesso.`);
      }
    },
    onError: (err: Error) => {
      error('Erro ao Salvar Membro', err.message || 'Ocorreu um erro ao processar o cadastro.');
    },
  });

  const deleteMemberMutation = useMutation({
    mutationFn: (id: string) => secretariaService.deleteMember(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['secretaria'] });
      success('Membro Excluído', 'O registro do membro foi desvinculado com sucesso.');
    },
    onError: (err: Error) => {
      error('Erro ao Excluir', err.message || 'Não foi possível desvincular o membro.');
    },
  });

  const createCongregationMutation = useMutation({
    mutationFn: (data: CongregationFormData) => secretariaService.createCongregation(data),
    onSuccess: (cong) => {
      queryClient.invalidateQueries({ queryKey: ['secretaria'] });
      success('Congregação Criada', `A congregação "${cong.name}" foi cadastrada com sucesso.`);
    },
    onError: (err: Error) => {
      error('Erro ao Criar Congregação', err.message);
    },
  });

  const createFamilyMutation = useMutation({
    mutationFn: (data: FamilyFormData) => secretariaService.createFamily(data),
    onSuccess: (family) => {
      queryClient.invalidateQueries({ queryKey: ['secretaria'] });
      success('Família Cadastrada', `O núcleo "${family.name}" foi registrado com sucesso.`);
    },
    onError: (err: Error) => {
      error('Erro ao Criar Família', err.message);
    },
  });

  const createVisitorMutation = useMutation({
    mutationFn: (data: VisitorFormData) => secretariaService.createVisitor(data),
    onSuccess: (visitor) => {
      queryClient.invalidateQueries({ queryKey: ['secretaria'] });
      success('Visitante Registrado', `${visitor.name} foi adicionado à lista de acompanhamento.`);
    },
    onError: (err: Error) => {
      error('Erro ao Registrar Visitante', err.message);
    },
  });

  const recordVisitMutation = useMutation({
    mutationFn: ({ visitorId, data }: { visitorId: string; data: VisitorVisitFormData }) =>
      secretariaService.recordVisitorVisit(visitorId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['secretaria'] });
      success('Presença Registrada', 'Nova visita registrada com sucesso.');
    },
    onError: (err: Error) => {
      error('Erro ao Registrar Presença', err.message);
    },
  });

  const convertVisitorMutation = useMutation({
    mutationFn: (visitorId: string) => secretariaService.convertVisitorToMember(visitorId),
    onSuccess: (newMember) => {
      queryClient.invalidateQueries({ queryKey: ['secretaria'] });
      success(
        'Visitante Convertido em Membro!',
        `${newMember.name} agora é oficialmente membro da igreja. Bem-vindo(a) à família!`
      );
    },
    onError: (err: Error) => {
      error('Erro na Conversão', err.message);
    },
  });

  const reviewChangeRequestMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { action: 'approve' | 'reject'; reviewNotes?: string };
    }) => secretariaService.reviewChangeRequest(id, data),
    onSuccess: (_res, variables) => {
      queryClient.invalidateQueries({ queryKey: ['secretaria'] });
      if (variables.data.action === 'approve') {
        success('Solicitação Aprovada', 'As alterações cadastrais foram aplicadas ao membro com sucesso.');
      } else {
        success('Solicitação Rejeitada', 'A solicitação foi recusada com a devida justificativa.');
      }
    },
    onError: (err: Error) => {
      error('Erro na Avaliação', err.message);
    },
  });

  const pendingRequestsCount = changeRequests.filter((r) => r.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Cabeçalho da Página */}
      <PageHeader
        title="Secretaria & Gestão de Membresia"
        description="Gestão de membros, famílias, visitantes, congregações filiais e aprovações cadastrais com conformidade LGPD."
        breadcrumbs={[
          { label: 'Admin', href: '/admin/dashboard' },
          { label: 'Secretaria', href: '/admin/members' },
        ]}
      />

      {/* Indicadores / KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <MetricKpiCard
          title="Total de Membros"
          value={metrics ? String(metrics.totalMembers) : '—'}
          icon={Users}
          iconVariant="indigo"
          isLoading={isMetricsLoading}
        />
        <MetricKpiCard
          title="Membros Ativos"
          value={metrics ? String(metrics.activeMembers) : '—'}
          icon={UserCheck}
          iconVariant="emerald"
          isLoading={isMetricsLoading}
        />
        <MetricKpiCard
          title="Menores (LGPD)"
          value={metrics ? String(metrics.minorMembers) : '—'}
          icon={ShieldAlert}
          iconVariant="amber"
          description="Sob tutela"
          isLoading={isMetricsLoading}
        />
        <MetricKpiCard
          title="Congregações"
          value={metrics ? String(metrics.totalCongregations) : '—'}
          icon={Building2}
          iconVariant="indigo"
          description="Sede + Filiais"
          isLoading={isMetricsLoading}
        />
        <MetricKpiCard
          title="Visitantes Ativos"
          value={metrics ? String(metrics.activeVisitors) : '—'}
          icon={Sparkles}
          iconVariant="emerald"
          description="Acompanhamento"
          isLoading={isMetricsLoading}
        />
        <MetricKpiCard
          title="Aprovações Pendentes"
          value={metrics ? String(metrics.pendingChangeRequests) : '—'}
          icon={Clock}
          iconVariant="rose"
          description={pendingRequestsCount > 0 ? 'Ação necessária' : 'Tudo em dia'}
          isLoading={isMetricsLoading}
        />
      </div>

      {/* Abas do Módulo */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-muted/60 p-1 flex-wrap h-auto">
          <TabsTrigger value="members" onClick={() => setActiveTab('members')} className="gap-2 text-xs">
            <Users className="h-4 w-4" />
            <span>Membros</span>
          </TabsTrigger>

          <TabsTrigger value="families" onClick={() => setActiveTab('families')} className="gap-2 text-xs">
            <Heart className="h-4 w-4" />
            <span>Famílias</span>
          </TabsTrigger>

          <TabsTrigger value="visitors" onClick={() => setActiveTab('visitors')} className="gap-2 text-xs">
            <Sparkles className="h-4 w-4" />
            <span>Visitantes</span>
          </TabsTrigger>

          <TabsTrigger value="congregations" onClick={() => setActiveTab('congregations')} className="gap-2 text-xs">
            <Building2 className="h-4 w-4" />
            <span>Congregações</span>
          </TabsTrigger>

          <TabsTrigger
            value="change-requests"
            onClick={() => setActiveTab('change-requests')}
            className="gap-2 text-xs relative"
          >
            <Clock className="h-4 w-4" />
            <span>Aprovações</span>
            {pendingRequestsCount > 0 && (
              <Badge
                variant="destructive"
                className="ml-1 h-4 min-w-4 px-1 text-[10px] flex items-center justify-center rounded-full"
              >
                {pendingRequestsCount}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Aba: Membros */}
        <TabsContent value="members" className="m-0 focus-visible:outline-none">
          <MembersTab
            members={members}
            congregations={congregations}
            families={families}
            isLoading={isMembersLoading}
            onSaveMember={async (data, id) => {
              await saveMemberMutation.mutateAsync({ data, id });
            }}
            onDeleteMember={async (id) => {
              await deleteMemberMutation.mutateAsync(id);
            }}
          />
        </TabsContent>

        {/* Aba: Famílias */}
        <TabsContent value="families" className="m-0 focus-visible:outline-none">
          <FamiliesTab
            families={families}
            isLoading={isFamiliesLoading}
            onCreateFamily={async (data) => {
              await createFamilyMutation.mutateAsync(data);
            }}
          />
        </TabsContent>

        {/* Aba: Visitantes */}
        <TabsContent value="visitors" className="m-0 focus-visible:outline-none">
          <VisitorsTab
            visitors={visitors}
            congregations={congregations}
            isLoading={isVisitorsLoading}
            onCreateVisitor={async (data) => {
              await createVisitorMutation.mutateAsync(data);
            }}
            onRecordVisit={async (visitorId, data) => {
              await recordVisitMutation.mutateAsync({ visitorId, data });
            }}
            onConvertVisitor={async (visitorId) => {
              await convertVisitorMutation.mutateAsync(visitorId);
            }}
          />
        </TabsContent>

        {/* Aba: Congregações */}
        <TabsContent value="congregations" className="m-0 focus-visible:outline-none">
          <CongregationsTab
            congregations={congregations}
            isLoading={isCongregationsLoading}
            onCreateCongregation={async (data) => {
              await createCongregationMutation.mutateAsync(data);
            }}
          />
        </TabsContent>

        {/* Aba: Aprovações Cadastrais */}
        <TabsContent value="change-requests" className="m-0 focus-visible:outline-none">
          <ChangeRequestsTab
            changeRequests={changeRequests}
            isLoading={isChangeRequestsLoading}
            onReviewRequest={async (id, data) => {
              await reviewChangeRequestMutation.mutateAsync({ id, data });
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
