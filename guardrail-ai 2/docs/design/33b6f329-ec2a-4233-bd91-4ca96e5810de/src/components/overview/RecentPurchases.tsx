import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../ui/Card';
import { MerchantAvatar } from '../MerchantAvatar';
import { MoneyText } from '../MoneyText';
import { StatusChip } from '../StatusChip';
import { recentPurchases } from '../../data/overview';

export function RecentPurchases() {
  return (
    <Card className="p-5 lg:p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Recent purchases</h2>
        <Link to="/transactions" className="text-sm font-medium text-primary-ink hover:underline">
          View all
        </Link>
      </div>
      <ul className="mt-3 divide-y divide-border">
        {recentPurchases.map((p) =>
        <li key={p.id} className="flex items-center gap-3 py-3">
            <MerchantAvatar initials={p.initials} hue={p.hue} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{p.merchant}</p>
              <p className="text-xs text-muted-foreground">{p.when}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <MoneyText amount={p.amount} className="text-sm" />
              <StatusChip label={p.status} />
            </div>
          </li>
        )}
      </ul>
    </Card>);

}