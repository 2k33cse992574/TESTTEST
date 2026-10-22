import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

export interface Column<T> {
  key: keyof T | string;
  header: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
  width?: string;
}

interface Props<T> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T | string;
  searchable?: boolean;
  searchPlaceholder?: string;
  emptyMessage?: string;
  loading?: boolean;
  onRowClick?: (row: T) => void;
  actions?: (row: T) => React.ReactNode;
  pageSize?: number;
}

function Skeleton() {
  return (
    <div className="space-y-3 p-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="h-10 bg-border rounded-control animate-pulse" />
      ))}
    </div>
  );
}

export function DataTable<T extends object>({
  columns, data, keyField, searchable = true,
  searchPlaceholder = 'Search…', emptyMessage = 'No records found.',
  loading = false, onRowClick, actions, pageSize = 10,
}: Props<T>) {
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const [page, setPage] = useState(0);

  const filtered = data.filter(row =>
    !search || Object.values(row as Record<string, unknown>).some(v =>
      String(v).toLowerCase().includes(search.toLowerCase())
    )
  );

  const sorted = sortKey
    ? [...filtered].sort((a, b) => {
        const r = a as Record<string, unknown>;
        const s = b as Record<string, unknown>;
        const av = String(r[sortKey] ?? '');
        const bv = String(s[sortKey] ?? '');
        const cmp = av.localeCompare(bv, undefined, { numeric: true });
        return sortDir === 'asc' ? cmp : -cmp;
      })
    : filtered;

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paged = sorted.slice(page * pageSize, (page + 1) * pageSize);

  const handleSort = (key: string) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('asc'); }
    setPage(0);
  };

  const handleSearch = (v: string) => { setSearch(v); setPage(0); };

  return (
    <div className="space-y-3">
      {searchable && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted pointer-events-none" />
          <input
            className="input pl-9 max-w-xs"
            placeholder={searchPlaceholder}
            value={search}
            onChange={e => handleSearch(e.target.value)}
          />
        </div>
      )}

      <div className="table-wrapper">
        {loading ? <Skeleton /> : (
          <table className="table">
            <thead>
              <tr>
                {columns.map(col => (
                  <th
                    key={String(col.key)}
                    style={col.width ? { width: col.width } : {}}
                    className={col.sortable ? 'cursor-pointer select-none hover:bg-canvas' : ''}
                    onClick={() => col.sortable && handleSort(String(col.key))}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.header}
                      {col.sortable && (
                        sortKey === String(col.key)
                          ? sortDir === 'asc'
                            ? <ChevronUp className="w-3 h-3 text-brand" />
                            : <ChevronDown className="w-3 h-3 text-brand" />
                          : <ChevronsUpDown className="w-3 h-3 text-text-muted" />
                      )}
                    </span>
                  </th>
                ))}
                {actions && <th className="w-20">Actions</th>}
              </tr>
            </thead>
            <AnimatePresence mode="wait">
              <tbody>
                {paged.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length + (actions ? 1 : 0)}
                      className="text-center py-12 text-text-muted text-sm"
                    >
                      {search
                        ? `No records match "${search}". Clear the search to see all records.`
                        : emptyMessage}
                    </td>
                  </tr>
                ) : (
                  paged.map((row, i) => (
                    <motion.tr
                      key={String((row as Record<string, unknown>)[keyField as string])}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.02 }}
                      className={onRowClick ? 'cursor-pointer' : ''}
                      onClick={() => onRowClick?.(row)}
                    >
                      {columns.map(col => (
                        <td key={String(col.key)}>
                          {col.render
                            ? col.render(row)
                            : String((row as Record<string, unknown>)[col.key as string] ?? '—')}
                        </td>
                      ))}
                      {actions && (
                        <td onClick={e => e.stopPropagation()}>
                          {actions(row)}
                        </td>
                      )}
                    </motion.tr>
                  ))
                )}
              </tbody>
            </AnimatePresence>
          </table>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-xs text-text-secondary pt-1">
          <span>
            Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, sorted.length)} of {sorted.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              className="btn-icon w-7 h-7 text-xs disabled:opacity-40"
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
            >←</button>
            {[...Array(Math.min(totalPages, 5))].map((_, i) => (
              <button
                key={i}
                className={`w-7 h-7 rounded-lg text-xs font-medium transition-colors
                  ${page === i ? 'bg-brand text-white' : 'hover:bg-canvas'}`}
                onClick={() => setPage(i)}
              >{i + 1}</button>
            ))}
            <button
              className="btn-icon w-7 h-7 text-xs disabled:opacity-40"
              disabled={page >= totalPages - 1}
              onClick={() => setPage(p => p + 1)}
            >→</button>
          </div>
        </div>
      )}
    </div>
  );
}
