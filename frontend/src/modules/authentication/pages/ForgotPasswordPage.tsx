import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { forgotPasswordSchema, ForgotPasswordFormData } from '../schemas';
import { authService } from '@/services/api/authService';
import { useToast } from '@/hooks/useToast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle2, Loader2, Mail } from 'lucide-react';
import { normalizeErrorMessage } from '@/services/http/errors';

export function ForgotPasswordPage() {
  const { error: toastError } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsSubmitting(true);
    try {
      await authService.forgotPassword(data);
      setIsSubmitted(true);
    } catch (err) {
      toastError(normalizeErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {isSubmitted ? (
        <div className="text-center space-y-4 py-2">
          <div className="h-12 w-12 rounded-full bg-emerald-500/15 text-emerald-500 mx-auto flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-foreground">Instruções Enviadas!</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Enviamos um link de recuperação para o e-mail{' '}
              <strong className="text-foreground">{getValues('email')}</strong>.
              Verifique sua caixa de entrada e siga as instruções.
            </p>
          </div>
          <div className="pt-2">
            <Link to="/login">
              <Button variant="outline" className="w-full gap-2 text-xs">
                <ArrowLeft className="h-3.5 w-3.5" />
                Voltar para o Login
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="text-center space-y-1.5">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Recuperar Acesso
            </h2>
            <p className="text-xs text-muted-foreground">
              Informe o e-mail cadastrado na sua congregação para redefinir sua senha
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            <div className="space-y-1.5">
              <Label htmlFor="forgot-email">E-mail Cadastrado</Label>
              <div className="relative">
                <Input
                  id="forgot-email"
                  type="email"
                  placeholder="seu.email@igreja.com.br"
                  disabled={isSubmitting}
                  {...register('email')}
                  className={errors.email ? 'border-destructive pl-9' : 'pl-9'}
                />
                <Mail className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
              {errors.email && (
                <p className="text-xs text-destructive font-medium mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-sm font-semibold gap-2 mt-2"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Enviando solicitação...</span>
                </>
              ) : (
                <span>Enviar Link de Recuperação</span>
              )}
            </Button>
          </form>

          <div className="text-center pt-2">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Lembrou sua senha? Voltar ao Login</span>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
