import React from 'react';
import { Gauge, Sparkles, Tag } from 'lucide-react';
import { Card } from '../ui/Card';
import type { DashboardOverview } from '../../lib/schemas';

// Insights are rule-generated server-side; the kind picks the icon.
const iconFor = (kind: string) => (kind.startsWith('BUDGET') ? Gauge : Tag);

export function InsightsCard({ insights }: {insights: DashboardOverview['insights'];}) {
  return (
    <Card className="p-5 lg:p-6">
      <h2 className="flex items-center gap-2 text-base font-semibold">
        <Sparkles className="h-4 w-4 text-primary-ink" aria-hidden="true" />
        AI insights
      </h2>
      {insights.length === 0 ?
      <p className="mt-4 text-sm text-muted-foreground">Insights appear once you start shopping.</p> :

      <ul className="mt-4 space-y-4">
          {insights.map((insight, i) => {
          const Icon = iconFor(insight.kind);
          return (
            <li key={`${insight.kind}-${i}`} className="flex gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary-ink">
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <p className="pt-1 text-sm leading-relaxed text-foreground">{insight.text}</p>
              </li>);

        })}
        </ul>
      }
    </Card>);

}
