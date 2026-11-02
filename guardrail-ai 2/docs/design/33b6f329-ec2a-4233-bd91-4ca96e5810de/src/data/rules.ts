import type { SpendingRules } from '../types/rules';

export const initialRules: SpendingRules = {
  categoryBudgets: [
  { id: 'b1', category: 'Groceries', period: 'Weekly', limit: 80 },
  { id: 'b2', category: 'Household', period: 'Monthly', limit: 50 }],

  overall: { weekly: 200, monthly: 600 },
  approvalThreshold: 30,
  maxTransaction: 150,
  approvedMerchants: ['FreshMart', 'GreenGrocer Co.'],
  blockedMerchants: ['TechNest'],
  newMerchants: 'Block',
  productRestrictions: [
  { id: 'p1', kind: 'Category', value: 'Alcohol', action: 'Block' },
  { id: 'p2', kind: 'Tag', value: 'gift-card', action: 'Block' }],

  duplicate: { enabled: true, window: '24 hours', scope: 'same product', action: 'Ask me' },
  timeRestrictions: [{ id: 't1', days: 'Every day', start: '23:00', end: '06:00', action: 'Block' }],
  unbudgeted: 'Ask me'
};

export const ruleSections = [
{ id: 'budgets', title: 'Category budgets' },
{ id: 'limits', title: 'Overall limits' },
{ id: 'transactions', title: 'Transaction rules' },
{ id: 'merchants', title: 'Merchants' },
{ id: 'products', title: 'Product restrictions' },
{ id: 'duplicates', title: 'Duplicate protection' },
{ id: 'time', title: 'Time restrictions' },
{ id: 'unbudgeted', title: 'Unbudgeted categories' }];


export const ruleVersions = [
{ version: 5, when: '2 min ago', change: 'Approval threshold set to $30.00' },
{ version: 4, when: 'Yesterday', change: 'TechNest blocked' },
{ version: 3, when: 'Oct 28', change: 'Household budget added' }];


export const ruleActions = ['Block', 'Ask me', 'Allow'] as const;