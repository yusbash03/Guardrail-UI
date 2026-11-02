import React from 'react';
import { cn } from '../../utils/cn';

interface TextFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  error?: string | null;
  hint?: string;
}

export function TextField({ id, label, error, hint, className, ...props }: TextFieldProps) {
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        aria-invalid={!!error}
        aria-describedby={describedBy}
        className={cn(
          'h-11 w-full rounded-btn border bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2',
          error ? 'border-blocked focus-visible:ring-blocked/40' : 'border-border focus-visible:ring-primary'
        )}
        {...props} />
      
      {error ?
      <p id={`${id}-error`} role="alert" className="mt-1.5 text-sm font-medium text-blocked-fg">{error}</p> :

      hint && <p id={`${id}-hint`} className="mt-1.5 text-xs text-muted-foreground">{hint}</p>
      }
    </div>);

}