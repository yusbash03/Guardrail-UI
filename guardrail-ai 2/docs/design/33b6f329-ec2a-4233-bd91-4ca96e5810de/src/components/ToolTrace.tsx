import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckIcon, ChevronDownIcon, Workflow } from 'lucide-react';
import { cn } from '../utils/cn';

interface TraceStep {
  label: string;
  detail: string;
}

export function ToolTrace({ steps }: {steps: TraceStep[];}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-btn border border-dashed border-border bg-muted/40">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-muted-foreground transition-colors duration-150 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-btn">
        
        <Workflow className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        <span className="min-w-0 flex-1 truncate">{steps.map((s) => s.label).join(' · ')}</span>
        <ChevronDownIcon className={cn('h-3.5 w-3.5 shrink-0 transition-transform duration-150 ease-out', open && 'rotate-180')} aria-hidden="true" />
      </button>
      <AnimatePresence initial={false}>
        {open &&
        <motion.ol
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
          className="overflow-hidden px-3">
          
            {steps.map((step) =>
          <li key={step.label} className="flex items-start gap-2 py-1.5 text-xs first:pt-0 last:pb-3">
                <CheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent-fg" aria-hidden="true" />
                <span className="font-medium text-foreground">{step.label}</span>
                <span className="text-muted-foreground">— {step.detail}</span>
              </li>
          )}
          </motion.ol>
        }
      </AnimatePresence>
    </div>);

}