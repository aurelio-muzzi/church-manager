import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  QrCode,
  UserCheck,
  Users,
  Clock,
  MapPin,
} from 'lucide-react';
import type { ChurchEvent, EventAttendanceRecord, CheckInResult } from '../types';
import type { Member, Visitor } from '@/modules/members/types';
import { ManualAttendanceModal } from './ManualAttendanceModal';
import { QRCodeScannerModal } from './QRCodeScannerModal';

interface EventAttendanceTabProps {
  events: ChurchEvent[];
  attendanceRecords: EventAttendanceRecord[];
  members: Member[];
  visitors: Visitor[];
  onRecordManualCheckIn: (
    eventId: string,
    attendeeId: string,
    attendeeType: 'member' | 'visitor',
    attendeeName: string,
    notes?: string
  ) => Promise<CheckInResult>;
  onRecordQRCodeCheckIn: (eventId: string, qrCode: string) => Promise<CheckInResult>;
}

export const EventAttendanceTab: React.FC<EventAttendanceTabProps> = ({
  events,
  attendanceRecords,
  members,
  visitors,
  onRecordManualCheckIn,
  onRecordQRCodeCheckIn,
}) => {
  const [selectedEventId, setSelectedEventId] = useState<string>('');
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);

  const activeEventId = selectedEventId || events[0]?.id || '';
  const selectedEvent = events.find((e) => e.id === activeEventId) || events[0];

  const currentRecords = attendanceRecords.filter((a) => a.eventId === selectedEvent?.id);

  const capacityPercentage = selectedEvent?.maxCapacity
    ? Math.min(100, Math.round((currentRecords.length / selectedEvent.maxCapacity) * 100))
    : null;

  return (
    <div className="space-y-6">
      {/* Seletor do Evento Ativo e Painel de Operações da Portaria */}
      <Card className="border-border bg-gradient-to-r from-card to-muted/30 shadow-xs">
        <CardContent className="p-6 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                Painel da Portaria & Recepção
              </span>
              <h3 className="text-xl font-bold text-foreground">
                Controle de Presença em Tempo Real
              </h3>
              <p className="text-xs text-muted-foreground">
                Selecione o culto ou evento para validar ingressos ou registrar presenças de membros e visitantes.
              </p>
            </div>

            <div className="w-full md:w-80 space-y-1.5">
              <label htmlFor="activeEventSelect" className="text-xs font-semibold text-foreground">
                Culto / Evento em Andamento:
              </label>
              <select
                id="activeEventSelect"
                className="w-full text-xs h-9 rounded-md border border-input bg-background px-3 py-1 font-medium text-foreground shadow-xs"
                value={selectedEvent?.id}
                onChange={(e) => setSelectedEventId(e.target.value)}
              >
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.title} ({ev.startDate})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {selectedEvent && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-border/80">
              <div className="p-3.5 rounded-lg bg-card border border-border shadow-2xs">
                <div className="flex items-center justify-between text-muted-foreground mb-1">
                  <span className="text-xs font-medium">Presenças Registradas</span>
                  <Users className="h-4 w-4 text-primary" />
                </div>
                <div className="text-2xl font-black text-foreground">
                  {currentRecords.length}
                </div>
                {capacityPercentage !== null && (
                  <div className="mt-2 space-y-1">
                    <div className="flex justify-between text-[11px] text-muted-foreground">
                      <span>Lotação do Espaço:</span>
                      <span className="font-semibold">{capacityPercentage}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          capacityPercentage >= 90
                            ? 'bg-rose-500'
                            : capacityPercentage >= 70
                              ? 'bg-amber-500'
                              : 'bg-primary'
                        }`}
                        style={{ width: `${capacityPercentage}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="p-3.5 rounded-lg bg-card border border-border shadow-2xs">
                <div className="flex items-center justify-between text-muted-foreground mb-1">
                  <span className="text-xs font-medium">Data e Horário</span>
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <div className="text-sm font-bold text-foreground">
                  {selectedEvent.startDate}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {selectedEvent.startTime} às {selectedEvent.endTime}
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-card border border-border shadow-2xs">
                <div className="flex items-center justify-between text-muted-foreground mb-1">
                  <span className="text-xs font-medium">Espaço Físico</span>
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <div className="text-sm font-bold text-foreground truncate">
                  {selectedEvent.location}
                </div>
                <div className="text-xs text-muted-foreground truncate mt-0.5">
                  {selectedEvent.congregationName}
                </div>
              </div>

              {/* Botões de Ação Imediata */}
              <div className="flex flex-col justify-center gap-2">
                <Button
                  className="gap-2 h-9 text-xs font-semibold shadow-xs"
                  onClick={() => setIsQRModalOpen(true)}
                >
                  <QrCode className="h-4 w-4" />
                  <span>Escanear QR Code</span>
                </Button>
                <Button
                  variant="outline"
                  className="gap-2 h-9 text-xs font-semibold"
                  onClick={() => setIsManualModalOpen(true)}
                >
                  <UserCheck className="h-4 w-4 text-primary" />
                  <span>Presença Manual</span>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Feed em Tempo Real dos Check-ins */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-base text-foreground flex items-center gap-2">
            <span>Histórico de Check-ins Registrados</span>
            <Badge variant="secondary" className="text-xs">
              {currentRecords.length}
            </Badge>
          </h3>
        </div>

        <Card className="border-border">
          <CardContent className="p-0 overflow-x-auto">
            {currentRecords.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="h-10 w-10 text-muted-foreground/40 mx-auto mb-2" />
                <h4 className="text-sm font-semibold text-foreground">Nenhuma presença registrada ainda</h4>
                <p className="text-xs text-muted-foreground mt-1">
                  Utilize o leitor de QR Code ou o botão de Presença Manual para começar os lançamentos.
                </p>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/40 text-muted-foreground border-b border-border">
                  <tr>
                    <th className="py-3 px-4 font-semibold">Participante</th>
                    <th className="py-3 px-4 font-semibold">Vínculo</th>
                    <th className="py-3 px-4 font-semibold">Método</th>
                    <th className="py-3 px-4 font-semibold">Horário do Check-in</th>
                    <th className="py-3 px-4 font-semibold">Operador / Portaria</th>
                    <th className="py-3 px-4 font-semibold">Observações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {currentRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-muted/20 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-foreground">{record.attendeeName}</div>
                        {record.attendeeEmail && (
                          <div className="text-[11px] text-muted-foreground">{record.attendeeEmail}</div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant="outline"
                          className={
                            record.attendeeType === 'member'
                              ? 'bg-primary/10 text-primary border-primary/20'
                              : 'bg-pink-500/10 text-pink-700 dark:text-pink-300 border-pink-500/20'
                          }
                        >
                          {record.attendeeType === 'member' ? 'Membro' : 'Visitante'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        {record.checkInMethod === 'qr_code' ? (
                          <span className="inline-flex items-center gap-1 font-medium text-purple-600 dark:text-purple-400">
                            <QrCode className="h-3.5 w-3.5" />
                            QR Code
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 font-medium text-blue-600 dark:text-blue-400">
                            <UserCheck className="h-3.5 w-3.5" />
                            Manual
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-foreground font-mono">
                        {new Date(record.checkedInAt).toLocaleTimeString('pt-BR', {
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{record.checkedInBy}</td>
                      <td className="py-3 px-4 text-muted-foreground text-[11px]">
                        {record.notes || record.ticketCode ? (
                          <span>
                            {record.ticketCode && `[${record.ticketCode}] `}
                            {record.notes}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Modais de Operação */}
      <ManualAttendanceModal
        open={isManualModalOpen}
        onOpenChange={setIsManualModalOpen}
        event={selectedEvent}
        members={members}
        visitors={visitors}
        onRecordCheckIn={onRecordManualCheckIn}
      />

      <QRCodeScannerModal
        open={isQRModalOpen}
        onOpenChange={setIsQRModalOpen}
        event={selectedEvent}
        onScanCode={onRecordQRCodeCheckIn}
      />
    </div>
  );
};
