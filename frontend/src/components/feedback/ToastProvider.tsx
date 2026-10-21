import { useState, useCallback, ReactNode } from 'react';
import { ToastContext, ToastItem } from './ToastContext';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    ({ title, description, variant = 'default', duration = 4000 }: Omit<ToastItem, 'id'>) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: ToastItem = { id, title, description, variant, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          dismiss(id);
        }, duration);
      }
    },
    [dismiss]
  );

  const success = useCallback(
    (description: string, title = 'Sucesso') => {
      toast({ title, description, variant: 'success' });
    },
    [toast]
  );

  const error = useCallback(
    (description: string, title = 'Erro na Operação') => {
      toast({ title, description, variant: 'error', duration: 6000 });
    },
    [toast]
  );

  const warning = useCallback(
    (description: string, title = 'Atenção') => {
      toast({ title, description, variant: 'warning', duration: 5000 });
    },
    [toast]
  );

  const info = useCallback(
    (description: string, title = 'Informação') => {
      toast({ title, description, variant: 'info' });
    },
    [toast]
  );

  return (
    <ToastContext.Provider
      value={{ toasts, toast, dismiss, success, error, warning, info }}
    >
      {children}

      {/* Toast Notification Container */}
      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
      >
        {toasts.map((t) => {
          const isSuccess = t.variant === 'success';
          const isError = t.variant === 'error';
          const isWarning = t.variant === 'warning';
          const isInfo = t.variant === 'info';

          return (
            <div
              key={t.id}
              className={cn(
                'pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg backdrop-blur-md transition-all duration-300 animate-in slide-in-from-bottom-5',
                isSuccess && 'bg-card border-emerald-500/40 text-foreground',
                isError && 'bg-card border-destructive/50 text-foreground',
                isWarning && 'bg-card border-amber-500/40 text-foreground',
                isInfo && 'bg-card border-sky-500/40 text-foreground',
                !isSuccess && !isError && !isWarning && !isInfo && 'bg-card border-border text-foreground'
              )}
            >
              <div className="shrink-0 mt-0.5">
                {isSuccess && <CheckCircle2 className="h-5 w-5 text-emerald-500" />}
                {isError && <AlertCircle className="h-5 w-5 text-destructive" />}
                {isWarning && <AlertTriangle className="h-5 w-5 text-amber-500" />}
                {isInfo && <Info className="h-5 w-5 text-sky-500" />}
                {!isSuccess && !isError && !isWarning && !isInfo && (
                  <Info className="h-5 w-5 text-primary" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                {t.title && (
                  <h4 className="font-semibold text-sm leading-tight text-foreground">
                    {t.title}
                  </h4>
                )}
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  {t.description}
                </p>
              </div>

              <button
                onClick={() => dismiss(t.id)}
                className="shrink-0 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                aria-label="Fechar notificação"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
