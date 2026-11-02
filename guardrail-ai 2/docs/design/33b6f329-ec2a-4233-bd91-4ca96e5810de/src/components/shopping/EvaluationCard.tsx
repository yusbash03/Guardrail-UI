import React, { ReactNode, useState } from 'react';
import { ChevronDownIcon } from 'lucide-react';
import { Card } from '../ui/Card';
import { DecisionBadge, Decision } from '../DecisionBadge';
import { ReasonList } from '../ReasonList';
import { cn } from '../../utils/cn';
import type { Reason } from '../../types/reason';

interface EvaluationCardProps {
  decision: Decision;
  primaryReason: string;
  reasons: Reason[];
  children?: ReactNode;
  footer?: ReactNode;
  defaultOpen?: boolean;
}

export function EvaluationCard({ decision, primaryReason, reasons, children, footer, defaultOpen = false }: EvaluationCardProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Card className="p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <DecisionBadge decision={decision} />
        <span className="text-xs text-muted-foreground">Checked by your rules · v5</span>
      </div>
      <p className="mt-3 text-[15px] font-semibold text-foreground">{primaryReason}</p>
      {children && <div className="mt-4">{children}</div>}
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="mt-4 inline-flex items-center gap-1 rounded text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
        
        {open ? 'Hide' : 'Show'} {reasons.length} {reasons.length === 1 ? 'reason' : 'reasons'}
        <ChevronDownIcon className={cn('h-4 w-4 transition-transform duration-150 ease-out', open && 'rotate-180')} aria-hidden="true" />
      </button>
      {open &&
      <div className="mt-3">
          <ReasonList reasons={reasons} />
        </div>
      }
      {footer && <div className="mt-4 border-t border-border pt-3">{footer}</div>}
    </Card>);

}