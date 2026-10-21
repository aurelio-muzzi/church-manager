import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Award,
  Info,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { MemberScheduleItem } from '../types';
import {
  memberScheduleResponseSchema,
  type MemberScheduleResponseFormData,
} from '../schemas';

interface MemberSchedulesViewProps {
  schedules: MemberScheduleItem[];
  onRespond: (scheduleId: string, data: MemberScheduleResponseFormData) => Promise<void>;
  isLoading?: boolean;
}

export const MemberSchedulesView: React.FC<MemberSchedulesViewProps> = ({
  schedules,
  onRespond,
  isLoading = false,
}) => {
  const [selectedDeclineSchedule, setSelectedDeclineSchedule] = useState<MemberScheduleItem | null>(null);
  const [submittingScheduleId, setSubmittingScheduleId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<MemberScheduleResponseFormData>({
    resolver: zodResolver(memberScheduleResponseSchema),
    defaultValues: {
      status: 'declined',
      declineReason: '',
    },
  });

  const handleConfirm = async (schedule: MemberScheduleItem) => {
    try {
      setSubmittingScheduleId(schedule.scheduleId);
      await onRespond(schedule.scheduleId, { status: 'confirmed' });
    } finally {
      setSubmittingScheduleId(null);
    }
  };

  const onDeclineSubmit = async (data: MemberScheduleResponseFormData) => {
    if (!selectedDeclineSchedule) return;
    try {
      setSubmittingScheduleId(selectedDeclineSchedule.scheduleId);
      await onRespond(selectedDeclineSchedule.scheduleId, {
        status: 'declined',
        declineReason: data.declineReason,
      });
      setSelectedDeclineSchedule(null);
      reset();
    } finally {
      setSubmittingScheduleId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-gradient-to-r from-violet-500/10 via-indigo-500/5 to-transparent p-4 sm:p-5 rounded-2xl border border-violet-500/20">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-violet-500/20 text-violet-600 dark:text-violet-400 flex items-center justify-center shrink-0">
            <Calendar className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-foreground">
              Minhas Escalas Ministeriais
            </h3>
            <p className="text-xs text-muted-foreground">
              Confirme sua presença ou informe imprevistos com antecedência para sua liderança.
            </p>
          </div>
        </div>
      </div>

      {/* Schedules List */}
      <div className="space-y-4" data-testid="member-schedules-list">
        {schedules.length === 0 ? (
          <Card className="border-dashed border-2">
            <CardContent className="py-12 text-center text-muted-foreground space-y-2">
              <Calendar className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
              <p className="font-semibold text-sm">Nenhuma escala programada no momento</p>
              <p className="text-xs max-w-sm mx-auto">
                Quando você for incluído nas escalas dos seus ministérios, elas aparecerão aqui para confirmação.
              </p>
            </CardContent>
          </Card>
        ) : (
          schedules.map((schedule) => {
            const isPending = schedule.status === 'pending';
            const isConfirmed = schedule.status === 'confirmed';
            const isDeclined = schedule.status === 'declined';

            return (
              <Card
                key={schedule.scheduleId}
                className={`transition-all border-border/80 shadow-sm overflow-hidden ${
                  isPending
                    ? 'border-amber-400/60 bg-amber-50/20 dark:bg-amber-950/10'
                    : isConfirmed
                      ? 'border-emerald-400/40'
                      : 'border-rose-400/30 opacity-80'
                }`}
                data-testid={`schedule-card-${schedule.scheduleId}`}
              >
                <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold text-white shadow-xs"
                        style={{ backgroundColor: schedule.ministryColor || '#6366f1' }}
                      >
                        {schedule.ministryName}
                      </span>

                      {isPending && (
                        <Badge
                          variant="outline"
                          className="bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[10px] gap-1"
                          data-testid="status-pending"
                        >
                          <Clock className="h-3 w-3" />
                          Aguardando Confirmação
                        </Badge>
                      )}

                      {isConfirmed && (
                        <Badge
                          variant="success"
                          className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] gap-1"
                          data-testid="status-confirmed"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          Presença Confirmada
                        </Badge>
                      )}

                      {isDeclined && (
                        <Badge
                          variant="destructive"
                          className="text-[10px] gap-1"
                          data-testid="status-declined"
                        >
                          <XCircle className="h-3 w-3" />
                          Recusada / Ausência Justificada
                        </Badge>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
                      <Award className="h-4 w-4 text-primary" />
                      <span>Função: {schedule.roleName}</span>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5 text-primary" />
                        <span>Data: <strong>{new Date(schedule.date).toLocaleDateString('pt-BR')}</strong></span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5 text-primary" />
                        <span>Horário: <strong>{schedule.startTime} - {schedule.endTime}</strong></span>
                      </div>
                    </div>

                    {schedule.notes && (
                      <div className="flex items-start gap-1.5 text-xs text-muted-foreground bg-muted/40 p-2 rounded-lg border border-border/40 max-w-xl">
                        <Info className="h-3.5 w-3.5 text-indigo-500 shrink-0 mt-0.5" />
                        <span>{schedule.notes}</span>
                      </div>
                    )}

                    {isDeclined && schedule.declineReason && (
                      <div className="flex items-start gap-1.5 text-xs text-rose-600 dark:text-rose-400 bg-rose-500/10 p-2 rounded-lg border border-rose-500/20 max-w-xl">
                        <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                        <span>Motivo informado: {schedule.declineReason}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions for Pending Schedules */}
                  {isPending && (
                    <div className="flex sm:flex-col items-center gap-2 shrink-0">
                      <Button
                        size="sm"
                        onClick={() => handleConfirm(schedule)}
                        disabled={isLoading || submittingScheduleId === schedule.scheduleId}
                        className="w-full sm:w-40 gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs text-xs"
                        data-testid={`confirm-schedule-btn-${schedule.scheduleId}`}
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Confirmar Presença
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedDeclineSchedule(schedule);
                          reset({ status: 'declined', declineReason: '' });
                        }}
                        disabled={isLoading || submittingScheduleId === schedule.scheduleId}
                        className="w-full sm:w-40 gap-1.5 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-xs"
                        data-testid={`decline-schedule-btn-${schedule.scheduleId}`}
                      >
                        <XCircle className="h-4 w-4" />
                        Não Comparecerei
                      </Button>
                    </div>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Decline Justification Modal */}
      {selectedDeclineSchedule && (
        <Dialog
          open={Boolean(selectedDeclineSchedule)}
          onOpenChange={(open) => !open && setSelectedDeclineSchedule(null)}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base flex items-center gap-2 text-rose-600">
                <AlertCircle className="h-5 w-5" />
                Justificar Ausência na Escala
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Informe o motivo para que a liderança do ministério de{' '}
                <strong>{selectedDeclineSchedule.ministryName}</strong> possa providenciar substituição.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit(onDeclineSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="declineReason" className="text-xs font-semibold">
                  Motivo da Ausência / Imprevisto *
                </Label>
                <Textarea
                  id="declineReason"
                  placeholder="Ex: Viagem profissional previamente agendada ou motivo de saúde..."
                  rows={3}
                  className="text-xs"
                  {...register('declineReason')}
                  data-testid="decline-reason-input"
                />
                {errors.declineReason && (
                  <p className="text-[11px] text-destructive" data-testid="decline-reason-error">
                    {errors.declineReason.message}
                  </p>
                )}
              </div>

              <DialogFooter className="flex justify-between sm:justify-between">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDeclineSchedule(null)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting}
                  className="bg-rose-600 hover:bg-rose-700 text-white"
                  data-testid="submit-decline-btn"
                >
                  Enviar Justificativa
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
