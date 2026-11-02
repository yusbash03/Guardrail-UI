import React from 'react';
import { Ban, CheckCircle2, ShieldAlert } from 'lucide-react';
import { cn } from '../utils/cn';

export type Decision = 'ALLOWED' | 'REQUIRES_APPROVAL' | 'BLOCKED';

const config = {
  ALLOWED: { label: 'Allowed', icon: CheckCircle2, cls: 'bg-allowed/10 text-allowed-fg ring-allowed/25' },
  REQUIRES_APPROVAL: { label: 'Requires approval', icon: ShieldAlert, cls: 'bg-approval/10 text-approval-fg ring-approval/30' },
  BLOCKED: { label: 'Blocked', icon: Ban, cls: 'bg-blocked/10 text-blocked-fg ring-blocked/25' }
};

export function DecisionBadge({ decision, size = 'md' }: {decision: Decision;size?: 'md' | 'lg';}) {
  const c = config[decision];
  const Icon = c.icon;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full font-semibold uppercase tracking-wide ring-1 ring-inset',
        size === 'lg' ? 'px-3 py-1 text-xs' : 'px-2.5 py-0.5 text-[11px]',
        c.cls
      )}>
      
      <Icon className={size === 'lg' ? 'h-4 w-4' : 'h-3.5 w-3.5'} aria-hidden="true" />
      {c.label}
    </span>);

}