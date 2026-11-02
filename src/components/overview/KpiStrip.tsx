import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import type { DashboardOverview, PolicyDocument } from '../../lib/schemas';
import { countActiveRules } from '../../lib/policy';
import { formatApiMoney } from '../../utils/money';
import { cn } from '../../utils/cn';

const linkCell =
'group flex flex-col justify-between bg-card p-5 transition-colors duration-150 hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary';

export function KpiStrip({ overview, policy }: {overview: DashboardOverview;policy?: PolicyDocument;}) {
  const pendingCount = overview.pendingApprovals;
  const { weekly, monthly } = overview;
  return (
    <section aria-label="Key figures" className="grid grid-cols-2 gap-px overflow-hidden rounded-card border border-border bg-border shadow-soft lg:grid-cols-[1.5fr_1fr_1fr_1fr]">
      <div className="col-span-2 bg-card p-5 lg:col-span-1 lg:p-6">
        <p className="text-sm font-medium text-muted-foreground">Left this week</p>
        <p className="tabular mt-1 text-[40px] font-semibold leading-none tracking-tight text-accent-fg">{formatApiMoney(weekly.remaining)}</p>
        <p className="mt-2 text-sm text-muted-foreground">
          {weekly.limit ?
          <>You have {formatApiMoney(weekly.remaining)} left of your {formatApiMoney(weekly.limit)} weekly limit.</> :
          'No weekly limit set.'}
        </p>
      </div>
      <div className="bg-card p-5">
        <p className="text-sm font-medium text-muted-foreground">Spent this month</p>
        <p className="tabular mt-2 text-2xl font-semibold tracking-tight">{formatApiMoney(monthly.spent)}</p>
        <p className="tabular mt-1 text-xs text-muted-foreground">{monthly.limit ? `of ${formatApiMoney(monthly.limit)}` : 'No monthly limit'}</p>
      </div>
      <Link to="/approvals" className={linkCell}>
        <p className="text-sm font-medium text-muted-foreground">Pending approvals</p>
        <p className={cn('tabular mt-2 text-2xl font-semibold tracking-tight', pendingCount > 0 && 'text-approval-fg')}>{pendingCount}</p>
        <p className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary-ink">
          {pendingCount > 0 ? 'Review now' : 'All caught up'}
          <ArrowRight className="h-3 w-3 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden="true" />
        </p>
      </Link>
      <Link to="/rules" className={cn(linkCell, 'col-span-2 sm:col-span-1')}>
        <p className="text-sm font-medium text-muted-foreground">Active rules</p>
        <p className="tabular mt-2 text-2xl font-semibold tracking-tight">{policy ? countActiveRules(policy) : '—'}</p>
        <p className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-primary-ink">
          Version {policy?.versionNumber ?? '—'}
          <ArrowRight className="h-3 w-3 transition-transform duration-150 group-hover:translate-x-0.5" aria-hidden="true" />
        </p>
      </Link>
    </section>);

}
