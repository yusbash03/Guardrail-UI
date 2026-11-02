import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../ui/Card';
import { BudgetRing } from '../BudgetRing';
import { BudgetBar } from '../BudgetBar';
import type { Category, DashboardOverview } from '../../lib/schemas';
import { categoryName, periodLabel } from '../../utils/labels';
import { formatApiMoney, toAmount } from '../../utils/money';

export function BudgetsPanel({ overview, categories }: {overview: DashboardOverview;categories?: Category[];}) {
  const rings = [
  { id: 'weekly', label: 'Weekly', period: overview.weekly },
  { id: 'monthly', label: 'Monthly', period: overview.monthly }].
  filter((ring) => ring.period.limit);
  const budgets = overview.categories.filter((c) => c.limit);
  return (
    <Card className="p-5 lg:p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Budgets</h2>
        <Link to="/rules" className="text-sm font-medium text-primary-ink hover:underline">
          Edit rules
        </Link>
      </div>
      {rings.length > 0 &&
      <div className="mt-4 grid gap-6 sm:grid-cols-2">
          {rings.map((ring) =>
        <BudgetRing
          key={ring.id}
          label={ring.label}
          spent={toAmount(ring.period.spent)}
          limit={toAmount(ring.period.limit)}
          remaining={toAmount(ring.period.remaining)} />
        )}
        </div>
      }
      {budgets.length > 0 &&
      <div className="mt-6 border-t border-border pt-5">
          <h3 className="mb-4 text-sm font-semibold text-muted-foreground">By category</h3>
          <div className="space-y-5">
            {budgets.map((budget) =>
          <BudgetBar
            key={`${budget.categoryCode}-${budget.period}`}
            label={categoryName(budget.categoryCode, categories)}
            period={periodLabel(budget.period)}
            spent={toAmount(budget.spent)}
            pending={toAmount(budget.pending)}
            limit={toAmount(budget.limit)}
            rightLabel={`${formatApiMoney(budget.remaining)} left of ${formatApiMoney(budget.limit)}`} />
          )}
          </div>
        </div>
      }
    </Card>);

}
