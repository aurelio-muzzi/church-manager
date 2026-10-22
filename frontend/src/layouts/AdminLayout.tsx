import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Sun,
  Moon,
  Building2,
  Users,
  Calendar,
  DollarSign,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  Layers,
  HeartHandshake,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: typeof BarChart3;
}

const navItems: NavItem[] = [
  { label: 'Dashboard & BI', href: '/admin/dashboard', icon: BarChart3 },
  { label: 'Secretaria & Membros', href: '/admin/members', icon: Users },
  { label: 'Ministérios & Voluntários', href: '/admin/ministries', icon: HeartHandshake },
  { label: 'Cultos & Presença QR', href: '/admin/events', icon: Calendar },
  { label: 'Financeiro Avançado', href: '/admin/finance', icon: DollarSign },
  { label: 'Relatórios Gerenciais', href: '/admin/reports', icon: Layers },
  { label: 'Configurações', href: '/admin/settings', icon: Settings },
];

export function AdminLayout() {
  const { isDark, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const activeTenantName =
    user?.tenantName ||
    'Igreja Central de Manaus';

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card/60 backdrop-blur-md p-4 shrink-0 h-screen sticky top-0 justify-between z-20">
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto pr-1 space-y-5">
          {/* Logo & Identificação */}
          <div className="px-2 space-y-3 shrink-0">
            <Link to="/admin/dashboard" className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold shadow-inner">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-bold text-sm tracking-tight bg-gradient-to-r from-primary to-indigo-400 bg-clip-text text-transparent">
                  ChurchManager
                </h2>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                  Gestão Eclesiástica
                </span>
              </div>
            </Link>

            {/* Identificação Institucional da Igreja */}
            <div className="p-2.5 rounded-lg border border-border bg-background/50 flex items-center justify-between shadow-xs">
              <div className="truncate pr-2">
                <span className="text-[10px] text-muted-foreground uppercase block font-semibold">
                  Igreja & Congregação
                </span>
                <span className="text-xs font-semibold text-foreground truncate block" title={activeTenantName}>
                  {activeTenantName}
                </span>
              </div>
              <span className="inline-flex items-center gap-1 text-[10px] text-emerald-500 font-medium bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 shrink-0">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Ativa
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 px-1 flex-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                location.pathname === item.href ||
                (item.href !== '/admin/dashboard' && location.pathname.startsWith(item.href));

              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                  )}
                >
                  <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-primary-foreground' : 'text-muted-foreground')} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Card & Settings (Sempre Visível na Base) */}
        <div className="border-t border-border pt-3 px-1 shrink-0 mt-3">
          <div className="flex items-center justify-between gap-1 p-1 rounded-xl bg-background/60 border border-border/50">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex items-center gap-2.5 text-left p-1.5 rounded-lg hover:bg-accent transition-colors flex-1 min-w-0"
                  title="Configurações e perfil do usuário logado"
                >
                  <Avatar className="h-8 w-8 shrink-0 ring-1 ring-border">
                    <AvatarFallback className="bg-primary/20 text-primary font-bold text-xs">
                      {user?.name?.slice(0, 2).toUpperCase() || 'PR'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="truncate flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate" title={user?.name || 'Pr. Carlos Eduardo'}>
                      {user?.name || 'Pr. Carlos Eduardo'}
                    </p>
                    <p className="text-[10px] text-muted-foreground truncate">
                      {user?.role === 'church_admin' ? 'Pastor / Administrador' : user?.role || 'Liderança'}
                    </p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mb-2">
                <DropdownMenuLabel className="text-xs">
                  <span className="block font-semibold">{user?.name || 'Pr. Carlos Eduardo'}</span>
                  <span className="text-[10px] text-muted-foreground font-normal">{user?.email || 'pastor@churchmanager.app'}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/portal/profile" className="flex items-center gap-2 text-xs cursor-pointer">
                    <User className="h-4 w-4" />
                    <span>Meu Perfil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/admin/settings" className="flex items-center gap-2 text-xs cursor-pointer">
                    <Settings className="h-4 w-4" />
                    <span>Configurações</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-destructive focus:text-destructive flex items-center gap-2 text-xs cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Encerrar Sessão</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              title={isDark ? 'Modo Claro' : 'Modo Escuro'}
              aria-label="Alternar tema"
              className="h-8 w-8 shrink-0 hover:bg-accent text-muted-foreground hover:text-foreground"
            >
              {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-500" />}
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer (Sheet) */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-72 p-4 flex flex-col justify-between">
          <div className="space-y-6">
            <SheetHeader className="text-left px-2">
              <SheetTitle className="flex items-center gap-2 text-base">
                <Building2 className="h-5 w-5 text-primary" />
                <span>ChurchManager</span>
              </SheetTitle>
            </SheetHeader>

            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="border-t border-border pt-4 space-y-3">
            {/* Perfil do Usuário Logado no Mobile */}
            <div className="flex items-center gap-3 p-2 rounded-lg bg-background/50 border border-border">
              <Avatar className="h-9 w-9 shrink-0 ring-1 ring-border">
                <AvatarFallback className="bg-primary/20 text-primary font-bold text-xs">
                  {user?.name?.slice(0, 2).toUpperCase() || 'PR'}
                </AvatarFallback>
              </Avatar>
              <div className="truncate flex-1 min-w-0">
                <p className="text-xs font-semibold text-foreground truncate">
                  {user?.name || 'Pr. Carlos Eduardo'}
                </p>
                <p className="text-[10px] text-muted-foreground truncate">
                  {user?.role === 'church_admin' ? 'Pastor / Administrador' : user?.role || 'Liderança'}
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              className="w-full justify-start gap-2 text-xs"
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
            >
              {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-500" />}
              <span>{isDark ? 'Modo Claro' : 'Modo Escuro'}</span>
            </Button>
            <Button
              variant="destructive"
              className="w-full justify-start gap-2 text-xs"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              <span>Encerrar Sessão</span>
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header Bar */}
        <header className="md:hidden border-b border-border bg-card/60 backdrop-blur-md px-4 py-3 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <span className="font-bold text-sm">ChurchManager</span>
          </div>

          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              aria-label="Alternar tema"
              className="h-9 w-9"
            >
              {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-500" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Abrir menu"
              className="h-9 w-9"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
