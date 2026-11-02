import React from 'react';
import { CopyIcon } from 'lucide-react';
import { toast } from 'sonner';

export function CopyId({ value, label }: {value: string;label: string;}) {
  const copy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(value);
      toast.success(`${label} copied`);
    } catch {
      toast.error('Couldn’t copy — select the ID instead');
    }
  };
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="font-mono text-xs text-foreground">{value}</span>
      <button
        type="button"
        onClick={copy}
        aria-label={`Copy ${label}`}
        className="rounded p-1 text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
        
        <CopyIcon className="h-3.5 w-3.5" aria-hidden="true" />
      </button>
    </span>);

}