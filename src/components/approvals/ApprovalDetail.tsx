import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Card } from '../ui/Card';
import { DecisionBadge } from '../DecisionBadge';
import { BudgetImpactBars } from '../BudgetImpactBars';
import { ReasonList } from '../ReasonList';
import { MerchantAvatar } from '../MerchantAvatar';
import { MoneyText } from '../MoneyText';
import { ApprovalActions } from './ApprovalActions';
import type { ApprovalDto } from '../../lib/schemas';
import { merchantAvatar } from '../../utils/merchant';
import { toReasons } from '../../utils/labels';
import { formatWhen } from '../../utils/time';
import { formatApiMoney, toAmount } from '../../utils/money';

interface ApprovalDetailProps {
  approval: ApprovalDto;
  onBack: () => void;
  onApprove: () => void;
  onReject: () => void;
  rejecting?: boolean;
}

export function ApprovalDetail({ approval, onBack, onApprove, onReject, rejecting }: ApprovalDetailProps) {
  const avatar = merchantAvatar(approval.merchantName);
  const amount = toAmount(approval.amount);
  const primary = approval.reasons.find((r) => r.severity === 'BLOCK') ?? approval.reasons.find((r) => r.severity === 'REQUIRE_APPROVAL');
  return (
    <div>
      <button type="button" onClick={onBack} className="mb-4 inline-flex items-center gap-1.5 rounded text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All approvals
      </button>
      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <Card className="overflow-hidden">
          <div className="flex items-center gap-3 border-b border-border px-5 py-4">
            <MerchantAvatar initials={avatar.initials} hue={avatar.hue} />
            <div>
              <h2 className="text-base font-semibold">{approval.merchantName}</h2>
              <p className="text-sm text-muted-foreground">
                Requested by {approval.requestedBy === 'AGENT' ? 'AI assistant' : 'you'} · {formatWhen(approval.createdAt)}
              </p>
            </div>
          </div>
          <table className="w-full text-sm">
            <caption className="sr-only">Line items</caption>
            <thead>
              <tr className="text-left text-xs text-muted-foreground">
                <th scope="col" className="px-5 pb-2 pt-4 font-medium">Item</th>
                <th scope="col" className="px-5 pb-2 pt-4 font-medium">Qty</th>
                <th scope="col" className="px-5 pb-2 pt-4 text-right font-medium">Price</th>
              </tr>
            </thead>
            <tbody>
              {approval.items.map((line) =>
              <tr key={line.productId} className="border-t border-border">
                  <td className="px-5 py-2.5 font-medium">{line.name}</td>
                  <td className="tabular px-5 py-2.5 text-muted-foreground">
                    {line.quantity} × {formatApiMoney(line.unitPrice)}
                  </td>
                  <td className="tabular px-5 py-2.5 text-right">{formatApiMoney(line.lineTotal)}</td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="border-t border-border bg-muted/40">
                <th scope="row" colSpan={2} className="px-5 py-3 text-left font-medium">
                  Total
                </th>
                <td className="px-5 py-3 text-right">
                  <MoneyText amount={amount} className="text-lg" />
                </td>
              </tr>
            </tfoot>
          </table>
        </Card>

        <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <Card className="p-5">
            <DecisionBadge decision="REQUIRES_APPROVAL" size="lg" />
            <p className="mt-3 text-[15px] font-semibold">{primary?.message ?? 'This purchase needs your approval'}</p>
            {approval.budgetImpacts.length > 0 &&
            <div className="mt-5">
                <p className="mb-2 text-sm text-muted-foreground">Budget impact</p>
                <BudgetImpactBars impacts={approval.budgetImpacts} />
              </div>
            }
            <div className="mt-5">
              <p className="mb-2 text-sm text-muted-foreground">Why this needs you</p>
              <ReasonList reasons={toReasons(approval.reasons)} />
            </div>
          </Card>
          <Card className="p-5">
            <div className="mb-4 flex items-baseline justify-between">
              <h3 className="text-[15px] font-semibold">Approve this exact cart</h3>
              <MoneyText amount={amount} className="text-xl" />
            </div>
            <ApprovalActions
              amount={amount}
              fingerprint={approval.cartSnapshotHash.slice(0, 8)}
              expiresAt={approval.expiresAt}
              onApprove={onApprove}
              onReject={onReject}
              rejecting={rejecting}
              stacked />
          </Card>
        </div>
      </div>
    </div>);

}
