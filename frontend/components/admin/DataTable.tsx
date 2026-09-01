'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronLeft, ChevronRight, Loader2, Database, RefreshCw } from 'lucide-react';

interface Column<T> {
  key: keyof T | string;
  label: string;
  render?: (row: T) => React.ReactNode;
  width?: string;
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  totalPages?: number;
  currentPage?: number;
  total?: number;
  onPageChange?: (page: number) => void;
  onSearch?: (query: string) => void;
  onRefresh?: () => void;
  searchPlaceholder?: string;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  actions?: (row: T) => React.ReactNode;
  filters?: React.ReactNode;
  headerRight?: React.ReactNode;
}

function SkeletonRow({ cols }: { cols: number }) {
  return (
    <tr style={{ borderBottom: '1px solid rgba(255,255,255,.04)' }}>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} style={{ padding: '.875rem 1.25rem' }}>
          <div className="skeleton-shimmer" style={{ height: 13, borderRadius: 6, width: `${60 + Math.random() * 30}%` }} />
        </td>
      ))}
    </tr>
  );
}

export default function DataTable<T extends { id: string }>({
  columns,
  data,
  isLoading = false,
  totalPages = 1,
  currentPage = 1,
  total,
  onPageChange,
  onSearch,
  onRefresh,
  searchPlaceholder = 'Tafuta...',
  emptyMessage = 'Hakuna rekodi zilizopatikana.',
  emptyIcon,
  actions,
  filters,
  headerRight,
}: DataTableProps<T>) {
  const [searchValue, setSearchValue] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const debouncedSearch = useCallback(
    (value: string) => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => onSearch?.(value), 400);
    },
    [onSearch]
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    debouncedSearch(e.target.value);
  };

  const getValue = (row: T, key: string) => {
    const keys = key.split('.');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return keys.reduce((obj: any, k) => obj?.[k], row);
  };

  const colCount = columns.length + (actions ? 1 : 0);

  // Windowed pages
  const pageWindow = Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
    const start = Math.max(1, Math.min(currentPage - 2, totalPages - 4));
    return start + i;
  }).filter(p => p >= 1 && p <= totalPages);

  return (
    <div style={{ borderRadius: '1.5rem', overflow: 'hidden', border: '1px solid var(--c-border)', background: 'var(--c-surface)' }}>

      {/* ── Controls ── */}
      <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--c-border)', display: 'flex', alignItems: 'center', gap: '.875rem', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        {/* Left: search + filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '.625rem', flex: 1, flexWrap: 'wrap' }}>
          {onSearch && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '.625rem',
              background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)',
              borderRadius: '.875rem', padding: '.55rem 1rem', minWidth: 180, maxWidth: 280, flex: 1,
              transition: 'border-color .2s',
            }}
              onFocusCapture={e => (e.currentTarget.style.borderColor = 'rgba(0,255,65,.4)')}
              onBlurCapture={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,.1)')}
            >
              {isLoading && searchValue
                ? <Loader2 style={{ width: 14, height: 14, color: 'rgba(255,255,255,.3)', animation: 'spin 1s linear infinite', flexShrink: 0 }} />
                : <Search style={{ width: 14, height: 14, color: 'rgba(255,255,255,.3)', flexShrink: 0 }} />
              }
              <input
                type="text"
                value={searchValue}
                onChange={handleSearch}
                placeholder={searchPlaceholder}
                style={{ background: 'none', border: 'none', outline: 'none', color: '#fff', fontSize: '.85rem', width: '100%' }}
              />
              {searchValue && (
                <button
                  onClick={() => { setSearchValue(''); onSearch?.(''); }}
                  style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,.35)', cursor: 'pointer', fontSize: '1rem', lineHeight: 1, padding: 0, flexShrink: 0 }}
                >×</button>
              )}
            </div>
          )}
          {filters && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', flexWrap: 'wrap' }}>
              {filters}
            </div>
          )}
        </div>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '.625rem' }}>
          {total !== undefined && (
            <span style={{ fontSize: '.72rem', fontWeight: 700, color: 'rgba(255,255,255,.35)', letterSpacing: '.05em', whiteSpace: 'nowrap' }}>
              {total.toLocaleString()} jumla
            </span>
          )}
          {onRefresh && (
            <button
              onClick={onRefresh}
              style={{
                width: 32, height: 32, borderRadius: '.625rem', cursor: 'pointer',
                background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,.4)',
                transition: 'all .2s',
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(0,255,65,.1)'; (e.currentTarget as HTMLElement).style.color = 'var(--c-lime)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.04)'; (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,.4)'; }}
              title="Onyesha upya"
            >
              <RefreshCw style={{ width: 13, height: 13 }} />
            </button>
          )}
          {headerRight}
        </div>
      </div>

      {/* ── Table ── */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'auto' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,.07)', background: 'rgba(255,255,255,.02)' }}>
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  style={{
                    padding: '.75rem 1.25rem',
                    textAlign: (col.align || 'left') as 'left' | 'center' | 'right',
                    fontSize: '.62rem', fontWeight: 800, textTransform: 'uppercase',
                    letterSpacing: '.12em', color: 'rgba(255,255,255,.35)',
                    whiteSpace: 'nowrap', width: col.width,
                  }}
                >
                  {col.label}
                </th>
              ))}
              {actions && (
                <th style={{ padding: '.75rem 1.25rem', textAlign: 'right', fontSize: '.62rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.12em', color: 'rgba(255,255,255,.35)', whiteSpace: 'nowrap' }}>
                  Vitendo
                </th>
              )}
            </tr>
          </thead>

          <tbody>
            <AnimatePresence mode="wait">
              {isLoading ? (
                <>
                  {Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} cols={colCount} />)}
                </>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={colCount} style={{ padding: '4rem 1.25rem', textAlign: 'center' }}>
                    <motion.div
                      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: .4 }}
                      style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}
                    >
                      {emptyIcon || <Database style={{ width: 40, height: 40, color: 'rgba(255,255,255,.08)' }} />}
                      <p style={{ color: 'rgba(255,255,255,.3)', fontSize: '.875rem', fontWeight: 600 }}>{emptyMessage}</p>
                    </motion.div>
                  </td>
                </tr>
              ) : (
                data.map((row, rowIdx) => (
                  <motion.tr
                    key={row.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: .3, delay: rowIdx * .03 }}
                    style={{
                      borderBottom: '1px solid rgba(255,255,255,.04)',
                      cursor: 'default', transition: 'background .15s',
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(0,255,65,.025)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                  >
                    {columns.map((col) => (
                      <td
                        key={String(col.key)}
                        style={{
                          padding: '.875rem 1.25rem',
                          textAlign: (col.align || 'left') as 'left' | 'center' | 'right',
                          fontSize: '.845rem', color: 'rgba(255,255,255,.8)',
                          verticalAlign: 'middle',
                        }}
                      >
                        {col.render ? col.render(row) : String(getValue(row, String(col.key)) ?? '—')}
                      </td>
                    ))}
                    {actions && (
                      <td style={{ padding: '.875rem 1.25rem', textAlign: 'right', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '.375rem' }}>
                          {actions(row)}
                        </div>
                      </td>
                    )}
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div style={{ padding: '.875rem 1.25rem', borderTop: '1px solid var(--c-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '.75rem' }}>
          <p style={{ fontSize: '.72rem', color: 'rgba(255,255,255,.35)', fontWeight: 600 }}>
            Ukurasa <span style={{ color: 'var(--c-lime)', fontWeight: 800 }}>{currentPage}</span> wa {totalPages}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '.375rem' }}>
            <button
              onClick={() => onPageChange?.(currentPage - 1)}
              disabled={currentPage === 1}
              style={{
                width: 30, height: 30, borderRadius: '.625rem', cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: currentPage === 1 ? 'rgba(255,255,255,.18)' : 'rgba(255,255,255,.6)',
                transition: 'all .15s',
              }}
              onMouseEnter={e => { if (currentPage !== 1) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.08)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.04)'; }}
            >
              <ChevronLeft style={{ width: 14, height: 14 }} />
            </button>

            {currentPage > 3 && totalPages > 5 && (
              <>
                <button onClick={() => onPageChange?.(1)} style={{ width: 30, height: 30, borderRadius: '.625rem', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', cursor: 'pointer', fontSize: '.78rem', fontWeight: 600, color: 'rgba(255,255,255,.6)', transition: 'all .15s' }}>1</button>
                <span style={{ color: 'rgba(255,255,255,.25)', fontSize: '.85rem' }}>…</span>
              </>
            )}

            {pageWindow.map((page) => (
              <button
                key={page}
                onClick={() => onPageChange?.(page)}
                style={{
                  width: 30, height: 30, borderRadius: '.625rem', cursor: 'pointer',
                  background: page === currentPage ? 'var(--c-lime)' : 'rgba(255,255,255,.04)',
                  border: page === currentPage ? 'none' : '1px solid rgba(255,255,255,.08)',
                  color: page === currentPage ? '#050805' : 'rgba(255,255,255,.6)',
                  fontWeight: page === currentPage ? 800 : 600, fontSize: '.78rem',
                  transition: 'all .15s',
                }}
                onMouseEnter={e => { if (page !== currentPage) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.08)'; }}
                onMouseLeave={e => { if (page !== currentPage) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.04)'; }}
              >
                {page}
              </button>
            ))}

            {currentPage < totalPages - 2 && totalPages > 5 && (
              <>
                <span style={{ color: 'rgba(255,255,255,.25)', fontSize: '.85rem' }}>…</span>
                <button onClick={() => onPageChange?.(totalPages)} style={{ width: 30, height: 30, borderRadius: '.625rem', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', cursor: 'pointer', fontSize: '.78rem', fontWeight: 600, color: 'rgba(255,255,255,.6)', transition: 'all .15s' }}>{totalPages}</button>
              </>
            )}

            <button
              onClick={() => onPageChange?.(currentPage + 1)}
              disabled={currentPage === totalPages}
              style={{
                width: 30, height: 30, borderRadius: '.625rem', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: currentPage === totalPages ? 'rgba(255,255,255,.18)' : 'rgba(255,255,255,.6)',
                transition: 'all .15s',
              }}
              onMouseEnter={e => { if (currentPage !== totalPages) (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.08)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.04)'; }}
            >
              <ChevronRight style={{ width: 14, height: 14 }} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
