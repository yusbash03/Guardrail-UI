import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, History, RotateCw } from 'lucide-react';
import { toast } from 'sonner';
import { LimitSections } from '../components/rules/LimitSections';
import { PolicySections } from '../components/rules/PolicySections';
import { Button } from '../components/ui/Button';
import { initialRules, ruleSections, ruleVersions } from '../data/rules';
import type { SpendingRules as Rules } from '../types/rules';

export function SpendingRules({ conflict }: {conflict: boolean;}) {
  const [rules, setRules] = useState<Rules>(initialRules);
  const [saved, setSaved] = useState<Rules>(initialRules);
  const [editing, setEditing] = useState<string[]>([]);
  const [version, setVersion] = useState(5);
  const [hasConflict, setHasConflict] = useState(conflict);
  const [historyOpen, setHistoryOpen] = useState(false);
  const historyRef = useRef<HTMLDivElement>(null);

  useEffect(() => setHasConflict(conflict), [conflict]);

  useEffect(() => {
    if (!historyOpen) return;
    const close = (e: MouseEvent) => historyRef.current && !historyRef.current.contains(e.target as Node) && setHistoryOpen(false);
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [historyOpen]);

  const dirty = JSON.stringify(rules) !== JSON.stringify(saved);
  const update = (patch: Partial<Rules>) => setRules((r) => ({ ...r, ...patch }));
  const isEditing = (id: string) => editing.includes(id);
  const toggleEdit = (id: string) => setEditing((list) => list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);

  const save = () => {
    setSaved(rules);
    setEditing([]);
    setVersion((v) => v + 1);
    toast.success(`Rules saved · Version ${version + 1}`);
  };

  const discard = () => {
    setRules(saved);
    setEditing([]);
  };

  const reload = () => {
    setRules(initialRules);
    setSaved(initialRules);
    setEditing([]);
    setVersion((v) => v + 1);
    setHasConflict(false);
    toast(`Loaded latest rules · Version ${version + 1}`);
  };

  return (
    <div className="mx-auto max-w-[1180px] px-4 py-6 lg:px-8 lg:py-8">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <p className="max-w-xl text-sm text-muted-foreground">
          Your AI assistant checks every cart against these rules. Nothing it builds can get around them.
        </p>
        <div ref={historyRef} className="relative text-sm text-muted-foreground">
          Version {version} · updated 2 min ago ·{' '}
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
              className="absolute right-0 z-20 mt-2 w-72 rounded-btn border border-border bg-card p-2 shadow-lift">
              
                {ruleVersions.map((v) =>
              <li key={v.version} className="rounded-lg px-2.5 py-2">
                    <p className="flex justify-between text-xs">
                      <span className="font-semibold text-foreground">Version {v.version}</span>
                      <span>{v.when}</span>
                    </p>
                    <p className="mt-0.5 text-sm text-foreground">{v.change}</p>
                  </li>
              )}
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
          <Button variant="secondary" size="sm" onClick={reload}>
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
          <LimitSections rules={rules} update={update} isEditing={isEditing} toggleEdit={toggleEdit} />
          <PolicySections rules={rules} update={update} isEditing={isEditing} toggleEdit={toggleEdit} />

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
                  <Button variant="ghost" size="sm" onClick={discard}>
                    Discard
                  </Button>
                  <Button size="sm" onClick={save} disabled={hasConflict}>
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