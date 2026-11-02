import React, { useState } from 'react';
import { ArrowUp } from 'lucide-react';
import { Button } from '../ui/Button';

export const suggestions = ['Weekly groceries under budget', "What's left this week?", 'Compare milk prices'];

export function Composer({ onSend, disabled }: {onSend: (text: string) => void;disabled?: boolean;}) {
  const [value, setValue] = useState('');

  const send = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
  };

  return (
    <div className="shrink-0 border-t border-border bg-card px-4 py-3 lg:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="-mx-1 mb-2 flex gap-2 overflow-x-auto px-1 pb-1">
          {suggestions.map((s) =>
          <button
            key={s}
            type="button"
            disabled={disabled}
            onClick={() => send(s)}
            className="h-8 shrink-0 whitespace-nowrap rounded-full border border-border bg-card px-3 text-sm text-muted-foreground transition-colors duration-150 hover:border-primary/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50">
            
              {s}
            </button>
          )}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(value);
          }}
          className="flex items-end gap-2 rounded-card border border-border bg-background p-1.5 focus-within:ring-2 focus-within:ring-primary/40">
          
          <label htmlFor="composer" className="sr-only">
            Message your AI assistant
          </label>
          <textarea
            id="composer"
            rows={1}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                send(value);
              }
            }}
            placeholder="Ask for a cart, a budget check, or a price comparison…"
            className="max-h-32 min-h-[40px] flex-1 resize-none bg-transparent px-2.5 py-2.5 text-sm outline-none placeholder:text-muted-foreground" />
          
          <Button type="submit" size="icon" aria-label="Send message" disabled={!value.trim() || disabled}>
            <ArrowUp className="h-4 w-4" aria-hidden="true" />
          </Button>
        </form>
        <p className="mt-2 text-center text-[11px] text-muted-foreground">Every cart is checked against your rules before you see it.</p>
      </div>
    </div>);

}