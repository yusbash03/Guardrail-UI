import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Ban, CheckCircle2 } from 'lucide-react';
import { RuleSection, RuleSectionsProps } from './RuleSection';
import { SegmentedTabs } from '../ui/SegmentedTabs';
import { Select } from '../ui/Select';
import { Switch } from '../ui/Switch';
import { StatusChip } from '../StatusChip';
import { ruleActions } from '../../data/rules';
import type { RuleAction } from '../../types/rules';
import { scopeLabels, windowOptions } from '../../lib/rulesMapping';

function ActionText({ action }: {action: RuleAction;}) {
  return <span className={action === 'Block' ? 'font-semibold text-blocked-fg' : 'font-semibold text-foreground'}>{action}</span>;
}

export function PolicySections({ rules, update, isEditing, toggleEdit }: RuleSectionsProps) {
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
          <li key={p.id} className="flex items-center justify-between gap-3 py-2.5 text-sm first:pt-0 last:pb-0">
              <span>
                <span className="text-muted-foreground">{p.kind}:</span> <span className="font-medium">{p.label}</span>
              </span>
              {isEditing('products') ?
            <Select
              aria-label={`Action for ${p.label}`}
              options={ruleActions}
              value={p.action}
              onChange={(e) =>
              update({ productRestrictions: rules.productRestrictions.map((x) => x.id === p.id ? { ...x, action: e.target.value as RuleAction } : x) })
              } /> :


            <span>
                  → <ActionText action={p.action} />
                </span>
            }
            </li>
          )}
        </ul>
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
        {rules.timeRestrictions.map((t) =>
        <div key={t.id} className="flex flex-wrap items-center gap-2 text-sm">
            <span className="font-medium">{t.days}</span>
            {isEditing('time') ?
          <>
                <input
              type="time"
              aria-label="Start time"
              value={t.start}
              onChange={(e) => update({ timeRestrictions: rules.timeRestrictions.map((x) => x.id === t.id ? { ...x, start: e.target.value } : x) })}
              className="tabular h-9 rounded-btn border border-border bg-card px-2 text-sm" />
            
                –
                <input
              type="time"
              aria-label="End time"
              value={t.end}
              onChange={(e) => update({ timeRestrictions: rules.timeRestrictions.map((x) => x.id === t.id ? { ...x, end: e.target.value } : x) })}
              className="tabular h-9 rounded-btn border border-border bg-card px-2 text-sm" />
            
                <Select
              aria-label="Action"
              options={ruleActions}
              value={t.action}
              onChange={(e) => update({ timeRestrictions: rules.timeRestrictions.map((x) => x.id === t.id ? { ...x, action: e.target.value as RuleAction } : x) })} />
            
              </> :

          <span>
                <span className="tabular">
                  {t.start}–{t.end}
                </span>{' '}
                → <ActionText action={t.action} />
              </span>
          }
          </div>
        )}
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