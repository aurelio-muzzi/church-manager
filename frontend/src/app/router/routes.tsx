import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Sun,
  Moon,
  ShieldCheck,
  Users,
  Calendar,
  DollarSign,
  Building2,
  CheckCircle2,
  Layers,
} from 'lucide-react';

function HomePage() {
  const { setTheme, isDark } = useTheme();

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
                Frontend Enterprise
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Badge variant="outline" className="hidden sm:inline-flex gap-1.5 py-1">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Etapa 01: Fundação Ativa
            </Badge>

            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              title={isDark ? 'Mudar para Modo Claro' : 'Mudar para Modo Escuro'}
              aria-label="Alternar tema visual"
            >
              {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-500" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero / Overview */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        <section className="text-center sm:text-left space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-xs font-semibold text-primary">
            <ShieldCheck className="h-3.5 w-3.5" />
            React 19 + TypeScript Estrito + Tailwind CSS v4 + Vite
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">
            Fundação de Frontend — <span className="text-primary">ChurchManager</span>
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-3xl">
            Arquitetura modular de alta performance para gestão eclesiástica multi-tenant,
            com design system consistente, acessibilidade nativa, tipagem rigorosa e cliente HTTP desacoplado.
          </p>
        </section>

        {/* Modules Foundation Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="hover:border-primary/50 transition-all shadow-sm hover:shadow-md">
            <CardHeader>
              <div className="h-10 w-10 rounded-lg bg-indigo-500/10 text-indigo-500 flex items-center justify-center mb-2">
                <Users className="h-5 w-5" />
              </div>
              <CardTitle>Secretaria & Membros</CardTitle>
              <CardDescription>
                Gestão de congregações, membros, famílias, visitantes e workflow de aprovação cadastral.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Badge variant="secondary">Etapa 04</Badge>
                <Badge variant="outline">Multi-tenant</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:border-primary/50 transition-all shadow-sm hover:shadow-md">
            <CardHeader>
              <div className="h-10 w-10 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center mb-2">
                <DollarSign className="h-5 w-5" />
              </div>
              <CardTitle>Financeiro Avançado</CardTitle>
              <CardDescription>
                Contas, movimentações, plano de contas, orçamentos, relatórios contábeis e conciliação bancária.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Badge variant="secondary">Etapa 07</Badge>
                <Badge variant="outline">Auditoria</Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:border-primary/50 transition-all shadow-sm hover:shadow-md">
            <CardHeader>
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 text-purple-500 flex items-center justify-center mb-2">
                <Calendar className="h-5 w-5" />
              </div>
              <CardTitle>Cultos & Presença QR Code</CardTitle>
              <CardDescription>
                Agenda unificada, inscrições, check-in manual e leitura por câmera de QR Code dinâmico.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <Badge variant="secondary">Etapa 06</Badge>
                <Badge variant="outline">Tempo Real</Badge>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Foundation Checklist & Design System Showcase */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            Componentes e Estado da Fundação (Etapa 01)
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Critérios de Aceite Verificados</CardTitle>
                <CardDescription>Validação dos alicerces técnicos do frontend</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>TypeScript 5.7+ configurado em modo estrito (strict)</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Tailwind CSS v4 + @theme tokens (Dark Mode inicial padrão)</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Primitivas Radix UI + utilitário cn (clsx + tailwind-merge)</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Cliente HTTP Axios configurado para Sanctum CSRF e tenant isolation</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span>Adaptador de desenvolvimento (DevMockAdapter) desacoplado</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Demonstração de Estados & Skeletons</CardTitle>
                <CardDescription>Feedback visual responsivo e transições suaves</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Button size="sm">Botão Primário</Button>
                  <Button size="sm" variant="secondary">Secundário</Button>
                  <Button size="sm" variant="outline">Contorno</Button>
                  <Button size="sm" variant="destructive">Destrutivo</Button>
                </div>
                <div className="space-y-2 pt-2 border-t border-border">
                  <span className="text-xs text-muted-foreground block">Exemplo de Skeleton Loading:</span>
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-6 text-center text-xs text-muted-foreground mt-auto">
        <p>ChurchManager Frontend Enterprise • Fuso Horário Padrão: America/Manaus • React 19 + Tailwind v4</p>
      </footer>
    </div>
  );
}

function NotFoundPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
      <h1 className="text-6xl font-black text-primary">404</h1>
      <p className="mt-2 text-xl font-semibold">Página não encontrada</p>
      <p className="text-muted-foreground text-sm mt-1">O endereço solicitado não existe ou foi movido.</p>
      <Link to="/" className="mt-6">
        <Button variant="default">Voltar para o Início</Button>
      </Link>
    </div>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}
