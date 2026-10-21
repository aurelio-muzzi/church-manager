import React from 'react';
import type { Member } from '@/modules/members/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ShieldAlert,
  Building2,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Heart,
  UserCheck,
  FileText,
} from 'lucide-react';
import { formatDate } from '@/utils/formatters';

interface MemberDetailDialogProps {
  member: Member | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MemberDetailDialog: React.FC<MemberDetailDialogProps> = ({
  member,
  open,
  onOpenChange,
}) => {
  if (!member) return null;

  const initials = member.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');

  const statusLabels: Record<Member['membershipStatus'], { label: string; variant: 'success' | 'outline' | 'destructive' | 'secondary' }> = {
    active: { label: 'Ativo', variant: 'success' },
    inactive: { label: 'Inativo', variant: 'secondary' },
    under_discipline: { label: 'Sob Disciplina', variant: 'destructive' },
    transferred: { label: 'Transferido', variant: 'outline' },
    deceased: { label: 'Falecido', variant: 'secondary' },
  };

  const statusConfig = statusLabels[member.membershipStatus] || { label: member.membershipStatus, variant: 'outline' };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 text-lg font-bold">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <DialogTitle className="text-xl flex items-center gap-2">
                {member.name}
                <Badge variant={statusConfig.variant}>{statusConfig.label}</Badge>
                {member.isMinor && (
                  <Badge variant="warning" className="gap-1">
                    <ShieldAlert className="h-3 w-3" />
                    Menor de Idade (LGPD)
                  </Badge>
                )}
              </DialogTitle>
              <DialogDescription className="flex items-center gap-2 mt-1">
                <Building2 className="h-3.5 w-3.5 text-muted-foreground" />
                {member.congregationName || 'Congregação não informada'}
                {member.familyName && (
                  <>
                    <span>•</span>
                    <Heart className="h-3.5 w-3.5 text-rose-500" />
                    {member.familyName} ({member.familyRole || 'Membro'})
                  </>
                )}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Separator className="my-2" />

        {/* Alerta de Proteção para Menores (LGPD) */}
        {member.isMinor && (
          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3.5 text-sm space-y-1">
            <div className="flex items-center gap-2 font-semibold text-amber-500">
              <ShieldAlert className="h-4 w-4" />
              <span>Conformidade com a LGPD — Dados de Menor de Idade</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Este membro tem menos de 18 anos. Seus dados estão sob a guarda legal declarada:
            </p>
            <div className="text-xs grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 font-medium text-foreground">
              <div>
                <span className="text-muted-foreground">Responsável Legal: </span>
                {member.legalGuardianName || 'Não informado'}
              </div>
              <div>
                <span className="text-muted-foreground">Telefone do Responsável: </span>
                {member.legalGuardianPhone || 'Não informado'}
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {/* Dados Pessoais */}
          <div className="space-y-3 p-3.5 rounded-lg border border-border bg-card/50">
            <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <UserCheck className="h-3.5 w-3.5 text-primary" />
              Dados Pessoais
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Gênero:</span>
                <span className="font-medium">{member.gender === 'male' ? 'Masculino' : 'Feminino'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nascimento:</span>
                <span className="font-medium">{formatDate(member.birthDate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Estado Civil:</span>
                <span className="font-medium capitalize">{member.maritalStatus}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Phone className="h-3 w-3" /> Telefone:
                </span>
                <span className="font-medium">{member.phone || 'Não informado'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Mail className="h-3 w-3" /> E-mail:
                </span>
                <span className="font-medium">{member.email || 'Não informado'}</span>
              </div>
            </div>
          </div>

          {/* Dados Eclesiásticos */}
          <div className="space-y-3 p-3.5 rounded-lg border border-border bg-card/50">
            <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-primary" />
              Dados Eclesiásticos
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tipo de Admissão:</span>
                <span className="font-medium capitalize">{member.admissionType || 'Batismo'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Data de Admissão:</span>
                <span className="font-medium">{member.admissionDate ? formatDate(member.admissionDate) : '—'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Data do Batismo:</span>
                <span className="font-medium">{member.baptismDate ? formatDate(member.baptismDate) : 'Não informado'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cadastrado em:</span>
                <span className="font-medium">{formatDate(member.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Endereço & Emergência */}
        <div className="p-3.5 rounded-lg border border-border bg-card/50 text-xs space-y-2">
          <h4 className="font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            Endereço & Contato de Emergência
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
            <div>
              <span className="text-muted-foreground">Endereço Residencial: </span>
              <span className="font-medium">
                {member.address ? `${member.address}, ${member.neighborhood || ''} — ${member.city || ''}/${member.state || ''}` : 'Não informado'}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Contato de Emergência: </span>
              <span className="font-medium">
                {member.emergencyContactName ? `${member.emergencyContactName} (${member.emergencyContactPhone || 'sem tel'})` : 'Não informado'}
              </span>
            </div>
          </div>
          {member.notes && (
            <div className="pt-2 border-t border-border">
              <span className="text-muted-foreground flex items-center gap-1 mb-1">
                <FileText className="h-3 w-3" /> Observações Pastorais:
              </span>
              <p className="font-normal italic text-muted-foreground">{member.notes}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
