import React from 'react';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../ui/Button';
import { conversations } from '../../data/conversations';
import { cn } from '../../utils/cn';

export function ConversationList() {
  return (
    <aside aria-label="Conversations" className="hidden w-64 shrink-0 flex-col border-r border-border bg-card xl:flex">
      <div className="p-3">
        <Button variant="secondary" className="w-full" onClick={() => toast('New chat started')}>
          <Plus className="h-4 w-4" aria-hidden="true" /> New chat
        </Button>
      </div>
      <ul className="flex-1 space-y-0.5 overflow-y-auto px-2 pb-3">
        {conversations.map((c) =>
        <li key={c.id}>
            <button
            type="button"
            aria-current={c.active || undefined}
            className={cn(
              'w-full rounded-btn px-3 py-2.5 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
              c.active ? 'bg-muted' : 'hover:bg-muted/60'
            )}>
            
              <span className="flex items-baseline justify-between gap-2">
                <span className="truncate text-sm font-medium">{c.title}</span>
                <span className="shrink-0 text-[11px] text-muted-foreground">{c.when}</span>
              </span>
              <span className="mt-0.5 block truncate text-xs text-muted-foreground">{c.preview}</span>
            </button>
          </li>
        )}
      </ul>
    </aside>);

}