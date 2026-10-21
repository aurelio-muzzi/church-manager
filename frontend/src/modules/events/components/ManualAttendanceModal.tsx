import React, { useState } from 'react';
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
import { Badge } from '@/components/ui/badge';
import {
  UserCheck,
  Search,
  CheckCircle2,
  AlertTriangle,
  User,
  HeartHandshake,
} from 'lucide-react';
import type { ChurchEvent, CheckInResult } from '../types';
import type { Member, Visitor } from '@/modules/members/types';

interface ManualAttendanceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: ChurchEvent | null;
  members: Member[];
  visitors: Visitor[];
  onRecordCheckIn: (
    eventId: string,
    attendeeId: string,
    attendeeType: 'member' | 'visitor',
    attendeeName: string,
    notes?: string
  ) => Promise<CheckInResult>;
}

export const ManualAttendanceModal: React.FC<ManualAttendanceModalProps> = ({
  open,
  onOpenChange,
  event,
  members,
  visitors,
  onRecordCheckIn,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAttendee, setSelectedAttendee] = useState<{
    id: string;
    name: string;
    type: 'member' | 'visitor';
    phone?: string;
  } | null>(null);
  const [notes, setNotes] = useState('');
  const [feedback, setFeedback] = useState<CheckInResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!event) return null;

  // Lista unificada para busca
  const allAttendees = [
    ...members.map((m) => ({
      id: m.id,
      name: m.name,
      type: 'member' as const,
      phone: m.phone,
    })),
    ...visitors.map((v) => ({
      id: v.id,
      name: v.name,
      type: 'visitor' as const,
      phone: v.phone,
    })),
  ];

  const filteredAttendees = searchTerm.trim()
    ? allAttendees.filter(
        (a) =>
          a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (a.phone && a.phone.includes(searchTerm))
      )
    : [];

  const handleSelect = (attendee: (typeof allAttendees)[0]) => {
    setSelectedAttendee(attendee);
    setFeedback(null);
  };

  const handleConfirm = async () => {
    if (!selectedAttendee) return;
    setIsSubmitting(true);
    try {
      const result = await onRecordCheckIn(
        event.id,
        selectedAttendee.id,
        selectedAttendee.type,
        selectedAttendee.name,
        notes
      );
      setFeedback(result);
      if (result.success) {
        setSelectedAttendee(null);
        setSearchTerm('');
        setNotes('');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-primary/10">
              <UserCheck className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Registro Manual de Presença</DialogTitle>
              <DialogDescription>
                Culto: <strong className="text-foreground">{event.title}</strong> ({event.startDate})
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Feedback Banner Reativo */}
        {feedback && (
          <div
            role="alert"
            data-testid="manual-attendance-feedback"
            className={`p-3.5 rounded-lg border text-xs space-y-1 ${
              feedback.success
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-300'
                : feedback.alreadyCheckedIn
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-300'
                  : 'bg-destructive/10 border-destructive/30 text-destructive'
            }`}
          >
            <div className="flex items-center gap-2 font-bold">
              {feedback.success ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
              )}
              <span>{feedback.message}</span>
            </div>
          </div>
        )}

        <div className="space-y-4 pt-1">
          {/* Busca de Participantes */}
          <div className="space-y-1.5">
            <Label htmlFor="searchAttendee" className="text-xs font-semibold">
              Pesquisar Membro ou Visitante
            </Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="searchAttendee"
                placeholder="Digite o nome ou telefone do participante..."
                className="pl-8 text-xs h-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Resultados da Pesquisa */}
          {searchTerm.trim() && (
            <div className="max-h-48 overflow-y-auto rounded-lg border border-border divide-y divide-border bg-card">
              {filteredAttendees.length === 0 ? (
                <div className="p-4 text-center text-xs text-muted-foreground">
                  Nenhum membro ou visitante encontrado com "{searchTerm}".
                </div>
              ) : (
                filteredAttendees.map((att) => (
                  <button
                    key={`${att.type}-${att.id}`}
                    type="button"
                    data-testid={`attendee-option-${att.id}`}
                    onClick={() => handleSelect(att)}
                    className={`w-full p-2.5 text-left text-xs flex items-center justify-between hover:bg-muted/40 transition-colors ${
                      selectedAttendee?.id === att.id ? 'bg-primary/10 font-semibold' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {att.type === 'member' ? (
                        <User className="h-3.5 w-3.5 text-primary shrink-0" />
                      ) : (
                        <HeartHandshake className="h-3.5 w-3.5 text-pink-500 shrink-0" />
                      )}
                      <div>
                        <div className="text-foreground">{att.name}</div>
                        <div className="text-[10px] text-muted-foreground">{att.phone || 'Sem telefone'}</div>
                      </div>
                    </div>

                    <Badge variant="outline" className="text-[10px]">
                      {att.type === 'member' ? 'Membro' : 'Visitante'}
                    </Badge>
                  </button>
                ))
              )}
            </div>
          )}

          {/* Participante Selecionado */}
          {selectedAttendee && (
            <div className="p-3 rounded-lg border border-primary/30 bg-primary/5 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Selecionado para Check-in:</span>
                <Badge variant="secondary" className="text-[10px]">
                  {selectedAttendee.type === 'member' ? 'Membro Oficial' : 'Visitante'}
                </Badge>
              </div>
              <p className="font-bold text-sm text-foreground">{selectedAttendee.name}</p>

              <div className="space-y-1 pt-1">
                <Label htmlFor="checkInNotes" className="text-[11px] font-medium text-muted-foreground">
                  Observações da Portaria (Opcional)
                </Label>
                <Input
                  id="checkInNotes"
                  placeholder="Ex.: Chegou com a família, necessita de assento preferencial..."
                  className="text-xs h-8"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Fechar
          </Button>
          <Button
            type="button"
            size="sm"
            disabled={!selectedAttendee || isSubmitting}
            onClick={handleConfirm}
          >
            {isSubmitting ? 'Registrando...' : 'Confirmar Presença'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
