import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Plus, Trash2 } from 'lucide-react';
import { scheduleFormSchema, type ScheduleFormData } from '../schemas';
import type { Ministry, Schedule, ScheduleConflict } from '../types';
import type { Member } from '@/modules/members/types';
import { ministryService } from '@/services/api/ministryService';
import { ScheduleConflictAlert } from './ScheduleConflictAlert';

interface ScheduleFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  scheduleToEdit?: Schedule | null;
  ministries: Ministry[];
  members: Member[];
  onSave: (data: ScheduleFormData) => Promise<void>;
}

export const ScheduleFormModal: React.FC<ScheduleFormModalProps> = ({
  open,
  onOpenChange,
  scheduleToEdit,
  ministries,
  members,
  onSave,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [conflicts, setConflicts] = useState<ScheduleConflict[]>([]);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      ministryId: ministries[0]?.id || '',
      title: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      startTime: '18:30',
      endTime: '20:30',
      volunteers: [{ memberId: members[0]?.id || '', roleName: 'Função Geral' }],
      notes: '',
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'volunteers',
  });

  useEffect(() => {
    if (open) {
      if (scheduleToEdit) {
        reset({
          ministryId: scheduleToEdit.ministryId,
          title: scheduleToEdit.title,
          description: scheduleToEdit.description || '',
          date: scheduleToEdit.date,
          startTime: scheduleToEdit.startTime,
          endTime: scheduleToEdit.endTime,
          volunteers: scheduleToEdit.volunteers.map((v) => ({
            memberId: v.memberId,
            roleName: v.roleName,
          })),
          notes: scheduleToEdit.notes || '',
        });
      } else {
        reset({
          ministryId: ministries[0]?.id || '',
          title: '',
          description: '',
          date: new Date().toISOString().split('T')[0],
          startTime: '18:30',
          endTime: '20:30',
          volunteers: [{ memberId: members[0]?.id || '', roleName: 'Função' }],
          notes: '',
        });
      }
      setConflicts([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, scheduleToEdit]);

  // Observa campos para detecção de conflitos em tempo real
  const watchedDate = useWatch({ control, name: 'date' });
  const watchedStartTime = useWatch({ control, name: 'startTime' });
  const watchedEndTime = useWatch({ control, name: 'endTime' });
  const watchedVolunteers = useWatch({ control, name: 'volunteers' });
  const volunteersKey = JSON.stringify(watchedVolunteers);

  useEffect(() => {
    if (!watchedDate || !watchedStartTime || !watchedEndTime || !watchedVolunteers?.length) {
      setConflicts([]);
      return;
    }

    const volunteerMemberIds = watchedVolunteers
      .map((v) => v?.memberId)
      .filter(Boolean) as string[];

    if (volunteerMemberIds.length === 0) {
      setConflicts([]);
      return;
    }

    let isMounted = true;
    ministryService
      .checkConflicts({
        date: watchedDate,
        startTime: watchedStartTime,
        endTime: watchedEndTime,
        volunteerMemberIds,
        excludeScheduleId: scheduleToEdit?.id,
      })
      .then((detected) => {
        if (isMounted) setConflicts(detected);
      })
      .catch(() => {
        if (isMounted) setConflicts([]);
      });

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    watchedDate,
    watchedStartTime,
    watchedEndTime,
    volunteersKey,
    scheduleToEdit,
  ]);

  const onSubmit = async (data: ScheduleFormData) => {
    try {
      setIsSubmitting(true);
      await onSave(data);
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <span>{scheduleToEdit ? 'Editar Escala de Serviço' : 'Criar Nova Escala de Serviço'}</span>
          </DialogTitle>
          <DialogDescription>
            Defina o ministério, horário e os voluntários. Conflitos de horário são detectados em tempo real.
          </DialogDescription>
        </DialogHeader>

        {/* Alerta de Conflito de Horário em Tempo Real */}
        <ScheduleConflictAlert conflicts={conflicts} />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="ministryId" className="text-xs font-semibold">
                Ministério Responsável *
              </Label>
              <select
                id="ministryId"
                className="w-full text-xs h-9 rounded-md border border-input bg-background px-3 py-1 text-foreground"
                {...register('ministryId')}
              >
                {ministries.map((min) => (
                  <option key={min.id} value={min.id}>
                    {min.name}
                  </option>
                ))}
              </select>
              {errors.ministryId && (
                <p className="text-[11px] text-destructive">{errors.ministryId.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-xs font-semibold">
                Título do Culto / Escala *
              </Label>
              <Input
                id="title"
                placeholder="Ex.: Culto de Celebração de Domingo (Noite)"
                className="text-xs h-9"
                {...register('title')}
              />
              {errors.title && (
                <p className="text-[11px] text-destructive">{errors.title.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="date" className="text-xs font-semibold">
                Data da Escala *
              </Label>
              <Input id="date" type="date" className="text-xs h-9" {...register('date')} />
              {errors.date && <p className="text-[11px] text-destructive">{errors.date.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="startTime" className="text-xs font-semibold">
                Início *
              </Label>
              <Input id="startTime" type="time" className="text-xs h-9" {...register('startTime')} />
              {errors.startTime && (
                <p className="text-[11px] text-destructive">{errors.startTime.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="endTime" className="text-xs font-semibold">
                Término *
              </Label>
              <Input id="endTime" type="time" className="text-xs h-9" {...register('endTime')} />
              {errors.endTime && (
                <p className="text-[11px] text-destructive">{errors.endTime.message}</p>
              )}
            </div>
          </div>

          {/* Voluntários Escalados */}
          <div className="space-y-2 pt-2 border-t border-border">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-xs font-semibold text-foreground">
                  Equipe de Voluntários ({fields.length}) *
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  Selecione os voluntários e atribua suas funções específicas para esta data.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1 h-7 text-xs"
                onClick={() => append({ memberId: members[0]?.id || '', roleName: 'Voluntário' })}
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Adicionar Voluntário</span>
              </Button>
            </div>

            {errors.volunteers?.message && (
              <p className="text-[11px] text-destructive">{errors.volunteers.message}</p>
            )}

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex items-center gap-2 p-2 rounded-md bg-muted/40 border border-border"
                >
                  <div className="flex-1">
                    <select
                      aria-label="Selecionar voluntário"
                      data-testid={`volunteer-member-select-${index}`}
                      className="w-full text-xs h-8 rounded-md border border-input bg-background px-2 py-1 text-foreground"
                      {...register(`volunteers.${index}.memberId` as const)}
                    >
                      <option value="">Selecione o membro...</option>
                      {members.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-44">
                    <Input
                      placeholder="Função (Ex.: Vocal, Projeção...)"
                      className="text-xs h-8"
                      {...register(`volunteers.${index}.roleName` as const)}
                    />
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                    disabled={fields.length <= 1}
                    onClick={() => remove(index)}
                    title="Remover voluntário"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1.5 pt-2">
            <Label htmlFor="notes" className="text-xs font-semibold">
              Instruções / Observações da Escala
            </Label>
            <Textarea
              id="notes"
              placeholder="Ex.: Chegar 1h antes para passagem de som / Trazer uniforme..."
              className="text-xs h-16 resize-none"
              {...register('notes')}
            />
          </div>

          <DialogFooter className="pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSubmitting}
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando escala...' : scheduleToEdit ? 'Atualizar Escala' : 'Criar Escala'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
