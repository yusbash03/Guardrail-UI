import React from 'react';
import { CheckCircle2, Clock, XCircle } from 'lucide-react';
import { Card } from '../ui/Card';
import { MoneyText } from '../MoneyText';
import { ApprovalActions } from '../approvals/ApprovalActions';
import type { ApprovalDto } from '../../lib/schemas';
import { toAmount } from '../../utils/money';

interface ApprovalCardProps {
  approval: ApprovalDto;
  onApprove: () => void;
  onReject: () => void;
  rejecting?: boolean;
}

export function ApprovalCard({ approval, onApprove, onReject, rejecting }: ApprovalCardProps) {
  const amount = toAmount(approval.amount);
  const itemCount = approval.items.reduce((n, item) => n + item.quantity, 0);
  return (
    <Card className="border-primary/30 p-4 ring-1 ring-primary/10">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-[15px] font-semibold">Approve this exact cart</h3>
        <MoneyText amount={amount} className="text-xl" />
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        {approval.merchantName} · {itemCount} {itemCount === 1 ? 'item' : 'items'} · you'll confirm with your password, then pay with PayPal.
      </p>
      <div className="mt-4">
        {approval.status === 'PENDING' &&
        <ApprovalActions
          amount={amount}
          fingerprint={approval.cartSnapshotHash.slice(0, 8)}
          expiresAt={approval.expiresAt}
          onApprove={onApprove}
          onReject={onReject}
          rejecting={rejecting} />
        }
        {approval.status === 'REJECTED' &&
        <p className="flex items-center gap-2 rounded-btn bg-muted px-3 py-2.5 text-sm text-muted-foreground">
            <XCircle className="h-4 w-4" aria-hidden="true" /> You rejected this cart. Nothing was charged.
          </p>
        }
        {(approval.status === 'APPROVED' || approval.status === 'CONSUMED') &&
        <p className="flex items-center gap-2 rounded-btn bg-accent/10 px-3 py-2.5 text-sm text-accent-fg">
            <CheckCircle2 className="h-4 w-4" aria-hidden="true" /> Approved with your password. Payment is handled in Transactions.
          </p>
        }
        {(approval.status === 'EXPIRED' || approval.status === 'INVALIDATED') &&
        <p className="flex items-center gap-2 rounded-btn bg-muted px-3 py-2.5 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" aria-hidden="true" />
            {approval.status === 'EXPIRED' ? 'This approval expired. Ask me to prepare the cart again.' : 'This approval is no longer valid — your rules or the cart changed.'}
          </p>
        }
      </div>
    </Card>);

}
