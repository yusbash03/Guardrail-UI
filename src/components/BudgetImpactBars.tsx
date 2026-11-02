import React from 'react';
import { BudgetBar } from './BudgetBar';
import type { BudgetImpact } from '../lib/schemas';
import { categoryName, periodLabel } from '../utils/labels';
import { formatApiMoney, toAmount } from '../utils/money';

/** Before → after bars for each budget a cart touches. All figures come from the engine's budgetImpacts. */
export function BudgetImpactBars({ impacts, showLegend, afterSuffix }: { impacts: BudgetImpact[]; showLegend?: boolean; afterSuffix?: string }) {
  if (impacts.length === 0) return null;
  return (
    <div className="space-y-4">
      {impacts.map((impact) =>
      <BudgetBar
        key={`${impact.scope}-${impact.categoryCode ?? 'all'}-${impact.period}`}
        label={impact.scope === 'OVERALL' ? 'Overall' : categoryName(impact.categoryCode)}
        period={periodLabel(impact.period)}
        spent={toAmount(impact.committedBefore)}
        pending={toAmount(impact.purchaseAmount)}
        limit={toAmount(impact.limit)}
        pendingLabel="This cart"
        showLegend={showLegend}
        rightLabel={
        <>
              {formatApiMoney(impact.remainingBefore)} → <span className="font-semibold text-foreground">{formatApiMoney(impact.remainingAfter)}</span>
              {afterSuffix}
            </>
        } />
      )}
    </div>);

}
