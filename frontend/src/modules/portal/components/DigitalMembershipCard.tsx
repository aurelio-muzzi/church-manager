import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  RotateCw,
  Printer,
  ShieldCheck,
  Calendar,
  Award,
  IdCard,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { MemberCredential } from '../types';

interface DigitalMembershipCardProps {
  credential: MemberCredential;
  onPrint?: () => void;
}

export const DigitalMembershipCard: React.FC<DigitalMembershipCardProps> = ({
  credential,
  onPrint,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      window.print();
    }
  };

  return (
    <div className="flex flex-col items-center">
      {/* Card Container */}
      <div className="w-full max-w-md perspective-1000">
        <div
          className={`relative w-full rounded-2xl transition-all duration-500 shadow-xl overflow-hidden border border-border/40 ${
            isFlipped
              ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white'
              : 'bg-gradient-to-br from-indigo-900 via-slate-900 to-blue-950 text-white'
          }`}
          style={{ minHeight: '260px' }}
        >
          {/* Subtle Church Emblem Background Pattern */}
          <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
            <ShieldCheck className="w-48 h-48 text-white" />
          </div>

          {!isFlipped ? (
            /* FRONT OF CARD */
            <div className="p-6 flex flex-col justify-between h-full relative z-10" data-testid="card-front">
              {/* Church Letterhead */}
              <div className="flex items-center justify-between border-b border-white/15 pb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-primary/20 backdrop-blur-md border border-white/20 flex items-center justify-center font-bold text-white shadow-inner">
                    <ShieldCheck className="h-6 w-6 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm tracking-wide text-white">
                      {credential.tenantName}
                    </h3>
                    <p className="text-[11px] text-indigo-200">
                      {credential.congregationName}
                    </p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className="bg-emerald-500/20 text-emerald-300 border-emerald-400/40 text-[10px] uppercase font-semibold flex items-center gap-1.5"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Ativo
                </Badge>
              </div>

              {/* Member Details */}
              <div className="my-4 flex items-center gap-4">
                <div className="h-18 w-18 sm:h-20 sm:w-20 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 p-0.5 shadow-md shrink-0">
                  <div className="h-full w-full rounded-2xl bg-slate-900/80 flex items-center justify-center overflow-hidden">
                    {credential.photoUrl ? (
                      <img
                        src={credential.photoUrl}
                        alt={credential.fullName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-xl sm:text-2xl font-bold text-indigo-200">
                        {credential.fullName
                          .split(' ')
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join('')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="min-w-0 flex-1">
                  <h4 className="text-base sm:text-lg font-bold text-white truncate" title={credential.fullName}>
                    {credential.fullName}
                  </h4>
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/10 text-[11px] font-medium text-amber-300 mt-0.5 mb-1.5">
                    <Award className="h-3 w-3" />
                    <span>{credential.ecclesiasticalRole}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-300">
                    <IdCard className="h-3.5 w-3.5 text-indigo-300" />
                    <span className="font-mono font-medium">{credential.matricula}</span>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-white/15 text-[11px] text-slate-300">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-indigo-300" />
                  <span>Admissão: {credential.admissionDate}</span>
                </div>
                <div>
                  <span className="text-indigo-200">Validade: </span>
                  <span className="font-semibold text-white">{credential.validUntil}</span>
                </div>
              </div>
            </div>
          ) : (
            /* BACK OF CARD */
            <div className="p-6 flex flex-col justify-between h-full relative z-10" data-testid="card-back">
              <div>
                <div className="flex items-center justify-between border-b border-white/15 pb-2 mb-3">
                  <span className="text-xs font-semibold tracking-wider uppercase text-amber-400">
                    Registro Eclesiástico & Validação
                  </span>
                  <span className="text-[10px] text-slate-400">Documento Digital</span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div className="bg-white/5 p-2 rounded-lg border border-white/10">
                    <span className="text-[10px] text-slate-400 block">CPF</span>
                    <span className="font-mono font-medium text-white">{credential.cpfMasked}</span>
                  </div>
                  <div className="bg-white/5 p-2 rounded-lg border border-white/10">
                    <span className="text-[10px] text-slate-400 block">RG</span>
                    <span className="font-mono font-medium text-white">{credential.rgMasked || 'Não informado'}</span>
                  </div>
                  <div className="bg-white/5 p-2 rounded-lg border border-white/10">
                    <span className="text-[10px] text-slate-400 block">Nascimento</span>
                    <span className="text-white">{credential.birthDate}</span>
                  </div>
                  <div className="bg-white/5 p-2 rounded-lg border border-white/10">
                    <span className="text-[10px] text-slate-400 block">Batismo nas Águas</span>
                    <span className="text-white">{credential.baptismDate || 'Não informado'}</span>
                  </div>
                </div>
              </div>

              {/* QR Code Validation Section */}
              <div className="flex items-center gap-3 bg-white/10 p-2.5 rounded-xl border border-white/15 backdrop-blur-sm">
                <div className="bg-white p-1 rounded-lg shrink-0">
                  <QRCodeSVG
                    value={credential.qrCodeValidationToken}
                    size={72}
                    level="M"
                    data-testid="credential-qr-code"
                  />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider block">
                    QR Code Autenticado
                  </span>
                  <p className="text-[10px] text-slate-300 leading-tight my-0.5">
                    Apresente na portaria ou secretaria para validação oficial de membro.
                  </p>
                  <p className="text-[9px] font-mono text-indigo-200 truncate">
                    {credential.qrCodeValidationToken}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-3 mt-4">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsFlipped(!isFlipped)}
          className="gap-2 shadow-sm text-xs"
          data-testid="flip-card-btn"
        >
          <RotateCw className="h-3.5 w-3.5" />
          {isFlipped ? 'Ver Frente do Cartão' : 'Girar para o Verso'}
        </Button>

        <Button
          type="button"
          variant="default"
          size="sm"
          onClick={handlePrint}
          className="gap-2 shadow-sm text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
          data-testid="print-card-btn"
        >
          <Printer className="h-3.5 w-3.5" />
          Imprimir / Baixar Credencial
        </Button>
      </div>
    </div>
  );
};
