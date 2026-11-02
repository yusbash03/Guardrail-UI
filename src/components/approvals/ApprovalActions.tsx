import React from 'react';
import { Clock, Fingerprint } from 'lucide-react';
import { Button } from '../ui/Button';
import { useCountdown } from '../../hooks/useCountdown';
import { useOnline } from '../../hooks/useOnline';
import { formatMoney } from '../../utils/money';
import { cn } from '../../utils/cn';

interface ApprovalActionsProps {
  amount: number;
  fingerprint: string;
  expiresAt: string;
  onApprove: () => void;
  onReject: () => void;
  rejecting?: boolean;
  stacked?: boolean;
}

export function ApprovalActions({ amount, fingerprint, expiresAt, onApprove, onReject, rejecting, stacked }: ApprovalActionsProps) {
  const countdown = useCountdown(expiresAt);
  const online = useOnline();
  const disabled = countdown.expired || !online;
  return (
    <div>
      <dl className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Fingerprint className="h-4 w-4" aria-hidden="true" />
          <dt>Approval fingerprint</dt>
          <dd className="rounded-md bg-muted px-1.5 font-mono text-xs text-foreground">{fingerprint}</dd>
        </div>
        <div className={cn('flex items-center gap-1.5', countdown.seconds < 300 ? 'text-approval-fg' : 'text-muted-foreground')}>
          <Clock className="h-4 w-4" aria-hidden="true" />
          <dt className="sr-only">Expires</dt>
          <dd>
            {countdown.expired ? 'Expired' :
            <>
                Expires in <span className="tabular font-medium text-foreground">{countdown.label}</span>
              </>
            }
          </dd>
        </div>
      </dl>
      <div className={cn('mt-4 flex gap-2', stacked ? 'flex-col-reverse' : 'flex-col-reverse sm:flex-row sm:justify-end')}>
        <Button variant="secondary" onClick={onReject} disabled={disabled || rejecting}>
          Reject
        </Button>
        <Button onClick={onApprove} disabled={disabled} className={stacked ? '' : 'sm:min-w-40'}>
          Approve {formatMoney(amount)}
        </Button>
      </div>
    </div>);

}
