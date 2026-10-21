import React, { useState } from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin, QrCode } from 'lucide-react';
import type { ChurchEvent } from '../types';
import { EventCategoryBadge, EventStatusBadge } from './EventBadges';

interface EventsCalendarViewProps {
  events: ChurchEvent[];
  onSelectEvent: (event: ChurchEvent) => void;
  onOpenCheckIn: (event: ChurchEvent) => void;
}

export const EventsCalendarView: React.FC<EventsCalendarViewProps> = ({
  events,
  onSelectEvent,
  onOpenCheckIn,
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date(2026, 9, 21)); // Outubro 2026 (mês 9 no JS Date 0-indexed)
  const [selectedDay, setSelectedDay] = useState<Date>(new Date(2026, 9, 25));

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 }); // Domingo
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });

  const calendarDays = eachDayOfInterval({ start: startDate, end: endDate });

  const weekDayHeaders = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  // Eventos do dia selecionado
  const selectedDayStr = format(selectedDay, 'yyyy-MM-dd');
  const dayEvents = events.filter((e) => e.startDate <= selectedDayStr && e.endDate >= selectedDayStr);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Grade do Calendário Mensal */}
      <div className="lg:col-span-2 space-y-4 bg-card p-4 rounded-xl border border-border shadow-xs">
        {/* Barra de Navegação do Mês */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5 text-primary" />
            <h2 className="text-base font-bold text-foreground capitalize">
              {format(currentDate, 'MMMM yyyy', { locale: ptBR })}
            </h2>
          </div>

          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className="text-xs h-8 px-2"
              onClick={() => setCurrentDate(subMonths(currentDate, 1))}
              title="Mês Anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="text-xs h-8"
              onClick={() => {
                const now = new Date(2026, 9, 21);
                setCurrentDate(now);
                setSelectedDay(now);
              }}
            >
              Hoje
            </Button>

            <Button
              variant="outline"
              size="sm"
              className="text-xs h-8 px-2"
              onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              title="Próximo Mês"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Cabeçalho dos Dias da Semana */}
        <div className="grid grid-cols-7 gap-1 text-center font-semibold text-xs text-muted-foreground py-2 border-b border-border">
          {weekDayHeaders.map((day) => (
            <div key={day}>{day}</div>
          ))}
        </div>

        {/* Dias do Mês */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day) => {
            const dayStr = format(day, 'yyyy-MM-dd');
            const dayMatches = events.filter(
              (e) => e.startDate <= dayStr && e.endDate >= dayStr
            );
            const isSelected = isSameDay(day, selectedDay);
            const isCurrentMonth = isSameMonth(day, monthStart);

            return (
              <button
                key={day.toISOString()}
                type="button"
                onClick={() => setSelectedDay(day)}
                className={`min-h-[85px] p-1.5 text-left rounded-lg transition-all border text-xs flex flex-col justify-between ${
                  isSelected
                    ? 'border-primary ring-2 ring-primary/20 bg-primary/5 font-semibold'
                    : 'border-border/60 hover:border-border hover:bg-muted/40'
                } ${!isCurrentMonth ? 'opacity-40 bg-muted/20' : 'bg-card'}`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-flex items-center justify-center h-5 w-5 rounded-full text-[11px] ${
                      isSelected
                        ? 'bg-primary text-primary-foreground font-bold'
                        : isSameDay(day, new Date(2026, 9, 21))
                          ? 'bg-accent text-accent-foreground font-bold'
                          : 'text-foreground'
                    }`}
                  >
                    {format(day, 'd')}
                  </span>
                  {dayMatches.length > 0 && (
                    <span className="text-[10px] font-bold text-muted-foreground px-1 bg-muted rounded-full">
                      {dayMatches.length}
                    </span>
                  )}
                </div>

                <div className="space-y-1 w-full overflow-hidden mt-1">
                  {dayMatches.slice(0, 2).map((ev) => (
                    <div
                      key={ev.id}
                      className="truncate text-[10px] px-1.5 py-0.5 rounded-sm bg-primary/10 text-primary font-medium"
                      title={`${ev.title} (${ev.startTime})`}
                    >
                      {ev.startTime} {ev.title}
                    </div>
                  ))}
                  {dayMatches.length > 2 && (
                    <span className="text-[9px] text-muted-foreground block pl-1">
                      +{dayMatches.length - 2} mais
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Painel Lateral: Agenda do Dia Selecionado */}
      <div className="space-y-4 bg-card p-4 rounded-xl border border-border shadow-xs flex flex-col justify-between">
        <div className="space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <div>
              <h3 className="text-sm font-bold text-foreground">Programação do Dia</h3>
              <p className="text-xs text-muted-foreground capitalize">
                {format(selectedDay, "EEEE, dd 'de' MMMM", { locale: ptBR })}
              </p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              {dayEvents.length} {dayEvents.length === 1 ? 'evento' : 'eventos'}
            </span>
          </div>

          {dayEvents.length === 0 ? (
            <div className="p-8 text-center rounded-lg border border-dashed border-border bg-muted/20">
              <CalendarIcon className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-xs text-muted-foreground">Nenhum evento agendado nesta data.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
              {dayEvents.map((event) => (
                <div
                  key={event.id}
                  className="p-3 rounded-lg border border-border bg-muted/30 space-y-2.5 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-center justify-between gap-1">
                    <EventCategoryBadge category={event.category} />
                    <EventStatusBadge status={event.status} />
                  </div>

                  <h4 className="font-semibold text-xs text-foreground leading-snug">
                    {event.title}
                  </h4>

                  <div className="space-y-1 text-[11px] text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3 text-primary" />
                      <span>
                        {event.startTime} às {event.endTime} (Manaus)
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-3 w-3 text-primary" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1 border-t border-border/60">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-7 px-2 flex-1 gap-1"
                      onClick={() => onOpenCheckIn(event)}
                    >
                      <QrCode className="h-3 w-3 text-primary" />
                      <span>Check-in</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-7 px-2"
                      onClick={() => onSelectEvent(event)}
                    >
                      Editar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-xs text-muted-foreground">
          <p className="font-semibold text-foreground">Fuso Horário Eclesiástico</p>
          <p className="text-[11px] mt-0.5">
            Todas as reuniões estão configuradas no fuso padrão <strong>America/Manaus (UTC-4)</strong>.
          </p>
        </div>
      </div>
    </div>
  );
};
