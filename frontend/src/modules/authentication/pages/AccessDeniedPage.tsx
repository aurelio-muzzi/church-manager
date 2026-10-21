import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { ShieldX, ArrowLeft, LogOut } from 'lucide-react';

export function AccessDeniedPage() {
  const { user, logout } = useAuth();

  // Determine fallback route based on role
  const getDestination = () => {
    if (!user) return '/login';
    if (user.role === 'platform_admin') return '/platform';
    if (user.role === 'member') return '/portal';
    return '/admin/dashboard';
  };

  const getDestinationLabel = () => {
    if (!user) return 'Ir para Login';
    if (user.role === 'platform_admin') return 'Voltar para Gestão SaaS';
    if (user.role === 'member') return 'Voltar para o Portal do Membro';
    return 'Voltar para o Painel Administrativo';
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
      <Card className="max-w-md w-full border-destructive/20 shadow-xl">
        <CardHeader className="text-center space-y-2">
          <div className="h-14 w-14 rounded-2xl bg-destructive/15 text-destructive border border-destructive/30 mx-auto flex items-center justify-center shadow-inner">
            <ShieldX className="h-8 w-8" />
          </div>
          <CardTitle className="text-2xl font-bold">403 — Acesso Restrito</CardTitle>
          <CardDescription>
            Você não possui autorização para acessar esta área ou funcionalidade.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-center text-xs text-muted-foreground">
          <p>
            Usuário conectado:{' '}
            <strong className="text-foreground">{user?.name || 'Não identificado'}</strong>
          </p>
          <p>
            Perfil de acesso atual:{' '}
            <span className="font-mono bg-muted px-2 py-0.5 rounded text-foreground">
              {user?.role || 'Visitante'}
            </span>
          </p>
          <p className="pt-2 leading-relaxed">
            As políticas de controle de acesso garantem a privacidade dos membros e o isolamento
            de dados administrativos e financeiros da congregação.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-2 pt-2">
          <Link to={getDestination()} className="w-full">
            <Button variant="default" className="w-full gap-2">
              <ArrowLeft className="h-4 w-4" />
              {getDestinationLabel()}
            </Button>
          </Link>
          <Button
            variant="outline"
            onClick={logout}
            className="w-full sm:w-auto text-destructive hover:text-destructive hover:bg-destructive/10 gap-1.5"
            title="Sair e conectar com outra conta"
          >
            <LogOut className="h-4 w-4" />
            <span>Sair</span>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
