import React from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { Card } from '../ui/Card';
import { MoneyText } from '../MoneyText';
import { ApprovalActions } from '../approvals/ApprovalActions';
import { useApprovals } from '../../contexts/ApprovalsContext';
import { approvalFingerprint, freshmartCartTotal } from '../../data/cart';

interface ApprovalCardProps {
  onApprove: () => void;
  onReject: () => void;
}

export function ApprovalCard({ onApprove, onReject }: ApprovalCardProps) {
  const { status } = useApprovals();
  return (
    <Card className="border-primary/30 p-4 ring-1 ring-primary/10">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-[15px] font-semibold">Approve this exact cart</h3>
        <MoneyText amount={freshmartCartTotal} className="text-xl" />
      </div>
      <p className="mt-1 text-sm text-muted-foreground">FreshMart · 10 items · you'll confirm with your password, then pay with PayPal.</p>
      <div className="mt-4">
        {status === 'pending' &&
        <ApprovalActions amount={freshmartCartTotal} fingerprint={approvalFingerprint} onApprove={onApprove} onReject={onReject} />
        }
        {status === 'rejected' &&
        <p className="flex items-center gap-2 rounded-btn bg-muted px-3 py-2.5 text-sm text-muted-foreground">
            <XCircle className="h-4 w-4" aria-hidden="true" /> You rejected this cart. Nothing was charged.
          </p>
        }
        {status === 'approved' &&
        <p className="flex items-center gap-2 rounded-btn bg-accent/10 px-3 py-2.5 text-sm text-accent-fg">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> Approved with your password. Payment is handled in Transactions.
          </p>
        }
      </div>
    </Card>);

}