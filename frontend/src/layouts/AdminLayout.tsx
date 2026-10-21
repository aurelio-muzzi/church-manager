import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useTheme } from '@/hooks/useTheme';
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
  ChevronDown,
  Layers,
  HeartHandshake,
  CheckCheck,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { devMockAdapter } from '@/services/adapters/devMockAdapter';

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
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const activeUser = devMockAdapter.getActiveUser();
  const tenants = devMockAdapter.getTenants();
  const [activeTenant, setActiveTenant] = useState(tenants[0]?.name || 'Igreja Central de Manaus');

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card/50 backdrop-blur-md p-4 shrink-0 justify-between">
        <div className="space-y-6">
          {/* Logo & Tenant Context */}
          <div className="px-2 space-y-3">
            <Link to="/" className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold shadow-inner">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-bold text-sm tracking-tight bg-gradient-to-r from-primary to-indigo-400 bg-clip-text text-transparent">
                  ChurchManager
                </h2>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">
                  SaaS Eclesiástico
                </span>
              </div>
            </Link>

            {/* Tenant Selector Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-full flex items-center justify-between p-2 rounded-lg border border-border bg-background/50 hover:bg-accent text-left transition-colors">
                  <div className="truncate pr-1">
                    <span className="text-[10px] text-muted-foreground uppercase block font-semibold">
                      Congregação Ativa
                    </span>
                    <span className="text-xs font-medium text-foreground truncate block">
                      {activeTenant}
                    </span>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="start">
                <DropdownMenuLabel className="text-xs">Alternar Congregação</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {tenants.map((t) => (
                  <DropdownMenuItem
                    key={t.id}
                    onClick={() => setActiveTenant(t.name)}
                    className="flex items-center justify-between text-xs"
                  >
                    <span className="truncate">{t.name}</span>
                    {activeTenant === t.name && (
                      <CheckCheck className="h-3.5 w-3.5 text-primary shrink-0" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 px-1">
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

        {/* User Card & Settings */}
        <div className="border-t border-border pt-4 px-2 space-y-3">
          <div className="flex items-center justify-between">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2.5 text-left p-1 rounded-lg hover:bg-accent transition-colors flex-1 min-w-0 mr-1">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/20 text-primary font-bold text-xs">
                      {activeUser?.name?.slice(0, 2).toUpperCase() || 'AD'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="truncate flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">
                      {activeUser?.name || 'Administrador'}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {activeUser?.role === 'church_admin' ? 'Pastor / Administrador' : activeUser?.role}
                    </p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/portal/profile" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>Meu Perfil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/admin/settings" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    <span>Configurações</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive focus:text-destructive flex items-center gap-2">
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
              className="h-8 w-8 shrink-0"
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

          <div className="border-t border-border pt-4">
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
            >
              {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-500" />}
              <span>{isDark ? 'Modo Claro' : 'Modo Escuro'}</span>
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
