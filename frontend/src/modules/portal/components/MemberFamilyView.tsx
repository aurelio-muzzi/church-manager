import React from 'react';
import {
  Users,
  Home,
  ShieldCheck,
  ShieldAlert,
  Heart,
  Calendar,
  Edit,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { MemberFamilyNucleus } from '../types';

interface MemberFamilyViewProps {
  family: MemberFamilyNucleus | null;
  onRequestUpdate?: () => void;
}

export const MemberFamilyView: React.FC<MemberFamilyViewProps> = ({
  family,
  onRequestUpdate,
}) => {
  if (!family) {
    return (
      <Card className="border-dashed border-2">
        <CardContent className="py-12 text-center text-muted-foreground space-y-3">
          <Users className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
          <h4 className="font-semibold text-sm">Vínculo Familiar não Localizado</h4>
          <p className="text-xs max-w-sm mx-auto">
            Seus dados ainda não estão vinculados a um núcleo familiar. Entre em contato com a secretaria da igreja para registrar sua família.
          </p>
          {onRequestUpdate && (
            <Button size="sm" variant="outline" onClick={onRequestUpdate} className="text-xs gap-1.5 mt-2">
              <Edit className="h-3.5 w-3.5" />
              Solicitar Vinculação
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  const getFamilyRoleLabel = (role?: string) => {
    switch (role) {
      case 'head':
        return 'Chefe da Família';
      case 'spouse':
        return 'Cônjuge';
      case 'child':
        return 'Filho(a)';
      case 'dependent':
        return 'Dependente';
      default:
        return 'Membro da Família';
    }
  };

  return (
    <div className="space-y-6">
      {/* Family Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-gradient-to-r from-pink-500/10 via-rose-500/5 to-transparent p-4 sm:p-5 rounded-2xl border border-pink-500/20">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-pink-500/20 text-pink-600 dark:text-pink-400 flex items-center justify-center shrink-0">
            <Heart className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-foreground" data-testid="family-name">
              {family.familyName}
            </h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
              <Home className="h-3.5 w-3.5 text-pink-500 shrink-0" />
              <span className="truncate">{family.address || 'Endereço familiar cadastrado'}</span>
            </p>
          </div>
        </div>

        {onRequestUpdate && (
          <Button
            size="sm"
            variant="outline"
            onClick={onRequestUpdate}
            className="text-xs gap-1.5 shrink-0"
            data-testid="request-family-update-btn"
          >
            <Edit className="h-3.5 w-3.5" />
            Atualizar Dados Familiares
          </Button>
        )}
      </div>

      {/* Members of the Family */}
      <div className="space-y-3" data-testid="family-members-list">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">
          Componentes do Núcleo ({family.members.length})
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {family.members.map((member) => (
            <Card
              key={member.id}
              className="border-border/80 shadow-sm overflow-hidden"
              data-testid={`family-member-${member.id}`}
            >
              <div className="p-4 flex items-start gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0 border border-primary/20">
                  {member.name
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')}
                </div>

                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <h5 className="font-bold text-sm text-foreground truncate" title={member.name}>
                      {member.name}
                    </h5>
                    <Badge
                      variant="outline"
                      className={`text-[10px] shrink-0 ${
                        member.familyRole === 'head'
                          ? 'bg-primary/15 text-primary border-primary/30 font-semibold'
                          : member.familyRole === 'spouse'
                            ? 'bg-pink-500/15 text-pink-600 dark:text-pink-400 border-pink-500/30'
                            : 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30'
                      }`}
                    >
                      {getFamilyRoleLabel(member.familyRole)}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Nascimento: {member.birthDate}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {member.isMinor && (
                      <Badge
                        variant="destructive"
                        className="text-[9px] bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30 gap-1"
                        data-testid="minor-badge"
                      >
                        <ShieldAlert className="h-2.5 w-2.5" />
                        Menor de Idade (LGPD)
                      </Badge>
                    )}

                    {member.baptismDate ? (
                      <Badge
                        variant="success"
                        className="text-[9px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 gap-1"
                      >
                        <ShieldCheck className="h-2.5 w-2.5" />
                        Batizado
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[9px] text-muted-foreground">
                        Não batizado
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};
