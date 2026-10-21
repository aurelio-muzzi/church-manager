import React, { useState } from 'react';
import type { MemberChangeRequest } from '@/modules/members/types';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { reviewChangeRequestSchema, type ReviewChangeRequestFormData } from '@/modules/members/schemas';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { EmptyState } from '@/components/shared/EmptyState';
import {
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  UserCheck,
  ShieldCheck,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { formatDate } from '@/utils/formatters';

interface ChangeRequestsTabProps {
  changeRequests: MemberChangeRequest[];
  isLoading: boolean;
  onReviewRequest: (
    id: string,
    data: { action: 'approve' | 'reject'; reviewNotes?: string }
  ) => Promise<void>;
}

export const ChangeRequestsTab: React.FC<ChangeRequestsTabProps> = ({
  changeRequests,
  onReviewRequest,
}) => {
  const [selectedRequest, setSelectedRequest] = useState<MemberChangeRequest | null>(null);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve');
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ReviewChangeRequestFormData>({
    resolver: zodResolver(reviewChangeRequestSchema),
    defaultValues: {
      action: 'approve',
      reviewNotes: '',
    },
  });

  const handleOpenReview = (request: MemberChangeRequest, action: 'approve' | 'reject') => {
    setSelectedRequest(request);
    setReviewAction(action);
    reset({
      action,
      reviewNotes: action === 'reject' ? 'Dados cadastrais divergentes dos documentos apresentados.' : '',
    });
    setIsReviewModalOpen(true);
  };

  const onSubmitReview = async (data: ReviewChangeRequestFormData) => {
    if (!selectedRequest) return;
    try {
      setIsSubmitting(true);
      await onReviewRequest(selectedRequest.id, {
        action: data.action,
        reviewNotes: data.reviewNotes,
      });
      setIsReviewModalOpen(false);
      setSelectedRequest(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const pendingRequests = changeRequests.filter((r) => r.status === 'pending');
  const reviewedRequests = changeRequests.filter((r) => r.status !== 'pending');

  const fieldLabels: Record<string, string> = {
    phone: 'Telefone / WhatsApp',
    email: 'E-mail',
    address: 'Endereço Residencial',
    neighborhood: 'Bairro',
    city: 'Cidade',
    state: 'Estado (UF)',
    postalCode: 'CEP',
    emergencyContactName: 'Nome Contato de Emergência',
    emergencyContactPhone: 'Telefone Contato de Emergência',
    maritalStatus: 'Estado Civil',
    legalGuardianName: 'Nome do Responsável Legal',
    legalGuardianPhone: 'Telefone do Responsável',
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div>
        <div className="flex items-center gap-2">
          <h3 className="text-base font-semibold text-foreground">
            Aprovações de Alterações Cadastrais
          </h3>
          {pendingRequests.length > 0 && (
            <Badge variant="warning" className="gap-1 font-semibold text-xs">
              <Clock className="h-3 w-3" />
              {pendingRequests.length} pendente(s)
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">
          Solicitações enviadas por membros através do Portal do Membro requerem validação da Secretaria antes de serem aplicadas aos registros oficiais.
        </p>
      </div>

      {/* Solicitações Pendentes */}
      <div className="space-y-4">
        <h4 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
          Pendentes de Avaliação ({pendingRequests.length})
        </h4>

        {pendingRequests.length === 0 ? (
          <EmptyState
            icon={ShieldCheck}
            title="Tudo em dia!"
            description="Nenhuma solicitação de alteração cadastral pendente no momento."
          />
        ) : (
          <div className="space-y-4">
            {pendingRequests.map((req) => (
              <Card key={req.id} className="border-amber-500/30 bg-card overflow-hidden">
                <CardHeader className="bg-amber-500/5 pb-3 border-b border-border">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="h-8 w-8 rounded-lg bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold text-xs">
                        <UserCheck className="h-4 w-4" />
                      </div>
                      <div>
                        <CardTitle className="text-sm font-semibold">{req.memberName}</CardTitle>
                        <CardDescription className="text-xs">
                          {req.memberEmail || 'E-mail não informado'} • Solicitado em {formatDate(req.createdAt)}
                        </CardDescription>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 gap-1 text-xs border-destructive/40 text-destructive hover:bg-destructive/10"
                        onClick={() => handleOpenReview(req, 'reject')}
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        Rejeitar
                      </Button>
                      <Button
                        size="sm"
                        className="h-8 gap-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={() => handleOpenReview(req, 'approve')}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        Aprovar Alteração
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-4">
                  <div className="space-y-3">
                    <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
                      <ArrowRight className="h-3.5 w-3.5 text-primary" />
                      Comparativo de Dados (Antes vs Depois)
                    </span>

                    {/* Tabela de Diff Visual */}
                    <div className="overflow-x-auto rounded-lg border border-border">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-muted/50 text-muted-foreground uppercase border-b border-border">
                          <tr>
                            <th className="px-3 py-2 font-semibold w-1/3">Campo Alterado</th>
                            <th className="px-3 py-2 font-semibold w-1/3 text-muted-foreground">
                              Valor Atual no Cadastro
                            </th>
                            <th className="px-3 py-2 font-semibold w-1/3 text-emerald-600 dark:text-emerald-400">
                              Novo Valor Solicitado
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                          {Object.entries(req.proposedChanges).map(([key, newVal]) => {
                            const origVal = req.originalData[key];
                            const label = fieldLabels[key] || key;

                            return (
                              <tr key={key} className="hover:bg-muted/20">
                                <td className="px-3 py-2.5 font-medium text-foreground">
                                  {label}
                                </td>
                                <td className="px-3 py-2.5 text-muted-foreground line-through opacity-80">
                                  {String(origVal || '—')}
                                </td>
                                <td className="px-3 py-2.5 font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10">
                                  {String(newVal || '—')}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Histórico de Solicitações Já Avaliadas */}
      {reviewedRequests.length > 0 && (
        <div className="space-y-3 pt-4 border-t border-border">
          <h4 className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
            Histórico Recente de Avaliações ({reviewedRequests.length})
          </h4>

          <div className="space-y-2">
            {reviewedRequests.map((req) => (
              <div
                key={req.id}
                className="p-3 rounded-lg border border-border bg-card/40 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  {req.status === 'approved' ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-destructive shrink-0" />
                  )}
                  <div>
                    <span className="font-semibold text-foreground">{req.memberName}</span>
                    <span className="text-muted-foreground ml-2">
                      ({Object.keys(req.proposedChanges).length} campos alterados)
                    </span>
                    {req.reviewNotes && (
                      <p className="text-[11px] text-muted-foreground italic mt-0.5">
                        Justificativa: "{req.reviewNotes}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant={req.status === 'approved' ? 'success' : 'destructive'}>
                    {req.status === 'approved' ? 'Aprovado' : 'Rejeitado'}
                  </Badge>
                  <span className="text-muted-foreground text-[11px]">
                    {req.reviewedAt ? formatDate(req.reviewedAt) : '—'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal de Confirmação de Avaliação */}
      <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {reviewAction === 'approve' ? (
                <>
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                  Confirmar Aprovação de Alterações
                </>
              ) : (
                <>
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                  Rejeitar Solicitação Cadastral
                </>
              )}
            </DialogTitle>
            <DialogDescription>
              {reviewAction === 'approve'
                ? `As alterações solicitadas por ${selectedRequest?.memberName} serão imediatamente aplicadas ao cadastro oficial.`
                : `A solicitação de ${selectedRequest?.memberName} será rejeitada. Forneça uma justificativa clara que será exibida ao membro.`}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmitReview)} className="space-y-3 pt-2">
            <div className="space-y-1">
              <Label htmlFor="review-notes">
                {reviewAction === 'reject' ? 'Justificativa da Rejeição *' : 'Notas do Revisor (Opcional)'}
              </Label>
              <Textarea
                id="review-notes"
                rows={3}
                placeholder={
                  reviewAction === 'reject'
                    ? 'Explique o motivo da recusa para que o membro possa corrigir os dados...'
                    : 'Anotações da secretaria sobre a aprovação...'
                }
                {...register('reviewNotes')}
                aria-invalid={!!errors.reviewNotes}
              />
              {errors.reviewNotes && (
                <p className="text-xs text-destructive">{errors.reviewNotes.message}</p>
              )}
            </div>

            <DialogFooter className="pt-2 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsReviewModalOpen(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant={reviewAction === 'approve' ? 'default' : 'destructive'}
                disabled={isSubmitting}
                className={reviewAction === 'approve' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : ''}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : reviewAction === 'approve' ? (
                  'Efetivar Aprovação'
                ) : (
                  'Rejeitar Pedido'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
