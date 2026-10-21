import React, { useState } from 'react';
import type { Visitor, Congregation } from '@/modules/members/types';
import type { VisitorFormData, VisitorVisitFormData } from '@/modules/members/schemas';
import { visitorFormSchema, visitorVisitFormSchema } from '@/modules/members/schemas';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { EmptyState } from '@/components/shared/EmptyState';
import {
  UserCheck,
  UserPlus,
  Search,
  Sparkles,
  CalendarPlus,
  Phone,
  Mail,
  Heart,
  Save,
  X,
  Loader2,
  Building2,
} from 'lucide-react';
import { formatDate } from '@/utils/formatters';

interface VisitorsTabProps {
  visitors: Visitor[];
  congregations: Congregation[];
  isLoading: boolean;
  onCreateVisitor: (data: VisitorFormData) => Promise<void>;
  onRecordVisit: (visitorId: string, data: VisitorVisitFormData) => Promise<void>;
  onConvertVisitor: (visitorId: string) => Promise<void>;
}

export const VisitorsTab: React.FC<VisitorsTabProps> = ({
  visitors,
  congregations,
  onCreateVisitor,
  onRecordVisit,
  onConvertVisitor,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewVisitorOpen, setIsNewVisitorOpen] = useState(false);
  const [isRecordVisitOpen, setIsRecordVisitOpen] = useState(false);
  const [selectedVisitorForVisit, setSelectedVisitorForVisit] = useState<Visitor | null>(null);
  const [convertingId, setConvertingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form for New Visitor
  const {
    register: registerVisitor,
    handleSubmit: handleSubmitVisitor,
    control: controlVisitor,
    reset: resetVisitor,
    formState: { errors: errorsVisitor },
  } = useForm<VisitorFormData>({
    resolver: zodResolver(visitorFormSchema),
    defaultValues: {
      name: '',
      phone: '',
      email: '',
      congregationId: congregations[0]?.id || '',
      firstVisitDate: new Date().toISOString().split('T')[0],
      howMetChurch: 'Convite de Amigo/Membro',
      prayerRequest: '',
      notes: '',
    },
  });

  // Form for Record Visit
  const {
    register: registerVisit,
    handleSubmit: handleSubmitVisit,
    reset: resetVisit,
    formState: { errors: errorsVisit },
  } = useForm<VisitorVisitFormData>({
    resolver: zodResolver(visitorVisitFormSchema),
    defaultValues: {
      visitDate: new Date().toISOString().split('T')[0],
      serviceName: 'Culto da Família',
      notes: '',
    },
  });

  const filteredVisitors = visitors.filter((v) => {
    if (!searchTerm) return true;
    const q = searchTerm.toLowerCase();
    return (
      v.name.toLowerCase().includes(q) ||
      v.email?.toLowerCase().includes(q) ||
      v.phone?.includes(q)
    );
  });

  const onSubmitVisitor = async (data: VisitorFormData) => {
    try {
      setIsSubmitting(true);
      await onCreateVisitor(data);
      resetVisitor();
      setIsNewVisitorOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmitVisit = async (data: VisitorVisitFormData) => {
    if (!selectedVisitorForVisit) return;
    try {
      setIsSubmitting(true);
      await onRecordVisit(selectedVisitorForVisit.id, data);
      resetVisit();
      setIsRecordVisitOpen(false);
      setSelectedVisitorForVisit(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConvert = async (visitor: Visitor) => {
    try {
      setConvertingId(visitor.id);
      await onConvertVisitor(visitor.id);
    } finally {
      setConvertingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Barra de Filtro e Ação */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar visitante por nome, telefone ou e-mail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>

        <Button onClick={() => setIsNewVisitorOpen(true)} className="gap-2">
          <UserPlus className="h-4 w-4" />
          <span>Registrar Visitante</span>
        </Button>
      </div>

      {/* Lista / Tabela de Visitantes */}
      <Card className="overflow-hidden border-border">
        {filteredVisitors.length === 0 ? (
          <EmptyState
            icon={UserCheck}
            title="Nenhum visitante encontrado"
            description="Cadastre os visitantes dos cultos e eventos para realizar o acompanhamento e integração."
            actionLabel="Registrar Visitante"
            onAction={() => setIsNewVisitorOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="text-xs uppercase bg-muted/50 text-muted-foreground border-b border-border">
                <tr>
                  <th className="px-4 py-3 font-semibold">Visitante</th>
                  <th className="px-4 py-3 font-semibold hidden md:table-cell">Congregação</th>
                  <th className="px-4 py-3 font-semibold">Primeira Visita</th>
                  <th className="px-4 py-3 font-semibold hidden lg:table-cell">Como Conheceu / Pedido</th>
                  <th className="px-4 py-3 font-semibold">Status / Visitas</th>
                  <th className="px-4 py-3 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredVisitors.map((visitor) => {
                  const isConverted = visitor.status === 'converted';

                  return (
                    <tr
                      key={visitor.id}
                      className="hover:bg-muted/40 transition-colors group"
                    >
                      {/* Visitante */}
                      <td className="px-4 py-3">
                        <div className="font-semibold text-foreground">{visitor.name}</div>
                        <div className="text-xs text-muted-foreground flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {visitor.phone || 'Sem telefone'}
                          </span>
                          {visitor.email && (
                            <span className="hidden sm:flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {visitor.email}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Congregação */}
                      <td className="px-4 py-3 hidden md:table-cell text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5 font-medium text-foreground">
                          <Building2 className="h-3.5 w-3.5 text-primary" />
                          {visitor.congregationName || 'Templo Central'}
                        </div>
                      </td>

                      {/* Primeira Visita */}
                      <td className="px-4 py-3 text-xs">
                        <div className="font-medium text-foreground">
                          {formatDate(visitor.firstVisitDate)}
                        </div>
                      </td>

                      {/* Origem e Pedido de Oração */}
                      <td className="px-4 py-3 hidden lg:table-cell text-xs text-muted-foreground max-w-xs">
                        <div className="truncate font-medium text-foreground">
                          {visitor.howMetChurch || 'Não informado'}
                        </div>
                        {visitor.prayerRequest && (
                          <div className="truncate text-[11px] text-rose-500 flex items-center gap-1 mt-0.5">
                            <Heart className="h-3 w-3 shrink-0" />
                            <span>{visitor.prayerRequest}</span>
                          </div>
                        )}
                      </td>

                      {/* Status & Visitas */}
                      <td className="px-4 py-3 text-xs">
                        {isConverted ? (
                          <Badge variant="success" className="gap-1 text-[11px]">
                            <Sparkles className="h-3 w-3" />
                            Membro Oficial
                          </Badge>
                        ) : (
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-[11px]">
                              {visitor.visitsCount} {visitor.visitsCount === 1 ? 'visita' : 'visitas'}
                            </Badge>
                          </div>
                        )}
                      </td>

                      {/* Ações */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {!isConverted && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-8 gap-1 text-xs"
                                onClick={() => {
                                  setSelectedVisitorForVisit(visitor);
                                  setIsRecordVisitOpen(true);
                                }}
                                title="Registrar presença em novo culto"
                              >
                                <CalendarPlus className="h-3.5 w-3.5" />
                                <span className="hidden sm:inline">Nova Visita</span>
                              </Button>

                              <Button
                                size="sm"
                                className="h-8 gap-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                                disabled={convertingId === visitor.id}
                                onClick={() => handleConvert(visitor)}
                                title="Transformar este visitante em membro oficial da igreja"
                              >
                                {convertingId === visitor.id ? (
                                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                  <Sparkles className="h-3.5 w-3.5" />
                                )}
                                <span>Converter</span>
                              </Button>
                            </>
                          )}
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

      {/* Modal de Cadastro de Visitante */}
      <Dialog open={isNewVisitorOpen} onOpenChange={setIsNewVisitorOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-primary" />
              Novo Cadastro de Visitante
            </DialogTitle>
            <DialogDescription>
              Registre os dados do visitante para contato e acolhimento pastoral.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitVisitor(onSubmitVisitor)} className="space-y-3 pt-2">
            <div className="space-y-1">
              <Label htmlFor="vis-name">Nome Completo *</Label>
              <Input
                id="vis-name"
                placeholder="Nome do visitante"
                {...registerVisitor('name')}
                aria-invalid={!!errorsVisitor.name}
              />
              {errorsVisitor.name && (
                <p className="text-xs text-destructive">{errorsVisitor.name.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="vis-phone">Telefone / WhatsApp *</Label>
                <Input
                  id="vis-phone"
                  placeholder="(92) 99999-9999"
                  {...registerVisitor('phone')}
                />
                {errorsVisitor.phone && (
                  <p className="text-xs text-destructive">{errorsVisitor.phone.message}</p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="vis-email">E-mail</Label>
                <Input
                  id="vis-email"
                  type="email"
                  placeholder="visitante@email.com"
                  {...registerVisitor('email')}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label htmlFor="vis-cong">Congregação *</Label>
                <Controller
                  name="congregationId"
                  control={controlVisitor}
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger id="vis-cong">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {congregations.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="space-y-1">
                <Label htmlFor="vis-date">Primeira Visita *</Label>
                <Input id="vis-date" type="date" {...registerVisitor('firstVisitDate')} />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="vis-how">Como conheceu a Igreja?</Label>
              <Input
                id="vis-how"
                placeholder="Ex: Convite de amigo, Redes Sociais, Evento"
                {...registerVisitor('howMetChurch')}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="vis-prayer">Pedido de Oração</Label>
              <Input
                id="vis-prayer"
                placeholder="Motivo de oração compartilhado pelo visitante"
                {...registerVisitor('prayerRequest')}
              />
            </div>

            <DialogFooter className="pt-2 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsNewVisitorOpen(false)}
                disabled={isSubmitting}
              >
                <X className="h-4 w-4 mr-1.5" />
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting} className="gap-1.5">
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Salvar Visitante
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Registro de Nova Visita */}
      <Dialog open={isRecordVisitOpen} onOpenChange={setIsRecordVisitOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarPlus className="h-5 w-5 text-primary" />
              Registrar Nova Presença
            </DialogTitle>
            <DialogDescription>
              Registrar participação de <strong>{selectedVisitorForVisit?.name}</strong> em um culto.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmitVisit(onSubmitVisit)} className="space-y-3 pt-2">
            <div className="space-y-1">
              <Label htmlFor="visit-date">Data do Culto *</Label>
              <Input id="visit-date" type="date" {...registerVisit('visitDate')} />
            </div>

            <div className="space-y-1">
              <Label htmlFor="visit-service">Nome / Tipo do Culto *</Label>
              <Input
                id="visit-service"
                placeholder="Ex: Culto da Família, Culto de Jovens"
                {...registerVisit('serviceName')}
              />
              {errorsVisit.serviceName && (
                <p className="text-xs text-destructive">{errorsVisit.serviceName.message}</p>
              )}
            </div>

            <div className="space-y-1">
              <Label htmlFor="visit-notes">Observações</Label>
              <Textarea
                id="visit-notes"
                rows={2}
                placeholder="Anotações sobre a participação"
                {...registerVisit('notes')}
              />
            </div>

            <DialogFooter className="pt-2 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsRecordVisitOpen(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting} className="gap-1.5">
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Registrar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};
