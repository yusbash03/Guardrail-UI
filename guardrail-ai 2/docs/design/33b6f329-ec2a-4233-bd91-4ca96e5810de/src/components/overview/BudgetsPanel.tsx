import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '../ui/Card';
import { BudgetRing } from '../BudgetRing';
import { BudgetBar } from '../BudgetBar';
import { budgetRings, categoryBudgets } from '../../data/overview';

export function BudgetsPanel() {
  return (
    <Card className="p-5 lg:p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">Budgets</h2>
        <Link to="/rules" className="text-sm font-medium text-primary-ink hover:underline">
          Edit rules
        </Link>
      </div>
      <div className="mt-4 grid gap-6 sm:grid-cols-2">
        {budgetRings.map((ring) =>
        <BudgetRing key={ring.id} label={ring.label} spent={ring.spent} limit={ring.limit} />
        )}
      </div>
      <div className="mt-6 border-t border-border pt-5">
        <h3 className="mb-4 text-sm font-semibold text-muted-foreground">By category</h3>
        <div className="space-y-5">
          {categoryBudgets.map((budget) =>
          <BudgetBar key={budget.id} label={budget.label} period={budget.period} spent={budget.spent} limit={budget.limit} />
          )}
        </div>
      </div>
    </Card>);

}