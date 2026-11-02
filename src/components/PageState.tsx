import React from 'react';
import { AlertTriangle, RotateCw, WifiOff } from 'lucide-react';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { errorMessage } from '../lib/errorCopy';
import { useOnline } from '../hooks/useOnline';

/** Error card in the design's empty-state style. Offline shows the PWA "unavailable offline" copy instead. */
export function PageError({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  const online = useOnline();
  return (
    <Card className="flex max-w-3xl flex-col items-center px-6 py-14 text-center">
      {online ? <AlertTriangle className="h-8 w-8 text-approval-fg" aria-hidden="true" /> : <WifiOff className="h-8 w-8 text-muted-foreground" aria-hidden="true" />}
      <p className="mt-3 font-medium">{online ? "Couldn't load this" : 'Unavailable offline'}</p>
      <p className="mt-1 text-sm text-muted-foreground">{online ? errorMessage(error) : 'Guardrail needs a connection to show your money.'}</p>
      {onRetry && online &&
      <Button variant="secondary" size="sm" className="mt-5" onClick={onRetry}>
          <RotateCw className="h-3.5 w-3.5" aria-hidden="true" /> Try again
        </Button>
      }
    </Card>);

}

export function PageLoading({ label }: { label: string }) {
  return (
    <div className="mx-auto max-w-[1280px] space-y-6 px-4 py-6 lg:px-8 lg:py-8" aria-busy="true" aria-label={label}>
      <div className="h-36 animate-pulse rounded-card border border-border bg-card" />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="h-80 animate-pulse rounded-card border border-border bg-card lg:col-span-2" />
        <div className="h-80 animate-pulse rounded-card border border-border bg-card" />
      </div>
    </div>);

}
