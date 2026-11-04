import { z } from 'zod';
import type { CategoryBudget } from '../types/rules';

// Mirrors the API's PolicyDocumentValidator for category budgets: limit > 0.00 and ≤ 100000.00 with 2 dp,
// and one budget per category per period.
const LimitSchema = z
  .number({ invalid_type_error: 'Enter an amount' })
  .gt(0, 'Must be more than $0.00')
  .max(100_000, 'At most $100,000.00')
  .refine((n) => Math.round(n * 100) === n * 100, 'Use at most 2 decimals');

export type BudgetErrors = Map<string, { limit?: string; category?: string }>;

export function validateBudgets(budgets: CategoryBudget[]): BudgetErrors {
  const errors: BudgetErrors = new Map();
  const seen = new Map<string, string>();
  for (const b of budgets) {
    const entry: { limit?: string; category?: string } = {};
    const limit = LimitSchema.safeParse(b.limit);
    if (!limit.success) entry.limit = limit.error.issues[0]?.message;
    const key = `${b.categoryCode}:${b.period}`;
    if (seen.has(key)) entry.category = `${b.category} already has a ${b.period.toLowerCase()} budget`;
    else seen.set(key, b.id);
    if (entry.limit || entry.category) errors.set(b.id, entry);
  }
  return errors;
}
