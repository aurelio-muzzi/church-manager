import React, { useState } from 'react';
import type { Member, Congregation, Family } from '@/modules/members/types';
import type { MemberFormData } from '@/modules/members/schemas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ConfirmationDialog } from '@/components/shared/ConfirmationDialog';
import { EmptyState } from '@/components/shared/EmptyState';
import { MemberDetailDialog } from './MemberDetailDialog';
import { MemberFormModal } from './MemberFormModal';
import {
  Users,
  UserPlus,
  Search,
  Eye,
  Pencil,
  Trash2,
  ShieldAlert,
  Building2,
  Calendar,
} from 'lucide-react';
import { formatDate } from '@/utils/formatters';

interface MembersTabProps {
  members: Member[];
  congregations: Congregation[];
  families: Family[];
  isLoading: boolean;
  onSaveMember: (data: MemberFormData, id?: string) => Promise<void>;
  onDeleteMember: (id: string) => Promise<void>;
}

export const MembersTab: React.FC<MembersTabProps> = ({
  members,
  congregations,
  families,
  isLoading,
  onSaveMember,
  onDeleteMember,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCongregation, setSelectedCongregation] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [onlyMinors, setOnlyMinors] = useState(false);

  // Modals state
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState<Member | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);

  // Client-side filtering
  const filteredMembers = members.filter((member) => {
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchName = member.name.toLowerCase().includes(q);
      const matchEmail = member.email?.toLowerCase().includes(q);
      const matchPhone = member.phone?.includes(q);
      if (!matchName && !matchEmail && !matchPhone) return false;
    }

    if (selectedCongregation !== 'all' && member.congregationId !== selectedCongregation) {
      return false;
    }

    if (selectedStatus !== 'all' && member.membershipStatus !== selectedStatus) {
      return false;
    }

    if (onlyMinors && !member.isMinor) {
      return false;
    }

    return true;
  });

  const statusBadges: Record<Member['membershipStatus'], { label: string; variant: 'success' | 'secondary' | 'destructive' | 'outline' }> = {
    active: { label: 'Ativo', variant: 'success' },
    inactive: { label: 'Inativo', variant: 'secondary' },
    under_discipline: { label: 'Sob Disciplina', variant: 'destructive' },
    transferred: { label: 'Transferido', variant: 'outline' },
    deceased: { label: 'Falecido', variant: 'secondary' },
  };

  const handleOpenCreate = () => {
    setMemberToEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (member: Member) => {
    setMemberToEdit(member);
    setIsFormOpen(true);
  };

  const handleOpenDetail = (member: Member) => {
    setSelectedMember(member);
    setIsDetailOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (memberToDelete) {
      await onDeleteMember(memberToDelete.id);
      setMemberToDelete(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Barra de Filtros e Ações */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        <div className="flex flex-1 flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome, e-mail ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>

          <Select value={selectedCongregation} onValueChange={setSelectedCongregation}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Todas as congregações" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as congregações</SelectItem>
              {congregations.map((cong) => (
                <SelectItem key={cong.id} value={cong.id}>
                  {cong.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="Todos os status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              <SelectItem value="active">Ativos</SelectItem>
              <SelectItem value="inactive">Inativos</SelectItem>
              <SelectItem value="under_discipline">Sob Disciplina</SelectItem>
              <SelectItem value="transferred">Transferidos</SelectItem>
              <SelectItem value="deceased">Falecidos</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-3 justify-between sm:justify-end">
          <div className="flex items-center gap-2 bg-card border border-border px-3 py-1.5 rounded-lg">
            <Switch
              id="filter-minors"
              checked={onlyMinors}
              onCheckedChange={setOnlyMinors}
            />
            <Label
              htmlFor="filter-minors"
              className="text-xs font-medium cursor-pointer flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
            >
              <ShieldAlert className="h-3.5 w-3.5 text-amber-500" />
              Menores (LGPD)
            </Label>
          </div>

          <Button onClick={handleOpenCreate} className="gap-2">
            <UserPlus className="h-4 w-4" />
            <span>Novo Membro</span>
          </Button>
        </div>
      </div>

      {/* Lista / Tabela de Membros */}
      <Card className="overflow-hidden border-border">
        {isLoading ? (
          <div className="p-12 text-center text-sm text-muted-foreground flex flex-col items-center justify-center gap-2">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span>Carregando membros...</span>
          </div>
        ) : filteredMembers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Nenhum membro encontrado"
            description={
              searchTerm || selectedCongregation !== 'all' || selectedStatus !== 'all' || onlyMinors
                ? 'Tente ajustar os filtros de busca para encontrar o membro desejado.'
                : 'Nenhum membro cadastrado nesta congregação. Comece cadastrando o primeiro membro.'
            }
            actionLabel="Cadastrar Membro"
            onAction={handleOpenCreate}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="text-xs uppercase bg-muted/50 text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-4 py-3 font-semibold">Membro</th>
                  <th className="px-4 py-3 font-semibold hidden md:table-cell">Congregação</th>
                  <th className="px-4 py-3 font-semibold hidden sm:table-cell">Contato</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold hidden lg:table-cell">Admissão</th>
                  <th className="px-4 py-3 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredMembers.map((member) => {
                  const initials = member.name
                    .split(' ')
                    .filter(Boolean)
                    .slice(0, 2)
                    .map((p) => p[0].toUpperCase())
                    .join('');

                  const badgeConfig = statusBadges[member.membershipStatus] || {
                    label: member.membershipStatus,
                    variant: 'outline',
                  };

                  return (
                    <tr
                      key={member.id}
                      className="hover:bg-muted/40 transition-colors group"
                    >
                      {/* Nome e Avatar */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9 text-xs font-semibold">
                            <AvatarFallback>{initials}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-semibold text-foreground flex items-center gap-2">
                              <span>{member.name}</span>
                              {member.isMinor && (
                                <Badge
                                  variant="warning"
                                  className="text-[10px] px-1.5 py-0 gap-1 font-semibold"
                                  title="Menor de 18 anos — Tutela legal exigida pela LGPD"
                                >
                                  <ShieldAlert className="h-3 w-3" />
                                  Menor (&lt; 18)
                                </Badge>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                              <span>{member.gender === 'male' ? 'Masc.' : 'Fem.'}</span>
                              <span>•</span>
                              <span>{formatDate(member.birthDate)}</span>
                              {member.familyName && (
                                <>
                                  <span>•</span>
                                  <span className="text-primary truncate max-w-[140px]">
                                    {member.familyName}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Congregação */}
                      <td className="px-4 py-3 hidden md:table-cell">
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Building2 className="h-3.5 w-3.5" />
                          <span className="font-medium text-foreground">
                            {member.congregationName || 'Templo Central'}
                          </span>
                        </div>
                      </td>

                      {/* Contato */}
                      <td className="px-4 py-3 hidden sm:table-cell text-xs text-muted-foreground">
                        <div>{member.phone || 'Sem telefone'}</div>
                        <div className="truncate max-w-[160px] text-[11px]">{member.email || '—'}</div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <Badge variant={badgeConfig.variant} className="text-xs">
                          {badgeConfig.label}
                        </Badge>
                      </td>

                      {/* Admissão */}
                      <td className="px-4 py-3 hidden lg:table-cell text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{member.admissionDate ? formatDate(member.admissionDate) : '—'}</span>
                        </div>
                        <span className="text-[11px] capitalize">{member.admissionType || 'Batismo'}</span>
                      </td>

                      {/* Ações */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-foreground"
                            onClick={() => handleOpenDetail(member)}
                            title="Ver detalhes completos"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-primary"
                            onClick={() => handleOpenEdit(member)}
                            title="Editar cadastro"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => setMemberToDelete(member)}
                            title="Excluir membro"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Modais do Módulo */}
      <MemberDetailDialog
        member={selectedMember}
        open={isDetailOpen}
        onOpenChange={setIsDetailOpen}
      />

      <MemberFormModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        memberToEdit={memberToEdit}
        congregations={congregations}
        families={families}
        onSave={async (data) => {
          await onSaveMember(data, memberToEdit?.id);
        }}
      />

      <ConfirmationDialog
        open={Boolean(memberToDelete)}
        onOpenChange={(open) => {
          if (!open) setMemberToDelete(null);
        }}
        title="Confirmar Exclusão de Membro"
        description={`Tem certeza que deseja desvincular o membro "${memberToDelete?.name}" do sistema? Esta ação manterá o histórico eclesiástico anonimizado.`}
        confirmLabel="Excluir Membro"
        isDestructive={true}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};
