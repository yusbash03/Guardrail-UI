import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, GitCompare, Loader2 } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { DataGrid, Column } from '../components/DataGrid';
import { PageError } from '../components/PageState';
import { useCategories, useMerchants, usePolicyVersion, usePolicyVersions } from '../lib/queries';
import { diffPolicies, policyFields } from '../lib/policyDiff';
import type { PolicyVersionSummary } from '../lib/schemas';
import { formatDateTime } from '../utils/time';
import { cn } from '../utils/cn';

export function PolicyHistory() {
  const versions = usePolicyVersions();
  const merchants = useMerchants();
  const categories = useCategories();
  const [selected, setSelected] = useState<number[]>([]);

  // Compare older → newer regardless of click order.
  const [older, newer] = [...selected].sort((a, b) => a - b);
  const before = usePolicyVersion(older ?? null);
  const after = usePolicyVersion(newer ?? null);

  const toggle = (n: number) =>
  setSelected((list) => list.includes(n) ? list.filter((x) => x !== n) : [...list.slice(-1), n]);

  const diff = useMemo(() => {
    if (!before.data || !after.data || !merchants.data) return null;
    return diffPolicies(policyFields(before.data, merchants.data, categories.data), policyFields(after.data, merchants.data, categories.data));
  }, [before.data, after.data, merchants.data, categories.data]);

  const columns: Column<PolicyVersionSummary>[] = [
  {
    key: 'select',
    header: 'Compare',
    width: 100,
    className: 'w-20',
    render: (v) =>
    <input
      type="checkbox"
      aria-label={`Compare version ${v.versionNumber}`}
      checked={selected.includes(v.versionNumber)}
      onChange={() => toggle(v.versionNumber)}
      onClick={(e) => e.stopPropagation()}
      className="h-4 w-4 accent-[hsl(var(--primary))]" />

  },
  { key: 'version', header: 'Version', width: 130, value: (v) => v.versionNumber, render: (v) => <span className="tabular font-semibold">Version {v.versionNumber}</span> },
  { key: 'summary', header: 'Change', flex: 2, value: (v) => v.changeSummary, render: (v) => v.changeSummary },
  { key: 'created', header: 'Created', value: (v) => v.createdAt, render: (v) => <span className="tabular text-muted-foreground">{formatDateTime(v.createdAt)}</span> },
  { key: 'hash', header: 'Snapshot hash', render: (v) => <span className="font-mono text-xs text-muted-foreground">{v.snapshotHash.slice(0, 12)}</span> }];


  return (
    <div className="mx-auto max-w-[1180px] px-4 py-6 lg:px-8 lg:py-8">
      <Link to="/rules" className="mb-4 inline-flex items-center gap-1.5 rounded text-sm font-medium text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
        <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Spending Rules
      </Link>
      <p className="mb-5 max-w-xl text-sm text-muted-foreground">
        Every change creates a new version; old versions never change. Select two to see exactly what changed.
      </p>

      {versions.isError ?
      <PageError error={versions.error} onRetry={() => void versions.refetch()} /> :

      <DataGrid
        ariaLabel="Policy versions"
        columns={columns}
        rows={versions.data?.items ?? []}
        getRowId={(v) => String(v.versionNumber)}
        onRowClick={(v) => toggle(v.versionNumber)}
        emptyLabel={versions.isLoading ? 'Loading…' : 'No versions yet.'} />

      }

      <Card className="mt-6 p-5 lg:p-6">
        <h2 className="flex items-center gap-2 text-base font-semibold">
          <GitCompare className="h-4 w-4 text-primary-ink" aria-hidden="true" />
          {older !== undefined && newer !== undefined ? `Version ${older} → Version ${newer}` : 'Compare versions'}
        </h2>
        {selected.length < 2 ?
        <p className="mt-3 text-sm text-muted-foreground">Select {selected.length === 0 ? 'two versions' : 'one more version'} above.</p> :
        !diff ?
        <p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Loading versions…</p> :
        diff.length === 0 ?
        <p className="mt-3 text-sm text-muted-foreground">No rule differences between these versions.</p> :

        <table className="mt-4 w-full text-sm">
            <caption className="sr-only">Changed fields</caption>
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th scope="col" className="pb-2 font-medium">Field</th>
                <th scope="col" className="pb-2 font-medium">Version {older}</th>
                <th scope="col" className="pb-2 font-medium">Version {newer}</th>
              </tr>
            </thead>
            <tbody>
              {diff.map((row) =>
            <tr key={row.field} className="border-b border-border last:border-0">
                  <td className="py-2.5 pr-3 font-medium">{row.field}</td>
                  <td className={cn('tabular py-2.5 pr-3', row.before === null ? 'text-muted-foreground' : 'text-blocked-fg line-through decoration-blocked/40')}>
                    {row.before ?? '—'}
                  </td>
                  <td className={cn('tabular py-2.5', row.after === null ? 'text-muted-foreground' : 'font-semibold text-accent-fg')}>{row.after ?? 'Removed'}</td>
                </tr>
            )}
            </tbody>
          </table>
        }
      </Card>
    </div>);

}
