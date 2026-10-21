import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { CheckCircle2, XCircle, UserCheck, Calendar, Clock, AlertTriangle } from 'lucide-react';
import { scheduleResponseSchema, type ScheduleResponseFormData } from '../schemas';
import type { Schedule, ScheduleVolunteer } from '../types';
import type { Member } from '@/modules/members/types';

interface VolunteerResponseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schedule: Schedule | null;
  volunteer: ScheduleVolunteer | null;
  availableMembers: Member[];
  onRespond: (data: ScheduleResponseFormData) => Promise<void>;
}

export const VolunteerResponseModal: React.FC<VolunteerResponseModalProps> = ({
  open,
  onOpenChange,
  schedule,
  volunteer,
  availableMembers,
  onRespond,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ScheduleResponseFormData>({
    resolver: zodResolver(scheduleResponseSchema),
    defaultValues: {
      action: 'confirm',
      reason: '',
      substituteMemberId: '',
    },
  });

  const selectedAction = watch('action');

  React.useEffect(() => {
    if (open) {
      reset({
        action: 'confirm',
        reason: '',
        substituteMemberId: '',
      });
    }
  }, [open, reset]);

  const onSubmit = async (data: ScheduleResponseFormData) => {
    try {
      setIsSubmitting(true);
      await onRespond(data);
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!schedule || !volunteer) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5 text-primary" />
            <span>Resposta da Escala de Serviço</span>
          </DialogTitle>
          <DialogDescription>
            Confirme sua disponibilidade ou justifique a impossibilidade de comparecimento.
          </DialogDescription>
        </DialogHeader>

        {/* Resumo da Escala */}
        <div className="p-3 rounded-lg bg-muted/60 border border-border text-xs space-y-1.5">
          <div className="font-semibold text-foreground text-sm flex items-center justify-between">
            <span>{schedule.title}</span>
            <span
              className="px-2 py-0.5 rounded text-[10px] font-bold text-white"
              style={{ backgroundColor: schedule.ministryColor }}
            >
              {schedule.ministryName}
            </span>
          </div>
          <div className="flex items-center gap-4 text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {schedule.date}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {schedule.startTime} às {schedule.endTime}
            </span>
          </div>
          <div className="text-foreground pt-1 border-t border-border/50">
            Voluntário: <strong>{volunteer.memberName}</strong> ({volunteer.roleName})
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          {/* Seletor de Ação */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold">Escolha a sua resposta *</Label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setValue('action', 'confirm')}
                className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-lg border text-xs font-medium transition-all ${
                  selectedAction === 'confirm'
                    ? 'border-emerald-600 bg-emerald-500/10 text-emerald-800 dark:text-emerald-400 font-bold ring-2 ring-emerald-500/30'
                    : 'border-border bg-card text-muted-foreground hover:bg-muted/50'
                }`}
              >
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <span>Confirmar</span>
              </button>

              <button
                type="button"
                onClick={() => setValue('action', 'decline')}
                className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-lg border text-xs font-medium transition-all ${
                  selectedAction === 'decline'
                    ? 'border-destructive bg-destructive/10 text-destructive font-bold ring-2 ring-destructive/30'
                    : 'border-border bg-card text-muted-foreground hover:bg-muted/50'
                }`}
              >
                <XCircle className="h-5 w-5 text-destructive" />
                <span>Recusar</span>
              </button>

              <button
                type="button"
                onClick={() => setValue('action', 'substitute')}
                className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-lg border text-xs font-medium transition-all ${
                  selectedAction === 'substitute'
                    ? 'border-indigo-600 bg-indigo-500/10 text-indigo-800 dark:text-indigo-400 font-bold ring-2 ring-indigo-500/30'
                    : 'border-border bg-card text-muted-foreground hover:bg-muted/50'
                }`}
              >
                <UserCheck className="h-5 w-5 text-indigo-600" />
                <span>Substituir</span>
              </button>
            </div>
          </div>

          {/* Campo de Justificativa (Obrigatório se recusar) */}
          {selectedAction === 'decline' && (
            <div className="space-y-1.5 animate-in fade-in-50 duration-150">
              <Label htmlFor="reason" className="text-xs font-semibold text-destructive flex items-center gap-1">
                <AlertTriangle className="h-3.5 w-3.5" />
                Justificativa da Impossibilidade *
              </Label>
              <Textarea
                id="reason"
                placeholder="Ex.: Viagem de trabalho inadiável / Sintomas gripais..."
                className="text-xs resize-none h-20"
                {...register('reason')}
              />
              {errors.reason && (
                <p className="text-[11px] text-destructive font-medium">{errors.reason.message}</p>
              )}
            </div>
          )}

          {/* Campo de Seleção de Substituto */}
          {selectedAction === 'substitute' && (
            <div className="space-y-1.5 animate-in fade-in-50 duration-150">
              <Label htmlFor="substituteMemberId" className="text-xs font-semibold">
                Indicar Voluntário Substituto *
              </Label>
              <select
                id="substituteMemberId"
                className="w-full text-xs h-9 rounded-md border border-input bg-background px-3 py-1 text-foreground"
                {...register('substituteMemberId')}
              >
                <option value="">Selecione um membro disponível...</option>
                {availableMembers
                  .filter((m) => m.id !== volunteer.memberId)
                  .map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.phone || 'Sem telefone'})
                    </option>
                  ))}
              </select>
              {errors.substituteMemberId && (
                <p className="text-[11px] text-destructive font-medium">
                  {errors.substituteMemberId.message}
                </p>
              )}
            </div>
          )}

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSubmitting}
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className={
                selectedAction === 'confirm'
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : selectedAction === 'decline'
                  ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground'
                  : 'bg-primary text-primary-foreground'
              }
            >
              {isSubmitting ? 'Gravando resposta...' : 'Confirmar Resposta'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
