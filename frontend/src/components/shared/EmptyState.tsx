import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  actionIcon?: LucideIcon;
  className?: string;
  children?: React.ReactNode;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  actionIcon: ActionIcon,
  className,
  children,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center p-8 sm:p-12 border border-dashed border-border rounded-xl bg-card/40 my-4',
        className
      )}
    >
      <div className="h-12 w-12 rounded-xl bg-muted/60 border border-border flex items-center justify-center text-muted-foreground mb-4 shadow-inner">
        <Icon className="h-6 w-6 stroke-[1.5]" />
      </div>

      <h3 className="text-base sm:text-lg font-semibold text-foreground">
        {title}
      </h3>

      <p className="text-sm text-muted-foreground max-w-sm mt-1 mb-6 leading-relaxed">
        {description}
      </p>

      {actionLabel && onAction && (
        <Button onClick={onAction} className="gap-2">
          {ActionIcon && <ActionIcon className="h-4 w-4" />}
          {actionLabel}
        </Button>
      )}

      {children}
    </div>
  );
}
