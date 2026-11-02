import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { StepUpPanel } from './StepUpPanel';
import type { ApprovalDto, PurchaseDto } from '../lib/schemas';
import { toAmount } from '../utils/money';

interface StepUpDialogProps {
  approval: ApprovalDto | null;
  onClose: () => void;
  onConfirmed: (purchase: PurchaseDto) => void;
}

export function StepUpDialog({ approval, onClose, onConfirmed }: StepUpDialogProps) {
  const open = approval !== null;
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {approval &&
      <div className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
          <motion.div
          className="absolute inset-0 bg-foreground/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          onClick={onClose} />

          <motion.div
          role="dialog"
          aria-modal="true"
          aria-labelledby="stepup-title"
          className="relative w-full max-w-md rounded-card border border-border bg-card shadow-lift"
          initial={{ opacity: 0, scale: 0.96, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}>

            <StepUpPanel
            approvalId={approval.id}
            cartSnapshotHash={approval.cartSnapshotHash}
            amount={toAmount(approval.amount)}
            merchant={approval.merchantName}
            fingerprint={approval.cartSnapshotHash.slice(0, 8)}
            onCancel={onClose}
            onConfirmed={onConfirmed} />
          </motion.div>
        </div>
      }
    </AnimatePresence>);

}
