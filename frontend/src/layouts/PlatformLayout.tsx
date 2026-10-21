import { Outlet, Link } from 'react-router-dom';
import { ShieldAlert, Server } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function PlatformLayout() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="border-b border-destructive/20 bg-destructive/5 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ShieldAlert className="h-5 w-5 text-destructive" />
          <span className="font-bold text-sm tracking-tight">ChurchManager Platform Admin</span>
          <Badge variant="destructive" className="text-xs">SaaS Master</Badge>
        </div>
        <nav className="flex items-center gap-4 text-xs font-medium">
          <Link to="/platform/tenants" className="hover:underline flex items-center gap-1">
            <Server className="h-3.5 w-3.5" />
            Igrejas (Tenants)
          </Link>
          <Link to="/" className="text-muted-foreground hover:underline">
            Sair para Aplicação
          </Link>
        </nav>
      </header>

      <main className="flex-1 p-6 max-w-7xl w-full mx-auto">
        <Outlet />
      </main>
    </div>
  );
}
