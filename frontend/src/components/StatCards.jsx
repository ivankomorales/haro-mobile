// src/components/StatCards.jsx
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useMemo, useState, useCallback } from 'react'

import StatCard from './StatCard'

/**
 * Props:
 * - stats: { count: { total, pendingGroup, completed }, totals: { net } }
 * - loading: boolean
 * - t: getMessage function (key: string) => string | undefined
 * - size: 'sm' | 'md' | 'lg'
 * - className: string
 * - showMobileCarousel: boolean (default: true)
 */
export default function StatCards({
  stats,
  loading,
  t, // <= getMessage passed in as `t`
  size = 'md',
  className = '',
  showMobileCarousel = true,
}) {
  const count = stats?.count
  const totals = stats?.totals

  // Build cards once based on deps
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
        value: new Intl.NumberFormat('es-MX', {
          style: 'currency',
          currency: 'MXN',
        }).format(totals?.subtotal ?? 0),
        // subtitle: t?.('stats.grossMinusDeposit') || 'Gross − Deposit',
      },
    ],
    [stats, t]
  )

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

      {/* TABLET/DESKTOP: original grid */}
      <div className="hidden grid-cols-2 gap-2 sm:grid sm:grid-cols-4 sm:gap-8">
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
