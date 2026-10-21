import { useState } from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { useTheme } from '@/hooks/useTheme';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Sun,
  Moon,
  ShieldCheck,
  Users,
  Calendar,
  DollarSign,
  Building2,
  CheckCircle2,
  Sparkles,
  Inbox,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  CreditCard,
  UserCheck,
  LayoutDashboard,
  ExternalLink,
  LogIn,
  LogOut,
} from 'lucide-react';
import { AdminLayout } from '@/layouts/AdminLayout';
import { MemberLayout } from '@/layouts/MemberLayout';
import { AuthLayout } from '@/layouts/AuthLayout';
import { PlatformLayout } from '@/layouts/PlatformLayout';
import { PageHeader } from '@/components/shared/PageHeader';
import { MetricKpiCard } from '@/components/shared/MetricKpiCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { ConfirmationDialog } from '@/components/shared/ConfirmationDialog';
import { ProtectedRoute } from '@/components/shared/ProtectedRoute';
import { LoginPage } from '@/modules/authentication/pages/LoginPage';
import { ForgotPasswordPage } from '@/modules/authentication/pages/ForgotPasswordPage';
import { AccessDeniedPage } from '@/modules/authentication/pages/AccessDeniedPage';
import { SecretariaPage } from '@/modules/members';
import { MinistriesPage } from '@/modules/ministries';
import { EventsPage } from '@/modules/events';
import { FinancePage } from '@/modules/finance';
import { MemberPortalPage } from '@/modules/portal';

function ShowcaseHomePage() {
  const { setTheme, isDark } = useTheme();
  const { success, error, warning, info } = useToast();
  const { user, isAuthenticated, logout } = useAuth();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [demoSwitch, setDemoSwitch] = useState(true);
  const [demoCheckbox, setDemoCheckbox] = useState(true);
  const [selectedRole, setSelectedRole] = useState('pastor');
  const [showSkeletonKpi, setShowSkeletonKpi] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Navbar */}
      <header className="border-b border-border bg-card/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold shadow-inner">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-primary to-indigo-400 bg-clip-text text-transparent">
                ChurchManager
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs text-muted-foreground border-l border-border pl-2">
                Autenticação & RBAC (Etapa 03)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <Link to="/admin/dashboard">
                  <Button size="sm" variant="outline" className="hidden md:inline-flex gap-1.5 text-xs">
                    <LayoutDashboard className="h-3.5 w-3.5" />
                    Painel Admin
                  </Button>
                </Link>
                <Link to="/portal">
                  <Button size="sm" variant="outline" className="hidden md:inline-flex gap-1.5 text-xs">
                    <UserCheck className="h-3.5 w-3.5" />
                    Portal Membro
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={logout}
                  className="gap-1.5 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Sair ({user?.name.split(' ')[0]})</span>
                </Button>
              </>
            ) : (
              <Link to="/login">
                <Button size="sm" className="gap-1.5 text-xs">
                  <LogIn className="h-3.5 w-3.5" />
                  Fazer Login
                </Button>
              </Link>
            )}

            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              title={isDark ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
              aria-label="Alternar tema visual"
              className="h-9 w-9"
            >
              {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-500" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Hero Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-6 border-b border-border">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
              <ShieldCheck className="h-3.5 w-3.5" />
              Etapa 03: Autenticação, Sessão Sanctum, RBAC & Rotas Protegidas
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Design System & Autenticação <span className="text-primary">ChurchManager</span>
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base max-w-2xl leading-relaxed">
              Camada de controle de acesso rigorosa com suporte a Laravel Sanctum (cookies + CSRF)
              ou DevMockAdapter, proteção visual por papéis e gerenciamento seguro de sessões.
            </p>
          </div>

          {/* Quick Nav to Dedicated Layouts */}
          <div className="flex flex-wrap gap-2">
            <Link to="/admin/dashboard">
              <Button className="gap-2">
                <span>Painel Admin</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/portal">
              <Button variant="secondary" className="gap-2">
                <span>Portal do Membro</span>
                <ExternalLink className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/platform">
              <Button variant="outline" className="gap-2">
                <span>Admin SaaS</span>
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="ghost" className="gap-2">
                <span>Tela de Login</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Tabbed Interactive Showcase */}
        <Tabs defaultValue="components" className="space-y-6">
          <TabsList className="grid grid-cols-3 max-w-md w-full">
            <TabsTrigger value="components">Componentes</TabsTrigger>
            <TabsTrigger value="feedback">Feedback & Toasts</TabsTrigger>
            <TabsTrigger value="kpi">Métricas & KPIs</TabsTrigger>
          </TabsList>

          {/* Tab 1: Form & Interactive Components */}
          <TabsContent value="components" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Form Controls Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Controles de Formulário</CardTitle>
                  <CardDescription>Inputs, Selects, Labels, Checkbox e Switch com foco acessível</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="demo-name">Nome do Membro ou Visitante</Label>
                    <Input id="demo-name" placeholder="Ex.: Pr. Carlos Eduardo" />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="demo-role">Cargo / Ministério</Label>
                    <Select value={selectedRole} onValueChange={setSelectedRole}>
                      <SelectTrigger id="demo-role">
                        <SelectValue placeholder="Selecione um ministério" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pastor">Pastorado & Docência</SelectItem>
                        <SelectItem value="louvor">Ministério de Louvor</SelectItem>
                        <SelectItem value="infantil">Ministério Infantil</SelectItem>
                        <SelectItem value="diaconato">Diaconato & Recepção</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="space-y-0.5">
                      <Label htmlFor="demo-switch" className="text-sm">Notificações por E-mail</Label>
                      <p className="text-xs text-muted-foreground">Receber escalas e avisos automaticamente</p>
                    </div>
                    <Switch
                      id="demo-switch"
                      checked={demoSwitch}
                      onCheckedChange={setDemoSwitch}
                    />
                  </div>

                  <div className="flex items-center space-x-2 pt-2">
                    <Checkbox
                      id="demo-checkbox"
                      checked={demoCheckbox}
                      onCheckedChange={(checked) => setDemoCheckbox(Boolean(checked))}
                    />
                    <label
                      htmlFor="demo-checkbox"
                      className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      Concordo com os termos de consentimento da congregação (LGPD)
                    </label>
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/30 border-t border-border flex justify-between py-3">
                  <span className="text-xs text-muted-foreground">Estado do switch: {demoSwitch ? 'Ativo' : 'Inativo'}</span>
                  <Button size="sm" variant="default" onClick={() => success('Formulário simulado com sucesso!')}>
                    Salvar Dados
                  </Button>
                </CardFooter>
              </Card>

              {/* Modals & Dialogs Showcase */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Diálogos e Modais Acessíveis</CardTitle>
                  <CardDescription>Diálogos normais e de confirmação crítica com Radix Portal</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Todos os modais possuem bloqueio de rolagem do body, fechamento por ESC,
                    foco aprisionado e transições suaves de entrada e saída.
                  </p>

                  <div className="flex flex-wrap gap-3 pt-2">
                    {/* Standard Dialog */}
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="gap-2">
                          <Sparkles className="h-4 w-4" />
                          Abrir Modal Padrão
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Informações do Ministério</DialogTitle>
                          <DialogDescription>
                            Detalhes cadastrais e voluntários associados a este departamento.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="py-2 space-y-2 text-sm text-muted-foreground">
                          <p>Ministério de Louvor • Responsável: Pr. Carlos Eduardo</p>
                          <p>Escala semanal: Domingos às 18:00 (Culto de Celebração)</p>
                        </div>
                        <DialogFooter>
                          <Button variant="default">Entendido</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>

                    {/* Destructive Confirmation Dialog */}
                    <Button
                      variant="destructive"
                      className="gap-2"
                      onClick={() => setConfirmOpen(true)}
                    >
                      <AlertTriangle className="h-4 w-4" />
                      Ação Crítica (Confirmar)
                    </Button>

                    <ConfirmationDialog
                      open={confirmOpen}
                      onOpenChange={setConfirmOpen}
                      title="Excluir Registro Eclesiástico"
                      description="Esta ação removerá o registro selecionado. Esta operação não poderá ser desfeita e será registrada na trilha de auditoria."
                      isDestructive
                      confirmLabel="Sim, Excluir"
                      cancelLabel="Cancelar"
                      onConfirm={() => warning('Registro excluído com registro de auditoria.')}
                    />
                  </div>

                  <div className="pt-4 border-t border-border space-y-2">
                    <span className="text-xs font-semibold text-muted-foreground block">Badges Semânticos:</span>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="default">Padrão Primário</Badge>
                      <Badge variant="secondary">Secundário</Badge>
                      <Badge variant="outline">Contorno</Badge>
                      <Badge variant="success">Presença Confirmada</Badge>
                      <Badge variant="warning">Pendente Secretaria</Badge>
                      <Badge variant="destructive">Divergência</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Tab 2: Feedback & Toasts */}
          <TabsContent value="feedback" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Sistema de Notificações Toast</CardTitle>
                <CardDescription>
                  Dispare alertas visuais em tempo real para verificar animações e cores semânticas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-3">
                  <Button
                    variant="outline"
                    className="border-emerald-500/40 text-emerald-500 hover:bg-emerald-500/10"
                    onClick={() => success('Presença via QR Code registrada com sucesso!', 'Check-in Aprovado')}
                  >
                    Disparar Sucesso
                  </Button>

                  <Button
                    variant="outline"
                    className="border-destructive/40 text-destructive hover:bg-destructive/10"
                    onClick={() => error('Falha na autenticação ou token expirado.', 'Sessão Inválida')}
                  >
                    Disparar Erro
                  </Button>

                  <Button
                    variant="outline"
                    className="border-amber-500/40 text-amber-500 hover:bg-amber-500/10"
                    onClick={() => warning('Voluntário já escalado em outro ministério no mesmo horário.', 'Conflito de Escala')}
                  >
                    Disparar Aviso
                  </Button>

                  <Button
                    variant="outline"
                    className="border-sky-500/40 text-sky-500 hover:bg-sky-500/10"
                    onClick={() => info('Novo comunicado pastoral publicado para a congregação.', 'Novo Aviso')}
                  >
                    Disparar Info
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Empty & Error States */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <EmptyState
                icon={Inbox}
                title="Nenhum visitante cadastrado hoje"
                description="Os visitantes cadastrados na recepção ou via formulário digital aparecerão aqui para acompanhamento."
                actionLabel="Cadastrar Novo Visitante"
                onAction={() => info('Abre formulário de cadastro de visitante')}
              />

              <ErrorState
                title="Falha ao sincronizar agenda"
                description="Não foi possível consultar os eventos da congregação. Verifique sua conexão com o servidor."
                onRetry={() => success('Tentativa de reconexão bem-sucedida!')}
              />
            </div>
          </TabsContent>

          {/* Tab 3: KPI Metrics */}
          <TabsContent value="kpi" className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold">Indicadores Eclesiásticos & Financeiros</h3>
                <p className="text-xs text-muted-foreground">Cards de métrica com indicadores de tendência e skeleton loading</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSkeletonKpi(!showSkeletonKpi)}
              >
                {showSkeletonKpi ? 'Mostrar Valores Reais' : 'Simular Carregamento (Skeleton)'}
              </Button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricKpiCard
                title="Total de Membros Ativos"
                value="428"
                icon={Users}
                trendPercentage={8.4}
                iconVariant="indigo"
                isLoading={showSkeletonKpi}
              />
              <MetricKpiCard
                title="Arrecadação do Mês"
                value="R$ 48.520,00"
                icon={DollarSign}
                trendPercentage={12.5}
                iconVariant="emerald"
                isLoading={showSkeletonKpi}
              />
              <MetricKpiCard
                title="Média de Presença em Cultos"
                value="315"
                icon={TrendingUp}
                trendPercentage={-2.1}
                iconVariant="purple"
                isLoading={showSkeletonKpi}
              />
              <MetricKpiCard
                title="Despesas Realizadas"
                value="R$ 31.280,00"
                icon={CreditCard}
                description="Dentro do previsto"
                iconVariant="rose"
                isLoading={showSkeletonKpi}
              />
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground mt-auto bg-card/30">
        <p>ChurchManager • Autenticação & Design System • React 19 + Tailwind CSS v4 • Fuso Horário: America/Manaus</p>
      </footer>
    </div>
  );
}

// Sample Pages inside Layouts to demonstrate real functional routes
function AdminDashboardDemo() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard Executivo & BI"
        description="Métricas consolidadas de congregações, frequência e saúde financeira."
        breadcrumbs={[{ label: 'Visão Geral', href: '/admin/dashboard' }, { label: 'Dashboard' }]}
        actions={
          <Button size="sm" className="gap-2">
            <Calendar className="h-4 w-4" />
            Filtrar Período
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricKpiCard
          title="Membros Totais"
          value="428"
          icon={Users}
          trendPercentage={6.2}
          iconVariant="indigo"
        />
        <MetricKpiCard
          title="Receita do Mês"
          value="R$ 48.520,00"
          icon={DollarSign}
          trendPercentage={14.1}
          iconVariant="emerald"
        />
        <MetricKpiCard
          title="Presenças Registradas"
          value="1.240"
          icon={CheckCircle2}
          trendPercentage={4.5}
          iconVariant="purple"
        />
        <MetricKpiCard
          title="Novos Visitantes"
          value="34"
          icon={UserCheck}
          trendPercentage={18.0}
          iconVariant="amber"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Acesso Protegido por Papel (RBAC)</CardTitle>
          <CardDescription>Área restrita a administradores e liderança eclesiástica</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Esta rota está protegida via <code>ProtectedRoute</code> com papéis autorizados
            (<code>church_admin</code>, <code>pastor</code>, <code>secretary</code>, <code>treasurer</code>, <code>leader</code>).
            Membros que tentarem acessar diretamente são redirecionados para a tela de Acesso Negado (403).
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function PlatformHomeDemo() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Gestão de Instâncias SaaS (Tenants)"
        description="Área exclusiva da administração global para acompanhamento de igrejas contratantes."
        breadcrumbs={[{ label: 'Platform', href: '/platform' }]}
        actions={
          <Button size="sm" className="gap-2 bg-destructive text-destructive-foreground hover:bg-destructive/90">
            <Building2 className="h-4 w-4" />
            Cadastrar Nova Igreja
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <MetricKpiCard title="Igrejas Ativas" value="12" icon={Building2} iconVariant="indigo" />
        <MetricKpiCard title="Igrejas em Trial" value="3" icon={Calendar} iconVariant="amber" />
        <MetricKpiCard title="Total Membros na Base" value="4.850" icon={Users} iconVariant="emerald" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Isolamento Multi-Tenant Garantido</CardTitle>
          <CardDescription>
            Conforme as regras do ChurchManager, a administração da plataforma não possui acesso
            aos dados privados de membros nem aos lançamentos financeiros individuais de cada igreja.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      {/* Showcase Home (Pública) */}
      <Route path="/" element={<ShowcaseHomePage />} />

      {/* Auth Public Routes */}
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/recuperar-senha" element={<ForgotPasswordPage />} />
      </Route>

      {/* Admin Layout Routes (Protegidas para Liderança / Administradores) */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['church_admin', 'pastor', 'secretary', 'treasurer', 'leader']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AdminDashboardDemo />} />
        <Route path="members" element={<SecretariaPage />} />
        <Route path="ministries" element={<MinistriesPage />} />
        <Route path="events" element={<EventsPage />} />
        <Route path="attendance" element={<EventsPage />} />
        <Route path="finance" element={<FinancePage />} />
        <Route path="reports" element={<AdminDashboardDemo />} />
        <Route path="settings" element={<AdminDashboardDemo />} />
      </Route>

      {/* Member Portal Layout Routes (Protegidas para Membros & Líderes) */}
      <Route
        path="/portal"
        element={
          <ProtectedRoute allowedRoles={['member', 'church_admin', 'pastor', 'secretary', 'treasurer', 'leader']}>
            <MemberLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<MemberPortalPage />} />
        <Route path="schedules" element={<MemberPortalPage />} />
        <Route path="events" element={<MemberPortalPage />} />
        <Route path="contributions" element={<MemberPortalPage />} />
        <Route path="family" element={<MemberPortalPage />} />
        <Route path="announcements" element={<MemberPortalPage />} />
        <Route path="profile" element={<MemberPortalPage />} />
      </Route>

      {/* Platform Layout Routes (Protegidas EXCLUSIVAMENTE para Platform Admin) */}
      <Route
        path="/platform"
        element={
          <ProtectedRoute allowedRoles={['platform_admin']}>
            <PlatformLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<PlatformHomeDemo />} />
        <Route path="tenants" element={<PlatformHomeDemo />} />
      </Route>

      {/* Status / Error Pages */}
      <Route path="/403" element={<AccessDeniedPage />} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
