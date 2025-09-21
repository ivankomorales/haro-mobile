// src/components/StatCards.jsx
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo, useState, useCallback } from 'react'
import StatCard from './StatCard'

/**
 * Props:
 * - stats: {
 *     count: { total, pendingGroup, completed },
 *     totals: { subtotal, due }   // from your /stats endpoint
 *   }
 * - loading: boolean
 * - t: getMessage function (key: string) => string | undefined
 * - size: 'sm' | 'md' | 'lg'
 * - className: string
 * - showMobileCarousel: boolean (default: true)
 * - currency: string (ISO 4217, default 'MXN')
 * - locale: string (BCP 47, default 'es-MX')
 */
export default function StatCards({
  stats,
  loading,
  t,
  size = 'md',
  className = '',
  showMobileCarousel = true,
  currency = 'MXN',
  locale = 'es-MX',
}) {
  const count = stats?.count
  const totals = stats?.totals

  // Currency formatter once
  const fmt = useMemo(
    () =>
      new Intl.NumberFormat(locale, {
        style: 'currency',
        currency,
        maximumFractionDigits: 2,
      }),
    [locale, currency]
  )

  // Build cards (memoized)
  const cards = useMemo(
    () => [
      {
        key: 'inRange',
        title: t?.('stats.inRange') || 'Orders (range)',
        value: count?.total ?? 0,
      },
      {
        key: 'completed',
        title: t?.('stats.completed') || 'Completed',
        value: count?.completed ?? 0,
      },
      {
        key: 'pending',
        title: t?.('stats.pending') || 'Pending',
        value: count?.pendingGroup ?? 0,
      },
      {
        key: 'netSales',
        title: t?.('stats.netSales') || 'Net sales',
        // Your backend exposes `totals.subtotal` as gross - discount (net sales)
        value: fmt.format(totals?.orderTotal ?? 0),
      },
      {
        key: 'amountDue',
        title: t?.('stats.amountDue') || 'Amount due',
        // From backend: totals.due (alias of subtotal - deposit)
        value: fmt.format(totals?.amountDue ?? 0),
      },
    ],
    [count, totals, t, fmt]
  )

  // Simple mobile carousel state
  const [i, setI] = useState(0)
  const total = cards.length
  const prev = useCallback(() => setI((v) => (v - 1 + total) % total), [total])
  const next = useCallback(() => setI((v) => (v + 1) % total), [total])

  const ariaPrev = t?.('pagination.previous') || 'Previous'
  const ariaNext = t?.('pagination.next') || 'Next'

  return (
    <div className={className}>
      {/* MOBILE: single card with chevrons */}
      {showMobileCarousel && (
        <div className="relative sm:hidden">
          <StatCard
            size={size}
            title={cards[i].title}
            value={cards[i].value}
            subtitle={cards[i].subtitle}
            loading={loading}
          />

          {/* Left chevron */}
          <button
            type="button"
            onClick={prev}
            aria-label={ariaPrev}
            className="absolute top-1/2 left-1 -translate-y-1/2 rounded-full bg-white/10 p-2 shadow hover:bg-white focus:ring focus:outline-none"
          >
            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
          </button>

          {/* Right chevron */}
          <button
            type="button"
            onClick={next}
            aria-label={ariaNext}
            className="absolute top-1/2 right-1 -translate-y-1/2 rounded-full bg-white/10 p-2 shadow hover:bg-white focus:ring focus:outline-none"
          >
            <ChevronRight className="h-5 w-5" aria-hidden="true" />
          </button>

          {/* Indicators */}
          <div className="mt-2 flex items-center justify-center gap-1">
            {cards.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setI(idx)}
                className={`h-1.5 w-4 rounded-full transition-all ${i === idx ? 'bg-gray-800' : 'bg-gray-300'}`}
              />
            ))}
          </div>
        </div>
      )}

      {/* TABLET/DESKTOP: responsive grid */}
      <div className="hidden grid-cols-2 gap-2 sm:grid sm:grid-cols-5 sm:gap-8">
        {cards.map((c) => (
          <StatCard
            key={c.key}
            size={size}
            title={c.title}
            value={c.value}
            subtitle={c.subtitle}
            loading={loading}
          />
        ))}
      </div>
    </div>
  )
}
