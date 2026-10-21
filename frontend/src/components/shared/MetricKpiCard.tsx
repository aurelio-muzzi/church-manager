import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

export interface MetricKpiCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trendPercentage?: number;
  trendLabel?: string;
  isLoading?: boolean;
  className?: string;
  iconVariant?: 'indigo' | 'emerald' | 'purple' | 'amber' | 'rose';
}

const variantStyles = {
  indigo: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
  emerald: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  purple: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  amber: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
  rose: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
};

export function MetricKpiCard({
  title,
  value,
  icon: Icon,
  description,
  trendPercentage,
  trendLabel = 'vs. mês anterior',
  isLoading = false,
  className,
  iconVariant = 'indigo',
}: MetricKpiCardProps) {
  if (isLoading) {
    return (
      <Card className={cn('p-6 shadow-sm', className)}>
        <CardContent className="p-0 space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-9 w-9 rounded-lg" />
          </div>
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-3 w-36" />
        </CardContent>
      </Card>
    );
  }

  const isPositive = trendPercentage !== undefined && trendPercentage > 0;
  const isNegative = trendPercentage !== undefined && trendPercentage < 0;

  return (
    <Card
      className={cn(
        'p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:border-primary/40',
        className
      )}
    >
      <CardContent className="p-0 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-muted-foreground">
            {title}
          </span>
          <div
            className={cn(
              'h-9 w-9 rounded-lg border flex items-center justify-center transition-colors',
              variantStyles[iconVariant]
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>

        <div className="space-y-1">
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-mono">
            {value}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-0.5">
            {trendPercentage !== undefined && (
              <span
                className={cn(
                  'inline-flex items-center font-semibold rounded px-1.5 py-0.5 text-[11px]',
                  isPositive && 'bg-emerald-500/15 text-emerald-500 dark:text-emerald-400',
                  isNegative && 'bg-rose-500/15 text-rose-500 dark:text-rose-400',
                  !isPositive && !isNegative && 'bg-muted text-muted-foreground'
                )}
              >
                {isPositive && <ArrowUpRight className="h-3 w-3 mr-0.5" />}
                {isNegative && <ArrowDownRight className="h-3 w-3 mr-0.5" />}
                {isPositive ? `+${trendPercentage}%` : `${trendPercentage}%`}
              </span>
            )}
            {description ? (
              <span>{description}</span>
            ) : trendPercentage !== undefined ? (
              <span className="truncate">{trendLabel}</span>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
