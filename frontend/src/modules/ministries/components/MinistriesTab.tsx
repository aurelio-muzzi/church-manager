import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Users,
  Plus,
  ShieldCheck,
  Tag,
  Pencil,
  Trash2,
  Sparkles,
} from 'lucide-react';
import type { Ministry } from '../types';
import {
  ministryFormSchema,
  ministryRoleFormSchema,
  type MinistryFormData,
  type MinistryRoleFormData,
} from '../schemas';
import type { Member } from '@/modules/members/types';
import { ConfirmationDialog } from '@/components/shared/ConfirmationDialog';
import { EmptyState } from '@/components/shared/EmptyState';

export interface MinistriesTabProps {
  ministries: Ministry[];
  members: Member[];
  isLoading?: boolean;
  onSaveMinistry: (data: MinistryFormData, id?: string) => Promise<void>;
  onDeleteMinistry: (id: string) => Promise<void>;
  onAddRole: (ministryId: string, data: MinistryRoleFormData) => Promise<void>;
}

export const MinistriesTab: React.FC<MinistriesTabProps> = ({
  ministries,
  members,
  isLoading,
  onSaveMinistry,
  onDeleteMinistry,
  onAddRole,
}) => {
  // Modal states
  const [isMinistryModalOpen, setIsMinistryModalOpen] = useState(false);
  const [ministryToEdit, setMinistryToEdit] = useState<Ministry | null>(null);
  const [ministryToDelete, setMinistryToDelete] = useState<Ministry | null>(null);

  // Role modal state
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [targetMinistryForRole, setTargetMinistryForRole] = useState<Ministry | null>(null);

  // Form for Ministry
  const {
    register: registerMinistry,
    handleSubmit: handleSubmitMinistry,
    reset: resetMinistry,
    setValue: setMinistryValue,
    formState: { errors: ministryErrors, isSubmitting: isSubmittingMinistry },
  } = useForm<MinistryFormData>({
    resolver: zodResolver(ministryFormSchema),
    defaultValues: {
      name: '',
      description: '',
      leaderId: members[0]?.id || '',
      leaderName: members[0]?.name || '',
      color: '#4f46e5',
      status: 'active',
    },
  });

  // Form for Role
  const {
    register: registerRole,
    handleSubmit: handleSubmitRole,
    reset: resetRole,
    formState: { errors: roleErrors, isSubmitting: isSubmittingRole },
  } = useForm<MinistryRoleFormData>({
    resolver: zodResolver(ministryRoleFormSchema),
    defaultValues: {
      name: '',
      description: '',
      requiredVolunteers: 1,
    },
  });

  const handleOpenCreateMinistry = () => {
    setMinistryToEdit(null);
    resetMinistry({
      name: '',
      description: '',
      leaderId: members[0]?.id || '',
      leaderName: members[0]?.name || '',
      color: '#8b5cf6',
      status: 'active',
    });
    setIsMinistryModalOpen(true);
  };

  const handleOpenEditMinistry = (ministry: Ministry) => {
    setMinistryToEdit(ministry);
    resetMinistry({
      name: ministry.name,
      description: ministry.description,
      leaderId: ministry.leaderId,
      leaderName: ministry.leaderName,
      color: ministry.color,
      status: ministry.status,
    });
    setIsMinistryModalOpen(true);
  };

  const handleOpenAddRole = (ministry: Ministry) => {
    setTargetMinistryForRole(ministry);
    resetRole({
      name: '',
      description: '',
      requiredVolunteers: 1,
    });
    setIsRoleModalOpen(true);
  };

  const onMinistrySubmit = async (data: MinistryFormData) => {
    // Busca nome do líder a partir do leaderId
    const selectedLeader = members.find((m) => m.id === data.leaderId);
    const payload = {
      ...data,
      leaderName: selectedLeader?.name || data.leaderName,
    };
    await onSaveMinistry(payload, ministryToEdit?.id);
    setIsMinistryModalOpen(false);
  };

  const onRoleSubmit = async (data: MinistryRoleFormData) => {
    if (targetMinistryForRole) {
      await onAddRole(targetMinistryForRole.id, data);
      setIsRoleModalOpen(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header com botão de ação */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">
            Departamentos & Ministérios ({ministries.length})
          </h3>
          <p className="text-xs text-muted-foreground">
            Estrutura organizacional, lideranças, cores representativas e funções cadastrais.
          </p>
        </div>
        <Button size="sm" onClick={handleOpenCreateMinistry} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" />
          <span>Novo Ministério</span>
        </Button>
      </div>

      {isLoading ? (
        <Card className="p-12 text-center text-sm text-muted-foreground flex flex-col items-center justify-center gap-2">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span>Carregando ministérios...</span>
        </Card>
      ) : ministries.length === 0 ? (
        <Card>
          <EmptyState
            icon={Sparkles}
            title="Nenhum ministério cadastrado"
            description="Cadastre os ministérios da sua igreja (Louvor, Infantil, Recepção...) para organizar equipes e escalas."
            actionLabel="Criar Ministério"
            onAction={handleOpenCreateMinistry}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ministries.map((ministry) => (
            <Card
              key={ministry.id}
              data-testid={`ministry-card-${ministry.id}`}
              className="p-5 border-border flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden"
            >
              {/* Faixa colorida do ministério */}
              <div
                className="absolute top-0 left-0 right-0 h-1.5"
                style={{ backgroundColor: ministry.color }}
              />

              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                      style={{ backgroundColor: ministry.color }}
                    />
                    <h4 className="font-bold text-foreground text-base">
                      {ministry.name}
                    </h4>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      onClick={() => handleOpenEditMinistry(ministry)}
                      title="Editar ministério"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                      onClick={() => setMinistryToDelete(ministry)}
                      title="Excluir ministério"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  {ministry.description}
                </p>

                {/* Líder Responsável */}
                <div className="flex items-center gap-2 p-2 rounded-md bg-muted/40 text-xs text-muted-foreground">
                  <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px]">
                    <ShieldCheck className="h-3.5 w-3.5" />
                  </div>
                  <div>
                    <span className="text-[11px] text-muted-foreground">Líder do Ministério:</span>{' '}
                    <strong className="text-foreground">{ministry.leaderName}</strong>
                    {ministry.leaderPhone && (
                      <span className="text-[11px] ml-1.5 text-muted-foreground">
                        ({ministry.leaderPhone})
                      </span>
                    )}
                  </div>
                </div>

                {/* Funções do Ministério */}
                <div className="space-y-1.5 pt-2 border-t border-border">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-muted-foreground uppercase text-[11px] tracking-wider">
                      Funções ({ministry.roles?.length || 0})
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs gap-1 text-primary hover:text-primary/90"
                      onClick={() => handleOpenAddRole(ministry)}
                    >
                      <Plus className="h-3 w-3" />
                      <span>Nova Função</span>
                    </Button>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {ministry.roles && ministry.roles.length > 0 ? (
                      ministry.roles.map((role) => (
                        <Badge
                          key={role.id}
                          variant="secondary"
                          className="text-[11px] gap-1 font-normal"
                        >
                          <Tag className="h-2.5 w-2.5 text-primary" />
                          {role.name}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-xs text-muted-foreground italic">
                        Nenhuma função cadastrada. Clique em "Nova Função" para adicionar.
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Rodapé com métricas */}
              <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5 text-primary" />
                  <strong className="text-foreground">{ministry.membersCount}</strong> voluntário(s) ativos
                </span>
                <Badge
                  variant={ministry.status === 'active' ? 'success' : 'outline'}
                  className="text-[10px]"
                >
                  {ministry.status === 'active' ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Criar / Editar Ministério */}
      <Dialog open={isMinistryModalOpen} onOpenChange={setIsMinistryModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {ministryToEdit ? 'Editar Ministério' : 'Cadastrar Novo Ministério'}
            </DialogTitle>
            <DialogDescription>
              Defina as informações básicas, liderança e cor de identificação do ministério.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitMinistry(onMinistrySubmit)} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="m-name" className="text-xs font-semibold">
                Nome do Ministério *
              </Label>
              <Input
                id="m-name"
                placeholder="Ex.: Ministério de Louvor & Adoração"
                className="text-xs h-9"
                {...registerMinistry('name')}
              />
              {ministryErrors.name && (
                <p className="text-[11px] text-destructive">{ministryErrors.name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="m-desc" className="text-xs font-semibold">
                Descrição e Propósito *
              </Label>
              <Textarea
                id="m-desc"
                placeholder="Ex.: Responsável pela condução da adoração musical durante os cultos..."
                className="text-xs h-20 resize-none"
                {...registerMinistry('description')}
              />
              {ministryErrors.description && (
                <p className="text-[11px] text-destructive">{ministryErrors.description.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="m-leader" className="text-xs font-semibold">
                Líder do Ministério *
              </Label>
              <select
                id="m-leader"
                className="w-full text-xs h-9 rounded-md border border-input bg-background px-3 py-1 text-foreground"
                {...registerMinistry('leaderId')}
                onChange={(e) => {
                  const m = members.find((x) => x.id === e.target.value);
                  setMinistryValue('leaderId', e.target.value);
                  if (m) setMinistryValue('leaderName', m.name);
                }}
              >
                {members.map((mem) => (
                  <option key={mem.id} value={mem.id}>
                    {mem.name} ({mem.phone || 'Sem telefone'})
                  </option>
                ))}
              </select>
              {ministryErrors.leaderId && (
                <p className="text-[11px] text-destructive">{ministryErrors.leaderId.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="m-color" className="text-xs font-semibold">
                  Cor Representativa *
                </Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    id="m-color"
                    className="h-9 w-12 rounded cursor-pointer border border-input bg-background"
                    {...registerMinistry('color')}
                  />
                  <Input
                    className="text-xs h-9 font-mono"
                    {...registerMinistry('color')}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="m-status" className="text-xs font-semibold">
                  Status Operacional *
                </Label>
                <select
                  id="m-status"
                  className="w-full text-xs h-9 rounded-md border border-input bg-background px-3 py-1 text-foreground"
                  {...registerMinistry('status')}
                >
                  <option value="active">Ativo</option>
                  <option value="inactive">Inativo</option>
                </select>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isSubmittingMinistry}
                onClick={() => setIsMinistryModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" size="sm" disabled={isSubmittingMinistry}>
                {isSubmittingMinistry ? 'Salvando...' : ministryToEdit ? 'Atualizar Ministério' : 'Criar Ministério'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal Adicionar Função ao Ministério */}
      <Dialog open={isRoleModalOpen} onOpenChange={setIsRoleModalOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle>Adicionar Função</DialogTitle>
            <DialogDescription>
              Cadastre uma nova função no ministério "{targetMinistryForRole?.name}".
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitRole(onRoleSubmit)} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <Label htmlFor="r-name" className="text-xs font-semibold">
                Nome da Função *
              </Label>
              <Input
                id="r-name"
                placeholder="Ex.: Vocalista, Operador de Som, Monitor..."
                className="text-xs h-9"
                {...registerRole('name')}
              />
              {roleErrors.name && (
                <p className="text-[11px] text-destructive">{roleErrors.name.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="r-desc" className="text-xs font-semibold">
                Descrição / Atribuições (Opcional)
              </Label>
              <Textarea
                id="r-desc"
                placeholder="Ex.: Responsável pela passagem dos slides durante o culto..."
                className="text-xs h-16 resize-none"
                {...registerRole('description')}
              />
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isSubmittingRole}
                onClick={() => setIsRoleModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" size="sm" disabled={isSubmittingRole}>
                {isSubmittingRole ? 'Salvando...' : 'Adicionar Função'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmação de Exclusão */}
      <ConfirmationDialog
        open={Boolean(ministryToDelete)}
        onOpenChange={(open) => {
          if (!open) setMinistryToDelete(null);
        }}
        title="Confirmar Exclusão de Ministério"
        description={`Tem certeza que deseja excluir o ministério "${ministryToDelete?.name}"? Todas as funções associadas serão removidas.`}
        confirmLabel="Excluir Ministério"
        isDestructive={true}
        onConfirm={async () => {
          if (ministryToDelete) {
            await onDeleteMinistry(ministryToDelete.id);
            setMinistryToDelete(null);
          }
        }}
      />
    </div>
  );
};
