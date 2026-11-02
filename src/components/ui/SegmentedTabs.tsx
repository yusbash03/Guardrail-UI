import React from 'react';
import { cn } from '../../utils/cn';

interface Option<T extends string> {
  value: T;
  label: string;
  count?: number;
}

interface SegmentedTabsProps<T extends string> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
  ariaLabel: string;
  disabled?: boolean;
  className?: string;
}

export function SegmentedTabs<T extends string>({ options, value, onChange, ariaLabel, disabled, className }: SegmentedTabsProps<T>) {
  return (
    <div role="tablist" aria-label={ariaLabel} className={cn('inline-flex rounded-btn bg-muted p-1', disabled && 'opacity-60', className)}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={cn(
              'inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-lg px-3 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              active ? 'bg-card text-foreground shadow-soft' : 'text-muted-foreground hover:text-foreground'
            )}>
            
            {option.label}
            {option.count !== undefined &&
            <span className={cn('tabular rounded-full px-1.5 text-xs', active ? 'bg-primary/10 text-primary-ink' : 'bg-card/60')}>
                {option.count}
              </span>
            }
          </button>);

      })}
    </div>);

}