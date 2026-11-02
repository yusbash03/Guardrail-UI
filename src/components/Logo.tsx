import React from 'react';
import { cn } from '../utils/cn';

export function LogoMark({ className }: {className?: string;}) {
  return (
    <svg viewBox="0 0 32 32" className={cn('h-8 w-8 shrink-0', className)} aria-hidden="true">
      <path d="M16 2.5 4.5 6.6v8.1c0 7.1 4.8 12.6 11.5 14.8 6.7-2.2 11.5-7.7 11.5-14.8V6.6L16 2.5Z" fill="hsl(var(--primary))" />
      <path d="M12.2 9.5v12.2M19.8 9.5v12.2" stroke="white" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M12.2 14h7.6M12.2 18h7.6" stroke="white" strokeOpacity="0.55" strokeWidth="1.4" strokeLinecap="round" />
    </svg>);

}

export function Logo({ className, inverted }: {className?: string;inverted?: boolean;}) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <LogoMark />
      <span className={cn('text-[17px] font-semibold tracking-tight', inverted ? 'text-white' : 'text-foreground')}>Guardrail</span>
      <span
        className={cn(
          'rounded-full px-1.5 py-0.5 text-[10px] font-semibold',
          inverted ? 'bg-white/15 text-white' : 'bg-primary/10 text-primary-ink'
        )}>
        
        AI
      </span>
    </div>);

}