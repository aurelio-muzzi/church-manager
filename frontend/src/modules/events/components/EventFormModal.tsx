import React, { useEffect, useState } from 'react';
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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { eventFormSchema, type EventFormData } from '../schemas';
import type { ChurchEvent } from '../types';
import type { Congregation } from '@/modules/members/types';

interface EventFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eventToEdit?: ChurchEvent | null;
  congregations: Congregation[];
  onSave: (data: EventFormData) => Promise<void>;
}

export const EventFormModal: React.FC<EventFormModalProps> = ({
  open,
  onOpenChange,
  eventToEdit,
  congregations,
  onSave,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<EventFormData>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      congregationId: '',
      title: '',
      description: '',
      category: 'worship',
      type: 'service',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
      startTime: '19:00',
      endTime: '21:00',
      location: 'Nave Principal (Templo)',
      address: '',
      maxCapacity: 300,
      isRegistrationRequired: false,
      registrationFee: 0,
      checkInMethod: 'both',
      targetAudience: 'Toda a igreja',
    },
  });

  const isRegistrationRequired = watch('isRegistrationRequired');

  useEffect(() => {
    if (open) {
      if (eventToEdit) {
        reset({
          congregationId: eventToEdit.congregationId,
          title: eventToEdit.title,
          description: eventToEdit.description || '',
          category: eventToEdit.category,
          type: eventToEdit.type,
          startDate: eventToEdit.startDate,
          endDate: eventToEdit.endDate,
          startTime: eventToEdit.startTime,
          endTime: eventToEdit.endTime,
          location: eventToEdit.location,
          address: eventToEdit.address || '',
          maxCapacity: eventToEdit.maxCapacity || 0,
          isRegistrationRequired: eventToEdit.isRegistrationRequired,
          registrationFee: eventToEdit.registrationFee || 0,
          registrationDeadline: eventToEdit.registrationDeadline || '',
          checkInMethod: eventToEdit.checkInMethod,
          targetAudience: eventToEdit.targetAudience || '',
        });
      } else {
        reset({
          congregationId: congregations[0]?.id || '',
          title: '',
          description: '',
          category: 'worship',
          type: 'service',
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0],
          startTime: '19:00',
          endTime: '21:00',
          location: 'Nave Principal (Templo)',
          address: '',
          maxCapacity: 300,
          isRegistrationRequired: false,
          registrationFee: 0,
          checkInMethod: 'both',
          targetAudience: 'Toda a igreja',
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, eventToEdit]);

  const onSubmit = async (data: EventFormData) => {
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
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {eventToEdit ? 'Editar Evento / Culto' : 'Novo Culto ou Evento Especial'}
          </DialogTitle>
          <DialogDescription>
            Planeje reuniões, cultos semanais ou congressos com controle de capacidade e check-in.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="congregationId" className="text-xs font-semibold">
                Congregação Responsável *
              </Label>
              <select
                id="congregationId"
                className="w-full text-xs h-9 rounded-md border border-input bg-background px-3 py-1 text-foreground"
                {...register('congregationId')}
              >
                <option value="">Selecione a congregação...</option>
                {congregations.map((cong) => (
                  <option key={cong.id} value={cong.id}>
                    {cong.name}
                  </option>
                ))}
              </select>
              {errors.congregationId && (
                <p className="text-[11px] text-destructive">{errors.congregationId.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="title" className="text-xs font-semibold">
                Título do Evento / Culto *
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
              <Label htmlFor="category" className="text-xs font-semibold">
                Categoria *
              </Label>
              <select
                id="category"
                className="w-full text-xs h-9 rounded-md border border-input bg-background px-3 py-1 text-foreground"
                {...register('category')}
              >
                <option value="worship">Culto / Celebração</option>
                <option value="conference">Conferência / Congresso</option>
                <option value="seminar">Seminário / Ensino</option>
                <option value="workshop">Oficina / Workshop</option>
                <option value="meeting">Reunião / Encontro</option>
                <option value="youth">Jovens / Adolescentes</option>
                <option value="kids">Infantil (Kids)</option>
                <option value="outreach">Ação Social / Missões</option>
              </select>
              {errors.category && (
                <p className="text-[11px] text-destructive">{errors.category.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="type" className="text-xs font-semibold">
                Tipo *
              </Label>
              <select
                id="type"
                className="w-full text-xs h-9 rounded-md border border-input bg-background px-3 py-1 text-foreground"
                {...register('type')}
              >
                <option value="service">Culto Regular</option>
                <option value="special_event">Evento Especial</option>
              </select>
              {errors.type && (
                <p className="text-[11px] text-destructive">{errors.type.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="checkInMethod" className="text-xs font-semibold">
                Método de Check-in *
              </Label>
              <select
                id="checkInMethod"
                className="w-full text-xs h-9 rounded-md border border-input bg-background px-3 py-1 text-foreground"
                {...register('checkInMethod')}
              >
                <option value="both">Ambos (Manual & QR Code)</option>
                <option value="manual">Apenas Presença Manual</option>
                <option value="qr_code">Apenas QR Code / Ingresso</option>
              </select>
              {errors.checkInMethod && (
                <p className="text-[11px] text-destructive">{errors.checkInMethod.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="startDate" className="text-xs font-semibold">
                Data Início *
              </Label>
              <Input id="startDate" type="date" className="text-xs h-9" {...register('startDate')} />
              {errors.startDate && (
                <p className="text-[11px] text-destructive">{errors.startDate.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="endDate" className="text-xs font-semibold">
                Data Término *
              </Label>
              <Input id="endDate" type="date" className="text-xs h-9" {...register('endDate')} />
              {errors.endDate && (
                <p className="text-[11px] text-destructive">{errors.endDate.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="startTime" className="text-xs font-semibold">
                Horário Início *
              </Label>
              <Input id="startTime" type="time" className="text-xs h-9" {...register('startTime')} />
              {errors.startTime && (
                <p className="text-[11px] text-destructive">{errors.startTime.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="endTime" className="text-xs font-semibold">
                Horário Término *
              </Label>
              <Input id="endTime" type="time" className="text-xs h-9" {...register('endTime')} />
              {errors.endTime && (
                <p className="text-[11px] text-destructive">{errors.endTime.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="location" className="text-xs font-semibold">
                Local / Espaço Físico *
              </Label>
              <Input
                id="location"
                placeholder="Ex.: Templo Principal / Auditório 2"
                className="text-xs h-9"
                {...register('location')}
              />
              {errors.location && (
                <p className="text-[11px] text-destructive">{errors.location.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="maxCapacity" className="text-xs font-semibold">
                Capacidade Máxima de Lotação
              </Label>
              <Input
                id="maxCapacity"
                type="number"
                placeholder="Ex.: 300"
                className="text-xs h-9"
                {...register('maxCapacity')}
              />
            </div>
          </div>

          <div className="p-3 rounded-lg border border-border bg-muted/30 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="reg-switch" className="text-xs font-semibold text-foreground cursor-pointer">
                  Exigir Inscrição Prévia
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  Gera ingressos digitais com QR Code individual para os participantes.
                </p>
              </div>
              <Switch
                id="reg-switch"
                checked={isRegistrationRequired}
                onCheckedChange={(checked) => setValue('isRegistrationRequired', checked)}
              />
            </div>

            {isRegistrationRequired && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border/60">
                <div className="space-y-1.5">
                  <Label htmlFor="registrationFee" className="text-xs font-semibold">
                    Valor da Inscrição (R$ 0,00 para gratuito)
                  </Label>
                  <Input
                    id="registrationFee"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className="text-xs h-8"
                    {...register('registrationFee')}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="registrationDeadline" className="text-xs font-semibold">
                    Prazo Final de Inscrição
                  </Label>
                  <Input
                    id="registrationDeadline"
                    type="date"
                    className="text-xs h-8"
                    {...register('registrationDeadline')}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-xs font-semibold">
              Descrição / Programação do Evento
            </Label>
            <Textarea
              id="description"
              placeholder="Descreva detalhes, preletores convidados e orientações..."
              className="text-xs h-18 resize-none"
              {...register('description')}
            />
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting}>
              {isSubmitting ? 'Salvando...' : eventToEdit ? 'Atualizar Evento' : 'Criar Evento'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
