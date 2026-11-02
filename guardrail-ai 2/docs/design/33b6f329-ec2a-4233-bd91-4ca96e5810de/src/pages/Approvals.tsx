import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BadgeCheck, Bot, Clock, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { SegmentedTabs } from '../components/ui/SegmentedTabs';
import { MerchantAvatar } from '../components/MerchantAvatar';
import { MoneyText } from '../components/MoneyText';
import { StatusChip } from '../components/StatusChip';
import { DecisionBadge } from '../components/DecisionBadge';
import { DataGrid, Column } from '../components/DataGrid';
import { StepUpDialog } from '../components/StepUpDialog';
import { ApprovalDetail } from '../components/approvals/ApprovalDetail';
import { useApprovals } from '../contexts/ApprovalsContext';
import { useCountdown } from '../hooks/useCountdown';
import { approvalHistory, pendingApproval } from '../data/approvals';
import { approvalExpirySeconds, approvalFingerprint } from '../data/cart';
import type { ApprovalHistoryRow } from '../types/transaction';

type Tab = 'pending' | 'history';

const columns: Column<ApprovalHistoryRow>[] = [
{ key: 'date', header: 'Date', render: (r) => <span className="text-muted-foreground">{r.date}</span> },
{
  key: 'merchant',
  header: 'Merchant',
  render: (r) =>
  <span className="flex items-center gap-2 font-medium">
        <MerchantAvatar initials={r.initials} hue={r.hue} size="sm" /> {r.merchant}
      </span>

},
{ key: 'amount', header: 'Amount', align: 'right', render: (r) => <MoneyText amount={r.amount} /> },
{ key: 'decision', header: 'Decision', render: () => <DecisionBadge decision="REQUIRES_APPROVAL" /> },
{ key: 'status', header: 'Status', render: (r) => <StatusChip label={r.status} /> },
{ key: 'by', header: 'Requested by', render: (r) => <span className="text-muted-foreground">{r.requestedBy}</span> }];


function PendingCard({ onReview }: {onReview: () => void;}) {
  const countdown = useCountdown(approvalExpirySeconds);
  return (
    <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
      <MerchantAvatar initials={pendingApproval.initials} hue={pendingApproval.hue} size="lg" />
      <div className="min-w-0 flex-1">
        <p className="text-base font-semibold">
          {pendingApproval.merchant} · <MoneyText amount={pendingApproval.amount} />
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Bot className="h-4 w-4" aria-hidden="true" /> Requested by {pendingApproval.requestedBy}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-4 w-4" aria-hidden="true" /> Expires in <span className="tabular font-medium text-foreground">{countdown.label}</span>
          </span>
          <StatusChip label={pendingApproval.reasonChip} tone="warning" icon={ShieldAlert} />
        </div>
      </div>
      <Button onClick={onReview} className="sm:w-28">
        Review
      </Button>
    </Card>);

}

export function Approvals() {
  const [tab, setTab] = useState<Tab>('pending');
  const [reviewing, setReviewing] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const { status, pendingCount, approve, reject } = useApprovals();
  const navigate = useNavigate();

  const history: ApprovalHistoryRow[] =
  status === 'pending' ?
  approvalHistory :
  [
  { id: 'h0', date: 'Nov 3, 2026', merchant: 'FreshMart', initials: 'FM', hue: 152, amount: 43, status: status === 'approved' ? 'Consumed' : 'Rejected', requestedBy: 'AI assistant' },
  ...approvalHistory];


  const handleReject = () => {
    reject();
    setReviewing(false);
    toast('Cart rejected — nothing was charged');
  };

  const handleConfirmed = () => {
    approve();
    setDialogOpen(false);
    navigate('/checkout/return');
  };

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 lg:px-8 lg:py-8">
      {reviewing && status === 'pending' ?
      <ApprovalDetail onBack={() => setReviewing(false)} onApprove={() => setDialogOpen(true)} onReject={handleReject} /> :

      <>
          <SegmentedTabs
          ariaLabel="Approvals"
          value={tab}
          onChange={setTab}
          className="mb-6"
          options={[
          { value: 'pending', label: 'Pending', count: pendingCount },
          { value: 'history', label: 'History' }]
          } />
        
          {tab === 'pending' && (
        pendingCount > 0 ?
        <div className="max-w-3xl">
                <PendingCard onReview={() => setReviewing(true)} />
              </div> :

        <Card className="flex max-w-3xl flex-col items-center px-6 py-14 text-center">
                <BadgeCheck className="h-8 w-8 text-accent-fg" aria-hidden="true" />
                <p className="mt-3 font-medium">No pending approvals</p>
                <p className="mt-1 text-sm text-muted-foreground">When a cart needs your OK, it shows up here.</p>
              </Card>)
        }
          {tab === 'history' && <DataGrid ariaLabel="Approval history" columns={columns} rows={history} getRowId={(r) => r.id} />}
        </>
      }
      <StepUpDialog
        open={dialogOpen}
        amount={pendingApproval.amount}
        merchant={pendingApproval.merchant}
        fingerprint={approvalFingerprint}
        onClose={() => setDialogOpen(false)}
        onConfirmed={handleConfirmed} />
      
    </div>);

}