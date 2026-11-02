import React, { ReactNode } from 'react';
import { cn } from '../utils/cn';
import { formatMoney } from '../utils/money';

interface BudgetBarProps {
  label: string;
  period?: string;
  spent: number;
  limit: number;
  pending?: number;
  rightLabel?: ReactNode;
  showLegend?: boolean;
  pendingLabel?: string;
}

export function BudgetBar({ label, period, spent, limit, pending = 0, rightLabel, showLegend, pendingLabel = 'Pending' }: BudgetBarProps) {
  const committed = spent + pending;
  const over = Math.max(0, committed - limit);
  const total = Math.max(limit, committed);
  const pct = (n: number) => `${n / total * 100}%`;
  const spentInLimit = Math.min(spent, limit);
  const pendingInLimit = Math.min(pending, Math.max(0, limit - spentInLimit));
  const remaining = Math.max(0, limit - committed);

  const summary = over > 0 ? `${formatMoney(over)} over ${formatMoney(limit)}` : `${formatMoney(remaining)} left of ${formatMoney(limit)}`;

  return (
    <div>
      <div className="mb-2 flex items-baseline justify-between gap-3 text-sm">
        <span className="font-medium text-foreground">
          {label}
          {period && <span className="text-muted-foreground"> · {period}</span>}
        </span>
        <span className={cn('tabular text-right', over > 0 ? 'font-semibold text-blocked-fg' : 'text-muted-foreground')}>
          {rightLabel ?? summary}
        </span>
      </div>
      <div
        role="img"
        aria-label={`${label}: ${formatMoney(spent)} spent${pending ? `, ${formatMoney(pending)} ${pendingLabel.toLowerCase()}` : ''}, ${summary}`}
        className="relative flex h-2.5 w-full overflow-hidden rounded-full bg-track">
        
        {spentInLimit > 0 && <div className="h-full bg-accent" style={{ width: pct(spentInLimit) }} />}
        {pendingInLimit > 0 && <div className="bar-pending h-full" style={{ width: pct(pendingInLimit) }} />}
        {over > 0 && <div className="bar-over h-full" style={{ width: pct(over) }} />}
        {over > 0 && <div className="absolute inset-y-0 w-0.5 bg-foreground" style={{ left: pct(limit) }} />}
      </div>
      {showLegend &&
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-accent" /> Spent {formatMoney(spent)}
          </span>
          {pending > 0 &&
        <span className="inline-flex items-center gap-1.5">
              <span className="bar-pending h-2 w-2 rounded-full" /> {pendingLabel} {formatMoney(pending)}
            </span>
        }
          {over > 0 ?
        <span className="inline-flex items-center gap-1.5 text-blocked-fg">
              <span className="bar-over h-2 w-2 rounded-full" /> Over {formatMoney(over)}
            </span> :

        <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-track ring-1 ring-border" /> Remaining {formatMoney(remaining)}
            </span>
        }
        </div>
      }
    </div>);

}