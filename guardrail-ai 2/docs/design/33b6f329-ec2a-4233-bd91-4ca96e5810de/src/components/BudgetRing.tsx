import React from 'react';
import { formatMoney } from '../utils/money';

interface BudgetRingProps {
  label: string;
  spent: number;
  limit: number;
}

export function BudgetRing({ label, spent, limit }: BudgetRingProps) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const ratio = Math.min(spent / limit, 1);
  const remaining = limit - spent;

  return (
    <figure className="flex flex-col items-center text-center">
      <div className="relative h-40 w-40">
        <svg viewBox="0 0 132 132" className="h-full w-full -rotate-90" aria-hidden="true">
          <circle cx="66" cy="66" r={radius} fill="none" stroke="hsl(var(--track))" strokeWidth="11" />
          <circle
            cx="66"
            cy="66"
            r={radius}
            fill="none"
            stroke="hsl(var(--accent))"
            strokeWidth="11"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - ratio)} />
          
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xs font-medium text-muted-foreground">{label}</span>
          <span className="tabular text-[26px] font-semibold leading-tight tracking-tight text-foreground">{formatMoney(remaining)}</span>
          <span className="text-xs text-muted-foreground">left</span>
        </div>
      </div>
      <figcaption className="mt-3 text-sm text-muted-foreground">
        <span className="tabular font-medium text-foreground">{formatMoney(spent)}</span> spent of{' '}
        <span className="tabular">{formatMoney(limit)}</span>
      </figcaption>
    </figure>);

}