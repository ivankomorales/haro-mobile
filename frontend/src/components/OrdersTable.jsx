// comments in English only
import { useEffect, useMemo, useRef } from 'react'
import { getMessage as t } from '../utils/getMessage'
import { formatDMY } from '../utils/date'
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'
import PaginationBar from './PaginationBar'

function IndeterminateCheckbox({ checked, indeterminate, onChange, ariaLabel }) {
  const ref = useRef(null)
  useEffect(() => {
    if (ref.current) ref.current.indeterminate = indeterminate
  }, [indeterminate])
  return (
    <input
      ref={ref}
      type="checkbox"
      className="h-4 w-4 accent-black dark:accent-white"
      checked={checked}
      onChange={(e) => onChange?.(e.target.checked)}
      aria-label={ariaLabel}
      aria-checked={indeterminate ? 'mixed' : checked ? 'true' : 'false'}
    />
  )
}

function getOrderTotal(order) {
  const items = Array.isArray(order?.products) ? order.products : []
  const subtotal = items.reduce((acc, it) => acc + Number(it?.price ?? 0), 0)
  //const deposit = Number(order?.deposit ?? 0)
  return subtotal //- deposit
}

function StatusPill({ value }) {
  const label = (() => {
    switch (value) {
      case 'new':
        return 'New' //TODO i18n
      case 'pending':
        return 'Pending'
      case 'inProgress':
        return 'In progress'
      case 'completed':
        return 'Completed'
      case 'cancelled':
        return 'Cancelled'
      default:
        return value || '—'
    }
  })()
  const cls = (() => {
    switch (value) {
      case 'new':
        return 'bg-blue-100 text-blue-900 dark:bg-blue-900/40 dark:text-blue-200'
      case 'pending':
        return 'bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-200'
      case 'inProgress':
        return 'bg-indigo-100 text-indigo-900 dark:bg-indigo-900/40 dark:text-indigo-200'
      case 'completed':
        return 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-200'
      case 'cancelled':
        return 'bg-rose-100 text-rose-900 dark:bg-rose-900/40 dark:text-rose-200'
      default:
        return 'bg-neutral-100 text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100'
    }
  })()
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${cls}`}>
      {label}
    </span>
  )
}

function SortHeader({ label, column, sort, onSort }) {
  const [key, dir] = (sort || 'orderDate:desc').split(':')
  const isActive = key === column
  const Icon = !isActive ? ArrowUpDown : dir === 'asc' ? ArrowUp : ArrowDown
  const nextDir = isActive ? (dir === 'asc' ? 'desc' : 'asc') : 'desc'
  return (
    <button
      type="button"
      className="inline-flex items-center gap-1 hover:underline"
      onClick={() => onSort?.(`${column}:${nextDir}`)}
      aria-sort={isActive ? (dir === 'asc' ? 'ascending' : 'descending') : 'none'}
    >
      <span>{label}</span>
      <Icon className="h-4 w-4 opacity-70" />
    </button>
  )
}

/**
 * OrdersTable: simple desktop table with page-local selection.
 *
 * Props:
 * - orders: array of orders (current page)
 * - selectedIds: string[] of selected order IDs
 * - onToggleRow(id)
 * - onTogglePage(checked)  -> select/unselect all rows on this page
 * - onRowClick(order)
 * - sort: 'orderDate:desc' | 'orderDate:asc' | ...
 * - onSort(nextSort)
 * - currency: e.g. 'MXN' (defaults to MXN)
 */
export default function OrdersTable({
  orders,
  selectedIds = [],
  onToggleRow,
  onTogglePage,
  onRowClick,
  sort = 'orderDate:desc',
  onSort,
  currency = 'MXN',
}) {
  const pageIds = useMemo(() => orders.map((o) => o._id), [orders])
  const selectedOnPage = useMemo(
    () => orders.filter((o) => selectedIds.includes(o._id)).length,
    [orders, selectedIds]
  )
  const all = orders.length > 0 && selectedOnPage === orders.length
  const some = selectedOnPage > 0 && selectedOnPage < orders.length

  const fmtCurrency = (n) =>
    new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(n ?? 0)

  return (
    <div className="overflow-x-auto rounded-xl border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
      <table className="min-w-full border-collapse text-sm">
        <thead className="bg-neutral-50 text-neutral-500 dark:bg-neutral-800 dark:text-neutral-200">
          <tr className="text-left">
            <th className="w-10 px-3 py-2">
              <IndeterminateCheckbox
                checked={all}
                indeterminate={some}
                onChange={(checked) => onTogglePage?.(checked)}
                ariaLabel="Select all on this page"
              />
            </th>
            <th className="px-3 py-2 font-semibold">
              <SortHeader
                label={t('headers.orderID') || 'ORD#'}
                column="orderID"
                sort={sort}
                onSort={onSort}
              />
            </th>
            <th className="px-3 py-2 font-semibold">
              <SortHeader
                label={t('headers.customer') || 'Customer'}
                column="customer"
                sort={sort}
                onSort={onSort}
              />
            </th>
            <th className="px-3 py-2 font-semibold">
              <SortHeader
                label={t('headers.orderDate') || 'Order date'}
                column="orderDate"
                sort={sort}
                onSort={onSort}
              />
            </th>
            <th className="px-3 py-2 font-semibold">
              <SortHeader
                label={t('headers.status') || 'Status'}
                column="status"
                sort={sort}
                onSort={onSort}
              />
            </th>
            <th className="px-3 py-2 text-right font-semibold">
              <SortHeader
                label={t('headers.total') || 'Total'}
                column="total"
                sort={sort}
                onSort={onSort}
              />
            </th>
          </tr>
        </thead>

        <tbody>
          {orders.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-3 py-6 text-center text-neutral-500">
                {t('order.empty') || 'No orders'}
              </td>
            </tr>
          ) : (
            orders.map((o) => {
              const isSel = selectedIds.includes(o._id)
              const customerName =
                `${o.customer?.name ?? ''} ${o.customer?.lastName ?? ''}`.trim() || '—'
              const dateStr = o.orderDate ? formatDMY(new Date(o.orderDate)) : '—'
              return (
                <tr
                  key={o._id}
                  className={`border-t border-neutral-200 hover:bg-neutral-50/60 dark:border-neutral-800 dark:hover:bg-neutral-800/50 ${isSel ? 'bg-neutral-50 dark:bg-neutral-800/60' : ''}`}
                >
                  <td className="px-3 py-2 align-middle">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-black dark:accent-white"
                      checked={isSel}
                      onChange={() => onToggleRow?.(o._id)}
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`Select ${o.orderID}`}
                    />
                  </td>

                  <td className="px-3 py-2 align-middle">
                    <button
                      className="truncate font-medium hover:underline"
                      onClick={() => onRowClick?.(o)}
                      title={o.orderID}
                    >
                      {o.orderID || '—'}
                    </button>
                  </td>

                  <td className="px-3 py-2 align-middle">
                    <span className="truncate" title={customerName}>
                      {customerName}
                    </span>
                  </td>

                  <td className="px-3 py-2 align-middle">
                    <span className="tabular-nums">{dateStr}</span>
                  </td>

                  <td className="px-3 py-2 align-middle">
                    <StatusPill value={o.status} />
                  </td>

                  <td className="px-3 py-2 text-right align-middle">
                    <span className="font-medium tabular-nums">
                      {fmtCurrency(getOrderTotal(o))}
                    </span>
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>
    </div>
  )
}
