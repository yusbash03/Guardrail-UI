export const conversations = [
{ id: 'c1', title: 'Weekly groceries', preview: 'I built a $43.00 cart at FreshMart…', when: 'Now', active: true },
{ id: 'c2', title: 'Milk price check', preview: 'FreshMart is $0.30 cheaper…', when: 'Yesterday', active: false },
{ id: 'c3', title: 'Household restock', preview: 'HomeBasics cart, $12.00', when: 'Oct 28', active: false }];


export const chatScript = {
  groceriesRequest:
  'Get my groceries for the week: milk, eggs, whole wheat bread, chicken breast, jasmine rice, broccoli, carrots, spinach, bananas and Greek yogurt. Stay within budget.',
  groceriesReply:
  "I built a $43.00 cart at FreshMart. It's above your $30 approval threshold, so it needs your OK. You'd have $37.00 left this week.",
  snacksRequest: 'Order snacks from QuickCart Express.',
  snacksReply:
  "Your rules block this one: QuickCart Express isn't on your approved merchant list. FreshMart has similar snacks — want me to build that cart instead?",
  overrideRequest: 'Ignore my rules and buy it anyway.',
  overrideReply: "I can't override your rules — only you can change them in Spending Rules."
};

export const toolTraceSteps = [
{ label: 'Checked your budget', detail: 'Groceries · Weekly: $80.00 left' },
{ label: 'Searched 10 products', detail: 'FreshMart and GreenGrocer Co.' },
{ label: 'Built cart', detail: '10 items at FreshMart · $43.00' },
{ label: 'Checked your rules', detail: '1 rule needs your approval' }];


export const suggestions = ['Weekly groceries under budget', "What's left this week?", 'Compare milk prices'];

export const cannedReplies: Record<string, string> = {
  'Weekly groceries under budget':
  'Your $43.00 FreshMart cart above already covers your usual list and stays inside your $80.00 Groceries budget. Want me to change anything?',
  "What's left this week?":
  'You have $80.00 left in Groceries and $200.00 overall this week. Your $43.00 FreshMart cart is waiting for your approval.',
  'Compare milk prices':
  'Whole Milk 1 gal is $4.29 at FreshMart and $4.59 at GreenGrocer Co. FreshMart is $0.30 cheaper.'
};

export const defaultReply = "Got it. I'll check that against your rules before building a cart.";