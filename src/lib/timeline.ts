import type { LedgerEntryDto, PurchaseDto, PurchaseStatus } from './schemas';
import type { TimelineStep } from '../types/transaction';
import { formatClockTime } from '../utils/time';

// Proposed → Reserved → Authorized → Final check → Captured (or Voided), FRONTEND_SPECIFICATION.md §3.6.

const IN_PROGRESS: PurchaseStatus[] = ['READY_FOR_CHECKOUT', 'CHECKOUT_PENDING', 'PAYER_APPROVED', 'PAYMENT_AUTHORIZED', 'CAPTURE_PENDING'];
const STOPPED: Partial<Record<PurchaseStatus, string>> = {
  REJECTED: 'Rejected — nothing was charged',
  CANCELLED: 'Cancelled — nothing was charged',
  EXPIRED: 'Approval expired — nothing was charged',
};

const rank: Record<PurchaseStatus, number> = {
  AWAITING_APPROVAL: 1,
  READY_FOR_CHECKOUT: 1,
  CHECKOUT_PENDING: 1,
  PAYER_APPROVED: 1,
  PAYMENT_AUTHORIZED: 3,
  CAPTURE_PENDING: 4,
  COMPLETED: 5,
  REFUNDED: 5,
  PARTIALLY_REFUNDED: 5,
  REJECTED: 0,
  CANCELLED: 0,
  EXPIRED: 0,
  FAILED: 0,
};

function firstAt(entries: LedgerEntryDto[], ...transitions: string[]): string | undefined {
  return entries
    .filter((e) => transitions.includes(e.transition))
    .map((e) => e.occurredAt)
    .sort()[0];
}

export function buildTimeline(purchase: PurchaseDto, entries: LedgerEntryDto[] = []): TimelineStep[] {
  const finalCheck = purchase.payment?.finalCheck ?? null;
  const voidedAt = firstAt(entries, 'VOID');
  const capturedAt = firstAt(entries, 'CAPTURE');
  const progress = rank[purchase.status];

  const raw: Array<{ label: string; at?: string; reached: boolean; failed?: boolean }> = [
    { label: 'Proposed', at: firstAt(entries, 'PROPOSE') ?? purchase.createdAt, reached: true },
    { label: 'Reserved', at: firstAt(entries, 'RESERVE', 'CONFIRM_RESERVATION'), reached: progress >= 1 || !!firstAt(entries, 'RESERVE', 'CONFIRM_RESERVATION') },
    { label: 'Authorized', at: firstAt(entries, 'AUTHORIZE'), reached: progress >= 3 || !!firstAt(entries, 'AUTHORIZE') },
    finalCheck && !finalCheck.passed
      ? { label: 'Final check failed', at: finalCheck.checkedAt, reached: true, failed: true }
      : { label: 'Final check', at: finalCheck?.checkedAt, reached: !!finalCheck?.passed || progress >= 5 },
    voidedAt || (finalCheck && !finalCheck.passed)
      ? { label: "Voided — you weren't charged", at: voidedAt, reached: true, failed: true }
      : { label: 'Captured', at: capturedAt ?? purchase.completedAt ?? undefined, reached: progress >= 5 || !!capturedAt },
  ];

  const stopped = STOPPED[purchase.status];
  const inProgress = IN_PROGRESS.includes(purchase.status) || purchase.status === 'AWAITING_APPROVAL';
  const steps: TimelineStep[] = [];
  let currentAssigned = false;

  for (const step of raw) {
    if (step.reached) {
      steps.push({ label: step.label, time: step.at ? formatClockTime(step.at) : undefined, state: step.failed ? 'failed' : 'done' });
      continue;
    }
    if (stopped) break;
    steps.push({ label: step.label, state: inProgress && !currentAssigned ? 'current' : 'upcoming' });
    currentAssigned = true;
  }

  if (stopped) steps.push({ label: stopped, state: 'failed' });
  if (purchase.status === 'FAILED' && !steps.some((s) => s.state === 'failed')) steps.push({ label: 'Payment failed', state: 'failed' });
  return steps;
}
