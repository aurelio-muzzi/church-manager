import { Outlet, Link } from 'react-router-dom';
import { Building2, Sun, Moon } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { Button } from '@/components/ui/button';

export function AuthLayout() {
  const { isDark, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-between p-4 relative overflow-hidden">
      {/* Background Decorative Blur */}
      <div className="absolute top-[-10%] left-[50%] translate-x-[-50%] w-[500px] h-[300px] bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header with Brand and Theme Switch */}
      <header className="max-w-md w-full mx-auto flex items-center justify-between z-10 pt-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center text-primary font-bold shadow-inner">
            <Building2 className="h-4 w-4" />
          </div>
          <span className="font-bold text-sm tracking-tight">ChurchManager</span>
        </Link>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(isDark ? 'light' : 'dark')}
          aria-label="Alternar tema"
          className="h-8 w-8"
        >
          {isDark ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-500" />}
        </Button>
      </header>

      {/* Center Auth Card */}
      <main className="w-full max-w-md mx-auto my-auto z-10 py-8">
        <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-xl p-6 sm:p-8 shadow-xl space-y-6">
          <Outlet />
        </div>
      </main>

      {/* Bottom Legal / Timezone Note */}
      <footer className="max-w-md w-full mx-auto text-center text-xs text-muted-foreground pb-4 z-10">
        <p>ChurchManager • Gestão Eclesiástica Inteligente</p>
      </footer>
    </div>
  );
}
