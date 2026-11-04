import React, { ReactNode, useCallback, useMemo, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import {
  AllCommunityModule,
  ModuleRegistry,
  themeQuartz,
  type ColDef,
  type ColumnState,
  type GridApi,
  type GridReadyEvent,
  type RowClassRules,
  type SortChangedEvent,
} from 'ag-grid-community';
import { cn } from '../utils/cn';

ModuleRegistry.registerModules([AllCommunityModule]);

/**
 * AG Grid themed from the design tokens (index.css). Values reference the CSS variables, so light/dark follow the
 * `.dark` class like the rest of the app. Matches the design's table: Inter, 44 px rows, muted header, card border.
 */
export const guardrailGridTheme = themeQuartz.withParams({
  fontFamily: 'Inter, system-ui, sans-serif',
  fontSize: 14,
  headerFontSize: 12,
  headerFontWeight: 500,
  backgroundColor: 'hsl(var(--card))',
  foregroundColor: 'hsl(var(--foreground))',
  headerBackgroundColor: 'hsl(var(--muted))',
  headerTextColor: 'hsl(var(--muted-foreground))',
  borderColor: 'hsl(var(--border))',
  accentColor: 'hsl(var(--primary))',
  rowHoverColor: 'hsl(var(--muted) / 0.6)',
  selectedRowBackgroundColor: 'hsl(var(--primary) / 0.06)',
  oddRowBackgroundColor: 'hsl(var(--card))',
  rowHeight: 44,
  headerHeight: 36,
  cellHorizontalPadding: 12,
  wrapperBorder: false,
  wrapperBorderRadius: 0,
  columnBorder: false,
  headerColumnBorder: false,
  inputBackgroundColor: 'hsl(var(--card))',
  inputBorder: { color: 'hsl(var(--border))' },
  inputFocusBorder: { color: 'hsl(var(--primary))' },
});

export interface Column<T> {
  key: string;
  header: string;
  align?: 'left' | 'right' | 'center';
  className?: string;
  render: (row: T) => ReactNode;
  /** Server-side sort field; makes the header a sort toggle that calls onSortChange (rows come back sorted). */
  sortField?: string;
  /** Plain value for client-side sort, quick filter and CSV export. */
  value?: (row: T) => string | number | null | undefined;
  width?: number;
  minWidth?: number;
  flex?: number;
}

export interface SortState {
  field: string;
  direction: 'asc' | 'desc';
}

export type RowTone = 'negative' | 'muted' | undefined;

interface DataGridProps<T> {
  columns: Column<T>[];
  rows: T[];
  getRowId: (row: T) => string;
  ariaLabel: string;
  onRowClick?: (row: T) => void;
  selectedId?: string | null;
  emptyLabel?: string;
  loading?: boolean;
  sort?: SortState;
  onSortChange?: (sort: SortState) => void;
  /** Quick filter over every column's `value`. */
  quickFilter?: string;
  /** Tints failed/voided rows red and pending rows grey. */
  rowTone?: (row: T) => RowTone;
  /** localStorage key for column layout (order, widths) — layout only, never data. */
  layoutKey?: string;
  onGridApi?: (api: GridApi<T>) => void;
  /** Max height before the grid scrolls (rows fit without scrolling up to this). */
  maxHeight?: number;
}

const ROW_HEIGHT = 44;
const HEADER_HEIGHT = 36;
const alignClass = { left: '', right: 'gr-cell-right', center: 'gr-cell-center' };

function readLayout(key: string | undefined): ColumnState[] | null {
  if (!key) return null;
  try {
    const raw = localStorage.getItem(`guardrail-grid:${key}`);
    return raw ? (JSON.parse(raw) as ColumnState[]) : null;
  } catch {
    return null;
  }
}

export function DataGrid<T>({
  columns,
  rows,
  getRowId,
  ariaLabel,
  onRowClick,
  selectedId,
  emptyLabel = 'Nothing to show.',
  loading,
  sort,
  onSortChange,
  quickFilter,
  rowTone,
  layoutKey,
  onGridApi,
  maxHeight = 560,
}: DataGridProps<T>) {
  const apiRef = useRef<GridApi<T> | null>(null);

  const columnDefs = useMemo<ColDef<T>[]>(
    () =>
      columns.map((col) => {
        const serverSorted = !!col.sortField && !!onSortChange;
        return {
          colId: col.key,
          headerName: col.header,
          cellRenderer: (p: { data?: T }) => (p.data ? col.render(p.data) : null),
          valueGetter: col.value ? (p) => (p.data ? col.value!(p.data) : null) : undefined,
          getQuickFilterText: col.value ? undefined : () => '',
          sortable: serverSorted || !!col.value,
          // Server-sorted columns: AG Grid shows the indicator, the API does the ordering.
          comparator: serverSorted ? () => 0 : undefined,
          sort: serverSorted && sort?.field === col.sortField ? sort?.direction : undefined,
          headerClass: cn(col.align === 'right' && 'ag-right-aligned-header', col.align === 'center' && 'gr-header-center'),
          cellClass: cn('gr-cell', alignClass[col.align ?? 'left'], col.className),
          width: col.width,
          minWidth: col.minWidth ?? 90,
          flex: col.width ? undefined : col.flex ?? 1,
          resizable: true,
          suppressMovable: false,
        } satisfies ColDef<T>;
      }),
    [columns, onSortChange, sort],
  );

  const rowClassRules = useMemo<RowClassRules<T>>(
    () => ({
      'gr-row-negative': (p) => !!p.data && rowTone?.(p.data) === 'negative',
      'gr-row-muted': (p) => !!p.data && rowTone?.(p.data) === 'muted',
      'gr-row-selected': (p) => !!p.data && !!selectedId && getRowId(p.data) === selectedId,
      'gr-row-clickable': () => !!onRowClick,
    }),
    [rowTone, selectedId, getRowId, onRowClick],
  );

  const onGridReady = useCallback(
    (e: GridReadyEvent<T>) => {
      apiRef.current = e.api;
      const layout = readLayout(layoutKey);
      if (layout) e.api.applyColumnState({ state: layout.map(({ sort: _s, sortIndex: _i, ...rest }) => rest), applyOrder: true });
      onGridApi?.(e.api);
    },
    [layoutKey, onGridApi],
  );

  const saveLayout = useCallback(() => {
    if (!layoutKey || !apiRef.current) return;
    try {
      const state = apiRef.current.getColumnState().map(({ colId, width, hide }) => ({ colId, width, hide }));
      localStorage.setItem(`guardrail-grid:${layoutKey}`, JSON.stringify(state));
    } catch {
      // storage unavailable
    }
  }, [layoutKey]);

  const onSortChanged = useCallback(
    (e: SortChangedEvent<T>) => {
      if (!onSortChange) return;
      const sorted = e.api.getColumnState().find((c) => c.sort);
      const col = columns.find((c) => c.key === sorted?.colId);
      const direction = sorted?.sort;
      if (col?.sortField && direction) onSortChange({ field: col.sortField, direction });
    },
    [columns, onSortChange],
  );

  // Fit short tables without a scrollbar; longer ones scroll inside maxHeight.
  const height = Math.min(maxHeight, HEADER_HEIGHT + Math.max(rows.length, 3) * ROW_HEIGHT + 2);

  return (
    <div role="region" aria-label={ariaLabel} className="gr-grid overflow-hidden rounded-card border border-border bg-card" style={{ height }}>
      <AgGridReact<T>
        theme={guardrailGridTheme}
        rowData={rows}
        columnDefs={columnDefs}
        getRowId={(p) => getRowId(p.data)}
        rowClassRules={rowClassRules}
        quickFilterText={quickFilter}
        loading={loading}
        overlayNoRowsTemplate={`<span class="gr-grid-empty">${emptyLabel.replace(/</g, '&lt;')}</span>`}
        onRowClicked={onRowClick ? (e) => e.data && onRowClick(e.data) : undefined}
        onCellKeyDown={
          onRowClick ?
          (e) => {
            const key = (e.event as KeyboardEvent | undefined)?.key;
            if ((key === 'Enter' || key === ' ') && e.data) onRowClick(e.data);
          } :
          undefined
        }
        onGridReady={onGridReady}
        onColumnResized={(e) => e.finished && saveLayout()}
        onColumnMoved={(e) => e.finished && saveLayout()}
        onSortChanged={onSortChanged}
        suppressCellFocus={false}
        animateRows
        enableCellTextSelection
        ensureDomOrder
      />
    </div>);

}
