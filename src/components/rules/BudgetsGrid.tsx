import React, { useMemo, useRef } from 'react';
import { AgGridReact } from 'ag-grid-react';
import type { CellClassRules, ColDef, ITooltipParams } from 'ag-grid-community';
import { Trash2 } from 'lucide-react';
import { guardrailGridTheme } from '../DataGrid';
import type { Category } from '../../lib/schemas';
import type { BudgetErrors } from '../../lib/budgetValidation';
import type { CategoryBudget } from '../../types/rules';
import { formatMoney } from '../../utils/money';

interface BudgetsGridProps {
  budgets: CategoryBudget[];
  categories: Category[];
  editing: boolean;
  errors: BudgetErrors;
  onChange: (id: string, patch: Partial<CategoryBudget>) => void;
  onRemove: (id: string) => void;
}

/**
 * Category budgets as an AG Grid with inline editing (AG_GRID_USAGE.md §4): select editors for category and period,
 * a number editor for the limit. Invalid cells are outlined; the page's single Save creates one policy version.
 */
export function BudgetsGrid({ budgets, categories, editing, errors, onChange, onRemove }: BudgetsGridProps) {
  const invalid = (field: 'limit' | 'category'): CellClassRules<CategoryBudget> => ({
    'gr-cell-invalid': (p) => !!p.data && !!errors.get(p.data.id)?.[field]
  });
  const tooltip = (field: 'limit' | 'category') => (p: ITooltipParams<CategoryBudget>) => (p.data ? errors.get(p.data.id)?.[field] : undefined);

  const columnDefs = useMemo<ColDef<CategoryBudget>[]>(
    () => [
    {
      colId: 'category',
      headerName: 'Category',
      flex: 2,
      minWidth: 160,
      editable: editing,
      cellClass: 'gr-cell font-medium',
      cellClassRules: invalid('category'),
      tooltipValueGetter: tooltip('category'),
      valueGetter: (p) => p.data?.category,
      valueSetter: (p) => {
        const category = categories.find((c) => c.name === p.newValue);
        if (!category || !p.data) return false;
        onChange(p.data.id, { categoryCode: category.code, category: category.name });
        return true;
      },
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: { values: categories.map((c) => c.name) }
    },
    {
      colId: 'period',
      headerName: 'Period',
      flex: 1,
      minWidth: 120,
      editable: editing,
      cellClass: 'gr-cell text-muted-foreground',
      valueGetter: (p) => p.data?.period,
      valueSetter: (p) => {
        if (!p.data || (p.newValue !== 'Weekly' && p.newValue !== 'Monthly')) return false;
        onChange(p.data.id, { period: p.newValue });
        return true;
      },
      cellEditor: 'agSelectCellEditor',
      cellEditorParams: { values: ['Weekly', 'Monthly'] }
    },
    {
      colId: 'limit',
      headerName: 'Limit',
      flex: 1,
      minWidth: 130,
      editable: editing,
      headerClass: 'ag-right-aligned-header',
      cellClass: 'gr-cell gr-cell-right font-semibold',
      cellClassRules: invalid('limit'),
      tooltipValueGetter: tooltip('limit'),
      valueGetter: (p) => p.data?.limit,
      valueFormatter: (p) => typeof p.value === 'number' && Number.isFinite(p.value) ? formatMoney(p.value) : '—',
      valueSetter: (p) => {
        if (!p.data) return false;
        const value = typeof p.newValue === 'number' ? p.newValue : Number.NaN;
        onChange(p.data.id, { limit: value });
        return true;
      },
      cellEditor: 'agNumberCellEditor',
      cellEditorParams: { min: 0, max: 100_000, precision: 2, step: 1 }
    },
    ...(editing ?
    [
    {
      colId: 'remove',
      headerName: '',
      width: 56,
      sortable: false,
      resizable: false,
      cellClass: 'gr-cell gr-cell-center',
      cellRenderer: (p: {data?: CategoryBudget;}) =>
      p.data ?
      <button
        type="button"
        aria-label={`Remove ${p.data.category}`}
        onClick={() => p.data && onRemove(p.data.id)}
        className="rounded-md p-2 text-muted-foreground hover:bg-muted hover:text-blocked-fg">
        
                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                  </button> :
      null
    } satisfies ColDef<CategoryBudget>] :

    [])],

    // eslint-disable-next-line react-hooks/exhaustive-deps
    [editing, categories, errors, onChange, onRemove]
  );

  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className="gr-grid overflow-hidden rounded-btn border border-border"
      role="region"
      aria-label="Category budgets"
      // Sized to its rows (36 px header + 44 px rows); room for the empty message when there are none.
      style={{ height: 36 + Math.max(budgets.length, 2) * 44 + 2 }}>
      <AgGridReact<CategoryBudget>
        theme={guardrailGridTheme}
        rowData={budgets}
        columnDefs={columnDefs}
        getRowId={(p) => p.data.id}
        singleClickEdit
        stopEditingWhenCellsLoseFocus
        // The select editor starts collapsed; open its list straight away so one click shows the options.
        onCellEditingStarted={(e) => {
          if (e.colDef.cellEditor !== 'agSelectCellEditor') return;
          requestAnimationFrame(() => {
            const picker = containerRef.current?.querySelector<HTMLElement>('.ag-cell-inline-editing .ag-picker-field-wrapper');
            picker?.focus();
            picker?.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
          });
        }}
        tooltipShowDelay={0}
        overlayNoRowsTemplate='<span class="gr-grid-empty">No category budgets yet.</span>' />
      
    </div>);

}
