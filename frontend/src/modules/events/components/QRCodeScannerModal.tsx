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
import {
  QrCode,
  Camera,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ScanLine,
  Keyboard,
} from 'lucide-react';
import type { ChurchEvent, CheckInResult } from '../types';

interface QRCodeScannerModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  event: ChurchEvent | null;
  onScanCode: (eventId: string, qrCodeString: string) => Promise<CheckInResult>;
}

export const QRCodeScannerModal: React.FC<QRCodeScannerModalProps> = ({
  open,
  onOpenChange,
  event,
  onScanCode,
}) => {
  const [codeString, setCodeString] = useState('');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<CheckInResult | null>(null);

  if (!event) return null;

  const handleProcessCode = async (codeToValidate: string) => {
    if (!codeToValidate.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await onScanCode(event.id, codeToValidate.trim());
      setResult(res);
      if (res.success) {
        setCodeString('');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSimulateScan = (sampleCode: string) => {
    setCodeString(sampleCode);
    handleProcessCode(sampleCode);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-primary/10">
              <QrCode className="h-5 w-5 text-primary" />
            </div>
            <div>
              <DialogTitle>Leitor de QR Code & Check-in</DialogTitle>
              <DialogDescription>
                Evento: <strong className="text-foreground">{event.title}</strong>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Feedback Banner Visual de Validação */}
        {result && (
          <div
            role="alert"
            data-testid="qr-checkin-feedback"
            className={`p-3.5 rounded-lg border text-xs space-y-1 animate-in fade-in-50 duration-200 ${
              result.success
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-950 dark:text-emerald-300'
                : result.alreadyCheckedIn
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-300'
                  : 'bg-rose-500/10 border-rose-500/30 text-rose-950 dark:text-rose-300'
            }`}
          >
            <div className="flex items-center gap-2 font-bold">
              {result.success ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : result.alreadyCheckedIn ? (
                <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
              ) : (
                <XCircle className="h-4 w-4 text-rose-600 dark:text-rose-400 shrink-0" />
              )}
              <span>{result.message}</span>
            </div>
            {result.attendeeName && (
              <p className="text-[11px] text-muted-foreground pl-6">
                Participante: <strong>{result.attendeeName}</strong>
                {result.ticketCode && ` • Ingresso: [${result.ticketCode}]`}
              </p>
            )}
          </div>
        )}

        <div className="space-y-4 pt-1">
          {/* Câmera / Viewfinder do Scanner */}
          <div className="relative rounded-xl overflow-hidden border-2 border-border bg-black/90 aspect-video flex flex-col items-center justify-center text-center p-4">
            {isCameraActive ? (
              <div className="relative w-full h-full flex flex-col items-center justify-center">
                {/* Linha animada do scanner laser */}
                <div className="absolute inset-x-8 top-1/2 -translate-y-1/2 h-0.5 bg-red-500 shadow-[0_0_12px_#ef4444] animate-pulse" />
                <div className="border-2 border-dashed border-primary/70 w-36 h-36 rounded-lg flex items-center justify-center relative">
                  <ScanLine className="h-8 w-8 text-primary/80 animate-bounce" />
                </div>
                <p className="text-[11px] text-muted-foreground mt-3">
                  Aponte a câmera para o QR Code do participante...
                </p>
              </div>
            ) : (
              <div className="space-y-2 text-center">
                <Camera className="h-8 w-8 text-muted-foreground/60 mx-auto" />
                <p className="text-xs text-muted-foreground max-w-xs">
                  Câmera desativada no momento. Ative a câmera ou digite o código do ingresso abaixo.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs h-7 bg-background"
                  onClick={() => setIsCameraActive(true)}
                >
                  Ativar Câmera
                </Button>
              </div>
            )}
          </div>

          {/* Atalho de Demonstração Rápida */}
          <div className="p-2.5 rounded-lg bg-muted/40 border border-border text-[11px] space-y-1.5">
            <span className="font-semibold text-muted-foreground">Testar Leitura de Ingressos Rápidos:</span>
            <div className="flex flex-wrap gap-1.5">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-6 text-[10px] px-2"
                onClick={() => handleSimulateScan('AVIV-2026-001')}
              >
                AVIV-2026-001 (Gabriel)
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-6 text-[10px] px-2"
                onClick={() => handleSimulateScan('AVIV-2026-002')}
              >
                AVIV-2026-002 (Lucas)
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="h-6 text-[10px] px-2"
                onClick={() => handleSimulateScan('FLOR-2026-001')}
              >
                FLOR-2026-001 (Helena)
              </Button>
            </div>
          </div>

          {/* Entrada Manual de Código / Scanner Gun */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleProcessCode(codeString);
            }}
            className="space-y-1.5"
          >
            <Label htmlFor="qrInput" className="text-xs font-semibold flex items-center gap-1.5">
              <Keyboard className="h-3.5 w-3.5 text-primary" />
              <span>Código do Ingresso ou QR Code Hash</span>
            </Label>
            <div className="flex gap-2">
              <Input
                id="qrInput"
                placeholder="Ex.: AVIV-2026-001 ou código do leitor USB"
                className="text-xs h-9 font-mono"
                value={codeString}
                onChange={(e) => setCodeString(e.target.value)}
              />
              <Button
                type="submit"
                size="sm"
                className="h-9 shrink-0"
                disabled={!codeString.trim() || isSubmitting}
              >
                {isSubmitting ? 'Validando...' : 'Validar'}
              </Button>
            </div>
          </form>
        </div>

        <DialogFooter className="pt-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Fechar Scanner
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
