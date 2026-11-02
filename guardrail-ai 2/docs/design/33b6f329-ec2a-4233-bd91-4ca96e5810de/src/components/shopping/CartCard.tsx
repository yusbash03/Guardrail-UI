import React, { useState } from 'react';
import { ShoppingBasket } from 'lucide-react';
import { Card } from '../ui/Card';
import { MerchantAvatar } from '../MerchantAvatar';
import { MerchantStatusChip } from '../MerchantStatusChip';
import { MoneyText } from '../MoneyText';
import { freshmartCart, freshmartCartTotal } from '../../data/cart';

const PREVIEW_COUNT = 5;

export function CartCard() {
  const [expanded, setExpanded] = useState(false);
  const lines = expanded ? freshmartCart : freshmartCart.slice(0, PREVIEW_COUNT);
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <MerchantAvatar initials="FM" hue={152} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 text-sm font-semibold">
            FreshMart <MerchantStatusChip status="APPROVED" />
          </p>
          <p className="text-xs text-muted-foreground">Cart · {freshmartCart.length} items</p>
        </div>
        <ShoppingBasket className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      </div>
      <ul className="px-4 py-2">
        {lines.map((line) =>
        <li key={line.id} className="flex items-baseline justify-between gap-3 py-1.5 text-sm">
            <span className="min-w-0 truncate">
              {line.name} <span className="text-muted-foreground">{line.size}</span>
            </span>
            <span className="tabular text-foreground">${line.price.toFixed(2)}</span>
          </li>
        )}
      </ul>
      {freshmartCart.length > PREVIEW_COUNT &&
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        aria-expanded={expanded}
        className="mx-4 mb-2 text-sm font-medium text-primary-ink hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
        
          {expanded ? 'Show fewer' : `Show all ${freshmartCart.length} items`}
        </button>
      }
      <div className="flex items-baseline justify-between border-t border-border bg-muted/40 px-4 py-3">
        <span className="text-sm font-medium">Total</span>
        <MoneyText amount={freshmartCartTotal} className="text-lg" />
      </div>
    </Card>);

}