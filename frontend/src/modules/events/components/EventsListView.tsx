import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Search,
  Plus,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Ticket,
} from 'lucide-react';
import { EventStatusBadge, EventCategoryBadge } from './EventBadges';
import type { ChurchEvent, EventFilters } from '../types';
import type { Congregation } from '@/modules/members/types';
import { formatCurrency } from '@/utils/formatters';

interface EventsListViewProps {
  events: ChurchEvent[];
  congregations: Congregation[];
  onNewEvent: () => void;
  onEditEvent: (event: ChurchEvent) => void;
  onOpenCheckIn: (event: ChurchEvent) => void;
  onCancelEvent: (eventId: string) => void;
}

export const EventsListView: React.FC<EventsListViewProps> = ({
  events,
  congregations,
  onNewEvent,
  onEditEvent,
  onOpenCheckIn,
  onCancelEvent,
}) => {
  const [filters, setFilters] = useState<EventFilters>({
    search: '',
    category: 'all',
    type: 'all',
    status: 'all',
    congregationId: 'all',
  });

  const filteredEvents = events.filter((e) => {
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const match =
        e.title.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q) ||
        e.congregationName.toLowerCase().includes(q) ||
        (e.description && e.description.toLowerCase().includes(q));
      if (!match) return false;
    }
    if (filters.category && filters.category !== 'all' && e.category !== filters.category) {
      return false;
    }
    if (filters.type && filters.type !== 'all' && e.type !== filters.type) {
      return false;
    }
    if (filters.status && filters.status !== 'all' && e.status !== filters.status) {
      return false;
    }
    if (
      filters.congregationId &&
      filters.congregationId !== 'all' &&
      e.congregationId !== filters.congregationId
    ) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Barra de Filtros */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between bg-card p-3.5 rounded-xl border border-border shadow-xs">
        <div className="flex flex-1 flex-col sm:flex-row gap-2.5">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por culto, conferência, espaço ou congregação..."
              className="pl-8 text-xs h-9"
              value={filters.search}
              onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
            />
          </div>

          <select
            aria-label="Filtrar por Categoria"
            className="text-xs h-9 rounded-md border border-input bg-background px-2.5 text-foreground"
            value={filters.category}
            onChange={(e) => setFilters((prev) => ({ ...prev, category: e.target.value }))}
          >
            <option value="all">Todas as Categorias</option>
            <option value="worship">Cultos</option>
            <option value="conference">Conferências</option>
            <option value="seminar">Seminários</option>
            <option value="meeting">Reuniões</option>
            <option value="youth">Jovens</option>
            <option value="kids">Infantil</option>
            <option value="outreach">Missões / Social</option>
          </select>

          <select
            aria-label="Filtrar por Congregação"
            className="text-xs h-9 rounded-md border border-input bg-background px-2.5 text-foreground"
            value={filters.congregationId}
            onChange={(e) => setFilters((prev) => ({ ...prev, congregationId: e.target.value }))}
          >
            <option value="all">Todas as Congregações</option>
            {congregations.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <select
            aria-label="Filtrar por Situação"
            className="text-xs h-9 rounded-md border border-input bg-background px-2.5 text-foreground"
            value={filters.status}
            onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
          >
            <option value="all">Todos os Status</option>
            <option value="scheduled">Agendados</option>
            <option value="in_progress">Em Andamento</option>
            <option value="completed">Encerrados</option>
            <option value="cancelled">Cancelados</option>
          </select>
        </div>

        <Button size="sm" className="gap-1.5 shrink-0" onClick={onNewEvent}>
          <Plus className="h-4 w-4" />
          <span>Novo Culto / Evento</span>
        </Button>
      </div>

      {/* Lista de Eventos em Grid */}
      {filteredEvents.length === 0 ? (
        <div className="p-12 text-center rounded-xl border border-dashed border-border bg-card/50">
          <Calendar className="h-10 w-10 text-muted-foreground/50 mx-auto mb-2" />
          <h3 className="text-sm font-semibold text-foreground">Nenhum evento encontrado</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Ajuste os filtros de busca ou cadastre um novo culto na congregação ativa.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEvents.map((event) => {
            const capacityRatio = event.maxCapacity
              ? Math.min(
                  100,
                  Math.round(
                    ((event.isRegistrationRequired ? event.registeredCount : event.checkedInCount) /
                      event.maxCapacity) *
                      100
                  )
                )
              : null;

            return (
              <Card
                key={event.id}
                className="flex flex-col justify-between hover:shadow-md transition-all duration-200 border-border/80"
              >
                <CardContent className="p-5 space-y-4">
                  {/* Cabeçalho do Card */}
                  <div className="flex items-center justify-between gap-2">
                    <EventCategoryBadge category={event.category} />
                    <EventStatusBadge status={event.status} />
                  </div>

                  <div>
                    <h3 className="font-bold text-base text-foreground leading-snug line-clamp-2">
                      {event.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {event.description || 'Culto / reunião congregacional de membros e visitantes.'}
                    </p>
                  </div>

                  {/* Informações de Local e Data */}
                  <div className="space-y-1.5 text-xs text-muted-foreground border-y border-border/60 py-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="font-medium text-foreground">
                        {event.startDate === event.endDate
                          ? event.startDate
                          : `${event.startDate} a ${event.endDate}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span>
                        {event.startTime} às {event.endTime} (Manaus)
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-primary shrink-0" />
                      <span className="truncate">
                        {event.location} • {event.congregationName}
                      </span>
                    </div>
                  </div>

                  {/* Ocupação / Inscrições */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <Users className="h-3.5 w-3.5" />
                        {event.isRegistrationRequired ? 'Inscrições Confirmadas' : 'Presença em Tempo Real'}
                      </span>
                      <span className="font-bold text-foreground">
                        {event.isRegistrationRequired
                          ? `${event.registeredCount} ${event.maxCapacity ? `/ ${event.maxCapacity}` : 'inscritos'}`
                          : `${event.checkedInCount} ${event.maxCapacity ? `/ ${event.maxCapacity}` : 'presentes'}`}
                      </span>
                    </div>

                    {capacityRatio !== null && (
                      <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 rounded-full ${
                            capacityRatio >= 90
                              ? 'bg-rose-500'
                              : capacityRatio >= 70
                                ? 'bg-amber-500'
                                : 'bg-primary'
                          }`}
                          style={{ width: `${capacityRatio}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Badges Adicionais */}
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
                    {event.isRegistrationRequired ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
                        <Ticket className="h-3 w-3" />
                        {event.registrationFee && event.registrationFee > 0
                          ? formatCurrency(event.registrationFee)
                          : 'Inscrição Gratuita'}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                        <CheckCircle2 className="h-3 w-3" />
                        Acesso Livre
                      </span>
                    )}

                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
                      <QrCode className="h-3 w-3" />
                      {event.checkInMethod === 'both'
                        ? 'QR Code & Manual'
                        : event.checkInMethod === 'qr_code'
                          ? 'Apenas QR Code'
                          : 'Presença Manual'}
                    </span>
                  </div>

                  {/* Ações do Card */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-border">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-8 gap-1.5 flex-1"
                      onClick={() => onOpenCheckIn(event)}
                    >
                      <QrCode className="h-3.5 w-3.5 text-primary" />
                      <span>Check-in</span>
                    </Button>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-8"
                      onClick={() => onEditEvent(event)}
                    >
                      Editar
                    </Button>

                    {event.status !== 'cancelled' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-8 text-destructive hover:bg-destructive/10"
                        onClick={() => onCancelEvent(event.id)}
                        title="Cancelar evento"
                      >
                        <AlertCircle className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
