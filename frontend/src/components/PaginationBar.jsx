// comments in English only
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { getMessage as t } from '../utils/getMessage'

export default function PaginationBar({
  page,
  totalPages,
  totalDocs,
  limit,
  visibleCount = 0, // NEW: number of items actually rendered
  onPrev,
  onNext,
  onLimitChange,
  isSticky = true,
  variant = 'auto', // 'auto' | 'mobileSticky' | 'block'
  leftContent,
}) {
  // Prefer meta.totalDocs; fallback to visibleCount if meta is missing (legacy)
  const total = Number.isFinite(totalDocs) && totalDocs > 0 ? totalDocs : visibleCount

  // If total is unknown and visibleCount is 0, keep it 0–0 of 0 to avoid lying
  const safeLimit = limit || Math.max(visibleCount, 1)
  const safePage = page || 1

  const start = total === 0 ? 0 : (safePage - 1) * safeLimit + 1
  const end = total === 0 ? 0 : Math.min(safePage * safeLimit, total)

  const isStickyNow = variant === 'mobileSticky' || (variant === 'auto' && isSticky)

  return (
    <div
      className={[
        // contenedor base
        'flex w-full items-center border-neutral-200 bg-white/90 px-2 py-2 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/90',
        // NO sticky en mobile; si quieres sticky solo en desktop, descomenta la línea de abajo
        // 'lg:sticky lg:bottom-0 lg:z-30',
        // si no quieres sticky en ningún lado, no agregues nada
        'mt-4', // separador normal
      ].join(' ')}
      role="navigation"
      aria-label="Pagination"
    >
      {/* Lado izquierdo opcional */}
      {leftContent ? <div className="mr-2 text-sm">{leftContent}</div> : null}

      {/* Grupo derecho: info + flechas + selector */}
      <div className="ml-auto flex items-center gap-2">
        {/* Info (compacta) */}
        <div className="hidden text-sm tabular-nums sm:block">
          <span className="font-medium">{start}</span>
          <span>–</span>
          <span className="font-medium">{end}</span>
          <span className="mx-1 opacity-70">{t('pagination.of')}</span>
          <span className="font-medium">{total}</span>
          <span className="ml-1 opacity-70">{t('order.entries')}</span>
        </div>

        {/* Flechas compactas */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-neutral-200 hover:bg-neutral-100 disabled:opacity-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
            onClick={onPrev}
            disabled={safePage <= 1}
            aria-label={t('pagination.previous')}
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>

          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-neutral-200 hover:bg-neutral-100 disabled:opacity-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
            onClick={onNext}
            disabled={safePage >= totalPages}
            aria-label={t('pagination.next')}
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        {/* Rows per page */}
        <label className="hidden items-center gap-2 text-sm sm:flex">
          <span className="opacity-70">{t('pagination.rowsPerPage')}</span>
          <select
            className="rounded-md border border-neutral-200 bg-transparent px-2 py-1 dark:border-neutral-700"
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
          >
            {[5, 10, 20, 50].map((n) => (
              <option
                key={n}
                value={n}
                className="bg-white text-black dark:bg-neutral-800 dark:text-white"
              >
                {n}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  )
}
