import React, { useEffect, useRef, useState } from 'react';
import { Clock, Eye, EyeOff, Loader2, LockKeyhole } from 'lucide-react';
import { Button } from './ui/Button';
import { useCountdown } from '../hooks/useCountdown';
import { useApprove } from '../lib/queries';
import { isApiError } from '../lib/api';
import { errorMessage } from '../lib/errorCopy';
import type { PurchaseDto } from '../lib/schemas';
import { formatMoney } from '../utils/money';
import { cn } from '../utils/cn';

const DEFAULT_LOCK_SECONDS = 15 * 60;

interface StepUpPanelProps {
  approvalId: string;
  /** The hash the rendered card was built from (GET /approvals/{id}) — never recomputed client-side. */
  cartSnapshotHash: string;
  amount: number;
  merchant: string;
  fingerprint?: string;
  onCancel: () => void;
  onConfirmed: (purchase: PurchaseDto) => void;
  autoFocus?: boolean;
}

export function StepUpPanel({ approvalId, cartSnapshotHash, amount, merchant, fingerprint, onCancel, onConfirmed, autoFocus = true }: StepUpPanelProps) {
  const [password, setPassword] = useState('');
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lockSeconds, setLockSeconds] = useState<number | null>(null);
  const approve = useApprove();
  const checking = approve.isPending;
  const locked = lockSeconds !== null;
  const lock = useCountdown(lockSeconds ?? 0, locked);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) inputRef.current?.focus();
  }, [autoFocus]);

  useEffect(() => {
    if (locked && lock.expired) setLockSeconds(null);
  }, [locked, lock.expired]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || locked || checking) return;
    const attempt = password;
    setPassword(''); // never keep the password in state past the request (APPROVAL_WORKFLOW.md §9)
    approve.mutate(
      { id: approvalId, cartSnapshotHash, password: attempt },
      {
        onSuccess: (result) => onConfirmed(result.purchase),
        onError: (err) => {
          if (isApiError(err, 'APPROVAL_STEP_UP_LOCKED')) {
            const retry = Number(err.data?.retryAfterSeconds);
            setLockSeconds(Number.isFinite(retry) && retry > 0 ? retry : DEFAULT_LOCK_SECONDS);
            setError(null);
            return;
          }
          setError(errorMessage(err));
          inputRef.current?.focus();
        },
      },
    );
  };

  return (
    <form onSubmit={submit} className="p-6">
      <div className="mb-5 flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary-ink">
          <LockKeyhole className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h2 id="stepup-title" className="text-lg font-semibold text-foreground">
            Confirm with your password
          </h2>
          <p className="text-sm text-muted-foreground">
            Approve <span className="tabular font-semibold text-foreground">{formatMoney(amount)}</span> at {merchant}
          </p>
        </div>
      </div>

      {locked ?
      <div role="alert" className="flex items-start gap-2.5 rounded-btn bg-blocked/10 px-3 py-3 text-sm text-blocked-fg">
          <Clock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <span>
            Too many attempts — try again in <span className="tabular font-semibold">{lock.label}</span>
          </span>
        </div> :

      <div>
          <label htmlFor="stepup-password" className="mb-1.5 block text-sm font-medium text-foreground">
            Password
          </label>
          <div className="relative">
            <input
            ref={inputRef}
            id="stepup-password"
            type={visible ? 'text' : 'password'}
            autoComplete="current-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError(null);
            }}
            aria-invalid={!!error}
            aria-describedby={error ? 'stepup-error' : 'stepup-hint'}
            className={cn(
              'h-11 w-full rounded-btn border bg-card px-3 pr-11 text-sm focus-visible:outline-none focus-visible:ring-2',
              error ? 'border-blocked focus-visible:ring-blocked/40' : 'border-border focus-visible:ring-primary'
            )} />

            <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? 'Hide password' : 'Show password'}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-md p-2 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">

              {visible ? <EyeOff className="h-4 w-4" aria-hidden="true" /> : <Eye className="h-4 w-4" aria-hidden="true" />}
            </button>
          </div>
          {error ?
        <p id="stepup-error" role="alert" className="mt-1.5 text-sm font-medium text-blocked-fg">
              {error}
            </p> :

        <p id="stepup-hint" className="mt-1.5 text-xs text-muted-foreground">
              Use the password you log in to Guardrail with.
            </p>
        }
        </div>
      }

      {fingerprint &&
      <p className="mt-4 text-xs text-muted-foreground">
          This approves only this exact cart · fingerprint <span className="font-mono text-foreground">{fingerprint}</span>
        </p>
      }

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={locked || !password || checking}>
          {checking && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
          Approve {formatMoney(amount)}
        </Button>
      </div>
    </form>);

}
