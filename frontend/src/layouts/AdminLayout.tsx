import { useState } from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/button';
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
} from 'lucide-react';

export function AdminLayout() {
  const { isDark, setTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 border-r border-border bg-card/40 backdrop-blur-sm p-4 space-y-6">
        <div className="flex items-center gap-3 px-2">
          <div className="h-9 w-9 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <h2 className="font-bold text-sm tracking-tight">ChurchManager</h2>
            <p className="text-xs text-muted-foreground">Painel Administrativo</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          <Link
            to="/admin/dashboard"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-accent text-accent-foreground transition-colors"
          >
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </Link>
          <Link
            to="/admin/members"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-accent text-accent-foreground transition-colors"
          >
            <Users className="h-4 w-4" />
            Secretaria & Membros
          </Link>
          <Link
            to="/admin/events"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-accent text-accent-foreground transition-colors"
          >
            <Calendar className="h-4 w-4" />
            Eventos & Presença
          </Link>
          <Link
            to="/admin/finance"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-accent text-accent-foreground transition-colors"
          >
            <DollarSign className="h-4 w-4" />
            Financeiro Avançado
          </Link>
          <Link
            to="/admin/settings"
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium hover:bg-accent text-accent-foreground transition-colors"
          >
            <Settings className="h-4 w-4" />
            Configurações
          </Link>
        </nav>

        <div className="border-t border-border pt-4 flex items-center justify-between px-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            title="Alternar tema"
          >
            {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-500" />}
          </Button>

          <Button variant="ghost" size="icon" title="Sair da Sessão">
            <LogOut className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="md:hidden border-b border-border bg-card p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <span className="font-bold text-sm">ChurchManager</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
