import React from 'react';
import { KpiStrip } from '../components/overview/KpiStrip';
import { BudgetsPanel } from '../components/overview/BudgetsPanel';
import { RecentPurchases } from '../components/overview/RecentPurchases';
import { InsightsCard } from '../components/overview/InsightsCard';
import { EmptyOverview } from '../components/overview/EmptyOverview';

export function Overview({ empty }: {empty: boolean;}) {
  if (empty) return <EmptyOverview />;
  return (
    <div className="mx-auto max-w-[1280px] space-y-6 px-4 py-6 lg:px-8 lg:py-8">
      <KpiStrip />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <BudgetsPanel />
        </div>
        <div className="space-y-6">
          <InsightsCard />
          <RecentPurchases />
        </div>
      </div>
    </div>);

}