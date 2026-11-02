import React from 'react';
import { Check, Loader2, X } from 'lucide-react';
import { cn } from '../utils/cn';
import type { TimelineStep } from '../types/transaction';

export function StatusTimeline({ steps }: {steps: TimelineStep[];}) {
  return (
    <ol className="relative">
      {steps.map((step, index) => {
        const last = index === steps.length - 1;
        return (
          <li key={`${step.label}-${index}`} className="relative flex gap-3 pb-5 last:pb-0">
            {!last &&
            <span
              aria-hidden="true"
              className={cn('absolute left-[11px] top-6 h-[calc(100%-1.5rem)] w-px', step.state === 'done' ? 'bg-accent/50' : 'bg-border')} />

            }
            <span
              className={cn(
                'relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full',
                step.state === 'done' && 'bg-accent text-white',
                step.state === 'current' && 'bg-primary/10 text-primary-ink ring-1 ring-primary/40',
                step.state === 'upcoming' && 'border border-border bg-card',
                step.state === 'failed' && 'bg-blocked/10 text-blocked-fg ring-1 ring-blocked/30'
              )}>
              
              {step.state === 'done' && <Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />}
              {step.state === 'current' && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
              {step.state === 'failed' && <X className="h-3.5 w-3.5" strokeWidth={3} aria-hidden="true" />}
            </span>
            <div className="flex min-w-0 flex-1 items-baseline justify-between gap-3 pt-0.5">
              <span
                className={cn(
                  'text-sm',
                  step.state === 'upcoming' ? 'text-muted-foreground' : 'font-medium text-foreground',
                  step.state === 'failed' && 'text-blocked-fg'
                )}>
                
                {step.label}
                <span className="sr-only"> — {step.state}</span>
              </span>
              {step.time && <span className="tabular shrink-0 text-xs text-muted-foreground">{step.time}</span>}
            </div>
          </li>);

      })}
    </ol>);

}