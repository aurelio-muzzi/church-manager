import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { loginSchema, LoginFormData } from '../schemas';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, Loader2, Sparkles, Shield, User, DollarSign, Users } from 'lucide-react';
import { normalizeErrorMessage } from '@/services/http/errors';

export function LoginPage() {
  const { login } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Destino após login ou rota padrão baseada no perfil
  const fromLocation = (location.state as { from?: { pathname?: string } })?.from?.pathname;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'pastor@churchmanager.app',
      password: 'password123',
      rememberMe: true,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      const user = await login(data);
      success(`Bem-vindo(a), ${user.name}!`, 'Autenticado com Sucesso');

      // Redirecionamento por Papel Eclesiástico / SaaS
      if (fromLocation && fromLocation !== '/login') {
        navigate(fromLocation, { replace: true });
        return;
      }

      if (user.role === 'platform_admin') {
        navigate('/platform', { replace: true });
      } else if (user.role === 'member') {
        navigate('/portal', { replace: true });
      } else {
        navigate('/admin/dashboard', { replace: true });
      }
    } catch (err) {
      toastError(normalizeErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickLogin = (email: string) => {
    setValue('email', email, { shouldValidate: true });
    setValue('password', 'password123', { shouldValidate: true });
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1.5">
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Entrar na Plataforma
        </h2>
        <p className="text-xs text-muted-foreground">
          Digite suas credenciais para gerenciar sua igreja ou acessar seu portal
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        {/* Campo E-mail */}
        <div className="space-y-1.5">
          <Label htmlFor="email">E-mail Cadastrado</Label>
          <Input
            id="email"
            type="email"
            placeholder="seu.email@igreja.com.br"
            autoComplete="email"
            disabled={isSubmitting}
            {...register('email')}
            className={errors.email ? 'border-destructive focus-visible:ring-destructive' : ''}
          />
          {errors.email && (
            <p className="text-xs text-destructive font-medium mt-1">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Campo Senha */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Senha de Acesso</Label>
            <Link
              to="/recuperar-senha"
              className="text-xs text-primary hover:underline transition-colors font-medium"
            >
              Esqueceu a senha?
            </Link>
          </div>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              autoComplete="current-password"
              disabled={isSubmitting}
              {...register('password')}
              className={errors.password ? 'border-destructive focus-visible:ring-destructive pr-10' : 'pr-10'}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 transition-colors"
              tabIndex={-1}
              aria-label={showPassword ? 'Ocultar senha' : 'Exibir senha'}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-xs text-destructive font-medium mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Opção Lembrar de mim */}
        <div className="flex items-center space-x-2 pt-1">
          <Checkbox
            id="rememberMe"
            defaultChecked
            onCheckedChange={(checked) => setValue('rememberMe', Boolean(checked))}
          />
          <Label htmlFor="rememberMe" className="text-xs text-muted-foreground font-normal cursor-pointer">
            Lembrar desta conexão neste navegador
          </Label>
        </div>

        {/* Botão Entrar */}
        <Button
          type="submit"
          className="w-full h-11 text-sm font-semibold gap-2 shadow-md mt-2"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Verificando credenciais...</span>
            </>
          ) : (
            <span>Acessar ChurchManager</span>
          )}
        </Button>
      </form>

      {/* Contas Rápidas de Demonstração / Teste de RBAC */}
      <div className="pt-4 border-t border-border space-y-2.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-semibold flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Acesso Rápido de Demonstração:
          </span>
          <span className="text-[11px] bg-muted px-2 py-0.5 rounded">Ambiente Dev</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            type="button"
            onClick={() => handleQuickLogin('pastor@churchmanager.app')}
            className="flex items-center gap-2 p-2 rounded-lg border border-border bg-card/60 hover:bg-accent text-left transition-colors"
          >
            <Shield className="h-3.5 w-3.5 text-indigo-500 shrink-0" />
            <div className="truncate">
              <span className="font-semibold block truncate">Pastor / Admin</span>
              <span className="text-[10px] text-muted-foreground block truncate">pastor@churchmanager.app</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin('secretaria@churchmanager.app')}
            className="flex items-center gap-2 p-2 rounded-lg border border-border bg-card/60 hover:bg-accent text-left transition-colors"
          >
            <Users className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            <div className="truncate">
              <span className="font-semibold block truncate">Secretaria</span>
              <span className="text-[10px] text-muted-foreground block truncate">secretaria@...</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin('financeiro@churchmanager.app')}
            className="flex items-center gap-2 p-2 rounded-lg border border-border bg-card/60 hover:bg-accent text-left transition-colors"
          >
            <DollarSign className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            <div className="truncate">
              <span className="font-semibold block truncate">Tesouraria</span>
              <span className="text-[10px] text-muted-foreground block truncate">financeiro@...</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin('gabriel.membro@gmail.com')}
            className="flex items-center gap-2 p-2 rounded-lg border border-border bg-card/60 hover:bg-accent text-left transition-colors"
          >
            <User className="h-3.5 w-3.5 text-sky-500 shrink-0" />
            <div className="truncate">
              <span className="font-semibold block truncate">Portal Membro</span>
              <span className="text-[10px] text-muted-foreground block truncate">gabriel.membro@...</span>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}
