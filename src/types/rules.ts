export type RuleAction = 'Block' | 'Ask me' | 'Allow';

export interface CategoryBudget {
  id: string;
  categoryCode: string;
  category: string;
  period: 'Weekly' | 'Monthly';
  limit: number;
}

export interface ProductRestriction {
  id: string;
  ruleId: string | null;
  kind: 'Category' | 'Tag' | 'Product';
  value: string;
  label: string;
  action: RuleAction;
  note: string | null;
}

export interface TimeRestriction {
  id: string;
  ruleId: string | null;
  daysOfWeek: string[];
  days: string;
  start: string;
  end: string;
  action: RuleAction;
}

/** Editable form model for the Spending Rules page; mapped to/from PolicyDocument in lib/rulesMapping.ts. */
export interface SpendingRules {
  categoryBudgets: CategoryBudget[];
  overall: {weekly: number | null;monthly: number | null;};
  approvalThreshold: number | null;
  maxTransaction: number | null;
  approvedMerchants: string[];
  blockedMerchants: string[];
  newMerchants: RuleAction;
  productRestrictions: ProductRestriction[];
  duplicate: {enabled: boolean;window: string;scope: string;action: RuleAction;};
  timeRestrictions: TimeRestriction[];
  unbudgeted: RuleAction;
}
