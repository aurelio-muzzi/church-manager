import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Sun,
  Moon,
  Calendar,
  CheckSquare,
  Bell,
  LogOut,
  Home,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: typeof Home;
}

const memberNav: NavItem[] = [
  { label: 'Início', href: '/portal', icon: Home },
  { label: 'Agenda & Cultos', href: '/portal/events', icon: Calendar },
  { label: 'Minhas Escalas', href: '/portal/schedules', icon: CheckSquare },
  { label: 'Comunicados', href: '/portal/announcements', icon: Bell },
  { label: 'Meu Perfil', href: '/portal/profile', icon: User },
];

export function MemberLayout() {
  const { isDark, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Top Header */}
      <header className="border-b border-border bg-card/70 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/portal" className="font-bold text-base flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-primary/20 text-primary flex items-center justify-center font-bold text-sm shadow-inner border border-primary/30">
              CM
            </div>
            <div>
              <span className="font-bold text-sm tracking-tight block">Portal do Membro</span>
              <span className="text-[11px] text-muted-foreground block truncate max-w-[180px] sm:max-w-none">
                {user?.tenantName || 'Igreja Central'}
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <Badge variant="success" className="hidden sm:inline-flex text-xs">
              Membro Ativo
            </Badge>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              aria-label="Alternar tema"
              className="h-9 w-9"
            >
              {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-500" />}
            </Button>

            <Link to="/portal/profile">
              <Avatar className="h-8 w-8 hover:ring-2 hover:ring-primary transition-all">
                <AvatarFallback className="bg-primary/20 text-primary font-bold text-xs">
                  {user?.name?.slice(0, 2).toUpperCase() || 'MB'}
                </AvatarFallback>
              </Avatar>
            </Link>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              aria-label="Sair"
              className="h-9 w-9 text-muted-foreground hover:text-destructive"
              title="Encerrar Sessão"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Desktop Sub-navigation */}
      <div className="hidden sm:block border-b border-border bg-card/30">
        <div className="max-w-5xl mx-auto px-4 flex items-center space-x-1">
          {memberNav.map((item) => {
            const Icon = item.icon;
            const isActive =
              location.pathname === item.href ||
              (item.href !== '/portal' && location.pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  'flex items-center gap-2 px-3 py-2.5 text-xs font-medium border-b-2 transition-all',
                  isActive
                    ? 'border-primary text-primary font-semibold'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 pb-24 sm:pb-8">
        <Outlet />
      </main>

      {/* Mobile-First Bottom Navigation Bar */}
      <nav
        aria-label="Navegação móvel do membro"
        className="sm:hidden fixed bottom-0 left-0 right-0 border-t border-border bg-card/95 backdrop-blur-lg px-2 py-1.5 flex justify-around items-center z-40 shadow-lg"
      >
        {memberNav.map((item) => {
          const Icon = item.icon;
          const isActive =
            location.pathname === item.href ||
            (item.href !== '/portal' && location.pathname.startsWith(item.href));

          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                'flex flex-col items-center justify-center p-1.5 rounded-lg text-[10px] font-medium transition-colors w-16',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon className={cn('h-5 w-5 mb-0.5', isActive && 'stroke-[2.5]')} />
              <span className="truncate">{item.label.split(' ')[0]}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
