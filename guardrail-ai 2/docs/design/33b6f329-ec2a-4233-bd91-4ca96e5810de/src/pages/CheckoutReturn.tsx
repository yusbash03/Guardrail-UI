import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, CircleSlash, ShieldX } from 'lucide-react';
import { toast } from 'sonner';
import { Logo } from '../components/Logo';
import { SandboxBadge } from '../components/layout/SandboxBadge';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { StatusTimeline } from '../components/StatusTimeline';
import { ReasonList } from '../components/ReasonList';
import { stoppedReasons } from '../data/reasons';
import type { TimelineStep } from '../types/transaction';

type Outcome = 'success' | 'stopped' | 'cancelled';
type Phase = 'progress' | Outcome;

const stepLabels = [
{ done: 'Confirmed with PayPal', active: 'Confirming with PayPal…' },
{ done: 'Funds authorized', active: 'Authorizing funds…' },
{ done: 'Final guardrail check passed', active: 'Final guardrail check…' },
{ done: 'Captured', active: 'Capturing…' }];


export function CheckoutReturn({ outcome }: {outcome: Outcome;}) {
  const navigate = useNavigate();
  const [runOutcome, setRunOutcome] = useState<Outcome>(outcome);
  const [phase, setPhase] = useState<Phase>(outcome === 'cancelled' ? 'cancelled' : 'progress');
  const [done, setDone] = useState(0);

  useEffect(() => {
    setRunOutcome(outcome);
    setDone(0);
    setPhase(outcome === 'cancelled' ? 'cancelled' : 'progress');
  }, [outcome]);

  useEffect(() => {
    if (phase !== 'progress') return;
    const stopAt = runOutcome === 'stopped' ? 2 : 4;
    if (done >= stopAt) {
      const t = window.setTimeout(() => setPhase(runOutcome === 'stopped' ? 'stopped' : 'success'), 450);
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(() => setDone((d) => d + 1), 700);
    return () => window.clearTimeout(t);
  }, [phase, done, runOutcome]);

  const steps: TimelineStep[] = stepLabels.map((s, i) => ({
    label: i < done ? s.done : i === done ? s.active : s.done.replace(' passed', ''),
    state: i < done ? 'done' : i === done ? 'current' : 'upcoming'
  }));

  const retry = () => {
    setRunOutcome('success');
    setDone(0);
    setPhase('progress');
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
                  <p className="mt-1 text-sm text-muted-foreground">$43.00 at FreshMart · don't close this page.</p>
                  <div className="mt-6">
                    <StatusTimeline steps={steps} />
                  </div>
                </div>
              }

              {phase === 'success' &&
              <div className="text-center">
                  <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 text-accent-fg">
                    <CheckCircle2 className="h-9 w-9" aria-hidden="true" />
                  </span>
                  <h1 className="mt-5 text-xl font-semibold tracking-tight">
                    Payment complete — <span className="tabular">$43.00</span> at FreshMart
                  </h1>
                  <p className="mt-2 text-sm text-muted-foreground">
                    You have <span className="tabular font-semibold text-accent-fg">$37.00</span> left in Groceries this week (resets Monday).
                  </p>
                  <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-center">
                    <Button variant="secondary" onClick={() => navigate('/transactions')}>View transaction</Button>
                    <Button onClick={() => navigate('/shop')}>Back to shopping</Button>
                  </div>
                </div>
              }

              {phase === 'stopped' &&
              <div>
                  <span className="flex h-14 w-14 items-center justify-center rounded-full bg-blocked/10 text-blocked-fg">
                    <ShieldX className="h-8 w-8" aria-hidden="true" />
                  </span>
                  <h1 className="mt-5 text-xl font-semibold tracking-tight">Payment stopped by your rules</h1>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    FreshMart was blocked after you approved. Your PayPal authorization was voided — you weren't charged.
                  </p>
                  <div className="mt-5">
                    <ReasonList reasons={stoppedReasons} />
                  </div>
                  <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                    <Button variant="secondary" onClick={() => navigate('/shop')}>Back to shopping</Button>
                    <Button onClick={() => navigate('/rules')}>Review rules</Button>
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
                    <Button
                    variant="secondary"
                    onClick={() => {
                      toast('Purchase cancelled — nothing was charged');
                      navigate('/shop');
                    }}>
                    
                      Cancel purchase
                    </Button>
                    <Button onClick={retry}>Try again</Button>
                  </div>
                </div>
              }
            </Card>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>);

}