import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Loader2, Minus, Package, Plus, Search, ShieldCheck, ShoppingBasket, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { MerchantAvatar } from '../components/MerchantAvatar';
import { MerchantStatusChip } from '../components/MerchantStatusChip';
import { MoneyText } from '../components/MoneyText';
import { BudgetImpactBars } from '../components/BudgetImpactBars';
import { EvaluationCard } from '../components/shopping/EvaluationCard';
import { PageError } from '../components/PageState';
import { useOnline } from '../hooks/useOnline';
import { useStartCheckout } from '../hooks/useStartCheckout';
import { useCart, useCartMutations, useMerchants, useProducts } from '../lib/queries';
import { isApiError, newIdempotencyKey } from '../lib/api';
import { errorMessage } from '../lib/errorCopy';
import type { Cart, PolicyDecision } from '../lib/schemas';
import { merchantAvatar } from '../utils/merchant';
import { categoryName, toReasons } from '../utils/labels';
import { formatApiMoney, toAmount } from '../utils/money';
import { cn } from '../utils/cn';

const MAX_QUANTITY = 99;

/**
 * Manual cart (fallback when the assistant is unavailable) and "Edit cart" for OPEN carts.
 * Same pipeline as the agent: cart → POST /carts/{id}/evaluate → POST /purchases → approval / checkout.
 */
export function CartBuilder() {
  const { cartId } = useParams();
  const navigate = useNavigate();
  const online = useOnline();
  const merchants = useMerchants();
  const existing = useCart(cartId);
  const mutations = useCartMutations();
  const checkout = useStartCheckout();
  const [merchantId, setMerchantId] = useState<string>('');
  const [search, setSearch] = useState('');
  const [query, setQuery] = useState('');
  const [cart, setCart] = useState<Cart | null>(null);
  const [evaluation, setEvaluation] = useState<PolicyDecision | null>(null);
  const purchaseKey = useRef<string | null>(null);

  useEffect(() => {
    if (existing.data) {
      setCart(existing.data);
      setMerchantId(existing.data.merchantId);
    }
  }, [existing.data]);

  // Default to the first approved merchant for a new cart.
  useEffect(() => {
    if (cartId || merchantId || !merchants.data?.length) return;
    setMerchantId((merchants.data.find((m) => m.status === 'APPROVED') ?? merchants.data[0]).id);
  }, [cartId, merchantId, merchants.data]);

  useEffect(() => {
    const t = window.setTimeout(() => setQuery(search.trim()), 250);
    return () => window.clearTimeout(t);
  }, [search]);

  const products = useProducts({ merchantId: merchantId || undefined, query: query || undefined });
  const merchant = merchants.data?.find((m) => m.id === merchantId);
  const editable = !cart || cart.status === 'OPEN';
  const busy = mutations.create.isPending || mutations.add.isPending || mutations.setQuantity.isPending || mutations.remove.isPending;
  // An evaluation only counts for the exact cart version it checked.
  const currentEvaluation = evaluation && cart && evaluation.cartVersion === cart.version ? evaluation : null;
  const quantities = useMemo(() => new Map(cart?.items.map((i) => [i.productId, i.quantity]) ?? []), [cart]);

  const onCartError = (err: unknown) => {
    toast.error(errorMessage(err));
    if (isApiError(err, 'CART_VERSION_MISMATCH') && cart) void existing.refetch().then((r) => r.data && setCart(r.data));
  };

  const addProduct = (productId: string) => {
    if (!merchantId) return;
    const current = quantities.get(productId);
    if (!cart) {
      mutations.create.mutate(
        { merchantId, items: [{ productId, quantity: 1 }] },
        {
          onSuccess: (created) => {
            setCart(created);
            navigate(`/cart/${created.id}`, { replace: true });
          },
          onError: onCartError
        }
      );
    } else if (current) {
      setQuantity(productId, current + 1);
    } else {
      mutations.add.mutate({ cart, productId, quantity: 1 }, { onSuccess: setCart, onError: onCartError });
    }
  };

  const setQuantity = (productId: string, quantity: number) => {
    if (!cart) return;
    if (quantity <= 0) {
      mutations.remove.mutate({ cart, productId }, { onSuccess: setCart, onError: onCartError });
    } else {
      mutations.setQuantity.mutate({ cart, productId, quantity: Math.min(quantity, MAX_QUANTITY) }, { onSuccess: setCart, onError: onCartError });
    }
  };

  const check = () =>
  cart &&
  mutations.evaluate.mutate(cart.id, {
    onSuccess: (result) => {
      setEvaluation(result);
      purchaseKey.current = null;
    },
    onError: (err) => toast.error(errorMessage(err))
  });

  const proceed = () => {
    if (!cart || !currentEvaluation) return;
    purchaseKey.current ??= newIdempotencyKey();
    mutations.purchase.mutate(
      { cartId: cart.id, evaluationId: currentEvaluation.evaluationId, idempotencyKey: purchaseKey.current },
      {
        onSuccess: (purchase) => {
          if (purchase.status === 'AWAITING_APPROVAL' && purchase.approval) {
            toast.success('Sent for your approval');
            navigate(`/approvals/${purchase.approval.id}`);
          } else if (purchase.status === 'READY_FOR_CHECKOUT') {
            checkout.start(purchase.id);
          } else {
            navigate(`/transactions/${purchase.id}`);
          }
        },
        onError: (err) => {
          if (isApiError(err, 'EVALUATION_STALE') || isApiError(err, 'EVALUATION_EXPIRED')) setEvaluation(null);
          toast.error(errorMessage(err));
        }
      }
    );
  };

  if (cartId && existing.isError) {
    return (
      <div className="mx-auto max-w-[1280px] px-4 py-6 lg:px-8 lg:py-8">
        <PageError error={existing.error} onRetry={() => void existing.refetch()} />
      </div>);

  }

  const avatar = merchant ? merchantAvatar(merchant.name) : null;

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-6 lg:px-8 lg:py-8">
      <p className="mb-6 max-w-xl text-sm text-muted-foreground">
        Build a cart yourself. It's checked against your rules exactly like the ones your assistant builds.
      </p>
      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        <Card className="overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center">
            <Select
              aria-label="Merchant"
              options={(merchants.data ?? []).map((m) => m.name)}
              value={merchant?.name ?? ''}
              disabled={!!cart}
              onChange={(e) => setMerchantId(merchants.data?.find((m) => m.name === e.target.value)?.id ?? '')}
              className="sm:w-56" />

            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <input
                type="search"
                aria-label="Search products"
                placeholder="Search products…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-full rounded-btn border border-border bg-card pl-9 pr-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary" />

            </div>
          </div>
          {cart && <p className="border-b border-border bg-muted/40 px-4 py-2 text-xs text-muted-foreground">A cart holds products from one merchant.</p>}
          <ul className="max-h-[560px] divide-y divide-border overflow-y-auto">
            {(products.data?.items ?? []).map((p) => {
              const inCart = quantities.get(p.id);
              return (
                <li key={p.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-btn bg-muted/60">
                    {p.imageUrl ?
                    <img src={p.imageUrl} alt="" loading="lazy" className="h-full w-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} /> :
                    <Package className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    }
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{p.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {categoryName(p.categoryCode)}
                      {p.unitLabel && ` · ${p.unitLabel}`}
                      {!p.isAvailable && ' · Unavailable'}
                    </p>
                  </div>
                  <MoneyText amount={toAmount(p.unitPrice)} className="text-sm" />
                  <Button
                    variant={inCart ? 'secondary' : 'primary'}
                    size="sm"
                    aria-label={`Add ${p.name}`}
                    disabled={!editable || busy || !p.isAvailable || !online}
                    onClick={() => addProduct(p.id)}>

                    <Plus className="h-3.5 w-3.5" aria-hidden="true" /> {inCart ? inCart : 'Add'}
                  </Button>
                </li>);

            })}
            {products.data?.items.length === 0 && <li className="px-4 py-10 text-center text-sm text-muted-foreground">No products match.</li>}
            {products.isLoading && <li className="px-4 py-10 text-center text-sm text-muted-foreground">Loading products…</li>}
          </ul>
        </Card>

        <div className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <Card className="overflow-hidden">
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              {avatar && <MerchantAvatar initials={avatar.initials} hue={avatar.hue} size="sm" />}
              <div className="min-w-0 flex-1">
                <p className="flex items-center gap-2 text-sm font-semibold">
                  {merchant?.name ?? 'Your cart'} {merchant && <MerchantStatusChip status={merchant.status} />}
                </p>
                <p className="text-xs text-muted-foreground">Cart · {cart?.items.length ?? 0} items</p>
              </div>
              {busy ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-label="Updating cart" /> : <ShoppingBasket className="h-4 w-4 text-muted-foreground" aria-hidden="true" />}
            </div>
            {!cart || cart.items.length === 0 ?
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">Add products to start a cart.</p> :

            <ul className="px-4 py-2">
                {cart.items.map((line) =>
              <li key={line.productId} className="flex items-center justify-between gap-3 py-1.5 text-sm">
                    <span className="min-w-0 flex-1 truncate">{line.name}</span>
                    {editable ?
                <span className="flex items-center gap-1">
                        <button type="button" aria-label={`Decrease ${line.name}`} disabled={busy} onClick={() => setQuantity(line.productId, line.quantity - 1)} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50">
                          {line.quantity === 1 ? <Trash2 className="h-3.5 w-3.5" aria-hidden="true" /> : <Minus className="h-3.5 w-3.5" aria-hidden="true" />}
                        </button>
                        <span className="tabular w-6 text-center font-medium">{line.quantity}</span>
                        <button type="button" aria-label={`Increase ${line.name}`} disabled={busy || line.quantity >= MAX_QUANTITY} onClick={() => setQuantity(line.productId, line.quantity + 1)} className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-50">
                          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      </span> :

                <span className="tabular text-muted-foreground">× {line.quantity}</span>
                }
                    <span className="tabular w-16 text-right text-foreground">{formatApiMoney(line.lineTotal)}</span>
                  </li>
              )}
              </ul>
            }
            <div className="flex items-baseline justify-between border-t border-border bg-muted/40 px-4 py-3">
              <span className="text-sm font-medium">Total</span>
              <MoneyText amount={toAmount(cart?.total)} className="text-lg" />
            </div>
          </Card>

          {!editable &&
          <p className="rounded-btn bg-muted px-3 py-2.5 text-sm text-muted-foreground">
              This cart is {cart?.status.toLowerCase().replace('_', ' ')} and can't be changed. <Link to="/transactions" className="font-medium text-primary-ink hover:underline">View transactions</Link>
            </p>
          }

          {editable && cart && cart.items.length > 0 && !currentEvaluation &&
          <Button className="w-full" onClick={check} disabled={busy || mutations.evaluate.isPending || !online}>
              {mutations.evaluate.isPending ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <ShieldCheck className="h-4 w-4" aria-hidden="true" />}
              Check against my rules
            </Button>
          }

          {currentEvaluation &&
          <>
              <EvaluationCard
              decision={currentEvaluation.decision}
              primaryReason={currentEvaluation.reason}
              reasons={toReasons(currentEvaluation.reasons)}
              policyVersionNumber={currentEvaluation.policyVersionNumber}
              defaultOpen={currentEvaluation.decision === 'BLOCKED'}
              footer={
              currentEvaluation.decision === 'BLOCKED' ?
              <Link to="/rules" className="text-sm font-medium text-primary-ink hover:underline">Review your rules</Link> :
              undefined
              }>

                {currentEvaluation.budgetImpacts.length > 0 && <BudgetImpactBars impacts={currentEvaluation.budgetImpacts.slice(0, 2)} afterSuffix=" after purchase" />}
              </EvaluationCard>
              {currentEvaluation.decision !== 'BLOCKED' &&
            <Button className={cn('w-full')} onClick={proceed} disabled={mutations.purchase.isPending || checkout.pending || !online}>
                  {(mutations.purchase.isPending || checkout.pending) && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                  {currentEvaluation.decision === 'ALLOWED' ? 'Pay with PayPal' : `Request approval · ${formatApiMoney(currentEvaluation.purchaseAmount)}`}
                </Button>
            }
            </>
          }
        </div>
      </div>
    </div>);

}
