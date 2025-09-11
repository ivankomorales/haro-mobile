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
        'flex w-full items-center gap-2 border-neutral-200 bg-white/90 px-2 py-2 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/90',
        // sticky only on mobile; as a normal block on ≥lg
        isStickyNow
          ? 'fixed right-0 bottom-[var(--bottom-bar-h,0px)] left-0 z-30 lg:static lg:bottom-auto lg:z-auto'
          : 'mt-4',
        // constrain width on desktop so it does not cross the sidebar
        // 'lg:mx-4 lg:rounded-lg lg:border',
      ].join(' ')}
      role="navigation"
      aria-label="Pagination"
    >
      {/* Prev Button */}
      <button
        type="button"
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-neutral-200 hover:bg-neutral-100 disabled:opacity-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
        onClick={onPrev}
        disabled={safePage <= 1}
        aria-label={t('pagination.previous')}
      >
        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
      </button>

      <div className="flex-1 text-center text-sm tabular-nums">
        <span className="font-medium">{start}</span>
        <span>–</span>
        <span className="font-medium">{end}</span>
        <span className="mx-1 opacity-70">{t('pagination.of')}</span>
        <span className="font-medium">{total}</span>
        <span className="ml-1 opacity-70">{t('order.entries')}</span>
      </div>

      {/* Next button */}
      <button
        type="button"
        className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-neutral-200 hover:bg-neutral-100 disabled:opacity-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
        onClick={onNext}
        disabled={safePage >= totalPages}
        aria-label={t('pagination.next')}
      >
        <ChevronRight className="h-5 w-5" aria-hidden="true" />
      </button>

      <label className="ml-2 hidden items-center gap-2 text-sm sm:flex">
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
  )
}
