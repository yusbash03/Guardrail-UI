import React, { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Check, Download, Search, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Select } from '../components/ui/Select';
import { SegmentedTabs } from '../components/ui/SegmentedTabs';
import { DataGrid, Column, RowTone, SortState } from '../components/DataGrid';
import { MerchantAvatar } from '../components/MerchantAvatar';
import { MoneyText } from '../components/MoneyText';
import { StatusChip } from '../components/StatusChip';
import { CopyId } from '../components/CopyId';
import { PageError } from '../components/PageState';
import { TransactionPanel } from '../components/transactions/TransactionPanel';
import { useCategories, useLedgerEntries, usePurchase, useTransactions } from '../lib/queries';
import { buildTimeline } from '../lib/timeline';
import type { LedgerEntryDto, PurchaseDto, TransactionDto } from '../lib/schemas';
import { downloadCsv } from '../utils/csv';
import { merchantAvatar } from '../utils/merchant';
import { categoryName, humanize, isCancellable, paymentStatusLabel, purchaseStatusLabel } from '../utils/labels';
import { formatDate, formatDateTime } from '../utils/time';
import { toAmount } from '../utils/money';
import type { LedgerEntry, Purchase } from '../types/transaction';

type Tab = 'purchases' | 'ledger';
const PAGE_SIZE = 50;

const statusOptions = ['All statuses', 'Completed', 'Failed', 'Awaiting approval', 'Rejected', 'Cancelled', 'Expired'] as const;
const statusCodes: Record<(typeof statusOptions)[number], string | undefined> = {
  'All statuses': undefined,
  Completed: 'COMPLETED',
  Failed: 'FAILED',
  'Awaiting approval': 'AWAITING_APPROVAL',
  Rejected: 'REJECTED',
  Cancelled: 'CANCELLED',
  Expired: 'EXPIRED'
};
const rangeOptions = ['Last 7 days', 'Last 30 days', 'All time'] as const;
const rangeDays: Record<(typeof rangeOptions)[number], number | null> = { 'Last 7 days': 7, 'Last 30 days': 30, 'All time': null };

const sourceLabels: Record<string, string> = { SYSTEM: 'System', USER: 'You', PAYPAL_API: 'PayPal API', PAYPAL_WEBHOOK: 'PayPal webhook', RECONCILER: 'Reconciler', SWEEPER: 'Sweeper' };

function finalCheckOf(t: TransactionDto): boolean | null {
  if (t.status === 'COMPLETED' || t.status === 'REFUNDED' || t.status === 'PARTIALLY_REFUNDED') return true;
  if (t.failureCode === 'FINAL_CHECK_FAILED') return false;
  return null;
}

function toRow(t: TransactionDto): Purchase {
  return {
    id: t.purchaseId,
    date: formatDate(t.createdAt),
    dateTime: formatDateTime(t.createdAt),
    merchant: t.merchantName,
    ...merchantAvatar(t.merchantName),
    amount: toAmount(t.amount),
    purchaseStatus: purchaseStatusLabel(t.status),
    paymentStatus: paymentStatusLabel(t.paymentStatus),
    orderId: t.paypalOrderId ?? null,
    authorizationId: t.paypalAuthorizationId ?? null,
    captureId: t.paypalCaptureId ?? null,
    finalCheck: finalCheckOf(t),
    canCancel: isCancellable(t.status),
    timeline: []
  };
}

const PENDING_LABELS = new Set(['Pending', 'Awaiting approval', 'Ready to pay']);

/** Failed/voided purchases tinted red, in-flight ones grey (AG_GRID_USAGE.md §4). */
const purchaseTone = (r: Purchase): RowTone =>
r.purchaseStatus === 'Failed' || r.paymentStatus === 'Voided' ? 'negative' : PENDING_LABELS.has(r.purchaseStatus) ? 'muted' : undefined;

const ledgerTone = (r: LedgerEntry): RowTone =>
r.transition === 'VOID' || r.transition === 'FAIL' ? 'negative' : r.transition === 'PROPOSE' || r.transition === 'RESERVE' ? 'muted' : undefined;

/** Row for a deep-linked purchase that isn't on the current page. */
function rowFromPurchase(p: PurchaseDto): Purchase {
  return {
    id: p.id,
    date: formatDate(p.createdAt),
    dateTime: formatDateTime(p.createdAt),
    merchant: p.merchantName,
    ...merchantAvatar(p.merchantName),
    amount: toAmount(p.amount),
    purchaseStatus: purchaseStatusLabel(p.status),
    paymentStatus: paymentStatusLabel(p.payment?.status),
    orderId: p.payment?.paypalOrderId ?? null,
    authorizationId: p.payment?.paypalAuthorizationId ?? null,
    captureId: p.payment?.paypalCaptureId ?? null,
    finalCheck: p.payment?.finalCheck ? p.payment.finalCheck.passed : null,
    canCancel: isCancellable(p.status),
    timeline: []
  };
}

const purchaseColumns: Column<Purchase>[] = [
{ key: 'date', header: 'Date', sortField: 'createdAt', width: 110, value: (r) => r.date, render: (r) => <span className="text-muted-foreground">{r.date}</span> },
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
{ key: 'amount', header: 'Amount', align: 'right', sortField: 'amount', width: 120, value: (r) => r.amount.toFixed(2), render: (r) => <MoneyText amount={r.amount} /> },
{ key: 'ps', header: 'Purchase status', sortField: 'status', minWidth: 150, value: (r) => r.purchaseStatus, render: (r) => <StatusChip label={r.purchaseStatus} /> },
{ key: 'pay', header: 'Payment status', minWidth: 140, value: (r) => r.paymentStatus, render: (r) => r.paymentStatus === '—' ? <span className="text-muted-foreground">—</span> : <StatusChip label={r.paymentStatus} /> },
{ key: 'order', header: 'PayPal order ID', minWidth: 200, value: (r) => r.orderId, render: (r) => r.orderId ? <CopyId value={r.orderId} label="PayPal order ID" /> : <span className="text-muted-foreground">—</span> },
{ key: 'auth', header: 'Authorization ID', minWidth: 170, value: (r) => r.authorizationId, render: (r) => <span className="font-mono text-xs text-muted-foreground">{r.authorizationId ?? '—'}</span> },
{ key: 'cap', header: 'Capture ID', minWidth: 170, value: (r) => r.captureId, render: (r) => <span className="font-mono text-xs text-muted-foreground">{r.captureId ?? '—'}</span> },
{
  key: 'final',
  header: 'Final check',
  width: 110,
  align: 'center',
  render: (r) =>
  r.finalCheck === null ?
  <span className="text-muted-foreground">—</span> :
  r.finalCheck ?
  <span className="inline-flex items-center gap-1 text-accent-fg"><Check className="h-4 w-4" aria-hidden="true" /><span className="sr-only">Passed</span></span> :

  <span className="inline-flex items-center gap-1 text-blocked-fg"><X className="h-4 w-4" aria-hidden="true" /><span className="sr-only">Failed</span></span>

}];


const ledgerColumns: Column<LedgerEntry>[] = [
{ key: 'time', header: 'Time', minWidth: 170, value: (r) => r.time, render: (r) => <span className="tabular text-muted-foreground">{r.time}</span> },
{ key: 'transition', header: 'Transition', minWidth: 170, value: (r) => r.transition, render: (r) => <span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[11px] font-medium">{r.transition}</span> },
{
  key: 'bucket',
  header: 'From → To bucket',
  minWidth: 200,
  value: (r) => `${r.from} → ${r.to}`,
  render: (r) =>
  <span className="text-sm">
        <span className="text-muted-foreground">{r.from}</span> → <span className="font-medium">{r.to}</span>
      </span>

},
{ key: 'category', header: 'Category', value: (r) => r.category, render: (r) => r.category },
{ key: 'amount', header: 'Amount', align: 'right', width: 120, value: (r) => r.amount, render: (r) => <MoneyText amount={r.amount} /> },
{ key: 'source', header: 'Source', value: (r) => r.source, render: (r) => <span className="text-muted-foreground">{r.source}</span> }];


function Pager({ page, total, onChange }: {page: number;total: number;onChange: (page: number) => void;}) {
  const pages = Math.ceil(total / PAGE_SIZE);
  if (pages <= 1) return null;
  return (
    <div className="mt-3 flex items-center justify-end gap-2 text-sm text-muted-foreground">
      <span className="tabular">Page {page} of {pages}</span>
      <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>Previous</Button>
      <Button variant="secondary" size="sm" disabled={page >= pages} onClick={() => onChange(page + 1)}>Next</Button>
    </div>);

}

/** Detail panel: PurchaseDto + its ledger entries → status timeline. Works for deep links too. */
function useSelectedPurchase(id: string | undefined, listRow: Purchase | undefined): Purchase | null {
  const purchase = usePurchase(id);
  const entries = useLedgerEntries({ purchaseId: id }, !!id);
  return useMemo(() => {
    if (!id) return null;
    const p = purchase.data;
    const row = listRow ?? (p ? rowFromPurchase(p) : null);
    if (!row || !p) return row;
    return {
      ...row,
      authorizationId: p.payment?.paypalAuthorizationId ?? row.authorizationId,
      captureId: p.payment?.paypalCaptureId ?? row.captureId,
      orderId: p.payment?.paypalOrderId ?? row.orderId,
      finalCheck: p.payment?.finalCheck ? p.payment.finalCheck.passed : row.finalCheck,
      purchaseStatus: purchaseStatusLabel(p.status),
      paymentStatus: paymentStatusLabel(p.payment?.status),
      canCancel: isCancellable(p.status),
      timeline: buildTimeline(p, entries.data?.items ?? [])
    };
  }, [id, listRow, purchase.data, entries.data]);
}

export function Transactions() {
  const { purchaseId } = useParams();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('purchases');
  const [sort, setSort] = useState<SortState>({ field: 'createdAt', direction: 'desc' });
  const [status, setStatus] = useState<(typeof statusOptions)[number]>('All statuses');
  const [range, setRange] = useState<(typeof rangeOptions)[number]>('Last 30 days');
  const [page, setPage] = useState(1);
  const [ledgerPage, setLedgerPage] = useState(1);
  const [search, setSearch] = useState('');
  const categories = useCategories();

  const from = useMemo(() => {
    const days = rangeDays[range];
    return days === null ? undefined : new Date(Date.now() - days * 86_400_000).toISOString();
  }, [range]);

  const transactions = useTransactions({ status: statusCodes[status], from, sort: `${sort.field}:${sort.direction}`, page, pageSize: PAGE_SIZE });
  const ledger = useLedgerEntries({ from, page: ledgerPage, pageSize: PAGE_SIZE }, tab === 'ledger');

  const rows = (transactions.data?.items ?? []).map(toRow);
  const detail = useSelectedPurchase(purchaseId, rows.find((r) => r.id === purchaseId));
  const open = (row: Purchase) => navigate(`/transactions/${row.id}`);
  const ledgerRows: LedgerEntry[] = (ledger.data?.items ?? []).map((e: LedgerEntryDto) => ({
    id: e.id,
    time: formatDateTime(e.occurredAt),
    transition: e.transition,
    from: humanize(e.fromBucket),
    to: humanize(e.toBucket),
    category: categoryName(e.categoryCode, categories.data),
    amount: toAmount(e.amount),
    source: sourceLabels[e.source] ?? humanize(e.source)
  }));

  const exportCsv = () => {
    if (tab === 'purchases') {
      downloadCsv(
        'guardrail-purchases.csv',
        ['Date', 'Merchant', 'Amount', 'Purchase status', 'Payment status', 'PayPal order ID', 'Authorization ID', 'Capture ID', 'Final check'],
        rows.map((r) => [r.date, r.merchant, r.amount.toFixed(2), r.purchaseStatus, r.paymentStatus, r.orderId ?? '', r.authorizationId ?? '', r.captureId ?? '', r.finalCheck === null ? '' : r.finalCheck ? 'Passed' : 'Failed'])
      );
    } else {
      downloadCsv(
        'guardrail-ledger.csv',
        ['Time', 'Transition', 'From', 'To', 'Category', 'Amount', 'Source'],
        ledgerRows.map((r) => [r.time, r.transition, r.from, r.to, r.category, r.amount.toFixed(2), r.source])
      );
    }
    toast.success('CSV exported');
  };

  const activeQuery = tab === 'purchases' ? transactions : ledger;

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-6 lg:px-8 lg:py-8">
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <SegmentedTabs
          ariaLabel="Transactions view"
          value={tab}
          onChange={setTab}
          options={[
          { value: 'purchases', label: 'Purchases' },
          { value: 'ledger', label: 'Ledger' }]
          } />
        
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative hidden md:block">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
            <input
              type="search"
              aria-label={`Search ${tab}`}
              placeholder="Search this page…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-56 rounded-btn border border-border bg-card pl-9 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" />
            
          </div>
          {tab === 'purchases' &&
          <Select
            aria-label="Filter by status"
            options={statusOptions}
            value={status}
            onChange={(e) => {
              setStatus(e.target.value as (typeof statusOptions)[number]);
              setPage(1);
            }} />
          }
          <Select
            aria-label="Date range"
            options={rangeOptions}
            value={range}
            onChange={(e) => {
              setRange(e.target.value as (typeof rangeOptions)[number]);
              setPage(1);
              setLedgerPage(1);
            }} />
          
          <Button variant="secondary" size="sm" className="h-9" onClick={exportCsv}>
            <Download className="h-4 w-4 text-muted-foreground" aria-hidden="true" /> Export CSV
          </Button>
        </div>
      </div>

      {activeQuery.isError ?
      <PageError error={activeQuery.error} onRetry={() => void activeQuery.refetch()} /> :
      tab === 'purchases' ?
      <>
          <div className="hidden md:block">
            <DataGrid
            ariaLabel="Purchases"
            columns={purchaseColumns}
            rows={rows}
            getRowId={(r) => r.id}
            onRowClick={open}
            selectedId={purchaseId}
            quickFilter={search}
            rowTone={purchaseTone}
            layoutKey="transactions-purchases"
            loading={transactions.isFetching && !transactions.isLoading}
            sort={sort}
            onSortChange={(next) => {
              setSort(next);
              setPage(1);
            }}
            emptyLabel={transactions.isLoading ? 'Loading…' : 'No purchases match this filter.'} />
          
          </div>
          <ul className="space-y-3 md:hidden">
            {rows.map((r) =>
          <li key={r.id}>
                <button type="button" onClick={() => open(r)} className="w-full text-left">
                  <Card className="flex items-center gap-3 p-4">
                    <MerchantAvatar initials={r.initials} hue={r.hue} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{r.merchant}</p>
                      <p className="text-xs text-muted-foreground">{r.date} · Payment {r.paymentStatus.toLowerCase()}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <MoneyText amount={r.amount} />
                      <StatusChip label={r.purchaseStatus} />
                    </div>
                  </Card>
                </button>
              </li>
          )}
            {rows.length === 0 && <li className="py-10 text-center text-sm text-muted-foreground">{transactions.isLoading ? 'Loading…' : 'No purchases match this filter.'}</li>}
          </ul>
          <Pager page={page} total={transactions.data?.totalCount ?? 0} onChange={setPage} />
        </> :

      <>
          <div className="hidden md:block">
            <DataGrid
            ariaLabel="Ledger"
            columns={ledgerColumns}
            rows={ledgerRows}
            getRowId={(r) => r.id}
            quickFilter={search}
            rowTone={ledgerTone}
            layoutKey="transactions-ledger"
            emptyLabel={ledger.isLoading ? 'Loading…' : 'No ledger entries in this range.'} />
            
          </div>
          <ul className="space-y-3 md:hidden">
            {ledgerRows.map((r) =>
          <li key={r.id}>
                <Card className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[11px] font-medium">{r.transition}</span>
                    <MoneyText amount={r.amount} />
                  </div>
                  <p className="mt-2 text-sm">
                    <span className="text-muted-foreground">{r.from}</span> → <span className="font-medium">{r.to}</span> · {r.category}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{r.time} · {r.source}</p>
                </Card>
              </li>
          )}
          </ul>
          <Pager page={ledgerPage} total={ledger.data?.totalCount ?? 0} onChange={setLedgerPage} />
        </>
      }
      <p className="mt-3 text-xs text-muted-foreground">PayPal IDs are from the PayPal Sandbox.</p>
      <TransactionPanel purchase={detail} onClose={() => navigate('/transactions')} />
    </div>);

}
