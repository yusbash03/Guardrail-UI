import type { ApprovalHistoryRow } from '../types/transaction';

export const pendingApproval = {
  id: 'apr_9f2c41e1',
  merchant: 'FreshMart',
  initials: 'FM',
  hue: 152,
  amount: 43.0,
  requestedBy: 'AI assistant',
  requestedAt: '2 min ago',
  reasonChip: 'Over $30 threshold'
};

export const approvalHistory: ApprovalHistoryRow[] = [
{ id: 'h1', date: 'Nov 1, 2026', merchant: 'FreshMart', initials: 'FM', hue: 152, amount: 31.4, status: 'Consumed', requestedBy: 'AI assistant' },
{ id: 'h2', date: 'Oct 30, 2026', merchant: 'HomeBasics', initials: 'HB', hue: 28, amount: 34.99, status: 'Rejected', requestedBy: 'AI assistant' },
{ id: 'h3', date: 'Oct 27, 2026', merchant: 'FreshMart', initials: 'FM', hue: 152, amount: 38.1, status: 'Expired', requestedBy: 'AI assistant' }];