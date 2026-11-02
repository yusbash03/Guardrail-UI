import React from 'react';
import { Loader2, Plus } from 'lucide-react';
import { Button } from '../ui/Button';
import type { Conversation } from '../../lib/schemas';
import { formatWhen } from '../../utils/time';
import { cn } from '../../utils/cn';

interface ConversationListProps {
  conversations: Conversation[];
  activeId?: string;
  onSelect: (id: string) => void;
  onNew: () => void;
  creating?: boolean;
}

export function ConversationList({ conversations, activeId, onSelect, onNew, creating }: ConversationListProps) {
  return (
    <aside aria-label="Conversations" className="hidden w-64 shrink-0 flex-col border-r border-border bg-card xl:flex">
      <div className="p-3">
        <Button variant="secondary" className="w-full" onClick={onNew} disabled={creating}>
          {creating ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Plus className="h-4 w-4" aria-hidden="true" />} New chat
        </Button>
      </div>
      <ul className="flex-1 space-y-0.5 overflow-y-auto px-2 pb-3">
        {conversations.map((c) => {
          const active = c.id === activeId;
          return (
            <li key={c.id}>
              <button
                type="button"
                aria-current={active || undefined}
                onClick={() => onSelect(c.id)}
                className={cn(
                  'w-full rounded-btn px-3 py-2.5 text-left transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
                  active ? 'bg-muted' : 'hover:bg-muted/60'
                )}>
                
                <span className="flex items-baseline justify-between gap-2">
                  <span className="truncate text-sm font-medium">{c.title}</span>
                  <span className="shrink-0 text-[11px] text-muted-foreground">{formatWhen(c.lastMessageAt ?? c.createdAt)}</span>
                </span>
              </button>
            </li>);

        })}
      </ul>
    </aside>);

}
