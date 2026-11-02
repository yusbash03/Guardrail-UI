import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Ban, ChevronDownIcon, Info, ShieldAlert } from 'lucide-react';
import { cn } from '../utils/cn';
import type { Reason } from '../types/reason';

const severity = {
  INFO: { icon: Info, cls: 'text-primary-ink', label: 'Info' },
  APPROVAL: { icon: ShieldAlert, cls: 'text-approval-fg', label: 'Needs approval' },
  BLOCK: { icon: Ban, cls: 'text-blocked-fg', label: 'Blocks purchase' }
};

export function ReasonList({ reasons }: {reasons: Reason[];}) {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <ul className="divide-y divide-border rounded-btn border border-border">
      {reasons.map((reason) => {
        const s = severity[reason.severity];
        const Icon = s.icon;
        const isOpen = open === reason.id;
        return (
          <li key={reason.id}>
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : reason.id)}
              className="flex w-full items-start gap-3 px-3 py-2.5 text-left transition-colors duration-150 hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary">
              
              <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', s.cls)} aria-label={s.label} />
              <span className="flex min-w-0 flex-1 flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                <span className="text-sm text-foreground">{reason.message}</span>
                <span className="w-fit shrink-0 rounded-md bg-muted px-1.5 py-0.5 font-mono text-[10px] font-medium text-muted-foreground">
                  {reason.ruleType}
                </span>
              </span>
              <ChevronDownIcon
                className={cn('mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-150 ease-out', isOpen && 'rotate-180')}
                aria-hidden="true" />
              
            </button>
            <AnimatePresence initial={false}>
              {isOpen &&
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
                className="overflow-hidden">
                
                  <p className="px-10 pb-3 text-sm text-muted-foreground">{reason.detail}</p>
                </motion.div>
              }
            </AnimatePresence>
          </li>);

      })}
    </ul>);

}