import type { Reason, ReasonSeverity } from '../types/reason';
import type { RuleAction } from '../types/rules';
import type { PolicyReason, PurchaseStatus, RuleActionCode } from '../lib/schemas';

const categoryNames: Record<string, string> = {
  GROCERIES: 'Groceries',
  HOUSEHOLD: 'Household',
  PERSONAL_CARE: 'Personal care',
  BABY: 'Baby',
  ELECTRONICS: 'Electronics',
  ALCOHOL: 'Alcohol',
};

/** Title-cases an UPPER_SNAKE code ("PERSONAL_CARE" → "Personal care"). */
export function humanize(code: string): string {
  const text = code.toLowerCase().replace(/_/g, ' ');
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function categoryName(code: string | null | undefined, categories?: Array<{ code: string; name: string }>): string {
  if (!code) return 'Overall';
  return categories?.find((c) => c.code === code)?.name ?? categoryNames[code] ?? humanize(code);
}

export const periodLabel = (period: 'WEEKLY' | 'MONTHLY') => (period === 'WEEKLY' ? 'Weekly' : 'Monthly');

const actionToLabel: Record<RuleActionCode, RuleAction> = { BLOCK: 'Block', REQUIRE_APPROVAL: 'Ask me', ALLOW: 'Allow' };
const labelToAction: Record<RuleAction, RuleActionCode> = { Block: 'BLOCK', 'Ask me': 'REQUIRE_APPROVAL', Allow: 'ALLOW' };
export const ruleActionLabel = (code: RuleActionCode): RuleAction => actionToLabel[code];
export const ruleActionCode = (label: RuleAction): RuleActionCode => labelToAction[label];

const severityMap: Record<PolicyReason['severity'], ReasonSeverity> = { BLOCK: 'BLOCK', REQUIRE_APPROVAL: 'APPROVAL', INFO: 'INFO' };

/** Maps engine reasons onto the design's ReasonList shape. The rule-type tag shows the stable reason code. */
export function toReasons(reasons: PolicyReason[]): Reason[] {
  return reasons.map((r, i) => ({
    id: `${r.code}-${i}`,
    severity: severityMap[r.severity],
    message: r.message,
    ruleType: r.code,
    detail: r.ruleType ? `Rule: ${humanize(r.ruleType)}.` : 'Checked against your current rules.',
  }));
}

/** Purchase status → the design's chip labels (Completed / Failed / Pending / Rejected / Expired …). */
export function purchaseStatusLabel(status: PurchaseStatus): string {
  switch (status) {
    case 'COMPLETED':
      return 'Completed';
    case 'FAILED':
      return 'Failed';
    case 'REJECTED':
      return 'Rejected';
    case 'CANCELLED':
      return 'Cancelled';
    case 'EXPIRED':
      return 'Expired';
    case 'REFUNDED':
    case 'PARTIALLY_REFUNDED':
      return humanize(status);
    case 'AWAITING_APPROVAL':
      return 'Awaiting approval';
    case 'READY_FOR_CHECKOUT':
      return 'Ready to pay';
    default:
      return 'Pending';
  }
}

export function paymentStatusLabel(status: string | null | undefined): string {
  if (!status) return '—';
  if (status === 'COMPLETED') return 'Completed';
  if (status === 'VOIDED') return 'Voided';
  if (status === 'DECLINED' || status === 'FAILED' || status === 'REVERSED') return humanize(status);
  if (status === 'REFUNDED' || status === 'PARTIALLY_REFUNDED') return humanize(status);
  return 'Pending';
}

const toolLabels: Record<string, string> = {
  SearchProducts: 'Searched products',
  GetProductDetails: 'Looked up a product',
  SearchMerchants: 'Searched merchants',
  GetApprovedMerchants: 'Checked approved merchants',
  GetSpendingPolicies: 'Read your rules',
  GetRemainingBudget: 'Checked your budget',
  GetPurchaseStatus: 'Checked a purchase',
  GetSpendingSummary: 'Summarised your spending',
  CreateShoppingCart: 'Built cart',
  EvaluatePurchase: 'Checked your rules',
  RequestPurchaseApproval: 'Requested your approval',
};

export const toolLabel = (name: string) => toolLabels[name] ?? humanize(name.replace(/([a-z])([A-Z])/g, '$1_$2'));
