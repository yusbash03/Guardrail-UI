import React, { useState } from 'react';
import { Package, Store } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { SegmentedTabs } from '../components/ui/SegmentedTabs';
import { MerchantAvatar } from '../components/MerchantAvatar';
import { MerchantStatusChip } from '../components/MerchantStatusChip';
import { merchants as initialMerchants } from '../data/merchants';
import type { Merchant, MerchantStatus } from '../types/merchant';

type Filter = 'ALL' | MerchantStatus;

const actionsFor: Record<MerchantStatus, Array<{label: string;to: MerchantStatus;variant: 'primary' | 'secondary';}>> = {
  APPROVED: [
  { label: 'Block', to: 'BLOCKED', variant: 'secondary' },
  { label: 'Reset', to: 'NEW', variant: 'secondary' }],

  NEW: [
  { label: 'Approve', to: 'APPROVED', variant: 'primary' },
  { label: 'Block', to: 'BLOCKED', variant: 'secondary' }],

  BLOCKED: [
  { label: 'Approve', to: 'APPROVED', variant: 'primary' },
  { label: 'Reset', to: 'NEW', variant: 'secondary' }]

};

const verbs: Record<MerchantStatus, string> = { APPROVED: 'approved', BLOCKED: 'blocked', NEW: 'reset to new' };

export function Merchants() {
  const [list, setList] = useState<Merchant[]>(initialMerchants);
  const [filter, setFilter] = useState<Filter>('ALL');
  const [version, setVersion] = useState(5);

  const count = (status: MerchantStatus) => list.filter((m) => m.status === status).length;
  const visible = filter === 'ALL' ? list : list.filter((m) => m.status === filter);

  const change = (merchant: Merchant, to: MerchantStatus) => {
    const next = version + 1;
    setList((l) => l.map((m) => m.id === merchant.id ? { ...m, status: to } : m));
    setVersion(next);
    toast.success(`${merchant.name} ${verbs[to]} · Rules version ${next}`);
  };

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 lg:px-8 lg:py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          New merchants are <span className="font-medium text-foreground">blocked</span> until you approve them.
        </p>
        <SegmentedTabs
          ariaLabel="Filter merchants"
          value={filter}
          onChange={setFilter}
          className="max-w-full overflow-x-auto"
          options={[
          { value: 'ALL', label: 'All', count: list.length },
          { value: 'APPROVED', label: 'Approved', count: count('APPROVED') },
          { value: 'BLOCKED', label: 'Blocked', count: count('BLOCKED') },
          { value: 'NEW', label: 'New', count: count('NEW') }]
          } />
        
      </div>

      {visible.length === 0 ?
      <Card className="flex flex-col items-center px-6 py-14 text-center">
          <Store className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
          <p className="mt-3 font-medium">No merchants here</p>
          <p className="mt-1 text-sm text-muted-foreground">Try another filter.</p>
        </Card> :

      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((m) =>
        <li key={m.id}>
              <Card className="flex h-full flex-col p-5">
                <div className="flex items-start gap-3">
                  <MerchantAvatar initials={m.initials} hue={m.hue} size="lg" />
                  <div className="min-w-0 flex-1">
                    <h2 className="truncate text-base font-semibold">{m.name}</h2>
                    <p className="truncate text-sm text-muted-foreground">{m.categories.join(', ')}</p>
                  </div>
                  <MerchantStatusChip status={m.status} />
                </div>
                <p className="mt-4 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Package className="h-4 w-4" aria-hidden="true" />
                  <span className="tabular">{m.productCount}</span> products
                </p>
                <div className="mt-auto pt-5">
                  <div className="flex gap-2 border-t border-border pt-4">
                    {actionsFor[m.status].map((a) =>
                <Button key={a.label} variant={a.variant} size="sm" className="flex-1" onClick={() => change(m, a.to)} aria-label={`${a.label} ${m.name}`}>
                        {a.label}
                      </Button>
                )}
                  </div>
                </div>
              </Card>
            </li>
        )}
        </ul>
      }
    </div>);

}