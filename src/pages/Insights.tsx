import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AgStudio, AgStudioProvider } from 'ag-studio-react';
import type { AgReportState, AgStudioApi } from 'ag-studio';
import { Check, Loader2, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../components/ui/Button';
import { SegmentedTabs } from '../components/ui/SegmentedTabs';
import { PageError, PageLoading } from '../components/PageState';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { api, isApiError } from '../lib/api';
import { errorMessage } from '../lib/errorCopy';
import { buildDataSources, fetchInsightDatasets } from '../insights/datasets';
import { defaultReport } from '../insights/defaultReport';
import { guardrailStudioTheme } from '../insights/theme';
import { guardrailWidgets } from '../insights/widgets';

// Guardrails Insights (AG_GRID_USAGE.md §2): AG Studio over the user's own read-only datasets.
// Lazy-loaded route, so Studio's bundle never touches the shell, login or checkout pages.

const REPORT = 'default';
const SAVE_DEBOUNCE_MS = 2_000;
const LICENSE_KEY = import.meta.env.VITE_AG_STUDIO_LICENSE_KEY as string | undefined;

interface SavedReport {
  state: AgReportState;
  version?: string | null;
}

/** GET /insights/reports/default → the user's saved Studio state, or null (404) to load the shipped default. */
async function loadReport(): Promise<SavedReport | null> {
  try {
    return await api<SavedReport>(`/insights/reports/${REPORT}`);
  } catch (err) {
    if (isApiError(err, 'NOT_FOUND')) return null;
    throw err;
  }
}

const saveReport = (state: AgReportState) =>
api(`/insights/reports/${REPORT}`, { method: 'PUT', body: { state, version: (state as { version?: string }).version ?? null } });

function useIsDesktop() {
  const query = '(min-width: 1024px)';
  const [desktop, setDesktop] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setDesktop(mq.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);
  return desktop;
}

export function Insights() {
  const { status } = useAuth();
  const { dark } = useTheme();
  const desktop = useIsDesktop();
  const datasets = useQuery({ queryKey: ['insights', 'datasets'], queryFn: fetchInsightDatasets, enabled: status === 'authenticated', staleTime: 60_000 });
  const report = useQuery({ queryKey: ['insights', 'report', REPORT], queryFn: loadReport, enabled: status === 'authenticated', staleTime: Infinity });
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [studioKey, setStudioKey] = useState(0);
  const [useDefault, setUseDefault] = useState(false);
  const [pages, setPages] = useState<string[]>([]);
  const [selectedPage, setSelectedPage] = useState<string>('');
  const apiRef = useRef<AgStudioApi | null>(null);
  const timer = useRef<number | null>(null);
  const pending = useRef<AgReportState | null>(null);

  const data = useMemo(() => datasets.data ? buildDataSources(datasets.data) : null, [datasets.data]);
  // Rebuilt from the live tokens when the app switches light/dark.
  const theme = useMemo(() => guardrailStudioTheme(dark), [dark]);
  const initialState = useDefault ? defaultReport : report.data?.state ?? defaultReport;

  const flush = useCallback(() => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = null;
    const state = pending.current;
    pending.current = null;
    if (!state) return;
    setSaveState('saving');
    saveReport(state).
    then(() => setSaveState('saved')).
    catch((err) => {
      setSaveState('idle');
      toast.error(`Couldn't save your dashboard. ${errorMessage(err)}`);
    });
  }, []);

  // Save edits 2 s after the last durable change (layout/widgets, not view-only tweaks), and on leaving the page.
  const syncPages = useCallback((state: AgReportState) => {
    setPages(state.pages.map((p) => p.id));
    setSelectedPage(state.selectedPageId);
  }, []);

  // Studio keeps pages in state; this page switcher (design tabs) selects one via setState.
  const selectPage = (id: string) => {
    const studio = apiRef.current;
    if (!studio) return;
    studio.setState({ ...studio.getState(), selectedPageId: id });
    setSelectedPage(id);
  };

  const onStateUpdated = useCallback(
    (event: {state: AgReportState;durable: boolean;}) => {
      syncPages(event.state);
      if (!event.durable || !desktop) return;
      pending.current = event.state;
      if (timer.current) window.clearTimeout(timer.current);
      timer.current = window.setTimeout(flush, SAVE_DEBOUNCE_MS);
    },
    [desktop, flush, syncPages]
  );
  useEffect(() => () => flush(), [flush]);

  const resetToDefault = () => {
    pending.current = defaultReport;
    flush();
    setUseDefault(true);
    setStudioKey((k) => k + 1);
    toast('Dashboard reset to the default report');
  };

  if (datasets.isLoading || report.isLoading) return <PageLoading label="Loading insights" />;
  if (datasets.isError || report.isError || !data) {
    return (
      <div className="mx-auto max-w-[1280px] px-4 py-6 lg:px-8 lg:py-8">
        <PageError error={datasets.error ?? report.error} onRetry={() => {void datasets.refetch();void report.refetch();}} />
      </div>);

  }

  return (
    <div className="flex h-full min-h-[640px] flex-col">
      <div className="flex shrink-0 flex-col gap-3 border-b border-border bg-card px-4 py-3 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="flex min-w-0 flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-4">
          {pages.length > 1 &&
          <SegmentedTabs
            ariaLabel="Dashboard pages"
            value={selectedPage}
            onChange={selectPage}
            className="max-w-full overflow-x-auto"
            options={pages.map((p) => ({ value: p, label: p }))} />
          }
          <p className="text-sm text-muted-foreground">
            Last 90 days. {desktop ? 'Edit widgets on the canvas; the Guardrail widgets are in the Compose menu.' : 'Open on a computer to edit.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground" aria-live="polite">
            {saveState === 'saving' && <><Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" /> Saving…</>}
            {saveState === 'saved' && <><Check className="h-3.5 w-3.5 text-accent-fg" aria-hidden="true" /> Saved</>}
          </span>
          {desktop &&
          <Button variant="secondary" size="sm" onClick={resetToDefault}>
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Reset to default
            </Button>
          }
        </div>
      </div>
      <div className="min-h-0 flex-1" data-ag-theme-mode={dark ? 'dark' : 'light'}>
        <AgStudioProvider licenseKey={LICENSE_KEY}>
          <AgStudio
            key={`${studioKey}-${dark ? 'dark' : 'light'}`}
            style={{ height: '100%', width: '100%' }}
            data={data}
            initialState={initialState}
            widgets={guardrailWidgets}
            theme={theme}
            mode={desktop ? 'edit' : 'view'}
            onApiReady={(e) => {
              apiRef.current = e.api as AgStudioApi;
              syncPages(apiRef.current.getState());
            }}
            onStateUpdated={onStateUpdated}
            onStudioPreDestroyed={(e) => {
              if (desktop && pending.current === null && timer.current === null) return;
              pending.current = (e.api as AgStudioApi).getState();
              flush();
            }}
            onErrorRaised={(e) => console.error('[insights]', e)} />

        </AgStudioProvider>
      </div>
    </div>);

}
