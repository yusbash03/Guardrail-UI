import React from 'react';
import { KpiStrip } from '../components/overview/KpiStrip';
import { BudgetsPanel } from '../components/overview/BudgetsPanel';
import { RecentPurchases } from '../components/overview/RecentPurchases';
import { InsightsCard } from '../components/overview/InsightsCard';
import { EmptyOverview } from '../components/overview/EmptyOverview';
import { PageError, PageLoading } from '../components/PageState';
import { useCategories, useDashboard, usePolicy } from '../lib/queries';
import { isApiError } from '../lib/api';

export function Overview() {
  const dashboard = useDashboard();
  const policy = usePolicy();
  const categories = useCategories();

  if (dashboard.isLoading) return <PageLoading label="Loading overview" />;
  if (isApiError(dashboard.error, 'NO_ACTIVE_POLICY')) return <EmptyOverview />;
  if (dashboard.isError || !dashboard.data) {
    return (
      <div className="mx-auto max-w-[1280px] px-4 py-6 lg:px-8 lg:py-8">
        <PageError error={dashboard.error} onRetry={() => void dashboard.refetch()} />
      </div>);

  }

  const overview = dashboard.data;
  const hasBudgets = !!overview.weekly.limit || !!overview.monthly.limit || overview.categories.some((c) => c.limit);
  if (!hasBudgets && overview.recentPurchases.length === 0) return <EmptyOverview />;

  return (
    <div className="mx-auto max-w-[1280px] space-y-6 px-4 py-6 lg:px-8 lg:py-8">
      <KpiStrip overview={overview} policy={policy.data} />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <BudgetsPanel overview={overview} categories={categories.data} />
        </div>
        <div className="space-y-6">
          <InsightsCard insights={overview.insights} />
          <RecentPurchases purchases={overview.recentPurchases} />
        </div>
      </div>
    </div>);

}
