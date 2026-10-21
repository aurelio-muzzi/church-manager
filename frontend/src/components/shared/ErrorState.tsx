import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  error?: unknown;
  className?: string;
}

export function ErrorState({
  title = 'Não foi possível carregar as informações',
  description = 'Ocorreu uma falha na comunicação com o servidor. Verifique sua conexão e tente novamente.',
  onRetry,
  error,
  className,
}: ErrorStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 sm:p-12 border border-destructive/20 rounded-xl bg-destructive/5 my-4',
        className
      )}
    >
      <div className="h-12 w-12 rounded-xl bg-destructive/10 border border-destructive/30 flex items-center justify-center text-destructive mb-4 shadow-inner">
        <AlertCircle className="h-6 w-6" />
      </div>

      <h3 className="text-base sm:text-lg font-semibold text-foreground">
        {title}
      </h3>

      <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-6 leading-relaxed">
        {description}
      </p>

      {error instanceof Error && import.meta.env.DEV && (
        <pre className="text-xs text-destructive/80 font-mono bg-destructive/10 p-2 rounded mb-4 max-w-md overflow-x-auto text-left">
          {error.message}
        </pre>
      )}

      {onRetry && (
        <Button variant="outline" onClick={onRetry} className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Tentar Novamente
        </Button>
      )}
    </div>
  );
}
