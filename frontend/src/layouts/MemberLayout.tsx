import { Outlet, Link } from 'react-router-dom';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/button';
import { Sun, Moon, User, Calendar, CheckSquare, Bell, LogOut } from 'lucide-react';

export function MemberLayout() {
  const { isDark, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b border-border bg-card/70 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/portal" className="font-bold text-base flex items-center gap-2">
            <span className="h-7 w-7 rounded-lg bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
              CM
            </span>
            <span>Portal do Membro</span>
          </Link>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              aria-label="Alternar tema"
            >
              {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-500" />}
            </Button>
            <Button variant="ghost" size="icon" aria-label="Sair">
              <LogOut className="h-4 w-4 text-muted-foreground" />
            </Button>
          </div>
        </div>
      </header>

      {/* Simplified Mobile-Friendly Bottom Navigation */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 border-t border-border bg-card/90 backdrop-blur-md px-4 py-2 flex justify-around z-40">
        <Link to="/portal" className="flex flex-col items-center text-xs text-muted-foreground hover:text-primary">
          <User className="h-5 w-5" />
          <span>Início</span>
        </Link>
        <Link to="/portal/events" className="flex flex-col items-center text-xs text-muted-foreground hover:text-primary">
          <Calendar className="h-5 w-5" />
          <span>Agenda</span>
        </Link>
        <Link to="/portal/schedules" className="flex flex-col items-center text-xs text-muted-foreground hover:text-primary">
          <CheckSquare className="h-5 w-5" />
          <span>Escalas</span>
        </Link>
        <Link to="/portal/announcements" className="flex flex-col items-center text-xs text-muted-foreground hover:text-primary">
          <Bell className="h-5 w-5" />
          <span>Avisos</span>
        </Link>
      </nav>

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 pb-20 sm:pb-6">
        <Outlet />
      </main>
    </div>
  );
}
