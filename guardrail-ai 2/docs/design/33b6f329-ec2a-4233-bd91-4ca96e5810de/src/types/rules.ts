export type RuleAction = 'Block' | 'Ask me' | 'Allow';

export interface CategoryBudget {
  id: string;
  category: string;
  period: 'Weekly' | 'Monthly';
  limit: number;
}

export interface ProductRestriction {
  id: string;
  kind: 'Category' | 'Tag';
  value: string;
  action: RuleAction;
}

export interface TimeRestriction {
  id: string;
  days: string;
  start: string;
  end: string;
  action: RuleAction;
}

export interface SpendingRules {
  categoryBudgets: CategoryBudget[];
  overall: {weekly: number;monthly: number;};
  approvalThreshold: number;
  maxTransaction: number;
  approvedMerchants: string[];
  blockedMerchants: string[];
  newMerchants: RuleAction;
  productRestrictions: ProductRestriction[];
  duplicate: {enabled: boolean;window: string;scope: string;action: RuleAction;};
  timeRestrictions: TimeRestriction[];
  unbudgeted: RuleAction;
}