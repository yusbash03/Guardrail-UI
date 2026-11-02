import React, { ReactNode } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { cn } from '../utils/cn';

export interface Column<T> {
  key: string;
  header: string;
  align?: 'left' | 'right' | 'center';
  className?: string;
  render: (row: T) => ReactNode;
  /** Server-side sort field; makes the header a sort toggle. */
  sortField?: string;
}

export interface SortState {
  field: string;
  direction: 'asc' | 'desc';
}

interface DataGridProps<T> {
  columns: Column<T>[];
  rows: T[];
  getRowId: (row: T) => string;
  ariaLabel: string;
  onRowClick?: (row: T) => void;
  selectedId?: string | null;
  emptyLabel?: string;
  sort?: SortState;
  onSortChange?: (sort: SortState) => void;
}

const alignClass = { left: 'text-left', right: 'text-right', center: 'text-center' };

export function DataGrid<T>({ columns, rows, getRowId, ariaLabel, onRowClick, selectedId, emptyLabel = 'Nothing to show.', sort, onSortChange }: DataGridProps<T>) {
  return (
    <div className="max-h-[560px] overflow-auto rounded-card border border-border bg-card">
      <table className="w-full min-w-[720px] border-collapse text-sm" aria-label={ariaLabel}>
        <thead className="sticky top-0 z-10 bg-muted/90 backdrop-blur">
          <tr>
            {columns.map((col) => {
              const active = sort && col.sortField === sort.field;
              const SortIcon = !active ? ArrowUpDown : sort.direction === 'asc' ? ArrowUp : ArrowDown;
              return (
                <th
                  key={col.key}
                  scope="col"
                  aria-sort={active ? sort.direction === 'asc' ? 'ascending' : 'descending' : undefined}
                  className={cn(
                    'h-9 whitespace-nowrap border-b border-border px-3 text-xs font-medium text-muted-foreground',
                    alignClass[col.align ?? 'left'],
                    col.className
                  )}>
                  
                  {col.sortField && onSortChange ?
                  <button
                    type="button"
                    onClick={() => onSortChange({ field: col.sortField!, direction: active && sort.direction === 'desc' ? 'asc' : 'desc' })}
                    className={cn('inline-flex items-center gap-1 rounded hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary', active && 'text-foreground')}>
                    
                      {col.header}
                      <SortIcon className="h-3 w-3" aria-hidden="true" />
                    </button> :

                  col.header
                  }
                </th>);

            })}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 &&
          <tr>
              <td colSpan={columns.length} className="px-3 py-10 text-center text-muted-foreground">
                {emptyLabel}
              </td>
            </tr>
          }
          {rows.map((row) => {
            const id = getRowId(row);
            return (
              <tr
                key={id}
                tabIndex={onRowClick ? 0 : undefined}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                onKeyDown={
                onRowClick ?
                (e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onRowClick(row);
                  }
                } :
                undefined
                }
                aria-selected={selectedId === id || undefined}
                className={cn(
                  'border-b border-border last:border-0',
                  onRowClick && 'cursor-pointer transition-colors duration-100 hover:bg-muted/60 focus-visible:bg-muted focus-visible:outline-none',
                  selectedId === id && 'bg-primary/5'
                )}>
                
                {columns.map((col) =>
                <td key={col.key} className={cn('h-11 whitespace-nowrap px-3', alignClass[col.align ?? 'left'], col.className)}>
                    {col.render(row)}
                  </td>
                )}
              </tr>);

          })}
        </tbody>
      </table>
    </div>);

}