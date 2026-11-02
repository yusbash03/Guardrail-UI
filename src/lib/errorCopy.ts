import { isApiError } from './api';

// ERROR_HANDLING.md §4: clients switch on `code`, never on title/detail; fall back to the server's detail.
const errorCopy: Record<string, string> = {
  VALIDATION_FAILED: 'Some details need fixing.',
  UNAUTHENTICATED: 'Your session ended — please log in again.',
  REAUTHENTICATION_FAILED: 'Incorrect password',
  FORBIDDEN: "You don't have access to that.",
  NOT_FOUND: "We couldn't find that.",
  INVALID_STATE: 'That action is no longer available — refresh and try again.',
  POLICY_VERSION_CONFLICT: 'Rules changed elsewhere — reload to continue.',
  CART_LOCKED: 'This cart already has a purchase in progress.',
  CART_NOT_OPEN: "This cart can't be changed any more.",
  CART_CHANGED: 'The cart changed after it was checked. Ask the assistant to rebuild it.',
  EVALUATION_STALE: 'Your rules or budget changed. Ask the assistant to check the cart again.',
  APPROVAL_NOT_PENDING: 'This approval was already decided.',
  APPROVAL_NOT_APPROVED: 'This purchase needs your approval before payment.',
  APPROVAL_SNAPSHOT_MISMATCH: "The cart you're approving changed. Reload to see the latest version.",
  APPROVAL_INVALIDATED: 'This approval is no longer valid — your rules or the cart changed.',
  APPROVAL_EXPIRED: 'This approval expired. Ask the assistant to prepare the cart again.',
  EVALUATION_EXPIRED: 'This check expired. Ask the assistant to check the cart again.',
  PAYMENT_NOT_APPROVED: "PayPal hasn't confirmed this payment yet.",
  IDEMPOTENCY_IN_PROGRESS: 'Still working on your last request…',
  POLICY_INVALID: "Those rules aren't valid — check the highlighted values.",
  POLICY_MERCHANT_CONFLICT: "A merchant can't be both approved and blocked.",
  EVALUATION_BLOCKED: 'Your rules block this purchase.',
  NO_ACTIVE_POLICY: 'Set your first rule before shopping.',
  PAYMENT_INSTRUMENT_DECLINED: 'PayPal declined that payment method. Try another one.',
  FINAL_CHECK_FAILED: "Payment stopped by your rules — you weren't charged.",
  RATE_LIMITED: 'Too many requests — wait a moment and try again.',
  APPROVAL_STEP_UP_LOCKED: 'Too many attempts — try again later.',
  PAYMENT_PROVIDER_UNAVAILABLE: "PayPal isn't responding. It's safe to try again.",
  AGENT_UNAVAILABLE: "The assistant isn't available right now. Try again in a minute.",
  CART_VERSION_MISMATCH: 'This cart changed in another tab — reloaded the latest version.',
  MIXED_MERCHANT_CART: 'A cart can only hold products from one merchant.',
  CART_LIMIT_EXCEEDED: 'A cart can hold at most 30 items.',
  PRODUCT_UNAVAILABLE: "That product isn't available right now.",
  INTERNAL_ERROR: 'Something went wrong on our side.',
};

export function errorMessage(error: unknown): string {
  if (isApiError(error)) return errorCopy[error.code] ?? error.detail ?? 'Something went wrong.';
  if (error instanceof TypeError) return "Can't reach Guardrail — check your connection.";
  return 'Something went wrong.';
}
