import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { Card } from '../ui/Card';
import { DecisionBadge } from '../DecisionBadge';
import { BudgetBar } from '../BudgetBar';
import { ReasonList } from '../ReasonList';
import { MerchantAvatar } from '../MerchantAvatar';
import { MoneyText } from '../MoneyText';
import { ApprovalActions } from './ApprovalActions';
import { approvalFingerprint, freshmartCart, freshmartCartTotal } from '../../data/cart';
import { approvalReasons } from '../../data/reasons';

interface ApprovalDetailProps {
  onBack: () => void;
  onApprove: () => void;
  onReject: () => void;
}

export function ApprovalDetail({ onBack, onApprove, onReject }: ApprovalDetailProps) {
  return (
    <div>
      <button type="button" onClick={onBack} className="mb-4 inline-flex items-center gap-1.5 rounded text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> All approvals
      </button>
      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <Card className="overflow-hidden">
          <div className="flex items-center gap-3 border-b border-border px-5 py-4">
            <MerchantAvatar initials="FM" hue={152} />
            <div>
              <h2 className="text-base font-semibold">FreshMart</h2>
              <p className="text-sm text-muted-foreground">Requested by AI assistant · 2 min ago</p>
            </div>
          </div>
          <table className="w-full text-sm">
            <caption className="sr-only">Line items</caption>
            <thead>
              <tr className="text-left text-xs text-muted-foreground">
                <th scope="col" className="px-5 pb-2 pt-4 font-medium">Item</th>
                <th scope="col" className="px-5 pb-2 pt-4 font-medium">Size</th>
                <th scope="col" className="px-5 pb-2 pt-4 text-right font-medium">Price</th>
              </tr>
            </thead>
            <tbody>
              {freshmartCart.map((line) =>
              <tr key={line.id} className="border-t border-border">
                  <td className="px-5 py-2.5 font-medium">{line.name}</td>
                  <td className="px-5 py-2.5 text-muted-foreground">{line.size}</td>
                  <td className="tabular px-5 py-2.5 text-right">${line.price.toFixed(2)}</td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="border-t border-border bg-muted/40">
                <th scope="row" colSpan={2} className="px-5 py-3 text-left font-medium">
                  Total
                </th>
                <td className="px-5 py-3 text-right">
                  <MoneyText amount={freshmartCartTotal} className="text-lg" />
                </td>
              </tr>
            </tfoot>
          </table>
        </Card>

        <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <Card className="p-5">
            <DecisionBadge decision="REQUIRES_APPROVAL" size="lg" />
            <p className="mt-3 text-[15px] font-semibold">Purchase exceeds approval threshold</p>
            <div className="mt-5">
              <p className="mb-2 text-sm text-muted-foreground">Budget impact</p>
              <BudgetBar
                label="Groceries"
                period="Weekly"
                spent={0}
                pending={freshmartCartTotal}
                limit={80}
                pendingLabel="This cart"
                rightLabel={
                <>
                    $80.00 → <span className="font-semibold text-foreground">$37.00</span>
                  </>
                } />
              
            </div>
            <div className="mt-5">
              <p className="mb-2 text-sm text-muted-foreground">Why this needs you</p>
              <ReasonList reasons={approvalReasons} />
            </div>
          </Card>
          <Card className="p-5">
            <div className="mb-4 flex items-baseline justify-between">
              <h3 className="text-[15px] font-semibold">Approve this exact cart</h3>
              <MoneyText amount={freshmartCartTotal} className="text-xl" />
            </div>
            <ApprovalActions amount={freshmartCartTotal} fingerprint={approvalFingerprint} onApprove={onApprove} onReject={onReject} stacked />
          </Card>
        </div>
      </div>
    </div>);

}