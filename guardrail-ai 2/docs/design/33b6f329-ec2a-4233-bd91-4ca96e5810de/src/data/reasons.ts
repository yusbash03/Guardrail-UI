import type { Reason } from '../types/reason';

export const approvalReasons: Reason[] = [
{
  id: 'r1',
  severity: 'INFO',
  message: 'FreshMart is on your approved list',
  ruleType: 'MERCHANT_ALLOWLIST',
  detail: 'You approved FreshMart in Merchants. Checked against rules version 5.'
},
{
  id: 'r2',
  severity: 'APPROVAL',
  message: 'Purchase exceeds approval threshold ($30.00)',
  ruleType: 'APPROVAL_THRESHOLD',
  detail: 'This cart is $43.00. Purchases above $30.00 need your approval before payment.'
}];


export const blockedReasons: Reason[] = [
{
  id: 'b1',
  severity: 'BLOCK',
  message: 'QuickCart Express is not on your approved merchant list',
  ruleType: 'MERCHANT_ALLOWLIST',
  detail: 'New merchants are set to Block. Approve QuickCart Express in Merchants to allow purchases there.'
}];


export const stoppedReasons: Reason[] = [
{
  id: 's1',
  severity: 'BLOCK',
  message: 'FreshMart is on your blocked merchant list',
  ruleType: 'MERCHANT_BLOCKLIST',
  detail: 'FreshMart was moved to Blocked after you approved this cart. The final check runs right before capture.'
}];