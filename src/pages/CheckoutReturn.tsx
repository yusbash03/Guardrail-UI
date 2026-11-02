import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, CheckCircle2, CircleSlash, Loader2, ShieldX } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Logo } from '../components/Logo';
import { SandboxBadge } from '../components/layout/SandboxBadge';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusTimeline } from '../components/StatusTimeline';
import { ReasonList } from '../components/ReasonList';
import { useStartCheckout } from '../hooks/useStartCheckout';
import { api, isApiError, newIdempotencyKey } from '../lib/api';
import { errorMessage } from '../lib/errorCopy';
import { capturePurchase, invalidateMoney, useCancelPurchase, useLedgerSummary, usePurchase } from '../lib/queries';
import { PurchaseSchema, type PurchaseDto, type PurchaseStatus } from '../lib/schemas';
import { categoryName } from '../utils/labels';
import { formatApiMoney } from '../utils/money';
import type { Reason } from '../types/reason';
import type { TimelineStep } from '../types/transaction';

type Phase = 'progress' | 'success' | 'stopped' | 'cancelled' | 'pending' | 'error';

const stepLabels = [
{ done: 'Confirmed with PayPal', active: 'Confirming with PayPal…' },
{ done: 'Funds authorized', active: 'Authorizing funds…' },
{ done: 'Final guardrail check passed', active: 'Final guardrail check…' },
{ done: 'Captured', active: 'Capturing…' }];


const POLL_MS = 2_000;
const POLL_LIMIT_MS = 30_000;
const PENDING: PurchaseStatus[] = ['PAYER_APPROVED', 'PAYMENT_AUTHORIZED', 'CAPTURE_PENDING', 'CHECKOUT_PENDING'];
const stepsDone: Partial<Record<PurchaseStatus, number>> = { PAYER_APPROVED: 1, PAYMENT_AUTHORIZED: 2, CAPTURE_PENDING: 3, COMPLETED: 4 };

/** sessionStorage holds only the opaque idempotency key per purchase (PWA_REQUIREMENTS.md §4). */
function captureKey(purchaseId: string): string {
  const storageKey = `guardrail:capture:${purchaseId}`;
  try {
    const existing = sessionStorage.getItem(storageKey);
    if (existing) return existing;
    const key = newIdempotencyKey();
    sessionStorage.setItem(storageKey, key);
    return key;
  } catch {
    return newIdempotencyKey();
  }
}

function finalCheckReasons(data: Record<string, unknown> | null, purchase?: PurchaseDto): Reason[] {
  const fromError = Array.isArray(data?.reasons) ? (data.reasons as Array<{ code?: string; message?: string }>) : [];
  const fromPurchase = purchase?.payment?.finalCheck?.reasons ?? [];
  const reasons = fromError.length ? fromError : fromPurchase;
  return reasons.map((r, i) => ({
    id: `${r.code ?? 'reason'}-${i}`,
    severity: 'BLOCK',
    message: r.message ?? 'Your rules no longer allow this purchase.',
    ruleType: r.code ?? 'FINAL_CHECK',
    detail: 'The final check runs right before capture, against your rules at that moment.'
  }));
}

export function CheckoutReturn({ cancelled = false }: {cancelled?: boolean;}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [params] = useSearchParams();
  const purchaseId = params.get('purchaseId');
  const purchaseQuery = usePurchase(purchaseId);
  const weekly = useLedgerSummary('WEEKLY');
  const cancel = useCancelPurchase();
  const checkout = useStartCheckout();
  const [phase, setPhase] = useState<Phase>(cancelled ? 'cancelled' : 'progress');
  const [done, setDone] = useState(0);
  const [purchase, setPurchase] = useState<PurchaseDto | null>(null);
  const [reasons, setReasons] = useState<Reason[]>([]);
  const [error, setError] = useState<string | null>(null);
  const started = useRef(false);

  const known = purchase ?? purchaseQuery.data ?? null;

  useEffect(() => {
    if (cancelled || started.current) return;
    started.current = true;
    if (!purchaseId) {
      setError('This link is missing its purchase. Open the purchase from Transactions.');
      setPhase('error');
      return;
    }

    let stopped = false;
    const finish = async (p: PurchaseDto) => {
      setPurchase(p);
      setDone(stepsDone[p.status] ?? 0);
      if (p.status === 'COMPLETED') {
        await invalidateMoney(queryClient);
        window.setTimeout(() => !stopped && setPhase('success'), 450);
        return true;
      }
      if (p.status === 'FAILED' && p.payment?.finalCheck && !p.payment.finalCheck.passed) {
        setReasons(finalCheckReasons(null, p));
        setPhase('stopped');
        return true;
      }
      if (!PENDING.includes(p.status)) {
        setError(`This purchase is ${p.status.toLowerCase().replace(/_/g, ' ')}.`);
        setPhase('error');
        return true;
      }
      return false;
    };

    const poll = async () => {
      const deadline = Date.now() + POLL_LIMIT_MS;
      while (!stopped && Date.now() < deadline) {
        await new Promise((r) => window.setTimeout(r, POLL_MS));
        const p = await api(`/purchases/${purchaseId}`, { schema: PurchaseSchema });
        if (await finish(p)) return;
      }
      if (!stopped) setPhase('pending');
    };

    (async () => {
      try {
        const { status, data } = await capturePurchase(purchaseId, captureKey(purchaseId));
        const parsed = PurchaseSchema.safeParse(data);
        if (status === 200 && parsed.success && (await finish(parsed.data))) return;
        setDone((d) => Math.max(d, 1));
        await poll();
      } catch (err) {
        if (isApiError(err, 'FINAL_CHECK_FAILED')) {
          setDone(2);
          setReasons(finalCheckReasons(err.data));
          await invalidateMoney(queryClient);
          setPhase('stopped');
          return;
        }
        if (isApiError(err, 'IDEMPOTENCY_IN_PROGRESS')) {
          await poll();
          return;
        }
        setError(errorMessage(err));
        setPhase('error');
      }
    })();

    return () => {
      stopped = true;
    };
  }, [cancelled, purchaseId, queryClient]);

  const steps: TimelineStep[] = stepLabels.map((s, i) => ({
    label: i < done ? s.done : i === done ? s.active : s.done.replace(' passed', ''),
    state: i < done ? 'done' : i === done ? 'current' : 'upcoming'
  }));

  const amount = known ? formatApiMoney(known.amount) : '';
  const merchant = known?.merchantName ?? '';
  const category = known?.items[0]?.categoryCode;
  const categorySummary = weekly.data?.categories.find((c) => c.categoryCode === category && c.limit);

  const cancelPurchase = () => {
    if (!purchaseId) return navigate('/shop');
    cancel.mutate(purchaseId, {
      onSuccess: () => {
        toast('Purchase cancelled — nothing was charged');
        navigate('/shop');
      },
      onError: (err) => toast.error(errorMessage(err))
    });
  };

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 lg:px-8">
        <Logo />
        <SandboxBadge />
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={phase}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="w-full max-w-md">

            <Card className="p-6 sm:p-8">
              {phase === 'progress' &&
              <div aria-live="polite">
                  <h1 className="text-xl font-semibold tracking-tight">Confirming your payment</h1>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {known ? `${amount} at ${merchant} · ` : ''}don't close this page.
                  </p>
                  <div className="mt-6">
                    <StatusTimeline steps={steps} />
                  </div>
                </div>
              }

              {phase === 'success' &&
              <div className="text-center" aria-live="polite">
                  <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-accent-fg">
                    <CheckCircle2 className="h-9 w-9" aria-hidden="true" />
                  </span>
                  <h1 className="mt-5 text-xl font-semibold tracking-tight">
                    Payment complete — <span className="tabular">{amount}</span> at {merchant}
                  </h1>
                  {categorySummary &&
                <p className="mt-2 text-sm text-muted-foreground">
                      You have <span className="tabular font-semibold text-accent-fg">{formatApiMoney(categorySummary.remaining)}</span> left in{' '}
                      {categoryName(categorySummary.categoryCode)} this week.
                    </p>
                }
                  <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-center">
                    <Button variant="secondary" onClick={() => navigate('/transactions')}>View transaction</Button>
                    <Button onClick={() => navigate('/shop')}>Back to shopping</Button>
                  </div>
                </div>
              }

              {phase === 'stopped' &&
              <div aria-live="polite">
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-blocked/10 text-blocked-fg">
                    <ShieldX className="h-8 w-8" aria-hidden="true" />
                  </span>
                  <h1 className="mt-5 text-xl font-semibold tracking-tight">Payment stopped by your rules</h1>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Your rules changed after you approved. Your PayPal authorization was voided — you weren't charged.
                  </p>
                  {reasons.length > 0 &&
                <div className="mt-5">
                      <ReasonList reasons={reasons} />
                    </div>
                }
                  <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <Button variant="secondary" onClick={() => navigate('/shop')}>Back to shopping</Button>
                    <Button onClick={() => navigate('/rules')}>Review rules</Button>
                  </div>
                </div>
              }

              {phase === 'pending' &&
              <div className="text-center" aria-live="polite">
                  <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-approval/10 text-approval-fg">
                    <Loader2 className="h-8 w-8 animate-spin" aria-hidden="true" />
                  </span>
                  <h1 className="mt-5 text-xl font-semibold tracking-tight">Still confirming with PayPal</h1>
                  <p className="mt-2 text-sm text-muted-foreground">
                    This is taking longer than usual. We'll finish in the background — check Transactions for the result.
                  </p>
                  <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-center">
                    <Button variant="secondary" onClick={() => navigate('/shop')}>Back to shopping</Button>
                    <Button onClick={() => navigate('/transactions')}>View transactions</Button>
                  </div>
                </div>
              }

              {phase === 'error' &&
              <div className="text-center" aria-live="polite">
                  <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-approval/10 text-approval-fg">
                    <AlertTriangle className="h-8 w-8" aria-hidden="true" />
                  </span>
                  <h1 className="mt-5 text-xl font-semibold tracking-tight">Payment not completed</h1>
                  <p className="mt-2 text-sm text-muted-foreground">{error}</p>
                  <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-center">
                    <Button variant="secondary" onClick={() => navigate('/transactions')}>View transactions</Button>
                    <Button onClick={() => navigate('/shop')}>Back to shopping</Button>
                  </div>
                </div>
              }

              {phase === 'cancelled' &&
              <div className="text-center">
                  <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <CircleSlash className="h-8 w-8" aria-hidden="true" />
                  </span>
                  <h1 className="mt-5 text-xl font-semibold tracking-tight">Payment not completed</h1>
                  <p className="mt-2 text-sm text-muted-foreground">You left PayPal before confirming. Nothing was charged and your approved cart is saved.</p>
                  <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-center">
                    <Button variant="secondary" onClick={cancelPurchase} disabled={cancel.isPending}>
                      Cancel purchase
                    </Button>
                    <Button onClick={() => purchaseId && checkout.start(purchaseId)} disabled={!purchaseId || checkout.pending}>
                      {checkout.pending && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                      Try again
                    </Button>
                  </div>
                </div>
              }
            </Card>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>);

}
