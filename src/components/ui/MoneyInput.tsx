import React from 'react';
import { cn } from '../../utils/cn';

interface MoneyInputProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
  className?: string;
}

export function MoneyInput({ value, onChange, label, className }: MoneyInputProps) {
  return (
    <div className={cn('relative w-28', className)}>
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
      <input
        type="number"
        min={0}
        step="0.01"
        aria-label={label}
        value={Number.isFinite(value) ? value : 0}
        onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
        className="tabular h-9 w-full rounded-btn border border-border bg-card pl-6 pr-2 text-sm font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" />
      
    </div>);

}