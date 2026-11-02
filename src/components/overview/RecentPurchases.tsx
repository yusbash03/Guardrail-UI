import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../ui/Card';
import { MerchantAvatar } from '../MerchantAvatar';
import { MoneyText } from '../MoneyText';
import { StatusChip } from '../StatusChip';
import type { PurchaseDto } from '../../lib/schemas';
import { merchantAvatar } from '../../utils/merchant';
import { purchaseStatusLabel } from '../../utils/labels';
import { formatWhen } from '../../utils/time';
import { toAmount } from '../../utils/money';

export function RecentPurchases({ purchases }: {purchases: PurchaseDto[];}) {
  return (
    <Card className="p-5 lg:p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Recent purchases</h2>
        <Link to="/transactions" className="text-sm font-medium text-primary-ink hover:underline">
          View all
        </Link>
      </div>
      {purchases.length === 0 ?
      <p className="mt-3 text-sm text-muted-foreground">No purchases yet.</p> :

      <ul className="mt-3 divide-y divide-border">
          {purchases.map((p) => {
          const avatar = merchantAvatar(p.merchantName);
          return (
            <li key={p.id} className="flex items-center gap-3 py-3">
                <MerchantAvatar initials={avatar.initials} hue={avatar.hue} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{p.merchantName}</p>
                  <p className="text-xs text-muted-foreground">{formatWhen(p.completedAt ?? p.createdAt)}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <MoneyText amount={toAmount(p.amount)} className="text-sm" />
                  <StatusChip label={purchaseStatusLabel(p.status)} />
                </div>
              </li>);

        })}
        </ul>
      }
    </Card>);

}
