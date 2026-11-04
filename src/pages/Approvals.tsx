import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BadgeCheck, Bot, Clock, Loader2, ShieldAlert } from 'lucide-react';
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
import { PageError } from '../components/PageState';
import { useCountdown } from '../hooks/useCountdown';
import { useStartCheckout } from '../hooks/useStartCheckout';
import { useAllApprovals, useApproval, usePendingApprovals, useReject } from '../lib/queries';
import { errorMessage } from '../lib/errorCopy';
import type { ApprovalDto, PurchaseDto } from '../lib/schemas';
import { merchantAvatar } from '../utils/merchant';
import { humanize } from '../utils/labels';
import { formatLongDate } from '../utils/time';
import { toAmount } from '../utils/money';
import type { ApprovalHistoryRow } from '../types/transaction';

type Tab = 'pending' | 'history';

const columns: Column<ApprovalHistoryRow>[] = [
{ key: 'date', header: 'Date', value: (r) => r.date, render: (r) => <span className="text-muted-foreground">{r.date}</span> },
{
  key: 'merchant',
  header: 'Merchant',
  minWidth: 180,
  value: (r) => r.merchant,
  render: (r) =>
  <span className="flex items-center gap-2 font-medium">
        <MerchantAvatar initials={r.initials} hue={r.hue} size="sm" /> {r.merchant}
      </span>

},
{ key: 'amount', header: 'Amount', align: 'right', value: (r) => r.amount, render: (r) => <MoneyText amount={r.amount} /> },
{ key: 'decision', header: 'Decision', minWidth: 190, render: () => <DecisionBadge decision="REQUIRES_APPROVAL" /> },
{ key: 'status', header: 'Status', value: (r) => r.status, render: (r) => <StatusChip label={r.status} /> },
{ key: 'by', header: 'Requested by', value: (r) => r.requestedBy, render: (r) => <span className="text-muted-foreground">{r.requestedBy}</span> }];


const shortReasons: Record<string, string> = {
  APPROVAL_THRESHOLD_EXCEEDED: 'Over approval threshold',
  NEW_MERCHANT_REQUIRES_APPROVAL: 'New merchant',
  PRODUCT_REQUIRES_APPROVAL: 'Restricted product',
  UNBUDGETED_CATEGORY: 'Unbudgeted category',
  DUPLICATE_PURCHASE: 'Possible duplicate',
  TIME_RESTRICTED: 'Outside allowed hours',
  CATEGORY_BUDGET_EXCEEDED: 'Over category budget',
  WEEKLY_LIMIT_EXCEEDED: 'Over weekly limit',
  MONTHLY_LIMIT_EXCEEDED: 'Over monthly limit',
};

function reasonChip(approval: ApprovalDto) {
  const reason = approval.reasons.find((r) => r.severity === 'REQUIRE_APPROVAL');
  return reason ? shortReasons[reason.code] ?? humanize(reason.code) : 'Needs your approval';
}

const requestedBy = (approval: ApprovalDto) => (approval.requestedBy === 'AGENT' ? 'AI assistant' : 'You');

function toHistoryRow(approval: ApprovalDto): ApprovalHistoryRow {
  const avatar = merchantAvatar(approval.merchantName);
  return {
    id: approval.id,
    date: formatLongDate(approval.decidedAt ?? approval.createdAt),
    merchant: approval.merchantName,
    ...avatar,
    amount: toAmount(approval.amount),
    status: humanize(approval.status),
    requestedBy: requestedBy(approval),
  };
}

function PendingCard({ approval, onReview }: {approval: ApprovalDto;onReview: () => void;}) {
  const countdown = useCountdown(approval.expiresAt);
  const avatar = merchantAvatar(approval.merchantName);
  return (
    <Card className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
      <MerchantAvatar initials={avatar.initials} hue={avatar.hue} size="lg" />
      <div className="min-w-0 flex-1">
        <p className="text-base font-semibold">
          {approval.merchantName} · <MoneyText amount={toAmount(approval.amount)} />
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Bot className="h-4 w-4" aria-hidden="true" /> Requested by {requestedBy(approval)}
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-4 w-4" aria-hidden="true" />
            {countdown.expired ? 'Expired' : <>Expires in <span className="tabular font-medium text-foreground">{countdown.label}</span></>}
          </span>
          <StatusChip label={reasonChip(approval)} tone="warning" icon={ShieldAlert} />
        </div>
      </div>
      <Button onClick={onReview} className="sm:w-28">
        Review
      </Button>
    </Card>);

}

export function Approvals() {
  const { id } = useParams();
  const [tab, setTab] = useState<Tab>('pending');
  const [stepUp, setStepUp] = useState<ApprovalDto | null>(null);
  const navigate = useNavigate();
  const pending = usePendingApprovals();
  const all = useAllApprovals();
  const detail = useApproval(id);
  const reject = useReject();
  const checkout = useStartCheckout();

  const pendingList = pending.data ?? [];
  const history = (all.data ?? []).filter((a) => a.status !== 'PENDING').map(toHistoryRow);

  const handleReject = (approval: ApprovalDto) =>
  reject.mutate(
    { id: approval.id },
    {
      onSuccess: () => {
        toast('Cart rejected — nothing was charged');
        navigate('/approvals');
      },
      onError: (err) => toast.error(errorMessage(err))
    }
  );

  const handleConfirmed = (purchase: PurchaseDto) => {
    setStepUp(null);
    if (purchase.status === 'READY_FOR_CHECKOUT') {
      toast.success('Approved — taking you to PayPal');
      checkout.start(purchase.id);
    } else {
      toast.success('Approved');
      navigate('/transactions');
    }
  };

  const reviewing = id ? detail.data : undefined;

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 lg:px-8 lg:py-8">
      {id ?
      detail.isLoading ?
      <div className="flex justify-center py-16 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" aria-label="Loading approval" /></div> :
      detail.isError ?
      <PageError error={detail.error} onRetry={() => void detail.refetch()} /> :
      reviewing && reviewing.status === 'PENDING' ?
      <ApprovalDetail
        approval={reviewing}
        onBack={() => navigate('/approvals')}
        onApprove={() => setStepUp(reviewing)}
        onReject={() => handleReject(reviewing)}
        rejecting={reject.isPending} /> :

      reviewing &&
      <Card className="flex max-w-3xl flex-col items-center px-6 py-14 text-center">
              <BadgeCheck className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
              <p className="mt-3 font-medium">This approval is {reviewing.status.toLowerCase()}</p>
              <p className="mt-1 text-sm text-muted-foreground">Nothing left to decide here.</p>
              <Button variant="secondary" className="mt-5" onClick={() => navigate('/approvals')}>All approvals</Button>
            </Card> :


      <>
          <SegmentedTabs
          ariaLabel="Approvals"
          value={tab}
          onChange={setTab}
          className="mb-6"
          options={[
          { value: 'pending', label: 'Pending', count: pendingList.length },
          { value: 'history', label: 'History' }]
          } />
        
          {tab === 'pending' && (
        pending.isError ?
        <PageError error={pending.error} onRetry={() => void pending.refetch()} /> :
        pendingList.length > 0 ?
        <div className="max-w-3xl space-y-3">
                {pendingList.map((approval) =>
          <PendingCard key={approval.id} approval={approval} onReview={() => navigate(`/approvals/${approval.id}`)} />
          )}
              </div> :

        <Card className="flex max-w-3xl flex-col items-center px-6 py-14 text-center">
                <BadgeCheck className="h-8 w-8 text-accent-fg" aria-hidden="true" />
                <p className="mt-3 font-medium">{pending.isLoading ? 'Loading approvals…' : 'No pending approvals'}</p>
                <p className="mt-1 text-sm text-muted-foreground">When a cart needs your OK, it shows up here.</p>
              </Card>)
        }
          {tab === 'history' && <DataGrid ariaLabel="Approval history" columns={columns} rows={history} getRowId={(r) => r.id} layoutKey="approvals-history" rowTone={(r) => (r.status === 'Rejected' || r.status === 'Invalidated' ? 'negative' : r.status === 'Expired' ? 'muted' : undefined)} emptyLabel={all.isLoading ? 'Loading…' : 'No decided approvals yet.'} />}
        </>
      }
      <StepUpDialog approval={stepUp} onClose={() => setStepUp(null)} onConfirmed={handleConfirmed} />
    </div>);

}
