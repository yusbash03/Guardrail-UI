import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDownIcon } from 'lucide-react';
import { BudgetBar } from '../BudgetBar';
import { initialRules } from '../../data/rules';
import { formatMoney } from '../../utils/money';
import { cn } from '../../utils/cn';

export function BudgetRail() {
  return (
    <aside aria-label="This week's budget" className="hidden w-80 shrink-0 overflow-y-auto border-l border-border bg-card p-5 lg:block">
      <h2 className="text-sm font-semibold">This week's budget</h2>
      <div className="mt-4 space-y-5">
        <BudgetBar label="Groceries" period="Weekly" spent={0} limit={80} showLegend />
        <BudgetBar label="Overall" period="Weekly" spent={0} limit={200} />
      </div>
      <div className="mt-6 border-t border-border pt-5">
        <h3 className="text-sm font-semibold">Rules your assistant follows</h3>
        <dl className="mt-3 space-y-3 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Needs approval above</dt>
            <dd className="tabular font-medium">{formatMoney(initialRules.approvalThreshold)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Max transaction</dt>
            <dd className="tabular font-medium">{formatMoney(initialRules.maxTransaction)}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">Approved merchants</dt>
            <dd className="text-right font-medium">{initialRules.approvedMerchants.join(', ')}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-muted-foreground">New merchants</dt>
            <dd className="font-medium">{initialRules.newMerchants}</dd>
          </div>
        </dl>
        <Link to="/rules" className="mt-4 inline-block text-sm font-medium text-primary-ink hover:underline">
          Edit rules
        </Link>
      </div>
    </aside>);

}

export function MobileBudgetStrip() {
  const [open, setOpen] = useState(false);
  return (
    <div className="shrink-0 border-b border-border bg-card px-4 lg:hidden">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex h-11 w-full items-center justify-between text-sm">
        
        <span>
          <span className="font-medium">Groceries</span> <span className="tabular text-muted-foreground">· $80.00 left of $80.00</span>
        </span>
        <ChevronDownIcon className={cn('h-4 w-4 text-muted-foreground transition-transform duration-150', open && 'rotate-180')} aria-hidden="true" />
      </button>
      {open &&
      <div className="space-y-4 pb-4">
          <BudgetBar label="Groceries" period="Weekly" spent={0} limit={80} />
          <BudgetBar label="Overall" period="Weekly" spent={0} limit={200} />
        </div>
      }
    </div>);

}