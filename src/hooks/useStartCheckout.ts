import { useRef } from 'react';
import { toast } from 'sonner';
import { newIdempotencyKey } from '../lib/api';
import { errorMessage } from '../lib/errorCopy';
import { useCheckout } from '../lib/queries';

/**
 * Creates the PayPal order for a READY_FOR_CHECKOUT purchase and sends the buyer to PayPal to approve it.
 * One Idempotency-Key per purchase per mounted component, so retries of the same intent replay.
 */
export function useStartCheckout() {
  const checkout = useCheckout();
  const keys = useRef(new Map<string, string>());

  const start = (purchaseId: string) => {
    if (checkout.isPending) return;
    let key = keys.current.get(purchaseId);
    if (!key) {
      key = newIdempotencyKey();
      keys.current.set(purchaseId, key);
    }
    checkout.mutate(
      { purchaseId, idempotencyKey: key },
      {
        onSuccess: (result) => {
          if (result.approveUrl) {
            window.location.assign(result.approveUrl);
          } else {
            toast.error("PayPal didn't return an approval link. Try again in a moment.");
          }
        },
        onError: (err) => toast.error(errorMessage(err)),
      },
    );
  };

  return { start, pending: checkout.isPending };
}
