import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Plus,
  Ticket,
  QrCode,
  CheckCircle2,
  Clock,
  Trash2,
} from 'lucide-react';
import type { ChurchEvent, EventRegistration } from '../types';
import { TicketPreviewModal } from './TicketPreviewModal';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  eventRegistrationFormSchema,
  type EventRegistrationFormData,
} from '../schemas';

interface EventRegistrationsTabProps {
  events: ChurchEvent[];
  registrations: EventRegistration[];
  onNewRegistration: (eventId: string, data: EventRegistrationFormData) => Promise<void>;
  onCancelRegistration: (id: string) => Promise<void>;
}

export const EventRegistrationsTab: React.FC<EventRegistrationsTabProps> = ({
  events,
  registrations,
  onNewRegistration,
  onCancelRegistration,
}) => {
  const [selectedEventId, setSelectedEventId] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [previewTicket, setPreviewTicket] = useState<EventRegistration | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [targetEventId, setTargetEventId] = useState(events[0]?.id || '');

  const registrationEvents = events.filter((e) => e.isRegistrationRequired);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EventRegistrationFormData>({
    resolver: zodResolver(eventRegistrationFormSchema),
    defaultValues: {
      attendeeName: '',
      attendeeEmail: '',
      attendeePhone: '',
    },
  });

  const filteredRegistrations = registrations.filter((r) => {
    if (selectedEventId !== 'all' && r.eventId !== selectedEventId) return false;
    if (search) {
      const q = search.toLowerCase();
      const match =
        r.attendeeName.toLowerCase().includes(q) ||
        r.attendeeEmail.toLowerCase().includes(q) ||
        r.ticketCode.toLowerCase().includes(q) ||
        r.eventTitle.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  const onSubmit = async (data: EventRegistrationFormData) => {
    await onNewRegistration(targetEventId, data);
    reset();
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Barra de Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between bg-card p-3.5 rounded-xl border border-border shadow-xs">
        <div className="flex flex-1 flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar participante por nome, e-mail ou código do ingresso..."
              className="pl-8 text-xs h-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            aria-label="Filtrar por Evento com Inscrição"
            className="text-xs h-9 rounded-md border border-input bg-background px-2.5 text-foreground"
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
          >
            <option value="all">Todos os Eventos ({registrations.length})</option>
            {events.map((e) => (
              <option key={e.id} value={e.id}>
                {e.title}
              </option>
            ))}
          </select>
        </div>

        <Button
          size="sm"
          className="gap-1.5 shrink-0"
          onClick={() => {
            setTargetEventId(registrationEvents[0]?.id || events[0]?.id || '');
            reset();
            setIsModalOpen(true);
          }}
        >
          <Plus className="h-4 w-4" />
          <span>Nova Inscrição</span>
        </Button>
      </div>

      {/* Tabela de Inscrições */}
      <Card className="border-border">
        <CardContent className="p-0 overflow-x-auto">
          {filteredRegistrations.length === 0 ? (
            <div className="p-12 text-center">
              <Ticket className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-foreground">Nenhuma inscrição encontrada</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Realize uma nova inscrição ou selecione outro evento para visualização.
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 text-muted-foreground border-b border-border">
                <tr>
                  <th className="py-3 px-4 font-semibold">Participante</th>
                  <th className="py-3 px-4 font-semibold">Evento</th>
                  <th className="py-3 px-4 font-semibold">Ingresso</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold">Check-in</th>
                  <th className="py-3 px-4 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredRegistrations.map((reg) => (
                  <tr key={reg.id} className="hover:bg-muted/20 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-foreground">{reg.attendeeName}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {reg.attendeeEmail} • {reg.attendeePhone}
                      </div>
                    </td>
                    <td className="py-3 px-4 max-w-[220px] truncate text-foreground font-medium">
                      {reg.eventTitle}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-foreground">
                      <span className="px-2 py-0.5 rounded-md bg-muted border border-border">
                        {reg.ticketCode}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {reg.status === 'confirmed' ? (
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30">
                          Confirmada
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-muted text-muted-foreground">
                          Cancelada
                        </Badge>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      {reg.checkedIn ? (
                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Presente
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          Pendente
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs gap-1"
                          onClick={() => setPreviewTicket(reg)}
                          title="Ver QR Code do Ingresso"
                        >
                          <QrCode className="h-3.5 w-3.5 text-primary" />
                          <span>QR Code</span>
                        </Button>

                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                          onClick={() => onCancelRegistration(reg.id)}
                          title="Cancelar inscrição"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>

      {/* Modal de Nova Inscrição */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nova Inscrição em Evento</DialogTitle>
            <DialogDescription>
              Cadastre um participante e gere o ingresso com QR Code automaticamente.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5 pt-1">
            <div className="space-y-1.5">
              <Label htmlFor="targetEvent" className="text-xs font-semibold">
                Evento de Destino *
              </Label>
              <select
                id="targetEvent"
                className="w-full text-xs h-9 rounded-md border border-input bg-background px-3 py-1 text-foreground"
                value={targetEventId}
                onChange={(e) => setTargetEventId(e.target.value)}
              >
                {events.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.title} ({e.startDate})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="attendeeName" className="text-xs font-semibold">
                Nome Completo do Participante *
              </Label>
              <Input
                id="attendeeName"
                placeholder="Ex.: Lucas Oliveira Rocha"
                className="text-xs h-9"
                {...register('attendeeName')}
              />
              {errors.attendeeName && (
                <p className="text-[11px] text-destructive">{errors.attendeeName.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="attendeeEmail" className="text-xs font-semibold">
                E-mail para Envio do Ingresso *
              </Label>
              <Input
                id="attendeeEmail"
                type="email"
                placeholder="lucas@exemplo.com"
                className="text-xs h-9"
                {...register('attendeeEmail')}
              />
              {errors.attendeeEmail && (
                <p className="text-[11px] text-destructive">{errors.attendeeEmail.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="attendeePhone" className="text-xs font-semibold">
                WhatsApp / Telefone *
              </Label>
              <Input
                id="attendeePhone"
                placeholder="(92) 99111-2233"
                className="text-xs h-9"
                {...register('attendeePhone')}
              />
              {errors.attendeePhone && (
                <p className="text-[11px] text-destructive">{errors.attendeePhone.message}</p>
              )}
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsModalOpen(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" size="sm" disabled={isSubmitting}>
                {isSubmitting ? 'Gerando...' : 'Confirmar Inscrição'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Visualização do Ingresso com QR Code */}
      <TicketPreviewModal
        open={Boolean(previewTicket)}
        onOpenChange={(open) => !open && setPreviewTicket(null)}
        registration={previewTicket}
      />
    </div>
  );
};
