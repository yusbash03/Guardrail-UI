import React, { ReactNode, useState } from 'react';
import { toast } from 'sonner';
import { SegmentedTabs } from '../components/ui/SegmentedTabs';
import { Card } from '../components/ui/Card';
import { MoneyText } from '../components/MoneyText';
import { DecisionBadge } from '../components/DecisionBadge';
import { BudgetBar } from '../components/BudgetBar';
import { BudgetRing } from '../components/BudgetRing';
import { MerchantStatusChip } from '../components/MerchantStatusChip';
import { ReasonList } from '../components/ReasonList';
import { StatusTimeline } from '../components/StatusTimeline';
import { StepUpPanel } from '../components/StepUpPanel';
import { ToolTrace } from '../components/ToolTrace';
import { DataGrid, Column } from '../components/DataGrid';
import { StatusChip } from '../components/StatusChip';
import { approvalReasons, blockedReasons } from '../data/reasons';
import { purchases } from '../data/transactions';
import { toolTraceSteps } from '../data/conversations';
import { useTheme } from '../contexts/ThemeContext';
import type { Purchase } from '../types/transaction';

const gridColumns: Column<Purchase>[] = [
{ key: 'date', header: 'Date', render: (r) => <span className="text-muted-foreground">{r.date}</span> },
{ key: 'merchant', header: 'Merchant', render: (r) => <span className="font-medium">{r.merchant}</span> },
{ key: 'amount', header: 'Amount', align: 'right', render: (r) => <MoneyText amount={r.amount} /> },
{ key: 'status', header: 'Purchase status', render: (r) => <StatusChip label={r.purchaseStatus} /> },
{ key: 'payment', header: 'Payment status', render: (r) => <StatusChip label={r.paymentStatus} /> }];


function Specimen({ index, title, children }: {index: number;title: string;children: ReactNode;}) {
  return (
    <section aria-labelledby={`spec-${index}`} className="border-t border-border py-8 first:border-0 first:pt-0">
      <h2 id={`spec-${index}`} className="mb-4 text-sm font-semibold">
        <span className="tabular mr-2 text-muted-foreground">{index}.</span>
        {title}
      </h2>
      {children}
    </section>);

}

export function ComponentSheet() {
  const { dark } = useTheme();
  const [mode, setMode] = useState<'light' | 'dark'>(dark ? 'dark' : 'light');

  return (
    <div className="mx-auto max-w-[1180px] px-4 py-6 lg:px-8 lg:py-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">Shared building blocks used across every screen.</p>
        <SegmentedTabs
          ariaLabel="Preview mode"
          value={mode}
          onChange={setMode}
          options={[
          { value: 'light', label: 'Light' },
          { value: 'dark', label: 'Dark' }]
          } />
        
      </div>
      <div className={mode}>
        <Card className="bg-background p-5 text-foreground lg:p-8">
          <Specimen index={1} title="MoneyText">
            <div className="flex items-baseline gap-6">
              <MoneyText amount={43} className="text-[32px]" />
              <MoneyText amount={43} />
              <MoneyText amount={-12} />
            </div>
          </Specimen>
          <Specimen index={2} title="DecisionBadge">
            <div className="flex flex-wrap gap-3">
              <DecisionBadge decision="ALLOWED" />
              <DecisionBadge decision="REQUIRES_APPROVAL" />
              <DecisionBadge decision="BLOCKED" />
            </div>
          </Specimen>
          <Specimen index={3} title="BudgetBar">
            <div className="grid gap-6 md:grid-cols-2">
              <BudgetBar label="Groceries" period="Weekly" spent={43} limit={80} showLegend />
              <BudgetBar label="Groceries" period="Weekly" spent={72} pending={18} limit={80} showLegend />
            </div>
          </Specimen>
          <Specimen index={4} title="BudgetRing">
            <div className="flex flex-wrap gap-10">
              <BudgetRing label="Weekly" spent={43} limit={200} />
              <BudgetRing label="Monthly" spent={155.4} limit={600} />
            </div>
          </Specimen>
          <Specimen index={5} title="MerchantStatusChip">
            <div className="flex gap-3">
              <MerchantStatusChip status="APPROVED" />
              <MerchantStatusChip status="BLOCKED" />
              <MerchantStatusChip status="NEW" />
            </div>
          </Specimen>
          <Specimen index={6} title="ReasonList">
            <div className="max-w-xl">
              <ReasonList reasons={[...approvalReasons, ...blockedReasons]} />
            </div>
          </Specimen>
          <Specimen index={7} title="StatusTimeline">
            <div className="grid gap-8 md:grid-cols-2">
              <StatusTimeline steps={purchases[0].timeline} />
              <StatusTimeline steps={purchases[2].timeline} />
            </div>
          </Specimen>
          <Specimen index={8} title="StepUpDialog">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="shadow-lift">
                <StepUpPanel amount={43} merchant="FreshMart" autoFocus={false} onCancel={() => undefined} onConfirmed={() => toast.success('Confirmed')} />
              </Card>
              <Card className="shadow-lift">
                <StepUpPanel amount={43} merchant="FreshMart" autoFocus={false} startLocked onCancel={() => undefined} onConfirmed={() => undefined} />
              </Card>
            </div>
          </Specimen>
          <Specimen index={9} title="ToolTrace">
            <div className="max-w-xl">
              <ToolTrace steps={toolTraceSteps} />
            </div>
          </Specimen>
          <Specimen index={10} title="DataGrid">
            <DataGrid ariaLabel="Sample purchases" columns={gridColumns} rows={purchases} getRowId={(r) => r.id} />
          </Specimen>
        </Card>
      </div>
    </div>);

}