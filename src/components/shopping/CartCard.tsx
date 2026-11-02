import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBasket } from 'lucide-react';
import { Card } from '../ui/Card';
import { MerchantAvatar } from '../MerchantAvatar';
import { MerchantStatusChip } from '../MerchantStatusChip';
import { MoneyText } from '../MoneyText';
import type { Cart } from '../../lib/schemas';
import type { MerchantStatus } from '../../types/merchant';
import { merchantAvatar } from '../../utils/merchant';
import { formatApiMoney, toAmount } from '../../utils/money';

const PREVIEW_COUNT = 5;

export function CartCard({ cart, merchantStatus }: {cart: Cart;merchantStatus?: MerchantStatus;}) {
  const [expanded, setExpanded] = useState(false);
  const lines = expanded ? cart.items : cart.items.slice(0, PREVIEW_COUNT);
  const avatar = merchantAvatar(cart.merchantName);
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <MerchantAvatar initials={avatar.initials} hue={avatar.hue} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-2 text-sm font-semibold">
            {cart.merchantName} {merchantStatus && <MerchantStatusChip status={merchantStatus} />}
          </p>
          <p className="text-xs text-muted-foreground">Cart · {cart.items.length} items</p>
        </div>
        {cart.status === 'OPEN' ?
        <Link to={`/cart/${cart.id}`} className="text-sm font-medium text-primary-ink hover:underline">
            Edit cart
          </Link> :

        <ShoppingBasket className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
        }
      </div>
      <ul className="px-4 py-2">
        {lines.map((line) =>
        <li key={line.productId} className="flex items-baseline justify-between gap-3 py-1.5 text-sm">
            <span className="min-w-0 truncate">
              {line.name} {line.quantity > 1 && <span className="text-muted-foreground">× {line.quantity}</span>}
            </span>
            <span className="tabular text-foreground">{formatApiMoney(line.lineTotal)}</span>
          </li>
        )}
      </ul>
      {cart.items.length > PREVIEW_COUNT &&
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        aria-expanded={expanded}
        className="mx-4 mb-2 text-sm font-medium text-primary-ink hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded">
        
          {expanded ? 'Show fewer' : `Show all ${cart.items.length} items`}
        </button>
      }
      <div className="flex items-baseline justify-between border-t border-border bg-muted/40 px-4 py-3">
        <span className="text-sm font-medium">Total</span>
        <MoneyText amount={toAmount(cart.total)} className="text-lg" />
      </div>
    </Card>);

}
