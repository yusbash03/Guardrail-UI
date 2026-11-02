import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export function UserMessage({ children }: {children: ReactNode;}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
      className="flex justify-end">
      
      <p className="max-w-[85%] rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-[15px] leading-relaxed text-primary-foreground">{children}</p>
    </motion.div>);

}

export function AssistantMessage({ children }: {children: ReactNode;}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
      className="flex gap-3">
      
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary-ink" aria-hidden="true">
        <Sparkles className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1 space-y-3 pt-1">
        <span className="sr-only">Assistant:</span>
        {children}
      </div>
    </motion.div>);

}

export function TypingIndicator() {
  return (
    <AssistantMessage>
      <span className="inline-flex gap-1 py-2" aria-label="Assistant is typing">
        {[0, 1, 2].map((i) =>
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-muted-foreground"
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear', delay: i * 0.15 }} />

        )}
      </span>
    </AssistantMessage>);

}