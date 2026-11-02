import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDownIcon } from 'lucide-react';
import { BudgetBar } from '../BudgetBar';
import { useCategories, useLedgerSummary, useMerchants, usePolicy } from '../../lib/queries';
import type { LedgerSummary } from '../../lib/schemas';
import { categoryName, ruleActionLabel } from '../../utils/labels';
import { formatApiMoney, toAmount } from '../../utils/money';
import { cn } from '../../utils/cn';

/** Live budget bars for the current week (GET /ledger/summary?period=WEEKLY). */
function WeeklyBars({ summary, showLegend }: {summary: LedgerSummary;showLegend?: boolean;}) {
  const categories = useCategories();
  const budgeted = summary.categories.filter((c) => c.limit);
  return (
    <>
      {budgeted.map((c, i) =>
      <BudgetBar
        key={c.categoryCode}
        label={categoryName(c.categoryCode, categories.data)}
        period="Weekly"
        spent={toAmount(c.spent)}
        pending={toAmount(c.pending)}
        limit={toAmount(c.limit)}
        showLegend={showLegend && i === 0}
        rightLabel={`${formatApiMoney(c.remaining)} left of ${formatApiMoney(c.limit)}`} />
      )}
      {summary.overall.limit &&
      <BudgetBar
        label="Overall"
        period="Weekly"
        spent={toAmount(summary.overall.spent)}
        pending={toAmount(summary.overall.pending)}
        limit={toAmount(summary.overall.limit)}
        rightLabel={`${formatApiMoney(summary.overall.remaining)} left of ${formatApiMoney(summary.overall.limit)}`} />
      }
    </>);

}

export function BudgetRail() {
  const summary = useLedgerSummary('WEEKLY');
  const policy = usePolicy();
  const merchants = useMerchants();
  const approvedNames = (merchants.data ?? []).filter((m) => m.status === 'APPROVED').map((m) => m.name);
  return (
    <aside aria-label="This week's budget" className="hidden w-80 shrink-0 overflow-y-auto border-l border-border bg-card p-5 lg:block">
      <h2 className="text-sm font-semibold">This week's budget</h2>
      <div className="mt-4 space-y-5">
        {summary.data ? <WeeklyBars summary={summary.data} showLegend /> : <p className="text-sm text-muted-foreground">{summary.isError ? 'Budget unavailable.' : 'Loading…'}</p>}
      </div>
      {policy.data &&
      <div className="mt-6 border-t border-border pt-5">
          <h3 className="text-sm font-semibold">Rules your assistant follows</h3>
          <dl className="mt-3 space-y-3 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Needs approval above</dt>
              <dd className="tabular font-medium">{formatApiMoney(policy.data.approvalThreshold?.amount)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Max transaction</dt>
              <dd className="tabular font-medium">{formatApiMoney(policy.data.maxTransactionAmount?.amount)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">Approved merchants</dt>
              <dd className="text-right font-medium">{approvedNames.length ? approvedNames.join(', ') : 'None yet'}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-muted-foreground">New merchants</dt>
              <dd className="font-medium">{ruleActionLabel(policy.data.merchantRules.newMerchantAction)}</dd>
            </div>
          </dl>
          <Link to="/rules" className="mt-4 inline-block text-sm font-medium text-primary-ink hover:underline">
            Edit rules
          </Link>
        </div>
      }
    </aside>);

}

export function MobileBudgetStrip() {
  const [open, setOpen] = useState(false);
  const summary = useLedgerSummary('WEEKLY');
  const categories = useCategories();
  const headline = summary.data?.categories.find((c) => c.limit);
  const overall = summary.data?.overall;
  return (
    <div className="shrink-0 border-b border-border bg-card px-4 lg:hidden">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex h-11 w-full items-center justify-between text-sm">
        
        <span>
          {headline ?
          <>
              <span className="font-medium">{categoryName(headline.categoryCode, categories.data)}</span>{' '}
              <span className="tabular text-muted-foreground">· {formatApiMoney(headline.remaining)} left of {formatApiMoney(headline.limit)}</span>
            </> :
          overall?.limit ?
          <>
              <span className="font-medium">This week</span>{' '}
              <span className="tabular text-muted-foreground">· {formatApiMoney(overall.remaining)} left of {formatApiMoney(overall.limit)}</span>
            </> :

          <span className="font-medium">This week's budget</span>
          }
        </span>
        <ChevronDownIcon className={cn('h-4 w-4 text-muted-foreground transition-transform duration-150', open && 'rotate-180')} aria-hidden="true" />
      </button>
      {open && summary.data &&
      <div className="space-y-4 pb-4">
          <WeeklyBars summary={summary.data} />
        </div>
      }
    </div>);

}
