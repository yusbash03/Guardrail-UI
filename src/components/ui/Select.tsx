import React from 'react';
import { ChevronDownIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: readonly string[];
}

export function Select({ options, className, ...props }: SelectProps) {
  return (
    <div className={cn('relative inline-flex', className)}>
      <select
        className="h-9 w-full appearance-none rounded-btn border border-border bg-card pl-3 pr-8 text-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        {...props}>
        
        {options.map((option) =>
        <option key={option} value={option}>
            {option}
          </option>
        )}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
    </div>);

}