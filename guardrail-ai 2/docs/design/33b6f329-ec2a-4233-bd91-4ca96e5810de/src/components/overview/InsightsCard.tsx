import React from 'react';
import { Gauge, Sparkles, Tag } from 'lucide-react';
import { Card } from '../ui/Card';
import { insights } from '../../data/overview';

const icons = { budget: Gauge, price: Tag };

export function InsightsCard() {
  return (
    <Card className="p-5 lg:p-6">
      <h2 className="flex items-center gap-2 text-base font-semibold">
        <Sparkles className="h-4 w-4 text-primary-ink" aria-hidden="true" />
        AI insights
      </h2>
      <ul className="mt-4 space-y-4">
        {insights.map((insight) => {
          const Icon = icons[insight.kind];
          return (
            <li key={insight.id} className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary-ink">
                <Icon className="h-4 w-4" aria-hidden="true" />
              </span>
              <p className="pt-1 text-sm leading-relaxed text-foreground">{insight.text}</p>
            </li>);

        })}
      </ul>
    </Card>);

}