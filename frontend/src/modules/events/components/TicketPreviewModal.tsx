import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Ticket, CheckCircle2, AlertCircle, Printer } from 'lucide-react';
import type { EventRegistration } from '../types';

interface TicketPreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  registration: EventRegistration | null;
}

export const TicketPreviewModal: React.FC<TicketPreviewModalProps> = ({
  open,
  onOpenChange,
  registration,
}) => {
  if (!registration) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center sm:text-center">
          <div className="mx-auto p-2 rounded-full bg-primary/10 w-fit mb-1">
            <Ticket className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-lg">Ingresso Digital com QR Code</DialogTitle>
          <DialogDescription>
            Apresente este código na portaria para validação do check-in.
          </DialogDescription>
        </DialogHeader>

        <div className="p-4 rounded-xl border border-border bg-card shadow-xs space-y-4 text-center">
          <div>
            <Badge variant="outline" className="text-xs font-mono tracking-wider mb-1">
              {registration.ticketCode}
            </Badge>
            <h3 className="font-bold text-base text-foreground">{registration.eventTitle}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Participante: <strong className="text-foreground">{registration.attendeeName}</strong></p>
          </div>

          {/* QR Code Renderizado */}
          <div className="p-4 bg-white rounded-lg inline-block mx-auto border-2 border-border shadow-xs">
            <QRCodeSVG
              value={registration.qrCodeValue}
              size={180}
              level="H"
              marginSize={2}
            />
          </div>

          <div className="flex items-center justify-center gap-2 text-xs">
            {registration.checkedIn ? (
              <span className="flex items-center gap-1.5 font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-4 w-4" />
                Ingresso Já Validado
              </span>
            ) : (
              <span className="flex items-center gap-1.5 font-medium text-amber-600 dark:text-amber-400">
                <AlertCircle className="h-4 w-4" />
                Aguardando Check-in na Entrada
              </span>
            )}
          </div>

          <div className="text-[11px] text-muted-foreground border-t border-border pt-2 text-left space-y-1">
            <div className="flex justify-between">
              <span>E-mail:</span>
              <span className="font-medium text-foreground">{registration.attendeeEmail}</span>
            </div>
            <div className="flex justify-between">
              <span>Telefone:</span>
              <span className="font-medium text-foreground">{registration.attendeePhone}</span>
            </div>
            <div className="flex justify-between">
              <span>Código Hash:</span>
              <span className="font-mono text-[10px] truncate max-w-[200px]">{registration.qrCodeValue}</span>
            </div>
          </div>
        </div>

        <DialogFooter className="flex sm:justify-between items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => window.print()}
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Imprimir</span>
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
