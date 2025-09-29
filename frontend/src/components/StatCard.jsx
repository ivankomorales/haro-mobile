// src/components/StatCard.jsx
// comments in English only
import { Spinner } from './Spinner'
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react'
import PropTypes from 'prop-types'

export default function StatCard({
  title,
  value,
  previousValue,
  valueFormat,
  deltaFormat,
  subtitle,
  loading = false,
  size = 'md',
  className = '',
  accentClass,
  shrinkValue = true,
  trend = 'upIsGood',
  onClick,
  as: Tag = 'div',
  ariaLabelDelta,
  showDelta = 'auto', // <--- NEW
}) {
  const sizes = {
    sm: 'px-3 py-2 text-sm min-h-[56px]',
    md: 'px-4 py-3 text-base min-h-[72px]',
    lg: 'px-5 py-4 text-base min-h-[88px]',
  }

  const currNum = typeof value === 'number' ? value : Number.isFinite(+value) ? +value : undefined
  const prevNum =
    typeof previousValue === 'number'
      ? previousValue
      : Number.isFinite(+previousValue)
        ? +previousValue
        : undefined

  const hasDelta = Number.isFinite(currNum) && Number.isFinite(prevNum) && prevNum !== 0
  const rawDelta = hasDelta ? ((currNum - prevNum) / Math.abs(prevNum)) * 100 : undefined
  const isUp = typeof rawDelta === 'number' ? rawDelta > 0 : undefined
  const good = typeof isUp === 'boolean' ? (trend === 'upIsGood' ? isUp : !isUp) : undefined
  const DeltaIcon = typeof isUp !== 'boolean' ? Minus : isUp ? ArrowUpRight : ArrowDownRight

  const deltaColor =
    typeof good === 'boolean'
      ? good
        ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30'
        : 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/30'
      : 'text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800'

  const valueClamp =
    size === 'lg'
      ? 'text-[clamp(1.25rem,3.5vw,1.875rem)]'
      : size === 'sm'
        ? 'text-[clamp(1rem,3vw,1.25rem)]'
        : 'text-[clamp(1.125rem,3.2vw,1.5rem)]'

  const shrinkClass = shrinkValue ? valueClamp : ''

  const displayValue =
    typeof currNum === 'number' && typeof valueFormat === 'function' ? valueFormat(currNum) : value

  const valueTitle =
    typeof currNum === 'number' && typeof valueFormat === 'function'
      ? String(valueFormat(currNum))
      : typeof value === 'string' || typeof value === 'number'
        ? String(value)
        : undefined

  const formattedPrev =
    typeof prevNum === 'number' && typeof valueFormat === 'function'
      ? String(valueFormat(prevNum))
      : typeof prevNum === 'number'
        ? String(prevNum)
        : undefined

  const formattedDelta =
    typeof rawDelta === 'number'
      ? typeof deltaFormat === 'function'
        ? deltaFormat(rawDelta)
        : `${rawDelta.toFixed(1)}%`
      : '–'

  const interactive = typeof onClick === 'function'
  const shouldShowDelta = showDelta === 'always' || (showDelta === 'auto' && hasDelta)

  return (
    <Tag
      className={`relative mb-5 overflow-hidden rounded-lg border border-neutral-200 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-900 dark:shadow-none ${sizes[size]} ${className} ${interactive ? 'cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/70' : ''}`}
      onClick={onClick}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
    >
      {/* {accentClass ? (
        <span className={`pointer-events-none absolute inset-x-0 top-0 h-0.5 ${accentClass}`} />
      ) : null} */}

      <div className="mt-2 mb-4 text-center opacity-70 sm:text-left">{title}</div>

      {loading ? (
        <div className="mt-2 flex justify-center " aria-live="polite">
          <Spinner
            className="h-8 w-8 text-neutral-500 dark:text-neutral-300"
            aria-hidden="true"
          />
          <span className="sr-only">Loading</span>
        </div>
      ) : (
        <div className="mt-2 mb-3 flex items-baseline justify-center gap-2">
          <div
            className={`max-w-full leading-tight font-semibold tabular-nums ${shrinkClass}`}
            title={valueTitle}
          >
            {displayValue}
          </div>

          {shouldShowDelta && (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${deltaColor}`}
              title={formattedPrev ? `Prev: ${formattedPrev}` : undefined}
              aria-label={
                ariaLabelDelta ??
                (typeof rawDelta === 'number'
                  ? (isUp ? 'Up ' : 'Down ') + `${rawDelta.toFixed(1)} percent`
                  : 'No change')
              }
            >
              <DeltaIcon className="h-3.5 w-3.5" aria-hidden="true" />
              {formattedDelta}
            </span>
          )}
        </div>
      )}

      {subtitle ? <div className="mt-0.5 text-right text-xs opacity-70">{subtitle}</div> : null}
      {accentClass ? (
        <span className={`pointer-events-none absolute inset-x-0 bottom-0 h-0.5 ${accentClass}`} />
      ) : null}
    </Tag>
  )
}

StatCard.propTypes = {
  title: PropTypes.node.isRequired,
  value: PropTypes.oneOfType([PropTypes.number, PropTypes.string, PropTypes.node]).isRequired,
  previousValue: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  valueFormat: PropTypes.func,
  deltaFormat: PropTypes.func,
  subtitle: PropTypes.node,
  loading: PropTypes.bool,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
  accentClass: PropTypes.string,
  shrinkValue: PropTypes.bool,
  trend: PropTypes.oneOf(['upIsGood', 'downIsGood']),
  onClick: PropTypes.func,
  as: PropTypes.elementType,
  ariaLabelDelta: PropTypes.string,
  showDelta: PropTypes.oneOf(['auto', 'never', 'always']), // <--- NEW
}
