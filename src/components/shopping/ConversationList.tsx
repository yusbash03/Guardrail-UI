import React from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, MessagesSquare, Plus, ShoppingBasket, X } from 'lucide-react';
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

function ConversationItems({ conversations, activeId, onSelect, onNew, creating }: ConversationListProps) {
  return (
    <>
      <div className="space-y-2 p-3">
        <Button variant="secondary" className="w-full" onClick={onNew} disabled={creating}>
          {creating ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Plus className="h-4 w-4" aria-hidden="true" />} New chat
        </Button>
        <Link
          to="/cart"
          className="flex h-9 items-center justify-center gap-2 rounded-btn text-sm font-medium text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
          <ShoppingBasket className="h-4 w-4" aria-hidden="true" /> Build a cart yourself
        </Link>
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
    </>);

}

export function ConversationList(props: ConversationListProps) {
  return (
    <aside aria-label="Conversations" className="hidden w-64 shrink-0 flex-col border-r border-border bg-card xl:flex">
      <ConversationItems {...props} />
    </aside>);

}

/** Below xl the list lives in a bottom sheet, opened from the chat header (FRONTEND_SPECIFICATION.md §3.2). */
export function ConversationSheet({ open, onClose, ...props }: ConversationListProps & {open: boolean;onClose: () => void;}) {
  return (
    <AnimatePresence>
      {open &&
      <div className="fixed inset-0 z-40 xl:hidden">
          <motion.div
          className="absolute inset-0 bg-foreground/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose} />
        
          <motion.nav
          aria-label="Conversations"
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
          className="absolute inset-x-0 bottom-0 flex max-h-[75vh] flex-col rounded-t-2xl border-t border-border bg-card pb-6">
          
            <div className="flex items-center justify-between px-4 pt-4">
              <span className="text-sm font-semibold">Conversations</span>
              <button type="button" aria-label="Close" onClick={onClose} className="rounded-btn p-2 hover:bg-muted">
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <ConversationItems
            {...props}
            onSelect={(id) => {
              props.onSelect(id);
              onClose();
            }}
            onNew={() => {
              props.onNew();
              onClose();
            }} />
          
          </motion.nav>
        </div>
      }
    </AnimatePresence>);

}

/** Chat header button (below xl) that opens the sheet. */
export function ConversationSheetButton({ title, onOpen }: {title: string;onOpen: () => void;}) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-haspopup="dialog"
      className="flex h-11 w-full shrink-0 items-center gap-2 border-b border-border bg-card px-4 text-left text-sm xl:hidden">
      
      <MessagesSquare className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      <span className="min-w-0 flex-1 truncate font-medium">{title}</span>
      <span className="shrink-0 text-xs font-medium text-primary-ink">Chats</span>
    </button>);

}
