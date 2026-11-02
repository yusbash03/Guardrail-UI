import React from "react";
import { cn } from "../utils/cn";
import { StatusTone, statusStyle } from "../utils/status";
import type { LucideIcon } from "lucide-react";
const tones: Record<StatusTone, string> = {
  positive: 'bg-accent/10 text-accent-fg ring-accent/25',
  negative: 'bg-blocked/10 text-blocked-fg ring-blocked/25',
  neutral: 'bg-muted text-muted-foreground ring-border',
  warning: 'bg-approval/10 text-approval-fg ring-approval/30'
};
interface StatusChipProps {
  label: string;
  tone?: StatusTone;
  icon?: LucideIcon;
  className?: string;
}
export function StatusChip({
  label,
  tone,
  icon,
  className
}: StatusChipProps) {
  const fallback = statusStyle(label);
  const Icon = icon ?? fallback.icon;
  return <span className={cn('inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset', tones[tone ?? fallback.tone], className)}>
      <Icon className="h-3.5 w-3.5" aria-hidden="true" />
      {label}
    </span>;
}