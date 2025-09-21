// src/components/OpenBalancesTable.jsx
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getOpenBalances, getDueGrandTotal } from '../api/orders'
import { getMessage as t } from '../utils/getMessage'
import { format } from 'date-fns'

export default function OpenBalancesTable({ locale = 'es-MX', currency = 'MXN' }) {
  const navigate = useNavigate()
  const [rows, setRows] = useState([])
  const [meta, setMeta] = useState({ page: 1, limit: 25, totalDocs: 0, totalPages: 1 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [grandDue, setGrandDue] = useState(0)

  const fmt = useMemo(
    () => new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 2 }),
    [locale, currency]
  )

  const load = async (page = 1) => {
    try {
      setLoading(true)
      setError('')
      const [{ data, meta }, stats] = await Promise.all([
        getOpenBalances({ page, limit: meta.limit, sort: 'orderDate:desc' }),
        getDueGrandTotal(),
      ])
      setRows(data || [])
      setMeta(meta || { page, limit: 25, totalDocs: 0, totalPages: 1 })
      setGrandDue(stats?.totals?.due ?? 0)
    } catch (e) {
      setError(e.message || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load(1)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const go = (p) => load(Math.max(1, Math.min(p, meta.totalPages)))

  return (
    <div className="mx-auto w-full max-w-5xl">
      {/* Header + grand total */}
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-lg font-semibold">{t('balances.open') || 'Open balances'}</h2>
        <div className="text-sm">
          <span className="text-neutral-500">
            {t('balances.grandTotal') || 'Grand total due'}:{' '}
          </span>
          <span className="font-semibold">{fmt.format(grandDue || 0)}</span>
        </div>
      </div>

      {/* Content */}
      <div className="overflow-hidden rounded-xl ring-1 ring-black/5 dark:ring-white/10">
        {/* Desktop table */}
        <table className="hidden min-w-full border-separate border-spacing-0 text-sm md:table">
          <thead className="bg-neutral-50 text-xs tracking-wide text-neutral-500 uppercase dark:bg-neutral-800 dark:text-neutral-400">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">{t('order.number') || 'Order'}</th>
              <th className="px-4 py-3 text-left font-semibold">
                {t('customer.title') || 'Customer'}
              </th>
              <th className="px-4 py-3 text-left font-semibold">{t('order.date') || 'Date'}</th>
              <th className="px-4 py-3 text-right font-semibold">
                {t('stats.amountDue') || 'Amount due'}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-200 bg-white dark:divide-neutral-800 dark:bg-neutral-900">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-neutral-500">
                  {t('loading.default') || 'Loading…'}
                </td>
              </tr>
            ) : error ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-red-600">
                  {error}
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-neutral-500">
                  {t('balances.none') || 'No open balances'}
                </td>
              </tr>
            ) : (
              rows.map((o) => (
                <tr
                  key={o._id}
                  className="cursor-pointer hover:bg-neutral-50 dark:hover:bg-neutral-800/60"
                  onClick={() => navigate(`/orders/${o._id}/details`)}
                >
                  <td className="px-4 py-3">{o.orderID}</td>
                  <td className="px-4 py-3">
                    {o.customer?.name} {o.customer?.lastName}
                  </td>
                  <td className="px-4 py-3">
                    {o.orderDate ? format(new Date(o.orderDate), 'MMM dd, yyyy') : '—'}
                  </td>
                  <td className="px-4 py-3 text-right font-medium">
                    {fmt.format(o.amountDue || 0)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Mobile cards */}
        <div className="md:hidden">
          {loading ? (
            <div className="p-4 text-center text-neutral-500">
              {t('loading.default') || 'Loading…'}
            </div>
          ) : error ? (
            <div className="p-4 text-center text-red-600">{error}</div>
          ) : rows.length === 0 ? (
            <div className="p-4 text-center text-neutral-500">
              {t('balances.none') || 'No open balances'}
            </div>
          ) : (
            <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {rows.map((o) => (
                <li
                  key={o._id}
                  className="flex items-center justify-between gap-3 p-4"
                  onClick={() => navigate(`/orders/${o._id}/details`)}
                >
                  <div>
                    <div className="font-medium">{o.orderID}</div>
                    <div className="text-xs text-neutral-500">
                      {o.customer?.name} {o.customer?.lastName}
                      {o.orderDate ? ` · ${format(new Date(o.orderDate), 'MMM dd, yyyy')}` : ''}
                    </div>
                  </div>
                  <div className="text-right font-semibold">{fmt.format(o.amountDue || 0)}</div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Pagination (simple) */}
      {meta.totalPages > 1 && (
        <div className="mt-3 flex items-center justify-between text-sm">
          <button
            disabled={meta.page <= 1 || loading}
            onClick={() => go(meta.page - 1)}
            className="rounded border px-3 py-1 disabled:opacity-50"
          >
            {t('pagination.previous') || 'Previous'}
          </button>
          <div className="text-neutral-500">
            {t('pagination.page') || 'Page'} {meta.page} / {meta.totalPages}
          </div>
          <button
            disabled={meta.page >= meta.totalPages || loading}
            onClick={() => go(meta.page + 1)}
            className="rounded border px-3 py-1 disabled:opacity-50"
          >
            {t('pagination.next') || 'Next'}
          </button>
        </div>
      )}
    </div>
  )
}
