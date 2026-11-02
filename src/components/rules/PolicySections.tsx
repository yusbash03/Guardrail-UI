import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Ban, CheckCircle2, Plus, Trash2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { RuleSection, RuleSectionsProps } from './RuleSection';
import { SegmentedTabs } from '../ui/SegmentedTabs';
import { Select } from '../ui/Select';
import { Switch } from '../ui/Switch';
import { StatusChip } from '../StatusChip';
import { ruleActions } from '../../data/rules';
import type { ProductRestriction, RuleAction, TimeRestriction } from '../../types/rules';
import { scopeLabels, windowOptions } from '../../lib/rulesMapping';

function ActionText({ action }: {action: RuleAction;}) {
  return <span className={action === 'Block' ? 'font-semibold text-blocked-fg' : 'font-semibold text-foreground'}>{action}</span>;
}

const restrictionKinds = ['Category', 'Tag', 'Product'] as const;

const dayPresets: Record<string, string[]> = {
  'Every day': ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'],
  Weekdays: ['MON', 'TUE', 'WED', 'THU', 'FRI'],
  Weekends: ['SAT', 'SUN']
};
const dayOptionsFor = (current: string) => (dayPresets[current] ? Object.keys(dayPresets) : [current, ...Object.keys(dayPresets)]);

function RemoveButton({ label, onClick }: {label: string;onClick: () => void;}) {
  return (
    <button type="button" aria-label={label} onClick={onClick} className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-blocked-fg">
      <Trash2 className="h-4 w-4" aria-hidden="true" />
    </button>);

}

export function PolicySections({ rules, update, isEditing, toggleEdit, categories }: RuleSectionsProps) {
  const setRestriction = (id: string, patch: Partial<ProductRestriction>) =>
  update({ productRestrictions: rules.productRestrictions.map((x) => x.id === id ? { ...x, ...patch } : x) });
  const setTime = (id: string, patch: Partial<TimeRestriction>) =>
  update({ timeRestrictions: rules.timeRestrictions.map((x) => x.id === id ? { ...x, ...patch } : x) });

  const addRestriction = () => {
    const taken = new Set(rules.productRestrictions.filter((p) => p.kind === 'Category').map((p) => p.value));
    const free = categories.filter((c) => !taken.has(c.code));
    const category = free.find((c) => c.code === 'ALCOHOL') ?? free[0] ?? categories[0];
    update({
      productRestrictions: [
      ...rules.productRestrictions,
      { id: `p${Date.now()}`, ruleId: null, kind: 'Category', value: category?.code ?? '', label: category?.name ?? '', action: 'Block', note: null }]

    });
    if (!isEditing('products')) toggleEdit('products');
  };

  const addQuietHours = () => {
    update({
      timeRestrictions: [
      ...rules.timeRestrictions,
      { id: `t${Date.now()}`, ruleId: null, daysOfWeek: dayPresets['Every day'], days: 'Every day', start: '23:00', end: '06:00', action: 'Block' }]

    });
    if (!isEditing('time')) toggleEdit('time');
  };

  return (
    <>
      <RuleSection id="merchants" title="Merchants" description="Where your assistant is allowed to shop." editing={isEditing('merchants')} onToggleEdit={() => toggleEdit('merchants')}>
        <div className="space-y-4">
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Approved</p>
            <div className="flex flex-wrap gap-2">
              {rules.approvedMerchants.length === 0 && <span className="text-sm text-muted-foreground">None yet</span>}
              {rules.approvedMerchants.map((m) =>
              <StatusChip key={m} label={m} tone="positive" icon={CheckCircle2} className="px-2.5 py-1 text-sm" />
              )}
            </div>
          </div>
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">Blocked</p>
            <div className="flex flex-wrap gap-2">
              {rules.blockedMerchants.length === 0 && <span className="text-sm text-muted-foreground">None</span>}
              {rules.blockedMerchants.map((m) =>
              <StatusChip key={m} label={m} tone="negative" icon={Ban} className="px-2.5 py-1 text-sm" />
              )}
            </div>
          </div>
          <div className="flex flex-col gap-2 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm font-medium">New merchants</span>
            <SegmentedTabs
              ariaLabel="New merchants policy"
              options={ruleActions.map((a) => ({ value: a, label: a }))}
              value={rules.newMerchants}
              onChange={(v) => update({ newMerchants: v })}
              disabled={!isEditing('merchants')} />
            
          </div>
          <Link to="/merchants" className="inline-flex items-center gap-1 text-sm font-medium text-primary-ink hover:underline">
            Manage merchants <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      </RuleSection>

      <RuleSection id="products" title="Product restrictions" description="Things your assistant should never add to a cart." editing={isEditing('products')} onToggleEdit={() => toggleEdit('products')}>
        {rules.productRestrictions.length === 0 && <p className="text-sm text-muted-foreground">No product restrictions.</p>}
        <ul className="divide-y divide-border">
          {rules.productRestrictions.map((p) =>
          <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 py-2.5 text-sm first:pt-0 last:pb-0">
              {isEditing('products') ?
            <>
                  <span className="flex flex-wrap items-center gap-2">
                    <Select
                  aria-label="Restriction type"
                  options={restrictionKinds}
                  value={p.kind}
                  onChange={(e) => {
                    const kind = e.target.value as ProductRestriction['kind'];
                    const first = categories[0];
                    setRestriction(p.id, kind === 'Category' && first ? { kind, value: first.code, label: first.name } : { kind, value: '', label: '' });
                  }} />
                
                    {p.kind === 'Category' ?
                <Select
                  aria-label="Category"
                  options={categories.map((c) => c.name)}
                  value={p.label}
                  onChange={(e) => {
                    const category = categories.find((c) => c.name === e.target.value);
                    if (category) setRestriction(p.id, { value: category.code, label: category.name });
                  }} /> :


                <input
                  aria-label={p.kind === 'Tag' ? 'Tag' : 'Product ID'}
                  placeholder={p.kind === 'Tag' ? 'e.g. gift-card' : 'Product ID'}
                  value={p.value}
                  onChange={(e) => setRestriction(p.id, { value: e.target.value.trim(), label: e.target.value.trim() })}
                  className="h-9 w-40 rounded-btn border border-border bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" />

                }
                  </span>
                  <span className="flex items-center gap-1">
                    <Select
                  aria-label={`Action for ${p.label || 'restriction'}`}
                  options={ruleActions}
                  value={p.action}
                  onChange={(e) => setRestriction(p.id, { action: e.target.value as RuleAction })} />
                
                    <RemoveButton label={`Remove ${p.label || 'restriction'}`} onClick={() => update({ productRestrictions: rules.productRestrictions.filter((x) => x.id !== p.id) })} />
                  </span>
                </> :

            <>
                  <span>
                    <span className="text-muted-foreground">{p.kind}:</span> <span className="font-medium">{p.label}</span>
                  </span>
                  <span>
                    → <ActionText action={p.action} />
                  </span>
                </>
            }
            </li>
          )}
        </ul>
        <Button variant="ghost" size="sm" className="mt-3 -ml-2 text-primary-ink" onClick={addRestriction}>
          <Plus className="h-4 w-4" aria-hidden="true" /> Add restriction
        </Button>
      </RuleSection>

      <RuleSection id="duplicates" title="Duplicate protection" description="Stops the same item being bought twice by accident." editing={isEditing('duplicates')} onToggleEdit={() => toggleEdit('duplicates')}>
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm">
            {rules.duplicate.enabled ?
            <>
                {rules.duplicate.window} · {rules.duplicate.scope} · <span className="lowercase">{rules.duplicate.action}</span>
              </> :

            <span className="text-muted-foreground">Off — duplicates are allowed</span>
            }
          </p>
          <Switch label="Duplicate protection" checked={rules.duplicate.enabled} onChange={(v) => update({ duplicate: { ...rules.duplicate, enabled: v } })} />
        </div>
        {isEditing('duplicates') && rules.duplicate.enabled &&
        <div className="mt-4 flex flex-wrap gap-2">
            <Select aria-label="Window" options={windowOptions.map((w) => w.label)} value={rules.duplicate.window} onChange={(e) => update({ duplicate: { ...rules.duplicate, window: e.target.value } })} />
            <Select aria-label="Scope" options={scopeLabels} value={rules.duplicate.scope} onChange={(e) => update({ duplicate: { ...rules.duplicate, scope: e.target.value } })} />
            <Select aria-label="Action" options={ruleActions} value={rules.duplicate.action} onChange={(e) => update({ duplicate: { ...rules.duplicate, action: e.target.value as RuleAction } })} />
          </div>
        }
      </RuleSection>

      <RuleSection id="time" title="Time restrictions" description="Quiet hours when nothing gets bought." editing={isEditing('time')} onToggleEdit={() => toggleEdit('time')}>
        {rules.timeRestrictions.length === 0 && <p className="text-sm text-muted-foreground">No quiet hours set.</p>}
        <div className="space-y-3">
          {rules.timeRestrictions.map((t) =>
          <div key={t.id} className="flex flex-wrap items-center gap-2 text-sm">
              {isEditing('time') ?
            <>
                  <Select
                aria-label="Days"
                options={dayOptionsFor(t.days)}
                value={t.days}
                onChange={(e) => setTime(t.id, { days: e.target.value, daysOfWeek: dayPresets[e.target.value] ?? t.daysOfWeek })} />
              
                  <input
                type="time"
                aria-label="Start time"
                value={t.start}
                onChange={(e) => setTime(t.id, { start: e.target.value })}
                className="tabular h-9 rounded-btn border border-border bg-card px-2 text-sm" />
              
                  –
                  <input
                type="time"
                aria-label="End time"
                value={t.end}
                onChange={(e) => setTime(t.id, { end: e.target.value })}
                className="tabular h-9 rounded-btn border border-border bg-card px-2 text-sm" />
              
                  <Select aria-label="Action" options={ruleActions} value={t.action} onChange={(e) => setTime(t.id, { action: e.target.value as RuleAction })} />
                  <RemoveButton label={`Remove ${t.days} ${t.start}–${t.end}`} onClick={() => update({ timeRestrictions: rules.timeRestrictions.filter((x) => x.id !== t.id) })} />
                </> :

            <>
                  <span className="font-medium">{t.days}</span>
                  <span>
                    <span className="tabular">
                      {t.start}–{t.end}
                    </span>{' '}
                    → <ActionText action={t.action} />
                  </span>
                </>
            }
            </div>
          )}
        </div>
        <Button variant="ghost" size="sm" className="mt-3 -ml-2 text-primary-ink" onClick={addQuietHours}>
          <Plus className="h-4 w-4" aria-hidden="true" /> Add quiet hours
        </Button>
      </RuleSection>

      <RuleSection id="unbudgeted" title="Unbudgeted categories" description="What happens when an item has no budget yet." editing={isEditing('unbudgeted')} onToggleEdit={() => toggleEdit('unbudgeted')}>
        {isEditing('unbudgeted') ?
        <SegmentedTabs ariaLabel="Unbudgeted categories policy" options={ruleActions.map((a) => ({ value: a, label: a }))} value={rules.unbudgeted} onChange={(v) => update({ unbudgeted: v })} /> :

        <p className="text-sm">
            Items outside your budgets → <ActionText action={rules.unbudgeted} />
          </p>
        }
      </RuleSection>
    </>);

}