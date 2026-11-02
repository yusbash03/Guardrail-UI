import React from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Package } from 'lucide-react';
import { z } from 'zod';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { CartCard } from './CartCard';
import { EvaluationCard } from './EvaluationCard';
import { ApprovalCard } from './ApprovalCard';
import { BudgetImpactBars } from '../BudgetImpactBars';
import { BudgetBar } from '../BudgetBar';
import { MerchantAvatar } from '../MerchantAvatar';
import { MerchantStatusChip } from '../MerchantStatusChip';
import { MoneyText } from '../MoneyText';
import { StatusChip } from '../StatusChip';
import { StatusTimeline } from '../StatusTimeline';
import {
  ApprovalSchema,
  CartSchema,
  LedgerSummarySchema,
  MerchantSchema,
  PolicyDecisionSchema,
  ProductSchema,
  PurchaseSchema,
  type ApprovalDto,
  type HydratedCard,
  type Product,
  type PurchaseDto,
} from '../../lib/schemas';
import { buildTimeline } from '../../lib/timeline';
import { useOnline } from '../../hooks/useOnline';
import { merchantAvatar } from '../../utils/merchant';
import { categoryName, purchaseStatusLabel, toReasons } from '../../utils/labels';
import { formatApiMoney, toAmount } from '../../utils/money';

function ProductTile({ product }: { product: Product }) {
  return (
    <Card className="w-44 shrink-0 overflow-hidden">
      <div className="flex h-24 items-center justify-center bg-muted/60">
        {product.imageUrl ?
        <img src={product.imageUrl} alt="" loading="lazy" className="h-full w-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} /> :
        <Package className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
        }
      </div>
      <div className="space-y-1.5 p-3">
        <p className="line-clamp-2 text-sm font-medium leading-snug">{product.name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {product.merchantName}
          {product.unitLabel && ` · ${product.unitLabel}`}
        </p>
        <div className="flex items-center justify-between gap-2">
          <MoneyText amount={toAmount(product.unitPrice)} className="text-sm" />
          <MerchantStatusChip status={product.merchantStatus} />
        </div>
      </div>
    </Card>);

}

function PurchaseCard({ purchase, onPay, paying }: { purchase: PurchaseDto; onPay: (id: string) => void; paying: boolean }) {
  const online = useOnline();
  const avatar = merchantAvatar(purchase.merchantName);
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <MerchantAvatar initials={avatar.initials} hue={avatar.hue} size="sm" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{purchase.merchantName}</p>
          <StatusChip label={purchaseStatusLabel(purchase.status)} />
        </div>
        <MoneyText amount={toAmount(purchase.amount)} className="text-lg" />
      </div>
      <div className="mt-4">
        <StatusTimeline steps={buildTimeline(purchase)} />
      </div>
      {purchase.status === 'READY_FOR_CHECKOUT' &&
      <Button className="mt-4 w-full" onClick={() => onPay(purchase.id)} disabled={paying || !online}>
          {paying && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          Pay with PayPal
        </Button>
      }
    </Card>);

}

interface AgentCardsProps {
  cards: HydratedCard[];
  onApprove: (approval: ApprovalDto) => void;
  onReject: (approval: ApprovalDto) => void;
  rejectingId?: string | null;
  onPay: (purchaseId: string) => void;
  paying: boolean;
}

/** Renders server-hydrated agent cards (API_CONTRACT.md card types). Unknown or malformed cards are skipped. */
export function AgentCards({ cards, onApprove, onReject, rejectingId, onPay, paying }: AgentCardsProps) {
  return (
    <>
      {cards.map((card, index) => {
        const key = `${card.type}-${card.id ?? index}`;
        switch (card.type) {
          case 'CART':{
              const cart = CartSchema.safeParse(card.data);
              return cart.success ? <CartCard key={key} cart={cart.data} /> : null;
            }
          case 'EVALUATION':{
              const evaluation = PolicyDecisionSchema.safeParse(card.data);
              if (!evaluation.success) return null;
              const d = evaluation.data;
              return (
                <EvaluationCard
                  key={key}
                  decision={d.decision}
                  primaryReason={d.reason}
                  reasons={toReasons(d.reasons)}
                  policyVersionNumber={d.policyVersionNumber}
                  footer={
                  d.decision === 'BLOCKED' ?
                  <Link to="/rules" className="text-sm font-medium text-primary-ink hover:underline">
                          Review your rules
                        </Link> :
                  undefined
                  }>

                  {d.budgetImpacts.length > 0 ?
                  <BudgetImpactBars impacts={d.budgetImpacts.slice(0, 2)} showLegend afterSuffix=" after purchase" /> :

                  <div className="flex items-baseline justify-between rounded-btn bg-muted/60 px-3 py-2 text-sm">
                      <span className="text-muted-foreground">Cart total</span>
                      <MoneyText amount={toAmount(d.purchaseAmount)} />
                    </div>
                  }
                </EvaluationCard>);

            }
          case 'APPROVAL':{
              const approval = ApprovalSchema.safeParse(card.data);
              if (!approval.success) return null;
              return (
                <ApprovalCard
                  key={key}
                  approval={approval.data}
                  onApprove={() => onApprove(approval.data)}
                  onReject={() => onReject(approval.data)}
                  rejecting={rejectingId === approval.data.id} />);

            }
          case 'PURCHASE':{
              const purchase = PurchaseSchema.safeParse(card.data);
              return purchase.success ? <PurchaseCard key={key} purchase={purchase.data} onPay={onPay} paying={paying} /> : null;
            }
          case 'PRODUCT':
          case 'PRODUCT_LIST':{
              const products = z.array(ProductSchema).safeParse(card.type === 'PRODUCT' ? [card.data] : card.data);
              if (!products.success || products.data.length === 0) return null;
              return (
                <div key={key} className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1" role="list" aria-label="Products">
                  {products.data.map((p) =>
                  <div key={p.id} role="listitem">
                      <ProductTile product={p} />
                    </div>
                  )}
                </div>);

            }
          case 'MERCHANT_LIST':{
              const merchants = z.array(MerchantSchema).safeParse(card.data);
              if (!merchants.success) return null;
              return (
                <Card key={key} className="divide-y divide-border">
                  {merchants.data.map((m) => {
                    const avatar = merchantAvatar(m.name);
                    return (
                      <div key={m.id} className="flex items-center gap-3 px-4 py-3">
                        <MerchantAvatar initials={avatar.initials} hue={avatar.hue} size="sm" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium">{m.name}</p>
                          <p className="truncate text-xs text-muted-foreground">{m.categoryCodes.map((c) => categoryName(c)).join(', ')}</p>
                        </div>
                        <MerchantStatusChip status={m.status} />
                      </div>);

                  })}
                </Card>);

            }
          case 'BUDGET':{
              const summary = LedgerSummarySchema.safeParse(card.data);
              if (!summary.success) return null;
              return (
                <Card key={key} className="space-y-4 p-4">
                  {summary.data.categories.filter((c) => c.limit).map((c) =>
                  <BudgetBar
                    key={c.categoryCode}
                    label={categoryName(c.categoryCode)}
                    period="Weekly"
                    spent={toAmount(c.spent)}
                    pending={toAmount(c.pending)}
                    limit={toAmount(c.limit)}
                    rightLabel={`${formatApiMoney(c.remaining)} left of ${formatApiMoney(c.limit)}`} />
                  )}
                  {summary.data.overall.limit &&
                  <BudgetBar
                    label="Overall"
                    period="Weekly"
                    spent={toAmount(summary.data.overall.spent)}
                    pending={toAmount(summary.data.overall.pending)}
                    limit={toAmount(summary.data.overall.limit)}
                    rightLabel={`${formatApiMoney(summary.data.overall.remaining)} left of ${formatApiMoney(summary.data.overall.limit)}`} />
                  }
                </Card>);

            }
          case 'POLICY_SUMMARY':
            return (
              <Link key={key} to="/rules" className="inline-block text-sm font-medium text-primary-ink hover:underline">
                View your spending rules
              </Link>);

          default:
            return null;
        }
      })}
    </>);

}
