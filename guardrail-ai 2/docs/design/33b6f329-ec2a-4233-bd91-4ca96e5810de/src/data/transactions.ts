import type { LedgerEntry, Purchase } from '../types/transaction';

export const purchases: Purchase[] = [
{
  id: 't1',
  date: 'Nov 3',
  dateTime: 'Nov 3, 2026 · 2:03 PM',
  merchant: 'FreshMart',
  initials: 'FM',
  hue: 152,
  amount: 43.0,
  purchaseStatus: 'Completed',
  paymentStatus: 'Completed',
  orderId: '5O190127TN364715T',
  authorizationId: '0VF52814937998046',
  captureId: '2GG279541U471931P',
  finalCheck: true,
  timeline: [
  { label: 'Proposed', time: '2:02:11 PM', state: 'done' },
  { label: 'Reserved', time: '2:02:12 PM', state: 'done' },
  { label: 'Authorized', time: '2:03:40 PM', state: 'done' },
  { label: 'Final check', time: '2:03:41 PM', state: 'done' },
  { label: 'Captured', time: '2:03:42 PM', state: 'done' }]

},
{
  id: 't2',
  date: 'Nov 2',
  dateTime: 'Nov 2, 2026 · 10:18 AM',
  merchant: 'GreenGrocer Co.',
  initials: 'GG',
  hue: 96,
  amount: 24.5,
  purchaseStatus: 'Completed',
  paymentStatus: 'Completed',
  orderId: '8RT44511AX902233K',
  authorizationId: '3JK90117LM554302C',
  captureId: '7HP11802QW334981D',
  finalCheck: true,
  timeline: [
  { label: 'Proposed', time: '10:17:02 AM', state: 'done' },
  { label: 'Reserved', time: '10:17:03 AM', state: 'done' },
  { label: 'Authorized', time: '10:18:20 AM', state: 'done' },
  { label: 'Final check', time: '10:18:21 AM', state: 'done' },
  { label: 'Captured', time: '10:18:22 AM', state: 'done' }]

},
{
  id: 't3',
  date: 'Nov 1',
  dateTime: 'Nov 1, 2026 · 6:41 PM',
  merchant: 'FreshMart',
  initials: 'FM',
  hue: 152,
  amount: 18.2,
  purchaseStatus: 'Failed',
  paymentStatus: 'Voided',
  orderId: '2BC67340PL118820M',
  authorizationId: '9XD22018RT776510A',
  captureId: null,
  finalCheck: false,
  timeline: [
  { label: 'Proposed', time: '6:40:05 PM', state: 'done' },
  { label: 'Reserved', time: '6:40:06 PM', state: 'done' },
  { label: 'Authorized', time: '6:41:10 PM', state: 'done' },
  { label: 'Final check failed', time: '6:41:11 PM', state: 'failed' },
  { label: "Voided — you weren't charged", time: '6:41:12 PM', state: 'failed' }]

},
{
  id: 't4',
  date: 'Oct 28',
  dateTime: 'Oct 28, 2026 · 9:02 AM',
  merchant: 'HomeBasics',
  initials: 'HB',
  hue: 28,
  amount: 12.0,
  purchaseStatus: 'Completed',
  paymentStatus: 'Completed',
  orderId: '4MN88120ZX445601B',
  authorizationId: '6QW10293ER887124F',
  captureId: '1TY55608UI220947G',
  finalCheck: true,
  timeline: [
  { label: 'Proposed', time: '9:01:12 AM', state: 'done' },
  { label: 'Reserved', time: '9:01:13 AM', state: 'done' },
  { label: 'Authorized', time: '9:02:01 AM', state: 'done' },
  { label: 'Final check', time: '9:02:02 AM', state: 'done' },
  { label: 'Captured', time: '9:02:03 AM', state: 'done' }]

}];


export const ledger: LedgerEntry[] = [
{ id: 'g1', time: 'Nov 3 · 2:02:11 PM', transition: 'PROPOSE', from: 'available', to: 'pending', category: 'Groceries', amount: 43.0, source: 'System' },
{ id: 'g2', time: 'Nov 3 · 2:02:12 PM', transition: 'CONFIRM_RESERVATION', from: 'pending', to: 'reserved', category: 'Groceries', amount: 43.0, source: 'System' },
{ id: 'g3', time: 'Nov 3 · 2:03:40 PM', transition: 'AUTHORIZE', from: 'reserved', to: 'authorized', category: 'Groceries', amount: 43.0, source: 'PayPal API' },
{ id: 'g4', time: 'Nov 3 · 2:03:42 PM', transition: 'CAPTURE', from: 'authorized', to: 'spent', category: 'Groceries', amount: 43.0, source: 'PayPal webhook' },
{ id: 'g5', time: 'Nov 2 · 10:17:02 AM', transition: 'PROPOSE', from: 'available', to: 'pending', category: 'Groceries', amount: 24.5, source: 'System' },
{ id: 'g6', time: 'Nov 2 · 10:17:03 AM', transition: 'CONFIRM_RESERVATION', from: 'pending', to: 'reserved', category: 'Groceries', amount: 24.5, source: 'System' },
{ id: 'g7', time: 'Nov 2 · 10:18:20 AM', transition: 'AUTHORIZE', from: 'reserved', to: 'authorized', category: 'Groceries', amount: 24.5, source: 'PayPal API' },
{ id: 'g8', time: 'Nov 2 · 10:18:22 AM', transition: 'CAPTURE', from: 'authorized', to: 'spent', category: 'Groceries', amount: 24.5, source: 'PayPal webhook' },
{ id: 'g9', time: 'Nov 1 · 6:40:05 PM', transition: 'PROPOSE', from: 'available', to: 'pending', category: 'Groceries', amount: 18.2, source: 'System' },
{ id: 'g10', time: 'Nov 1 · 6:41:10 PM', transition: 'AUTHORIZE', from: 'reserved', to: 'authorized', category: 'Groceries', amount: 18.2, source: 'PayPal API' },
{ id: 'g11', time: 'Nov 1 · 6:41:12 PM', transition: 'VOID', from: 'authorized', to: 'available', category: 'Groceries', amount: 18.2, source: 'PayPal API' }];