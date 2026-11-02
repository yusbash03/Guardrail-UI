export const kpis = {
  spentThisMonth: 155.4,
  monthlyLimit: 600,
  leftThisWeek: 157.0,
  weeklyLimit: 200,
  activeRules: 9,
  rulesVersion: 5
};

export const budgetRings = [
{ id: 'weekly', label: 'Weekly', spent: 43.0, limit: 200.0 },
{ id: 'monthly', label: 'Monthly', spent: 155.4, limit: 600.0 }];


export const categoryBudgets = [
{ id: 'groceries', label: 'Groceries', period: 'Weekly', spent: 43.0, limit: 80.0 },
{ id: 'household', label: 'Household', period: 'Monthly', spent: 12.0, limit: 50.0 }];


export const recentPurchases = [
{ id: 'p1', merchant: 'FreshMart', initials: 'FM', hue: 152, amount: 43.0, status: 'Completed', when: '2 min ago' },
{ id: 'p2', merchant: 'GreenGrocer Co.', initials: 'GG', hue: 96, amount: 24.5, status: 'Completed', when: 'Mon' },
{ id: 'p3', merchant: 'HomeBasics', initials: 'HB', hue: 28, amount: 12.0, status: 'Completed', when: 'Oct 28' }];


export const insights = [
{ id: 'i1', kind: 'budget' as const, text: "You've used 54% of your weekly grocery budget with 5 days left." },
{ id: 'i2', kind: 'price' as const, text: 'FreshMart was 8% cheaper than GreenGrocer Co. for your usual basket.' }];