import React, { useState } from 'react';
import { Package, Store } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { SegmentedTabs } from '../components/ui/SegmentedTabs';
import { MerchantAvatar } from '../components/MerchantAvatar';
import { MerchantStatusChip } from '../components/MerchantStatusChip';
import { PageError } from '../components/PageState';
import { useOnline } from '../hooks/useOnline';
import { useCategories, useMerchantAction, useMerchants, usePolicy } from '../lib/queries';
import { errorMessage } from '../lib/errorCopy';
import type { MerchantDto } from '../lib/schemas';
import { merchantAvatar } from '../utils/merchant';
import { categoryName, ruleActionLabel } from '../utils/labels';
import type { MerchantStatus } from '../types/merchant';

type Filter = 'ALL' | MerchantStatus;
type Action = 'approve' | 'block' | 'reset';

const actionsFor: Record<MerchantStatus, Array<{label: string;action: Action;variant: 'primary' | 'secondary';}>> = {
  APPROVED: [
  { label: 'Block', action: 'block', variant: 'secondary' },
  { label: 'Reset', action: 'reset', variant: 'secondary' }],

  NEW: [
  { label: 'Approve', action: 'approve', variant: 'primary' },
  { label: 'Block', action: 'block', variant: 'secondary' }],

  BLOCKED: [
  { label: 'Approve', action: 'approve', variant: 'primary' },
  { label: 'Reset', action: 'reset', variant: 'secondary' }]

};

const verbs: Record<Action, string> = { approve: 'approved', block: 'blocked', reset: 'reset to new' };

const newMerchantCopy = { Block: 'blocked until you approve them', 'Ask me': 'sent to you for approval', Allow: 'allowed' } as const;

export function Merchants() {
  const merchants = useMerchants();
  const policy = usePolicy();
  const categories = useCategories();
  const action = useMerchantAction();
  const online = useOnline();
  const [filter, setFilter] = useState<Filter>('ALL');

  const list = merchants.data ?? [];
  const count = (status: MerchantStatus) => list.filter((m) => m.status === status).length;
  const visible = filter === 'ALL' ? list : list.filter((m) => m.status === filter);
  const newAction = policy.data ? ruleActionLabel(policy.data.merchantRules.newMerchantAction) : null;

  const change = (merchant: MerchantDto, next: Action) => {
    const expectedVersionNumber = policy.data?.versionNumber;
    if (expectedVersionNumber === undefined || expectedVersionNumber === null) return;
    action.mutate(
      { id: merchant.id, action: next, expectedVersionNumber },
      {
        onSuccess: (result) => toast.success(`${merchant.name} ${verbs[next]} · Rules version ${result.policyVersionNumber}`),
        onError: (err) => toast.error(errorMessage(err))
      }
    );
  };

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 lg:px-8 lg:py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          {newAction &&
          <>
              New merchants are <span className="font-medium text-foreground">{newMerchantCopy[newAction]}</span>.
            </>
          }
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

      {merchants.isError ?
      <PageError error={merchants.error} onRetry={() => void merchants.refetch()} /> :
      visible.length === 0 ?
      <Card className="flex flex-col items-center px-6 py-14 text-center">
          <Store className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
          <p className="mt-3 font-medium">{merchants.isLoading ? 'Loading merchants…' : 'No merchants here'}</p>
          {!merchants.isLoading && <p className="mt-1 text-sm text-muted-foreground">Try another filter.</p>}
        </Card> :

      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {visible.map((m) => {
          const avatar = merchantAvatar(m.name);
          const busy = action.isPending && action.variables?.id === m.id;
          return (
            <li key={m.id}>
                <Card className="flex h-full flex-col p-5">
                  <div className="flex items-start gap-3">
                    <MerchantAvatar initials={avatar.initials} hue={avatar.hue} size="lg" />
                    <div className="min-w-0 flex-1">
                      <h2 className="truncate text-base font-semibold">{m.name}</h2>
                      <p className="truncate text-sm text-muted-foreground">{m.categoryCodes.map((c) => categoryName(c, categories.data)).join(', ')}</p>
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
                    <Button
                      key={a.label}
                      variant={a.variant}
                      size="sm"
                      className="flex-1"
                      disabled={busy || !online || !policy.data}
                      onClick={() => change(m, a.action)}
                      aria-label={`${a.label} ${m.name}`}>

                          {a.label}
                        </Button>
                    )}
                    </div>
                  </div>
                </Card>
              </li>);

        })}
        </ul>
      }
    </div>);

}
