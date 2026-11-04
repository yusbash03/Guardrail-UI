import React, { useEffect, useMemo, useState } from 'react';
import type { AgWidgetField, AgWidgetParams } from 'ag-studio';
import { createWidgets, type AgWidgetDefinition } from 'ag-studio-react';
import { formatMoney } from '../utils/money';
import { humanize } from '../utils/labels';
import { widgetColors } from './theme';

// Guardrail custom widgets for AG Studio (AG_GRID_USAGE.md §2.4). Each one is configured through Studio's normal field
// mapping, fetches through widgetApi.getData (so page filters and cross-filters apply), reports its display state,
// and draws with the design tokens. Money values come straight from the data; only ratios are computed here.

type Row = Record<string, unknown>;

interface Mapped {
  rows: Row[];
  fields: Record<string, AgWidgetField>;
}

const valueOf = (row: Row, field: AgWidgetField | undefined): unknown => (field ? row[field.key] ?? row[field.fieldId as string] : undefined);
const num = (v: unknown) => (typeof v === 'number' ? v : Number(v ?? 0) || 0);

/** Resolves the widget's mapped fields, queries them once per render of new params, and drives Studio's overlays. */
function useMappedRows(params: AgWidgetParams, required: string[], optional: string[] = []): Mapped | null {
  const { widgetApi, dataMapping, widgetId } = params;
  const [result, setResult] = useState<Mapped | null>(null);

  const fields = useMemo(() => {
    const out: Record<string, AgWidgetField> = {};
    for (const key of [...required, ...optional]) {
      const field = (dataMapping as Record<string, AgWidgetField[] | undefined>)[key]?.[0];
      if (field) out[key] = field;
    }
    return out;
  }, [dataMapping, required, optional]);

  useEffect(() => {
    if (required.some((k) => !fields[k])) {
      widgetApi.setDisplayState('incompleteDataMapping');
      return;
    }
    let cancelled = false;
    widgetApi.setDisplayState('loading', { prominent: false });
    void widgetApi.getData({ kind: 'flat', fields: Object.values(fields) }, { queryId: widgetId }).then((response) => {
      if (cancelled || response.replaced) return;
      const rows = response.results.rows ?? [];
      setResult({ rows, fields });
      widgetApi.setDisplayState(rows.length ? 'displayed' : 'noData');
    });
    return () => {
      cancelled = true;
    };
  }, [params, fields, required, widgetApi, widgetId]);

  return result;
}

/** Numeric items are aggregated values; category/temporal items group the rows. */
const fieldMapping = (role: 'category' | 'numeric' | 'temporal', required = true) => ({
  type: 'field' as const,
  supportedRoles: [role],
  intent: role === 'numeric' ? 'value' as const : 'category' as const,
  required
});

// ------------------------------------------------------------------ Money Protected

const MONEY_KEYS = ['decision', 'amount'];
const MONEY_OPTIONAL = ['attempts'];

function MoneyProtected(params: AgWidgetParams) {
  const data = useMappedRows(params, MONEY_KEYS, MONEY_OPTIONAL);
  const c = widgetColors();
  if (!data) return null;
  const blocked = data.rows.filter((r) => valueOf(r, data.fields.decision) === 'BLOCKED');
  const amount = blocked.reduce((sum, r) => sum + num(valueOf(r, data.fields.amount)), 0);
  const attempts = data.fields.attempts ? blocked.reduce((sum, r) => sum + num(valueOf(r, data.fields.attempts)), 0) : null;
  return (
    <div className="flex h-full flex-col justify-center gap-1 overflow-hidden p-4" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      <span className="text-sm font-medium" style={{ color: c.muted }}>Money protected</span>
      <span className="tabular text-[32px] font-semibold leading-none tracking-tight" style={{ color: c.accent }}>{formatMoney(amount)}</span>
      <span className="text-sm" style={{ color: c.muted }}>
        kept inside your rules{attempts !== null && ` · ${attempts} blocked ${attempts === 1 ? 'attempt' : 'attempts'}`}
      </span>
    </div>);

}

// ------------------------------------------------------------------ Decision Funnel

const FUNNEL_KEYS = ['decision', 'count'];

function DecisionFunnel(params: AgWidgetParams) {
  const data = useMappedRows(params, FUNNEL_KEYS);
  const c = widgetColors();
  if (!data) return null;
  const counts = new Map<string, number>();
  data.rows.forEach((r) => counts.set(String(valueOf(r, data.fields.decision)), num(valueOf(r, data.fields.count))));
  const total = [...counts.values()].reduce((a, b) => a + b, 0);
  const stages = [
  { label: 'Checked by your rules', value: total, colour: c.primary, decision: null },
  { label: 'Allowed', value: counts.get('ALLOWED') ?? 0, colour: c.accent, decision: 'ALLOWED' },
  { label: 'Needed your approval', value: counts.get('REQUIRES_APPROVAL') ?? 0, colour: c.approval, decision: 'REQUIRES_APPROVAL' },
  { label: 'Blocked', value: counts.get('BLOCKED') ?? 0, colour: c.blocked, decision: 'BLOCKED' }];

  const select = (decision: string | null) =>
  params.widgetApi.toggleCrossFilter(
    decision === null ?
    { type: 'value', field: data.fields.decision, value: null, group: 0, reset: true } :
    { type: 'value', field: data.fields.decision, value: decision, group: 0 }
  );
  return (
    <div className="flex h-full flex-col justify-center gap-2.5 p-4" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {stages.map((s, i) =>
      <button
        key={s.label}
        type="button"
        onClick={() => select(s.decision)}
        className="group text-left focus-visible:outline-none"
        aria-label={`${s.label}: ${s.value}. ${s.decision ? 'Filter the page to this decision' : 'Clear the decision filter'}`}>

          <div className="mb-1 flex items-baseline justify-between text-sm" style={{ color: c.foreground }}>
            <span className={i === 0 ? 'font-semibold' : 'font-medium'}>{s.label}</span>
            <span className="tabular" style={{ color: c.muted }}>
              {s.value}
              {i > 0 && total > 0 && ` · ${Math.round(s.value / total * 100)}%`}
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full" style={{ background: c.track }}>
            <div
            className="h-full rounded-full transition-[width,opacity] duration-300 group-hover:opacity-80"
            style={{ width: `${total ? Math.max(s.value / total * 100, s.value ? 2 : 0) : 0}%`, background: s.colour }} />

          </div>
        </button>
      )}
    </div>);

}

// ------------------------------------------------------------------ Budget Burn-down

const BURN_KEYS = ['category', 'limit', 'spent'];
const BURN_OPTIONAL = ['pending', 'period', 'periodStart'];

/** Fraction of the budget period already gone (weekly = 7 days, monthly = calendar month). */
function elapsed(period: string, start: Date | null): number | null {
  if (!start || Number.isNaN(start.getTime())) return null;
  const end = new Date(start);
  if (period === 'MONTHLY') end.setMonth(end.getMonth() + 1);else
  end.setDate(end.getDate() + 7);
  const f = (Date.now() - start.getTime()) / (end.getTime() - start.getTime());
  return Math.min(1, Math.max(0, f));
}

function BudgetBurn(params: AgWidgetParams) {
  const data = useMappedRows(params, BURN_KEYS, BURN_OPTIONAL);
  const c = widgetColors();
  if (!data) return null;
  const rows = data.rows.
  map((r) => {
    const startRaw = valueOf(r, data.fields.periodStart);
    return {
      category: String(valueOf(r, data.fields.category) ?? 'Overall'),
      period: String(valueOf(r, data.fields.period) ?? ''),
      limit: num(valueOf(r, data.fields.limit)),
      spent: num(valueOf(r, data.fields.spent)),
      pending: num(valueOf(r, data.fields.pending)),
      start: startRaw instanceof Date ? startRaw : startRaw ? new Date(String(startRaw)) : null
    };
  }).
  filter((r) => r.limit > 0);

  return (
    <div className="flex h-full flex-col justify-center gap-4 overflow-y-auto p-4" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
      {rows.map((r) => {
        const used = (r.spent + r.pending) / r.limit;
        const pace = elapsed(r.period, r.start);
        const tone = used > 1 ? c.blocked : pace !== null && used > pace + 0.05 ? c.approval : c.accent;
        const status = used > 1 ? 'Over the limit' : pace !== null && used > pace + 0.05 ? 'Ahead of pace' : 'On pace';
        const scale = Math.max(1, used);
        return (
          <div key={`${r.category}-${r.period}`}>
            <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm" style={{ color: c.foreground }}>
              <span className="font-medium">
                {r.category === 'OVERALL' ? 'Overall' : humanize(r.category)}
                {r.period && <span style={{ color: c.muted }}> · {humanize(r.period)}</span>}
              </span>
              <span className="tabular text-right" style={{ color: c.muted }}>
                {formatMoney(r.spent + r.pending)} of {formatMoney(r.limit)} · <span style={{ color: tone }}>{status}</span>
              </span>
            </div>
            <div
              role="img"
              aria-label={`${r.category}: ${Math.round(used * 100)}% used${pace !== null ? `, ${Math.round(pace * 100)}% of the period gone` : ''}. ${status}.`}
              className="relative h-3 overflow-hidden rounded-full"
              style={{ background: c.track }}>

              <div className="h-full" style={{ width: `${Math.min(used, scale) / scale * 100}%`, background: tone }} />
              {pace !== null &&
              <div className="absolute inset-y-0 w-0.5" style={{ left: `${pace / scale * 100}%`, background: c.foreground }} title="Ideal pace" />
              }
            </div>
          </div>);

      })}
      {rows.length === 0 && <p className="text-sm" style={{ color: c.muted }}>No budgets with a limit.</p>}
    </div>);

}

// ------------------------------------------------------------------ definitions

const definitions = [
{
  id: 'guardrail-money-protected',
  label: 'Money protected',
  dataMapping: { decision: fieldMapping('category'), amount: fieldMapping('numeric'), attempts: fieldMapping('numeric', false) },
  defaultState: {
    dataMapping: {
      decision: [{ id: 'evaluations.decision' }],
      amount: [{ id: 'evaluations.amount', aggregation: 'sum' }],
      attempts: [{ id: 'evaluations.amount', aggregation: 'count' }]
    }
  },
  form: (p: any) => p.createDefaults({ dataMappingItems: [{ key: 'decision', label: 'Decision' }, { key: 'amount', label: 'Amount' }, { key: 'attempts', label: 'Attempts (count)' }] }),
  comp: MoneyProtected,
  defaultSize: { width: 360, height: 180 },
  minSize: { width: 240, height: 140 }
},
{
  id: 'guardrail-decision-funnel',
  label: 'Decision funnel',
  dataMapping: { decision: fieldMapping('category'), count: fieldMapping('numeric') },
  defaultState: {
    dataMapping: { decision: [{ id: 'evaluations.decision' }], count: [{ id: 'evaluations.amount', aggregation: 'count' }] }
  },
  form: (p: any) => p.createDefaults({ dataMappingItems: [{ key: 'decision', label: 'Decision' }, { key: 'count', label: 'Count' }] }),
  comp: DecisionFunnel,
  defaultSize: { width: 420, height: 260 },
  minSize: { width: 280, height: 200 }
},
{
  id: 'guardrail-budget-burn',
  label: 'Budget burn-down',
  dataMapping: {
    category: fieldMapping('category'),
    limit: fieldMapping('numeric'),
    spent: fieldMapping('numeric'),
    pending: fieldMapping('numeric', false),
    period: fieldMapping('category', false),
    periodStart: fieldMapping('temporal', false)
  },
  defaultState: {
    dataMapping: {
      category: [{ id: 'budgets.categoryCode' }],
      period: [{ id: 'budgets.period' }],
      periodStart: [{ id: 'budgets.periodStart' }],
      limit: [{ id: 'budgets.limit', aggregation: 'sum' }],
      spent: [{ id: 'budgets.spent', aggregation: 'sum' }],
      pending: [{ id: 'budgets.pending', aggregation: 'sum' }]
    }
  },
  form: (p: any) =>
  p.createDefaults({
    dataMappingItems: [
    { key: 'category', label: 'Category' },
    { key: 'period', label: 'Period' },
    { key: 'periodStart', label: 'Period start' },
    { key: 'limit', label: 'Limit' },
    { key: 'spent', label: 'Spent' },
    { key: 'pending', label: 'Pending' }]

  }),
  comp: BudgetBurn,
  defaultSize: { width: 520, height: 240 },
  minSize: { width: 320, height: 160 }
}] as
unknown as AgWidgetDefinition[];

export const GUARDRAIL_WIDGET_IDS = ['guardrail-money-protected', 'guardrail-decision-funnel', 'guardrail-budget-burn'];

/** Adds the Guardrail widgets under their own menu group, keeping Studio's built-in widgets. */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const guardrailWidgets = (base: any) =>
createWidgets({
  additionalTypes: definitions,
  menu: [...base.menu, { label: 'Guardrail', widgetIds: GUARDRAIL_WIDGET_IDS }]
} as never);
