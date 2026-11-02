import React from 'react';
import { FlaskConical } from 'lucide-react';

export function SandboxBadge() {
  return (
    <span className="inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-full bg-muted px-3 text-xs font-medium text-muted-foreground ring-1 ring-inset ring-border">
      <FlaskConical className="h-3.5 w-3.5" aria-hidden="true" />
      <span className="hidden md:inline">Sandbox mode — no real money moves</span>
      <span className="md:hidden">Sandbox</span>
    </span>);

}