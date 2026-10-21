import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { App } from '@/app/App';
import { MetricKpiCard } from '@/components/shared/MetricKpiCard';
import { EmptyState } from '@/components/shared/EmptyState';
import { ErrorState } from '@/components/shared/ErrorState';
import { ConfirmationDialog } from '@/components/shared/ConfirmationDialog';
import { Users } from 'lucide-react';
import { ToastProvider } from '@/components/feedback/ToastProvider';
import { useToast } from '@/hooks/useToast';

function ToastTestTrigger() {
  const { success, error, warning, info } = useToast();
  return (
    <div>
      <button onClick={() => success('Operação realizada com sucesso!')}>
        Disparar Sucesso
      </button>
      <button onClick={() => error('Ocorreu um erro no servidor.')}>
        Disparar Erro
      </button>
      <button onClick={() => warning('Aviso de conflito!')}>
        Disparar Aviso
      </button>
      <button onClick={() => info('Informativo importante')}>
        Disparar Info
      </button>
    </div>
  );
}

describe('Etapa 02 — Design System e Layouts', () => {
  it('deve renderizar o Showcase completo do Design System na rota inicial', () => {
    render(<App />);
    expect(screen.getAllByText(/Design System/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/Controles de Formulário/i)).toBeInTheDocument();
    expect(screen.getByText(/Diálogos e Modais Acessíveis/i)).toBeInTheDocument();
  });

  it('deve renderizar MetricKpiCard com valores e tendência calculada', () => {
    render(
      <MetricKpiCard
        title="Membros Ativos"
        value={350}
        icon={Users}
        trendPercentage={15.4}
      />
    );
    expect(screen.getByText('Membros Ativos')).toBeInTheDocument();
    expect(screen.getByText('350')).toBeInTheDocument();
    expect(screen.getByText('+15.4%')).toBeInTheDocument();
  });

  it('deve renderizar MetricKpiCard em modo Skeleton sem quebrar layout', () => {
    const { container } = render(
      <MetricKpiCard
        title="Membros Ativos"
        value={350}
        icon={Users}
        isLoading={true}
      />
    );
    // Deve conter classes de pulse de skeleton
    const skeletons = container.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('deve renderizar EmptyState com ação clicável', () => {
    const onActionMock = vi.fn();
    render(
      <EmptyState
        title="Nenhum registro encontrado"
        description="Adicione seu primeiro registro para começar."
        actionLabel="Adicionar Agora"
        onAction={onActionMock}
      />
    );
    expect(screen.getByText('Nenhum registro encontrado')).toBeInTheDocument();
    const actionButton = screen.getByRole('button', { name: /adicionar agora/i });
    fireEvent.click(actionButton);
    expect(onActionMock).toHaveBeenCalledTimes(1);
  });

  it('deve renderizar ErrorState com botão de retry funcional', () => {
    const onRetryMock = vi.fn();
    render(
      <ErrorState
        title="Erro ao carregar dados"
        description="Falha de conexão com a API."
        onRetry={onRetryMock}
        error={new Error('Network timeout')}
      />
    );
    expect(screen.getByText('Erro ao carregar dados')).toBeInTheDocument();
    const retryBtn = screen.getByRole('button', { name: /tentar novamente/i });
    fireEvent.click(retryBtn);
    expect(onRetryMock).toHaveBeenCalledTimes(1);
  });

  it('deve controlar abertura e confirmação do ConfirmationDialog', () => {
    const onConfirmMock = vi.fn();
    const onOpenChangeMock = vi.fn();
    render(
      <ConfirmationDialog
        open={true}
        onOpenChange={onOpenChangeMock}
        title="Confirmação de Exclusão"
        description="Deseja realmente remover este item?"
        onConfirm={onConfirmMock}
        isDestructive={true}
        confirmLabel="Sim, Remover"
      />
    );
    expect(screen.getByText('Confirmação de Exclusão')).toBeInTheDocument();
    const confirmBtn = screen.getByRole('button', { name: /sim, remover/i });
    fireEvent.click(confirmBtn);
    expect(onConfirmMock).toHaveBeenCalledTimes(1);
    expect(onOpenChangeMock).toHaveBeenCalledWith(false);
  });

  it('deve disparar e renderizar toasts de feedback na tela', () => {
    render(
      <ToastProvider>
        <ToastTestTrigger />
      </ToastProvider>
    );
    const successBtn = screen.getByRole('button', { name: /disparar sucesso/i });
    fireEvent.click(successBtn);
    expect(screen.getByText('Operação realizada com sucesso!')).toBeInTheDocument();

    const errorBtn = screen.getByRole('button', { name: /disparar erro/i });
    fireEvent.click(errorBtn);
    expect(screen.getByText('Ocorreu um erro no servidor.')).toBeInTheDocument();
  });
});
