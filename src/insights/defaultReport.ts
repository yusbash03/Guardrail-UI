import type { AgReportState } from 'ag-studio';

// The shipped "Guardrails Insights" report (AG_GRID_USAGE.md §2.3): three pages, built from the datasets in
// datasets.ts. Users can edit it in Studio; their copy is saved per user and "Reset to default" reloads this one.
// Layout: 24 columns, 20 px rows.

type Ref = { id: string; aggregation?: 'sum' | 'avg' | 'min' | 'max' | 'count' | 'countd' };
type Layout = { xTrack: number; yTrack: number; xSpan: number; ySpan: number };

const title = (text: string, subtitle?: string) => ({
  title: { enabled: true, text },
  ...(subtitle ? { subtitle: { enabled: true, text: subtitle } } : {})
});

const value = (field: Ref, heading: string, subtitle?: string) => ({ type: 'value', dataMapping: { value: [field] }, format: title(heading, subtitle) });
const chart = (type: string, category: Ref, val: Ref, heading: string, legend?: Ref, subtitle?: string) => ({
  type,
  dataMapping: { categoryKey: [category], valueKey: [val], ...(legend ? { legendKey: [legend] } : {}) },
  format: title(heading, subtitle)
});
const grid = (cols: Ref[], heading: string) => ({ type: 'grid', dataMapping: { cols }, format: title(heading) });
const custom = (type: string, dataMapping: Record<string, Ref[]>, heading?: string) => ({
  type,
  dataMapping,
  ...(heading ? { format: title(heading) } : {})
});

function page(id: string, widgets: Array<[string, object, Layout]>) {
  return {
    id,
    layout: { columns: 24, rowHeight: 20 },
    widgets: Object.fromEntries(widgets.map(([key, widget]) => [key, widget])),
    widgetLayout: Object.fromEntries(widgets.map(([key, , layout]) => [key, layout]))
  };
}

const at = (xTrack: number, yTrack: number, xSpan: number, ySpan: number): Layout => ({ xTrack, yTrack, xSpan, ySpan });

const moneyProtected = custom('guardrail-money-protected', {
  decision: [{ id: 'evaluations.decision' }],
  amount: [{ id: 'evaluations.amount', aggregation: 'sum' }],
  attempts: [{ id: 'evaluations.amount', aggregation: 'count' }]
});

export const defaultReport = {
  selectedPageId: 'Where my money goes',
  pages: [
  page('Where my money goes', [
  ['spent', value({ id: 'purchases.amount', aggregation: 'sum' }, 'Purchased', 'Last 90 days'), at(0, 0, 6, 8)],
  ['count', value({ id: 'purchases.purchaseId', aggregation: 'count' }, 'Purchases', 'Last 90 days'), at(6, 0, 6, 8)],
  ['approve', value({ id: 'purchases.approvalMinutes', aggregation: 'avg' }, 'Minutes to approve', 'Average'), at(12, 0, 6, 8)],
  ['protected', moneyProtected, at(18, 0, 6, 8)],
  [
  'burn',
  custom(
    'guardrail-budget-burn',
    {
      category: [{ id: 'budgets.categoryCode' }],
      period: [{ id: 'budgets.period' }],
      periodStart: [{ id: 'budgets.periodStart' }],
      limit: [{ id: 'budgets.limit', aggregation: 'sum' }],
      spent: [{ id: 'budgets.spent', aggregation: 'sum' }],
      pending: [{ id: 'budgets.pending', aggregation: 'sum' }]
    },
    'Budget burn-down'
  ),
  at(0, 8, 12, 12)],

  [
  'byCategory',
  chart('column-chart-stacked', { id: 'lineItems.weekStart' }, { id: 'lineItems.lineTotal', aggregation: 'sum' }, 'Spend by category per week', {
    id: 'lineItems.categoryCode'
  }),
  at(12, 8, 12, 12)],

  ['byMerchant', chart('bar-chart-grouped', { id: 'purchases.merchant' }, { id: 'purchases.amount', aggregation: 'sum' }, 'Spend by merchant'), at(0, 20, 12, 12)],
  [
  'recent',
  grid(
    [
    { id: 'purchases.createdAt' },
    { id: 'purchases.merchant' },
    { id: 'purchases.amount' },
    { id: 'purchases.status' },
    { id: 'purchases.decision' },
    { id: 'purchases.requestedBy' }],

    'Purchases'
  ),
  at(12, 20, 12, 12)]]

  ),
  page('Guardrails at work', [
  ['protected', moneyProtected, at(0, 0, 8, 8)],
  ['funnel', custom('guardrail-decision-funnel', { decision: [{ id: 'evaluations.decision' }], count: [{ id: 'evaluations.amount', aggregation: 'count' }] }, 'Decision funnel'), at(8, 0, 16, 14)],
  ['approve', value({ id: 'purchases.approvalMinutes', aggregation: 'avg' }, 'Minutes to approve', 'Average, approved purchases'), at(0, 8, 8, 6)],
  [
  'reasons',
  chart('bar-chart-grouped', { id: 'evaluations.primaryReasonCode' }, { id: 'evaluations.amount', aggregation: 'count' }, 'Why carts were stopped or flagged', undefined, 'Main reason per rules check'),
  at(0, 14, 12, 12)],

  [
  'whoAsked',
  chart('column-chart-stacked', { id: 'purchases.weekStart' }, { id: 'purchases.purchaseId', aggregation: 'count' }, 'AI-requested vs your purchases', {
    id: 'purchases.requestedBy'
  }),
  at(12, 14, 12, 12)]]

  ),
  page('Price watch', [
  [
  'prices',
  chart('line-chart', { id: 'lineItems.createdAt' }, { id: 'lineItems.unitPrice', aggregation: 'avg' }, 'Unit price over time', { id: 'lineItems.product' }),
  at(0, 0, 24, 14)],

  [
  'cheapest',
  grid([{ id: 'lineItems.product' }, { id: 'lineItems.merchant' }, { id: 'lineItems.unitPrice', aggregation: 'min' }], 'Lowest price paid per item and merchant'),
  at(0, 14, 24, 14)]]

  )]

} as unknown as AgReportState;
