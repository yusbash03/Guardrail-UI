import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, History, Loader2, RotateCw } from 'lucide-react';
import { toast } from 'sonner';
import { LimitSections } from '../components/rules/LimitSections';
import { PolicySections } from '../components/rules/PolicySections';
import { Button } from '../components/ui/Button';
import { PageError, PageLoading } from '../components/PageState';
import { useOnline } from '../hooks/useOnline';
import { useCategories, useMerchants, usePolicy, usePolicyVersions, useSavePolicy } from '../lib/queries';
import { changeSummary, toPolicyDocument, toRules } from '../lib/rulesMapping';
import { isApiError } from '../lib/api';
import { errorMessage } from '../lib/errorCopy';
import { ruleSections } from '../data/rules';
import { formatWhen } from '../utils/time';
import type { SpendingRules as Rules } from '../types/rules';

export function SpendingRules() {
  const policy = usePolicy();
  const merchants = useMerchants();
  const categories = useCategories();
  const versions = usePolicyVersions();
  const savePolicy = useSavePolicy();
  const online = useOnline();
  const [rules, setRules] = useState<Rules | null>(null);
  const [saved, setSaved] = useState<Rules | null>(null);
  const [editing, setEditing] = useState<string[]>([]);
  const [hasConflict, setHasConflict] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const historyRef = useRef<HTMLDivElement>(null);

  const ready = policy.data && merchants.data && categories.data;

  // Seed the form from the server whenever a new version loads and nothing is being edited.
  useEffect(() => {
    if (!policy.data || !merchants.data || !categories.data) return;
    const next = toRules(policy.data, merchants.data, categories.data);
    setSaved(next);
    setRules((current) => (current && saved && JSON.stringify(current) !== JSON.stringify(saved) ? current : next));
  }, [policy.data, merchants.data, categories.data]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!historyOpen) return;
    const close = (e: MouseEvent) => historyRef.current && !historyRef.current.contains(e.target as Node) && setHistoryOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [historyOpen]);

  if (policy.isError || merchants.isError) {
    return (
      <div className="mx-auto max-w-[1180px] px-4 py-6 lg:px-8 lg:py-8">
        <PageError error={policy.error ?? merchants.error} onRetry={() => void policy.refetch()} />
      </div>);

  }
  if (!ready || !rules || !saved) return <PageLoading label="Loading rules" />;

  const version = policy.data.versionNumber ?? 0;
  const latest = versions.data?.items[0];
  const dirty = JSON.stringify(rules) !== JSON.stringify(saved);
  const update = (patch: Partial<Rules>) => setRules((r) => r && { ...r, ...patch });
  const isEditing = (id: string) => editing.includes(id);
  const toggleEdit = (id: string) => setEditing((list) => list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

  const save = () => {
    savePolicy.mutate(
      { expectedVersionNumber: version, changeSummary: changeSummary(saved, rules), policy: toPolicyDocument(rules, policy.data) },
      {
        onSuccess: (next) => {
          const nextRules = toRules(next, merchants.data, categories.data);
          setSaved(nextRules);
          setRules(nextRules);
          setEditing([]);
          toast.success(`Rules saved · Version ${next.versionNumber}`);
        },
        onError: (err) => {
          if (isApiError(err, 'POLICY_VERSION_CONFLICT')) {
            setHasConflict(true);
            return;
          }
          const field = err instanceof Error && isApiError(err) && err.errors ? Object.values(err.errors)[0]?.[0] : null;
          toast.error(field ?? errorMessage(err));
        }
      }
    );
  };

  const discard = () => {
    setRules(saved);
    setEditing([]);
  };

  const reload = async () => {
    const fresh = await policy.refetch();
    void merchants.refetch();
    void versions.refetch();
    if (fresh.data) {
      const next = toRules(fresh.data, merchants.data, categories.data);
      setRules(next);
      setSaved(next);
      setEditing([]);
      setHasConflict(false);
      toast(`Loaded latest rules · Version ${fresh.data.versionNumber}`);
    }
  };

  return (
    <div className="mx-auto max-w-[1180px] px-4 py-6 lg:px-8 lg:py-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <p className="max-w-xl text-sm text-muted-foreground">
          Your AI assistant checks every cart against these rules. Nothing it builds can get around them.
        </p>
        <div ref={historyRef} className="relative text-sm text-muted-foreground">
          Version {version}
          {latest && latest.versionNumber === version && <> · updated {formatWhen(latest.createdAt).toLowerCase()}</>} ·{' '}
          <button
            type="button"
            aria-expanded={historyOpen}
            onClick={() => setHistoryOpen((o) => !o)}
            className="inline-flex items-center gap-1 font-medium text-primary-ink hover:underline">

            <History className="h-3.5 w-3.5" aria-hidden="true" /> View history
          </button>
          <AnimatePresence>
            {historyOpen &&
            <motion.ul
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15, ease: [0.23, 1, 0.32, 1] }}
              className="absolute right-0 z-20 mt-2 max-h-96 w-72 overflow-y-auto rounded-btn border border-border bg-card p-2 shadow-lift">

                {(versions.data?.items ?? []).map((v) =>
              <li key={v.versionNumber} className="rounded-lg px-2.5 py-2">
                    <p className="flex justify-between text-xs">
                      <span className="font-semibold text-foreground">Version {v.versionNumber}</span>
                      <span>{formatWhen(v.createdAt)}</span>
                    </p>
                    <p className="mt-0.5 text-sm text-foreground">{v.changeSummary}</p>
                  </li>
              )}
                {versions.isLoading && <li className="px-2.5 py-2 text-sm">Loading…</li>}
                <li className="border-t border-border px-2.5 pb-1 pt-2">
                  <Link to="/rules/history" className="text-sm font-medium text-primary-ink hover:underline">Compare versions →</Link>
                </li>
              </motion.ul>
            }
          </AnimatePresence>
        </div>
      </div>

      {hasConflict &&
      <div role="alert" className="mb-6 flex flex-col gap-3 rounded-card border border-approval/40 bg-approval/10 p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex items-center gap-2 text-sm font-medium text-approval-fg">
            <AlertTriangle className="h-4 w-4 shrink-0" aria-hidden="true" />
            Rules changed elsewhere — reload to continue.
          </p>
          <Button variant="secondary" size="sm" onClick={() => void reload()}>
            <RotateCw className="h-3.5 w-3.5" aria-hidden="true" /> Reload rules
          </Button>
        </div>
      }

      <div className="lg:grid lg:grid-cols-[200px_1fr] lg:gap-10">
        <nav aria-label="Rule sections" className="hidden lg:block">
          <ul className="sticky top-6 space-y-0.5">
            {ruleSections.map((s) =>
            <li key={s.id}>
                <a href={`#${s.id}`} className="block rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground">
                  {s.title}
                </a>
              </li>
            )}
          </ul>
        </nav>
        <div className="max-w-3xl space-y-4">
          <LimitSections rules={rules} update={update} isEditing={isEditing} toggleEdit={toggleEdit} categories={categories.data} />
          <PolicySections rules={rules} update={update} isEditing={isEditing} toggleEdit={toggleEdit} categories={categories.data} />

          <AnimatePresence>
            {dirty &&
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
              className="sticky bottom-4 z-20 flex items-center justify-between gap-3 rounded-card border border-border bg-card p-3 pl-4 shadow-lift">

                <p className="text-sm font-medium">You have unsaved changes</p>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={discard} disabled={savePolicy.isPending}>
                    Discard
                  </Button>
                  <Button size="sm" onClick={save} disabled={hasConflict || savePolicy.isPending || !online}>
                    {savePolicy.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />}
                    Save changes
                  </Button>
                </div>
              </motion.div>
            }
          </AnimatePresence>
        </div>
      </div>
    </div>);

}
