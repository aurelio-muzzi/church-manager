import { Outlet, Link, useLocation } from 'react-router-dom';
import { ShieldAlert, Server, BarChart2, ArrowLeft, Sun, Moon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';

export function PlatformLayout() {
  const { isDark, setTheme } = useTheme();
  const location = useLocation();

  const platformNav = [
    { label: 'Visão Geral dos Tenants', href: '/platform', icon: BarChart2 },
    { label: 'Gestão de Igrejas', href: '/platform/tenants', icon: Server },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* SaaS Admin Banner Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-destructive/15 border border-destructive/30 flex items-center justify-center text-destructive font-bold">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight">ChurchManager</span>
                <Badge variant="destructive" className="text-[10px] uppercase font-bold py-0.5">
                  Platform Master
                </Badge>
              </div>
              <span className="text-xs text-muted-foreground block">
                Gestão Global de Instâncias & Assinaturas SaaS
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              aria-label="Alternar tema"
              className="h-9 w-9"
            >
              {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-500" />}
            </Button>

            <Link to="/">
              <Button variant="outline" size="sm" className="gap-2 text-xs">
                <ArrowLeft className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Voltar ao</span> Início
              </Button>
            </Link>
          </div>
        </div>

        {/* Subnav */}
        <div className="border-t border-border bg-muted/20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex items-center space-x-2">
            {platformNav.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 text-xs font-medium border-b-2 transition-colors',
                    isActive
                      ? 'border-destructive text-destructive font-semibold'
                      : 'border-transparent text-muted-foreground hover:text-foreground'
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
        <Outlet />
      </main>
    </div>
  );
}
