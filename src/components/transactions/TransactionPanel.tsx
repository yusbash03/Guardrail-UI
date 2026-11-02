import React, { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../ui/Button';
import { MerchantAvatar } from '../MerchantAvatar';
import { MoneyText } from '../MoneyText';
import { StatusChip } from '../StatusChip';
import { StatusTimeline } from '../StatusTimeline';
import { CopyId } from '../CopyId';
import { statusStyle } from '../../utils/status';
import { useCancelPurchase } from '../../lib/queries';
import { errorMessage } from '../../lib/errorCopy';
import type { Purchase } from '../../types/transaction';

export function TransactionPanel({ purchase, onClose }: {purchase: Purchase | null;onClose: () => void;}) {
  const cancel = useCancelPurchase();
  const [confirmCancel, setConfirmCancel] = useState(false);

  useEffect(() => setConfirmCancel(false), [purchase?.id]);

  const cancelPurchase = () => {
    if (!purchase) return;
    cancel.mutate(purchase.id, {
      onSuccess: () => {
        setConfirmCancel(false);
        toast('Purchase cancelled — nothing was charged');
        onClose();
      },
      onError: (err) => toast.error(errorMessage(err))
    });
  };

  useEffect(() => {
    if (!purchase) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [purchase, onClose]);

  return (
    <AnimatePresence>
      {purchase &&
      <div className="fixed inset-0 z-50">
          <motion.div className="absolute inset-0 bg-foreground/30" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} onClick={onClose} />
          <motion.aside
          role="dialog"
          aria-modal="true"
          aria-label={`${purchase.merchant} purchase details`}
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
          className="absolute inset-y-0 right-0 flex w-full max-w-md flex-col border-l border-border bg-card shadow-lift">
          
            <div className="flex items-center gap-3 border-b border-border px-5 py-4">
              <MerchantAvatar initials={purchase.initials} hue={purchase.hue} />
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{purchase.merchant}</p>
                <p className="text-sm text-muted-foreground">{purchase.dateTime}</p>
              </div>
              <button type="button" onClick={onClose} aria-label="Close" className="rounded-btn p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              <MoneyText amount={purchase.amount} className="text-[32px] tracking-tight" />
              <div className="mt-2 flex flex-wrap gap-2">
                <StatusChip label={`Purchase: ${purchase.purchaseStatus}`} tone={statusStyle(purchase.purchaseStatus).tone} icon={statusStyle(purchase.purchaseStatus).icon} />
                <StatusChip label={`Payment: ${purchase.paymentStatus}`} tone={statusStyle(purchase.paymentStatus).tone} icon={statusStyle(purchase.paymentStatus).icon} />
              </div>
              <h3 className="mb-4 mt-8 text-sm font-semibold">Status</h3>
              {purchase.timeline.length > 0 ? <StatusTimeline steps={purchase.timeline} /> : <p className="text-sm text-muted-foreground">Loading status…</p>}
              <h3 className="mb-3 mt-8 text-sm font-semibold">PayPal references</h3>
              <dl className="space-y-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">Order ID</dt>
                  <dd>{purchase.orderId ? <CopyId value={purchase.orderId} label="PayPal order ID" /> : <span className="text-muted-foreground">—</span>}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">Authorization ID</dt>
                  <dd>{purchase.authorizationId ? <CopyId value={purchase.authorizationId} label="Authorization ID" /> : <span className="text-muted-foreground">—</span>}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-muted-foreground">Capture ID</dt>
                  <dd>{purchase.captureId ? <CopyId value={purchase.captureId} label="Capture ID" /> : <span className="text-muted-foreground">—</span>}</dd>
                </div>
              </dl>
            </div>
            {purchase.canCancel &&
          <div className="border-t border-border px-5 py-4">
                {confirmCancel ?
            <div className="rounded-btn border border-blocked/30 bg-blocked/5 p-4">
                    <p className="text-sm">Cancel this purchase? Nothing has been charged, and the amount goes back to your budget.</p>
                    <div className="mt-3 flex gap-2">
                      <Button variant="secondary" size="sm" onClick={() => setConfirmCancel(false)} disabled={cancel.isPending}>Keep it</Button>
                      <Button variant="danger" size="sm" onClick={cancelPurchase} disabled={cancel.isPending}>
                        Cancel purchase
                      </Button>
                    </div>
                  </div> :

            <Button variant="secondary" className="w-full" onClick={() => setConfirmCancel(true)}>
                    Cancel purchase
                  </Button>
            }
              </div>
          }
          </motion.aside>
        </div>
      }
    </AnimatePresence>);

}