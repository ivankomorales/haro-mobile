import React from 'react'

function Spinner({ size = 28, border = 4, className = '' }) {
  const s = `${size}px`
  const b = `${border}px`
  return (
    <span
      className={[
        'inline-block animate-spin rounded-full border-t-transparent',
        'border-neutral-300 dark:border-neutral-700',
        'border-t-neutral-400 dark:border-t-neutral-300',
        className,
      ].join(' ')}
      style={{ width: s, height: s, borderWidth: b }}
      aria-hidden="true"
    />
  )
}

function SpinnerOverlay({ label = 'Cargando…' }) {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      <div className="flex items-center gap-3 rounded-full bg-white/70 px-4 py-2 shadow-sm ring-1 ring-black/5 backdrop-blur-sm dark:bg-neutral-900/60">
        <Spinner />
        <span className="text-sm text-neutral-700 dark:text-neutral-200">{label}</span>
      </div>
    </div>
  )
}

function SkeletonBlock({ className = '' }) {
  return (
    <div
      className={['animate-pulse rounded bg-neutral-200 dark:bg-neutral-700', className].join(' ')}
    />
  )
}

/**
 * TableSkeleton
 * - rows: number → filas del skeleton
 * - columns: array → ancho de columnas (Tailwind classes) o número de columnas
 * - header: boolean → si quieres simular cabecera
 * - approxRowHeight: alto estimado por fila (px)
 * - showSpinner: boolean → mostrar spinner centrado encima
 */
export default function TableSkeleton({
  rows = 10,
  columns = 5,
  header = true,
  approxRowHeight = 56,
  showSpinner = true,
  spinnerLabel = 'Cargando...',
}) {
  const cols = Array.isArray(columns)
    ? columns
    : Array.from({ length: columns }).map(() => 'flex-1')

  const headerH = header ? 44 : 0
  const height = headerH + rows * approxRowHeight

  return (
    <div className="relative overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800">
      <div style={{ height }} className="flex flex-col">
        {/* Header */}
        {header && (
          <div className="flex items-center gap-3 border-b border-neutral-200 px-3 py-2 dark:border-neutral-800">
            {cols.map((w, i) => (
              <div key={i} className={['min-w-0', 'flex items-center', w].join(' ')}>
                <SkeletonBlock className="h-4 w-24" />
              </div>
            ))}
          </div>
        )}

        {/* Body */}
        <div className="flex-1">
          {Array.from({ length: rows }).map((_, r) => (
            <div
              key={r}
              className="flex items-center gap-3 border-b border-neutral-100 px-3 dark:border-neutral-800"
              style={{ height: approxRowHeight }}
            >
              {cols.map((w, c) => (
                <div key={c} className={['min-w-0', 'flex items-center', w].join(' ')}>
                  <SkeletonBlock
                    className={[
                      'h-4',
                      c === 0 ? 'w-8' : c === cols.length - 1 ? 'w-14' : 'w-3/4',
                    ].join(' ')}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Spinner opcional */}
      {showSpinner && <SpinnerOverlay label={spinnerLabel} />}
    </div>
  )
}
