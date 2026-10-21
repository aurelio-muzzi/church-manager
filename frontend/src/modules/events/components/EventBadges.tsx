import React from 'react';
import { Badge } from '@/components/ui/badge';
import type { EventStatus, EventCategory } from '../types';
import {
  Calendar,
  Sparkles,
  BookOpen,
  Briefcase,
  Users,
  Flame,
  Smile,
  Globe,
} from 'lucide-react';

export const EventStatusBadge: React.FC<{ status: EventStatus }> = ({ status }) => {
  switch (status) {
    case 'scheduled':
      return (
        <Badge variant="outline" className="bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/30">
          Agendado
        </Badge>
      );
    case 'in_progress':
      return (
        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 animate-pulse">
          ● Em Andamento
        </Badge>
      );
    case 'completed':
      return (
        <Badge variant="outline" className="bg-muted text-muted-foreground border-border">
          Encerrado
        </Badge>
      );
    case 'cancelled':
      return (
        <Badge variant="outline" className="bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30">
          Cancelado
        </Badge>
      );
    case 'rescheduled':
      return (
        <Badge variant="outline" className="bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30">
          Reagendado
        </Badge>
      );
    default:
      return null;
  }
};

export const EventCategoryBadge: React.FC<{ category: EventCategory }> = ({ category }) => {
  switch (category) {
    case 'worship':
      return (
        <Badge variant="secondary" className="gap-1 bg-primary/10 text-primary border-primary/20">
          <Calendar className="h-3 w-3" />
          <span>Culto</span>
        </Badge>
      );
    case 'conference':
      return (
        <Badge variant="secondary" className="gap-1 bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20">
          <Sparkles className="h-3 w-3" />
          <span>Conferência</span>
        </Badge>
      );
    case 'seminar':
      return (
        <Badge variant="secondary" className="gap-1 bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-500/20">
          <BookOpen className="h-3 w-3" />
          <span>Seminário</span>
        </Badge>
      );
    case 'workshop':
      return (
        <Badge variant="secondary" className="gap-1 bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20">
          <Briefcase className="h-3 w-3" />
          <span>Oficina</span>
        </Badge>
      );
    case 'meeting':
      return (
        <Badge variant="secondary" className="gap-1 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20">
          <Users className="h-3 w-3" />
          <span>Reunião</span>
        </Badge>
      );
    case 'youth':
      return (
        <Badge variant="secondary" className="gap-1 bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/20">
          <Flame className="h-3 w-3" />
          <span>Jovens</span>
        </Badge>
      );
    case 'kids':
      return (
        <Badge variant="secondary" className="gap-1 bg-pink-500/10 text-pink-700 dark:text-pink-300 border-pink-500/20">
          <Smile className="h-3 w-3" />
          <span>Infantil</span>
        </Badge>
      );
    case 'outreach':
      return (
        <Badge variant="secondary" className="gap-1 bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/20">
          <Globe className="h-3 w-3" />
          <span>Missões</span>
        </Badge>
      );
    default:
      return null;
  }
};
