import type { Category, MerchantDto, PolicyDocument } from './schemas';
import { daysLabel } from './rulesMapping';
import { categoryName, humanize, ruleActionLabel } from '../utils/labels';
import { formatApiMoney } from '../utils/money';

export interface DiffRow {
  field: string;
  before: string | null;
  after: string | null;
}

/** Flattens a policy into readable "field → value" pairs so two versions can be compared line by line. */
export function policyFields(policy: PolicyDocument, merchants: MerchantDto[], categories?: Category[]): Map<string, string> {
  const map = new Map<string, string>();
  // Duplicate rules (e.g. two identical restrictions) get "(2)", "(3)" so they still show up in a diff.
  const fields = {
    set(key: string, value: string) {
      let unique = key;
      for (let n = 2; map.has(unique); n++) unique = `${key} (${n})`;
      map.set(unique, value);
    },
  };
  const merchantName = (id: string) => merchants.find((m) => m.id === id)?.name ?? `Merchant ${id.slice(0, 8)}`;
  const period = (p: string) => (p === 'WEEKLY' ? 'Weekly' : 'Monthly');

  fields.set('Approval threshold', policy.approvalThreshold ? formatApiMoney(policy.approvalThreshold.amount) : 'Not set');
  fields.set('Max transaction amount', policy.maxTransactionAmount ? formatApiMoney(policy.maxTransactionAmount.amount) : 'Not set');
  policy.spendingLimits.forEach((l) => fields.set(`Overall limit · ${period(l.period)}`, formatApiMoney(l.limit)));
  policy.categoryBudgets.forEach((b) => fields.set(`Category budget · ${categoryName(b.categoryCode, categories)} (${period(b.period)})`, formatApiMoney(b.limit)));
  policy.merchantRules.approvedMerchantIds.forEach((id) => fields.set(`Merchant · ${merchantName(id)}`, 'Approved'));
  policy.merchantRules.blockedMerchantIds.forEach((id) => fields.set(`Merchant · ${merchantName(id)}`, 'Blocked'));
  fields.set('New merchants', ruleActionLabel(policy.merchantRules.newMerchantAction));
  policy.productRestrictions.forEach((p) => {
    const value = p.match.type === 'CATEGORY' ? categoryName(p.match.value, categories) : p.match.value;
    fields.set(`Product restriction · ${humanize(p.match.type)}: ${value}`, ruleActionLabel(p.action));
  });
  const dup = policy.duplicatePurchase;
  fields.set('Duplicate protection', dup?.enabled ? `${dup.windowHours} h · ${humanize(dup.scope).toLowerCase()} · ${ruleActionLabel(dup.action)}` : 'Off');
  policy.timeRestrictions.forEach((t) =>
    fields.set(`Quiet hours · ${daysLabel(t.daysOfWeek)} ${t.startLocalTime.slice(0, 5)}–${t.endLocalTime.slice(0, 5)}`, ruleActionLabel(t.action)),
  );
  fields.set('Unbudgeted categories', ruleActionLabel(policy.unbudgetedCategoryAction));
  return map;
}

export function diffPolicies(before: Map<string, string>, after: Map<string, string>): DiffRow[] {
  const keys = [...new Set([...before.keys(), ...after.keys()])];
  return keys
    .map((field) => ({ field, before: before.get(field) ?? null, after: after.get(field) ?? null }))
    .filter((row) => row.before !== row.after);
}
