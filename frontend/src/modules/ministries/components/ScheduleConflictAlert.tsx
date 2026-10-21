import React from 'react';
import { AlertTriangle, Clock, Calendar, AlertCircle } from 'lucide-react';
import type { ScheduleConflict } from '../types';

interface ScheduleConflictAlertProps {
  conflicts: ScheduleConflict[];
}

export const ScheduleConflictAlert: React.FC<ScheduleConflictAlertProps> = ({ conflicts }) => {
  if (!conflicts || conflicts.length === 0) return null;

  return (
    <div
      role="alert"
      data-testid="schedule-conflict-alert"
      className="p-4 rounded-lg bg-amber-500/10 border-2 border-amber-500/30 text-amber-950 dark:text-amber-200 animate-in fade-in-50 duration-200 space-y-3"
    >
      <div className="flex items-center gap-2.5 font-bold text-sm text-amber-800 dark:text-amber-400">
        <div className="p-1.5 rounded-full bg-amber-500/20 shrink-0">
          <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <span>Atenção: Conflito de Horário de Voluntários Detectado!</span>
          <p className="text-xs font-normal text-muted-foreground mt-0.5">
            Um ou mais voluntários selecionados já estão escalados em outro ministério no mesmo horário ou com intervalo sobreposto.
          </p>
        </div>
      </div>

      <div className="space-y-2 pt-1 border-t border-amber-500/20">
        {conflicts.map((conflict, index) => (
          <div
            key={`${conflict.memberId}-${conflict.conflictingScheduleId}-${index}`}
            className="flex items-start gap-2.5 text-xs bg-background/80 p-2.5 rounded-md border border-amber-500/20"
          >
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold text-foreground">
                {conflict.memberName}
              </p>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-muted-foreground text-[11px]">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {conflict.conflictingDate}
                </span>
                <span className="flex items-center gap-1 font-medium text-amber-600 dark:text-amber-400">
                  <Clock className="h-3 w-3" />
                  {conflict.conflictingTimeWindow}
                </span>
                <span>
                  Escala: <strong className="text-foreground">{conflict.conflictingScheduleTitle}</strong> ({conflict.conflictingMinistryName})
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
