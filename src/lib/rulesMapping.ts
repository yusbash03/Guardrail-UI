import type { Category, MerchantDto, PolicyDocument } from './schemas';
import type { SpendingRules } from '../types/rules';
import { categoryName, ruleActionCode, ruleActionLabel } from '../utils/labels';
import { toAmount, toMoneyString } from '../utils/money';

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
const DAY_NAMES: Record<string, string> = { MON: 'Mon', TUE: 'Tue', WED: 'Wed', THU: 'Thu', FRI: 'Fri', SAT: 'Sat', SUN: 'Sun' };

export const windowOptions = [
  { label: '12 hours', hours: 12 },
  { label: '24 hours', hours: 24 },
  { label: '7 days', hours: 168 },
  { label: '30 days', hours: 720 },
];
const scopeOptions = [
  { label: 'same product', code: 'SAME_PRODUCT' as const },
  { label: 'same cart', code: 'SAME_CART' as const },
];
export const scopeLabels = scopeOptions.map((s) => s.label);

export function daysLabel(days: string[]): string {
  const set = new Set(days.map((d) => d.toUpperCase().slice(0, 3)));
  if (set.size === 7) return 'Every day';
  if (set.size === 5 && ['MON', 'TUE', 'WED', 'THU', 'FRI'].every((d) => set.has(d))) return 'Weekdays';
  if (set.size === 2 && set.has('SAT') && set.has('SUN')) return 'Weekends';
  return DAYS.filter((d) => set.has(d)).map((d) => DAY_NAMES[d]).join(', ');
}

function windowLabel(hours: number): string {
  return windowOptions.find((w) => w.hours === hours)?.label ?? `${hours} hours`;
}

export function toRules(policy: PolicyDocument, merchants: MerchantDto[], categories: Category[] | undefined): SpendingRules {
  const nameOf = (id: string) => merchants.find((m) => m.id === id)?.name ?? 'Unknown merchant';
  const limit = (period: 'WEEKLY' | 'MONTHLY') => {
    const found = policy.spendingLimits.find((l) => l.period === period);
    return found ? toAmount(found.limit) : null;
  };
  const dup = policy.duplicatePurchase;
  return {
    categoryBudgets: policy.categoryBudgets.map((b, i) => ({
      id: `b${i}`,
      categoryCode: b.categoryCode,
      category: categoryName(b.categoryCode, categories),
      period: b.period === 'WEEKLY' ? 'Weekly' : 'Monthly',
      limit: toAmount(b.limit),
    })),
    overall: { weekly: limit('WEEKLY'), monthly: limit('MONTHLY') },
    approvalThreshold: policy.approvalThreshold ? toAmount(policy.approvalThreshold.amount) : null,
    maxTransaction: policy.maxTransactionAmount ? toAmount(policy.maxTransactionAmount.amount) : null,
    approvedMerchants: policy.merchantRules.approvedMerchantIds.map(nameOf),
    blockedMerchants: policy.merchantRules.blockedMerchantIds.map(nameOf),
    newMerchants: ruleActionLabel(policy.merchantRules.newMerchantAction),
    productRestrictions: policy.productRestrictions.map((p, i) => ({
      id: p.id ?? `p${i}`,
      ruleId: p.id ?? null,
      kind: p.match.type === 'CATEGORY' ? 'Category' : p.match.type === 'TAG' ? 'Tag' : 'Product',
      value: p.match.value,
      label: p.match.type === 'CATEGORY' ? categoryName(p.match.value, categories) : p.match.value,
      action: ruleActionLabel(p.action),
      note: p.note ?? null,
    })),
    duplicate: {
      enabled: dup?.enabled ?? false,
      window: windowLabel(dup?.windowHours ?? 24),
      scope: scopeOptions.find((s) => s.code === dup?.scope)?.label ?? 'same product',
      action: ruleActionLabel(dup?.action ?? 'REQUIRE_APPROVAL'),
    },
    timeRestrictions: policy.timeRestrictions.map((t, i) => ({
      id: t.id ?? `t${i}`,
      ruleId: t.id ?? null,
      daysOfWeek: t.daysOfWeek,
      days: daysLabel(t.daysOfWeek),
      start: t.startLocalTime.slice(0, 5),
      end: t.endLocalTime.slice(0, 5),
      action: ruleActionLabel(t.action),
    })),
    unbudgeted: ruleActionLabel(policy.unbudgetedCategoryAction),
  };
}

const positive = (n: number | null) => (n !== null && n > 0 ? toMoneyString(n) : null);

/** Form → PUT /policies body. Merchant lists are managed on the Merchants page, so their ids carry over unchanged. */
export function toPolicyDocument(rules: SpendingRules, original: PolicyDocument): PolicyDocument {
  const weekly = positive(rules.overall.weekly);
  const monthly = positive(rules.overall.monthly);
  const max = positive(rules.maxTransaction);
  const hours = windowOptions.find((w) => w.label === rules.duplicate.window)?.hours ?? original.duplicatePurchase?.windowHours ?? 24;
  return {
    approvalThreshold: rules.approvalThreshold === null ? null : { amount: toMoneyString(Math.max(0, rules.approvalThreshold)) },
    maxTransactionAmount: max ? { amount: max } : null,
    spendingLimits: [
      ...(weekly ? [{ period: 'WEEKLY' as const, limit: weekly }] : []),
      ...(monthly ? [{ period: 'MONTHLY' as const, limit: monthly }] : []),
    ],
    categoryBudgets: rules.categoryBudgets
      .filter((b) => b.limit > 0)
      .map((b) => ({ categoryCode: b.categoryCode, period: b.period === 'Weekly' ? 'WEEKLY' : 'MONTHLY', limit: toMoneyString(b.limit) })),
    merchantRules: { ...original.merchantRules, newMerchantAction: ruleActionCode(rules.newMerchants) },
    productRestrictions: rules.productRestrictions.filter((p) => p.value.trim() !== '').map((p) => ({
      id: p.ruleId,
      match: { type: p.kind === 'Category' ? 'CATEGORY' : p.kind === 'Tag' ? 'TAG' : 'PRODUCT', value: p.value },
      action: ruleActionCode(p.action),
      note: p.note,
    })),
    duplicatePurchase:
      !rules.duplicate.enabled && !original.duplicatePurchase
        ? null
        : {
            enabled: rules.duplicate.enabled,
            windowHours: hours,
            scope: scopeOptions.find((s) => s.label === rules.duplicate.scope)?.code ?? 'SAME_PRODUCT',
            action: ruleActionCode(rules.duplicate.action),
          },
    timeRestrictions: rules.timeRestrictions.map((t) => ({
      id: t.ruleId,
      daysOfWeek: t.daysOfWeek,
      startLocalTime: t.start,
      endLocalTime: t.end,
      action: ruleActionCode(t.action),
    })),
    unbudgetedCategoryAction: ruleActionCode(rules.unbudgeted),
  };
}

/** Short human summary of what changed, stored as the version's changeSummary (≤ 300 chars). */
export function changeSummary(before: SpendingRules, after: SpendingRules): string {
  const parts: string[] = [];
  const money = (n: number | null) => (n === null || n <= 0 ? 'none' : `$${n.toFixed(2)}`);
  if (before.approvalThreshold !== after.approvalThreshold) parts.push(`Approval threshold set to ${money(after.approvalThreshold)}`);
  if (before.maxTransaction !== after.maxTransaction) parts.push(`Max transaction set to ${money(after.maxTransaction)}`);
  if (before.overall.weekly !== after.overall.weekly) parts.push(`Weekly limit set to ${money(after.overall.weekly)}`);
  if (before.overall.monthly !== after.overall.monthly) parts.push(`Monthly limit set to ${money(after.overall.monthly)}`);
  if (JSON.stringify(before.categoryBudgets) !== JSON.stringify(after.categoryBudgets)) parts.push('Category budgets updated');
  if (before.newMerchants !== after.newMerchants) parts.push(`New merchants: ${after.newMerchants}`);
  if (JSON.stringify(before.productRestrictions) !== JSON.stringify(after.productRestrictions)) parts.push('Product restrictions updated');
  if (JSON.stringify(before.duplicate) !== JSON.stringify(after.duplicate)) parts.push('Duplicate protection updated');
  if (JSON.stringify(before.timeRestrictions) !== JSON.stringify(after.timeRestrictions)) parts.push('Time restrictions updated');
  if (before.unbudgeted !== after.unbudgeted) parts.push(`Unbudgeted categories: ${after.unbudgeted}`);
  return (parts.join('; ') || 'Rules updated').slice(0, 300);
}
