import React, { useState } from 'react';
import { Calendar, Check, Download, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { Select } from '../components/ui/Select';
import { SegmentedTabs } from '../components/ui/SegmentedTabs';
import { DataGrid, Column } from '../components/DataGrid';
import { MerchantAvatar } from '../components/MerchantAvatar';
import { MoneyText } from '../components/MoneyText';
import { StatusChip } from '../components/StatusChip';
import { CopyId } from '../components/CopyId';
import { TransactionPanel } from '../components/transactions/TransactionPanel';
import { ledger, purchases } from '../data/transactions';
import { downloadCsv } from '../utils/csv';
import type { LedgerEntry, Purchase } from '../types/transaction';

type Tab = 'purchases' | 'ledger';
const statusOptions = ['All statuses', 'Completed', 'Failed'] as const;

const purchaseColumns: Column<Purchase>[] = [
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
{ key: 'ps', header: 'Purchase status', render: (r) => <StatusChip label={r.purchaseStatus} /> },
{ key: 'pay', header: 'Payment status', render: (r) => <StatusChip label={r.paymentStatus} /> },
{ key: 'order', header: 'PayPal order ID', render: (r) => <CopyId value={r.orderId} label="PayPal order ID" /> },
{ key: 'auth', header: 'Authorization ID', render: (r) => <span className="font-mono text-xs text-muted-foreground">{r.authorizationId}</span> },
{ key: 'cap', header: 'Capture ID', render: (r) => <span className="font-mono text-xs text-muted-foreground">{r.captureId ?? '—'}</span> },
{
  key: 'final',
  header: 'Final check',
  align: 'center',
  render: (r) =>
  r.finalCheck ?
  <span className="inline-flex items-center gap-1 text-accent-fg"><Check className="h-4 w-4" aria-hidden="true" /><span className="sr-only">Passed</span></span> :

  <span className="inline-flex items-center gap-1 text-blocked-fg"><X className="h-4 w-4" aria-hidden="true" /><span className="sr-only">Failed</span></span>

}];


const ledgerColumns: Column<LedgerEntry>[] = [
{ key: 'time', header: 'Time', render: (r) => <span className="tabular text-muted-foreground">{r.time}</span> },
{ key: 'transition', header: 'Transition', render: (r) => <span className="rounded-md bg-muted px-1.5 py-0.5 font-mono text-[11px] font-medium">{r.transition}</span> },
{
  key: 'bucket',
  header: 'From → To bucket',
  render: (r) =>
  <span className="text-sm">
        <span className="text-muted-foreground">{r.from}</span> → <span className="font-medium">{r.to}</span>
      </span>

},
{ key: 'category', header: 'Category', render: (r) => r.category },
{ key: 'amount', header: 'Amount', align: 'right', render: (r) => <MoneyText amount={r.amount} /> },
{ key: 'source', header: 'Source', render: (r) => <span className="text-muted-foreground">{r.source}</span> }];


export function Transactions() {
  const [tab, setTab] = useState<Tab>('purchases');
  const [status, setStatus] = useState<(typeof statusOptions)[number]>('All statuses');
  const [selected, setSelected] = useState<Purchase | null>(null);

  const rows = status === 'All statuses' ? purchases : purchases.filter((p) => p.purchaseStatus === status);

  const exportCsv = () => {
    if (tab === 'purchases') {
      downloadCsv(
        'guardrail-purchases.csv',
        ['Date', 'Merchant', 'Amount', 'Purchase status', 'Payment status', 'PayPal order ID', 'Authorization ID', 'Capture ID', 'Final check'],
        rows.map((r) => [r.date, r.merchant, r.amount.toFixed(2), r.purchaseStatus, r.paymentStatus, r.orderId, r.authorizationId, r.captureId ?? '', r.finalCheck ? 'Passed' : 'Failed'])
      );
    } else {
      downloadCsv(
        'guardrail-ledger.csv',
        ['Time', 'Transition', 'From', 'To', 'Category', 'Amount', 'Source'],
        ledger.map((r) => [r.time, r.transition, r.from, r.to, r.category, r.amount.toFixed(2), r.source])
      );
    }
    toast.success('CSV exported');
  };

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
          {tab === 'purchases' &&
          <Select aria-label="Filter by status" options={statusOptions} value={status} onChange={(e) => setStatus(e.target.value as (typeof statusOptions)[number])} />
          }
          <Button variant="secondary" size="sm" className="h-9">
            <Calendar className="h-4 w-4 text-muted-foreground" aria-hidden="true" /> Oct 28 – Nov 3
          </Button>
          <Button variant="secondary" size="sm" className="h-9" onClick={exportCsv}>
            <Download className="h-4 w-4 text-muted-foreground" aria-hidden="true" /> Export CSV
          </Button>
        </div>
      </div>

      {tab === 'purchases' ?
      <>
          <div className="hidden md:block">
            <DataGrid ariaLabel="Purchases" columns={purchaseColumns} rows={rows} getRowId={(r) => r.id} onRowClick={setSelected} selectedId={selected?.id} emptyLabel="No purchases match this filter." />
          </div>
          <ul className="space-y-3 md:hidden">
            {rows.map((r) =>
          <li key={r.id}>
                <button type="button" onClick={() => setSelected(r)} className="w-full text-left">
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
          </ul>
        </> :

      <>
          <div className="hidden md:block">
            <DataGrid ariaLabel="Ledger" columns={ledgerColumns} rows={ledger} getRowId={(r) => r.id} />
          </div>
          <ul className="space-y-3 md:hidden">
            {ledger.map((r) =>
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
        </>
      }
      <p className="mt-3 text-xs text-muted-foreground">PayPal IDs are sandbox placeholders.</p>
      <TransactionPanel purchase={selected} onClose={() => setSelected(null)} />
    </div>);

}