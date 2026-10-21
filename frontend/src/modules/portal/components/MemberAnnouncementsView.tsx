import React from 'react';
import {
  Bell,
  Calendar,
  Sparkles,
  AlertTriangle,
  Megaphone,
  BookOpen,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { MemberAnnouncement } from '../types';

interface MemberAnnouncementsViewProps {
  announcements: MemberAnnouncement[];
}

export const MemberAnnouncementsView: React.FC<MemberAnnouncementsViewProps> = ({
  announcements,
}) => {
  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'urgent':
        return (
          <Badge variant="destructive" className="text-[10px] gap-1">
            <AlertTriangle className="h-3 w-3" /> Urgente
          </Badge>
        );
      case 'pastoral':
        return (
          <Badge
            variant="outline"
            className="text-[10px] gap-1 bg-purple-500/15 text-purple-600 dark:text-purple-400 border-purple-500/30"
          >
            <BookOpen className="h-3 w-3" /> Pastoral
          </Badge>
        );
      case 'event':
        return (
          <Badge
            variant="outline"
            className="text-[10px] gap-1 bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
          >
            <Sparkles className="h-3 w-3" /> Evento
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-[10px] gap-1">
            <Megaphone className="h-3 w-3" /> Geral
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-transparent p-4 sm:p-5 rounded-2xl border border-amber-500/20">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Bell className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-foreground">
              Mural de Comunicados & Cartas Pastorais
            </h3>
            <p className="text-xs text-muted-foreground">
              Fique por dentro das notícias, orientações da liderança e avisos importantes da igreja.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4" data-testid="member-announcements-list">
        {announcements.length === 0 ? (
          <Card className="border-dashed border-2">
            <CardContent className="py-12 text-center text-muted-foreground space-y-2">
              <Bell className="h-10 w-10 mx-auto text-muted-foreground/50 mb-2" />
              <p className="font-semibold text-sm">Nenhum comunicado recente</p>
              <p className="text-xs max-w-sm mx-auto">
                Quando a secretaria ou o pastor publicarem novos informes, eles aparecerão aqui.
              </p>
            </CardContent>
          </Card>
        ) : (
          announcements.map((item) => (
            <Card
              key={item.id}
              className={`border-border/80 shadow-sm overflow-hidden transition-all ${
                item.isImportant
                  ? 'border-l-4 border-l-amber-500 bg-amber-500/5'
                  : ''
              }`}
              data-testid={`announcement-card-${item.id}`}
            >
              <CardHeader className="p-4 sm:p-5 pb-2 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {getCategoryBadge(item.category)}
                    {item.isImportant && (
                      <span className="text-[10px] font-semibold text-amber-600 uppercase tracking-wide">
                        Destaque
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5 text-primary" />
                    <span>{new Date(item.date).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>

                <CardTitle className="text-base font-bold text-foreground leading-snug">
                  {item.title}
                </CardTitle>
                <p className="text-xs font-medium text-muted-foreground">
                  Por: <span className="text-foreground">{item.author}</span>
                </p>
              </CardHeader>

              <CardContent className="p-4 sm:p-5 pt-1">
                <p className="text-xs text-foreground/90 leading-relaxed whitespace-pre-line">
                  {item.content}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
