export type TimelineState = 'done' | 'current' | 'upcoming' | 'failed';

export interface TimelineStep {
  label: string;
  time?: string;
  state: TimelineState;
}

/** Display model for a purchase row / detail panel, built from TransactionDto (+ PurchaseDto and ledger for details). */
export interface Purchase {
  id: string;
  date: string;
  dateTime: string;
  merchant: string;
  initials: string;
  hue: number;
  amount: number;
  purchaseStatus: string;
  paymentStatus: string;
  orderId: string | null;
  authorizationId: string | null;
  captureId: string | null;
  finalCheck: boolean | null;
  timeline: TimelineStep[];
}

export interface LedgerEntry {
  id: string;
  time: string;
  transition: string;
  from: string;
  to: string;
  category: string;
  amount: number;
  source: string;
}

export interface ApprovalHistoryRow {
  id: string;
  date: string;
  merchant: string;
  initials: string;
  hue: number;
  amount: number;
  status: string;
  requestedBy: string;
}
