export type TimelineState = 'done' | 'current' | 'upcoming' | 'failed';

export interface TimelineStep {
  label: string;
  time?: string;
  state: TimelineState;
}

export interface Purchase {
  id: string;
  date: string;
  dateTime: string;
  merchant: string;
  initials: string;
  hue: number;
  amount: number;
  purchaseStatus: 'Completed' | 'Failed' | 'Pending';
  paymentStatus: 'Completed' | 'Voided' | 'Pending';
  orderId: string;
  authorizationId: string;
  captureId: string | null;
  finalCheck: boolean;
  timeline: TimelineStep[];
}

export type LedgerTransition = 'PROPOSE' | 'CONFIRM_RESERVATION' | 'AUTHORIZE' | 'CAPTURE' | 'VOID';

export interface LedgerEntry {
  id: string;
  time: string;
  transition: LedgerTransition;
  from: string;
  to: string;
  category: string;
  amount: number;
  source: 'System' | 'PayPal API' | 'PayPal webhook';
}

export interface ApprovalHistoryRow {
  id: string;
  date: string;
  merchant: string;
  initials: string;
  hue: number;
  amount: number;
  status: 'Consumed' | 'Rejected' | 'Expired';
  requestedBy: string;
}