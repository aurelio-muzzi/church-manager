import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Calendar,
  MapPin,
  Ticket,
  CheckCircle2,
  Printer,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import type { MemberRegistrationItem } from '../types';

interface MemberRegistrationsViewProps {
  registrations: MemberRegistrationItem[];
}

export const MemberRegistrationsView: React.FC<MemberRegistrationsViewProps> = ({
  registrations,
}) => {
  const [selectedTicket, setSelectedTicket] = useState<MemberRegistrationItem | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-gradient-to-r from-blue-500/10 via-indigo-500/5 to-transparent p-4 sm:p-5 rounded-2xl border border-blue-500/20">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Ticket className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-foreground">
              Eventos & Ingressos Digitais
            </h3>
            <p className="text-xs text-muted-foreground">
              Acesse seus ingressos com QR Code para conferências, retiros e workshops da igreja.
            </p>
          </div>
        </div>
      </div>

      {/* Registrations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="member-registrations-list">
        {registrations.length === 0 ? (
          <Card className="col-span-full border-dashed border-2">
            <CardContent className="py-12 text-center text-muted-foreground space-y-2">
              <Ticket className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
              <p className="font-semibold text-sm">Você ainda não possui inscrições ativas</p>
              <p className="text-xs max-w-sm mx-auto">
                Confira a programação da igreja e participe dos próximos retiros, conferências e cursos.
              </p>
            </CardContent>
          </Card>
        ) : (
          registrations.map((reg) => (
            <Card
              key={reg.registrationId}
              className="border-border/80 shadow-sm overflow-hidden flex flex-col justify-between"
              data-testid={`reg-card-${reg.registrationId}`}
            >
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <Badge variant="outline" className="font-mono text-[11px] bg-primary/10 text-primary border-primary/30">
                    <Ticket className="h-3 w-3 mr-1" />
                    {reg.ticketCode}
                  </Badge>

                  {reg.checkedIn ? (
                    <Badge variant="success" className="text-[10px] bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Check-in Feito
                    </Badge>
                  ) : (
                    <Badge variant="success" className="text-[10px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30">
                      Confirmado
                    </Badge>
                  )}
                </div>

                <div>
                  <h4 className="font-bold text-sm text-foreground leading-snug">
                    {reg.eventTitle}
                  </h4>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-2">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    <span>Data: <strong>{new Date(reg.eventDate).toLocaleDateString('pt-BR')}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
                    <MapPin className="h-3.5 w-3.5 text-primary" />
                    <span className="truncate">{reg.eventLocation}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-border/60 bg-muted/20 flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">Ingresso Pessoal</span>
                <Button
                  size="sm"
                  variant="default"
                  onClick={() => setSelectedTicket(reg)}
                  className="gap-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
                  data-testid={`open-ticket-btn-${reg.registrationId}`}
                >
                  <Ticket className="h-3.5 w-3.5" />
                  Ver Ingresso & QR Code
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Ticket QR Code Modal */}
      {selectedTicket && (
        <Dialog open={Boolean(selectedTicket)} onOpenChange={() => setSelectedTicket(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-base flex items-center gap-2">
                <Ticket className="h-5 w-5 text-indigo-600" />
                Ingresso Digital com Check-in Rápido
              </DialogTitle>
            </DialogHeader>

            <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-b from-indigo-50/50 via-background to-background dark:from-indigo-950/20 p-5 text-center space-y-4">
              <div className="space-y-1">
                <Badge variant="outline" className="font-mono text-xs bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30">
                  {selectedTicket.ticketCode}
                </Badge>
                <h3 className="font-bold text-base text-foreground mt-1">
                  {selectedTicket.eventTitle}
                </h3>
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-indigo-500" />
                  {selectedTicket.eventLocation}
                </p>
              </div>

              {/* QR Code Container */}
              <div className="flex flex-col items-center justify-center py-2">
                <div className="p-3 bg-white rounded-2xl shadow-md border border-slate-200">
                  <QRCodeSVG
                    value={selectedTicket.qrCodeToken}
                    size={160}
                    level="H"
                    data-testid="event-ticket-qr-code"
                  />
                </div>
                <span className="font-mono text-[11px] text-muted-foreground mt-2">
                  Token: {selectedTicket.qrCodeToken}
                </span>
              </div>

              <div className="bg-muted/50 p-2.5 rounded-xl border border-border/60 text-xs text-muted-foreground">
                <p className="leading-tight">
                  Apresente este código na entrada do evento. A equipe de recepção realizará a leitura para liberar seu acesso.
                </p>
              </div>
            </div>

            <DialogFooter className="flex justify-between sm:justify-between">
              <Button variant="outline" size="sm" onClick={() => setSelectedTicket(null)}>
                Fechar
              </Button>
              <Button
                size="sm"
                className="gap-2"
                onClick={() => window.print()}
              >
                <Printer className="h-3.5 w-3.5" />
                Imprimir Ingresso
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
