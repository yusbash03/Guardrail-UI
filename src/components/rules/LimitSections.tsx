import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { RuleSection, RuleSectionsProps } from './RuleSection';
import { Button } from '../ui/Button';
import { MoneyInput } from '../ui/MoneyInput';
import { Select } from '../ui/Select';
import { formatMoney } from '../../utils/money';
import type { CategoryBudget } from '../../types/rules';

const moneyOrUnset = (value: number | null) => (value === null || value <= 0 ? 'Not set' : formatMoney(value));

export function LimitSections({ rules, update, isEditing, toggleEdit, categories }: RuleSectionsProps) {
  const editBudgets = isEditing('budgets');
  const editLimits = isEditing('limits');
  const editTx = isEditing('transactions');

  const setBudget = (id: string, patch: Partial<CategoryBudget>) =>
  update({ categoryBudgets: rules.categoryBudgets.map((b) => b.id === id ? { ...b, ...patch } : b) });

  const nameOf = (code: string) => categories.find((c) => c.code === code)?.name ?? code;

  const addBudget = () => {
    const used = new Set(rules.categoryBudgets.map((b) => b.categoryCode));
    const next = categories.find((c) => !used.has(c.code)) ?? categories[0];
    if (!next) return;
    update({ categoryBudgets: [...rules.categoryBudgets, { id: `b${Date.now()}`, categoryCode: next.code, category: next.name, period: 'Monthly', limit: 25 }] });
    if (!editBudgets) toggleEdit('budgets');
  };

  return (
    <>
      <RuleSection id="budgets" title="Category budgets" description="How much the assistant can spend per category." editing={editBudgets} onToggleEdit={() => toggleEdit('budgets')}>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs text-muted-foreground">
              <th scope="col" className="pb-2 font-medium">Category</th>
              <th scope="col" className="pb-2 font-medium">Period</th>
              <th scope="col" className="pb-2 text-right font-medium">Limit</th>
              {editBudgets && <th scope="col" className="w-10 pb-2"><span className="sr-only">Remove</span></th>}
            </tr>
          </thead>
          <tbody>
            {rules.categoryBudgets.map((b) =>
            <tr key={b.id} className="border-b border-border last:border-0">
                <td className="py-2.5 pr-3">
                  {editBudgets ?
                <Select
                  aria-label="Category"
                  options={categories.map((c) => c.name)}
                  value={b.category}
                  onChange={(e) => {
                    const category = categories.find((c) => c.name === e.target.value);
                    if (category) setBudget(b.id, { categoryCode: category.code, category: category.name });
                  }}
                  className="w-full max-w-[180px]" /> :


                <span className="font-medium">{nameOf(b.categoryCode)}</span>
                }
                </td>
                <td className="py-2.5 pr-3">
                  {editBudgets ?
                <Select aria-label="Period" options={['Weekly', 'Monthly']} value={b.period} onChange={(e) => setBudget(b.id, { period: e.target.value as CategoryBudget['period'] })} /> :

                <span className="text-muted-foreground">{b.period}</span>
                }
                </td>
                <td className="py-2.5 text-right">
                  {editBudgets ?
                <MoneyInput label={`${b.category} limit`} value={b.limit} onChange={(v) => setBudget(b.id, { limit: v })} className="ml-auto" /> :

                <span className="tabular font-semibold">{formatMoney(b.limit)}</span>
                }
                </td>
                {editBudgets &&
              <td className="py-2.5 pl-2 text-right">
                    <button
                  type="button"
                  aria-label={`Remove ${b.category}`}
                  onClick={() => update({ categoryBudgets: rules.categoryBudgets.filter((x) => x.id !== b.id) })}
                  className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-blocked-fg">
                  
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </td>
              }
              </tr>
            )}
          </tbody>
        </table>
        <Button variant="ghost" size="sm" className="mt-3 -ml-2 text-primary-ink" onClick={addBudget}>
          <Plus className="h-4 w-4" aria-hidden="true" /> Add budget
        </Button>
      </RuleSection>

      <RuleSection id="limits" title="Overall limits" description="Caps across every category combined." editing={editLimits} onToggleEdit={() => toggleEdit('limits')}>
        <dl className="grid grid-cols-2 gap-4">
          {(['weekly', 'monthly'] as const).map((key) =>
          <div key={key} className="rounded-btn bg-muted/50 p-4">
              <dt className="text-sm text-muted-foreground">{key === 'weekly' ? 'Weekly' : 'Monthly'}</dt>
              <dd className="mt-1">
                {editLimits ?
              <MoneyInput label={`${key} limit`} value={rules.overall[key] ?? 0} onChange={(v) => update({ overall: { ...rules.overall, [key]: v } })} /> :

              <span className="tabular text-2xl font-semibold tracking-tight">{moneyOrUnset(rules.overall[key])}</span>
              }
              </dd>
            </div>
          )}
        </dl>
      </RuleSection>

      <RuleSection id="transactions" title="Transaction rules" description="Limits on each single purchase." editing={editTx} onToggleEdit={() => toggleEdit('transactions')}>
        <div>
          <div className="flex items-center justify-between gap-4">
            <label htmlFor="threshold" className="text-sm font-medium">
              Approval threshold
            </label>
            {editTx ?
            <MoneyInput label="Approval threshold amount" value={rules.approvalThreshold ?? 0} onChange={(v) => update({ approvalThreshold: v })} /> :

            <span className="tabular text-sm font-semibold">{rules.approvalThreshold === null ? 'Not set' : formatMoney(rules.approvalThreshold)}</span>
            }
          </div>
          <input
            id="threshold"
            type="range"
            min={0}
            max={rules.maxTransaction && rules.maxTransaction > 0 ? rules.maxTransaction : 500}
            step={1}
            disabled={!editTx}
            value={rules.approvalThreshold ?? 0}
            onChange={(e) => update({ approvalThreshold: Number(e.target.value) })}
            className="mt-3 w-full disabled:opacity-60" />
          
          <p className="mt-1 text-sm text-muted-foreground">
            {rules.approvalThreshold === null ?
            'No approval threshold — other rules still apply.' :
            <>
                Purchases above <span className="tabular font-medium text-foreground">{formatMoney(rules.approvalThreshold)}</span> need your approval.
              </>
            }
          </p>
        </div>
        <div className="mt-5 flex items-center justify-between gap-4 border-t border-border pt-4">
          <span className="text-sm font-medium">Max transaction amount</span>
          {editTx ?
          <MoneyInput label="Max transaction amount" value={rules.maxTransaction ?? 0} onChange={(v) => update({ maxTransaction: v })} /> :

          <span className="tabular text-sm font-semibold">{moneyOrUnset(rules.maxTransaction)}</span>
          }
        </div>
      </RuleSection>
    </>);

}