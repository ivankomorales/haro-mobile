// comments in English only
import { ArrowUpDown, ArrowUp, ArrowDown, Pencil, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

import ConfirmModal from './ConfirmModal'
import { formatDMY } from '../utils/date'
import { getMessage as t } from '../utils/getMessage'
import { getStatusLabel, getStatusClasses } from '../utils/orderStatusUtils'

function IndeterminateCheckbox({ checked, indeterminate, onChange, ariaLabel }) {
  const ref = useRef(null)

  useEffect(() => {
    if (!ref.current) return
    // Important: re-apply whenever either flag changes.
    ref.current.indeterminate = Boolean(indeterminate) && !checked
  }, [indeterminate, checked])

  return (
    <input
      ref={ref}
      type="checkbox"
      className="h-4 w-4" 
      checked={checked}
      onChange={(e) => onChange?.(e.target.checked)}
      aria-label={ariaLabel}
      aria-checked={indeterminate ? 'mixed' : checked ? 'true' : 'false'}
    />
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Money helpers (prefer new fields; fallback to safe local calc)
// ─────────────────────────────────────────────────────────────────────────────
function getOrderNet(o) {
  // New model
  if (typeof o?.orderTotal === 'number') return Math.round(o.orderTotal)

  // Fallback (legacy docs or partial payloads)
  const items = Array.isArray(o?.products) ? o.products : []
  let gross = 0
  let discounts = 0
  for (const p of items) {
    const qty = Math.max(1, Number(p?.quantity ?? 1))
    const price = Math.max(0, Number(p?.price ?? 0))
    const unitDisc = Math.max(0, Math.min(Number(p?.discount ?? 0), price)) // clamp ≤ price
    gross += qty * price
    discounts += qty * unitDisc
  }
  return Math.max(0, Math.round(gross - discounts))
}

function getOrderDue(o) {
  // New model
  if (typeof o?.amountDue === 'number') return Math.round(o.amountDue)

  // Fallback from net − deposit
  const net = getOrderNet(o)
  const deposit = Math.max(0, Number(o?.deposit ?? 0))
  return Math.max(0, Math.round(net - deposit))
}

function StatusPill({ value }) {
  const label = getStatusLabel(value, t)
  const cls = getStatusClasses(value)
  return (
    <span className={cls} title={label}>
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
 * OrdersTable
 *
 * Props:
 * - orders: array of orders (current page)
 * - selectedIds: string[] of selected order IDs
 * - onToggleRow(id)
 * - onTogglePage(checked)  -> select/unselect all rows on this page
 * - onRowClick(order)
 * - sort: 'orderDate:desc' | 'orderDate:asc' | 'orderTotal:desc' | ...
 * - onSort(nextSort)
 * - onCancelOrder(id): Promise<void>
 * - currency: e.g. 'MXN' (defaults to MXN)
 * - moneyColumn: 'net' | 'due'   (what to show in the main money column; default 'net')
 * - showDueColumn: boolean        (adds a separate Due column; default false)
 */
export default function OrdersTable({
  orders,
  selectedIds = [],
  onToggleRow,
  onTogglePage,
  onRowClick,
  sort = 'orderDate:desc',
  onSort,
  onCancelOrder,
  currency = 'MXN',
  moneyColumn = 'net',
  showDueColumn = false,
}) {
  // Modal state
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmId, setConfirmId] = useState(null)
  const [busyId, setBusyId] = useState(null)

  // Navigation
  const navigate = useNavigate()
  const location = useLocation()

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
    }).format(Number.isFinite(Number(n)) ? Number(n) : 0)

  // Which column and label do we use for the main money column?
  const mainMoneyGetter = moneyColumn === 'due' ? getOrderDue : getOrderNet
  const mainMoneySortField = moneyColumn === 'due' ? 'amountDue' : 'orderTotal'
  const mainMoneyLabel =
    moneyColumn === 'due'
      ? t('headers.due') || 'Due'
      : t('headers.net') || t('headers.total') || 'Total'

  // Header col count (for empty row colSpan)
  const headerCols =
    1 /*checkbox*/ +
    5 /*id, customer, date, status, money*/ +
    1 /*actions*/ +
    (showDueColumn ? 1 : 0)

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

            {/* Main money column (Net or Due) */}
            <th className="px-3 py-2 text-right font-semibold">
              <SortHeader
                label={mainMoneyLabel}
                column={mainMoneySortField}
                sort={sort}
                onSort={onSort}
              />
            </th>

            {/* Optional separate "Due" column */}
            {showDueColumn && (
              <th className="px-3 py-2 text-right font-semibold">
                <SortHeader
                  label={t('headers.due') || 'Due'}
                  column="amountDue"
                  sort={sort}
                  onSort={onSort}
                />
              </th>
            )}

            <th className="px-3 py-2 text-right font-semibold">
              {t('headers.actions') || 'Actions'}
            </th>
          </tr>
        </thead>

        <tbody>
          {orders.length === 0 ? (
            <tr>
              <td colSpan={headerCols} className="px-3 py-6 text-center text-neutral-500">
                {t('order.empty') || 'No orders'}
              </td>
            </tr>
          ) : (
            orders.map((o) => {
              const isSel = selectedIds.includes(o._id)
              const customerName =
                `${o.customer?.name ?? ''} ${o.customer?.lastName ?? ''}`.trim() || '—'
              const dateStr = o.orderDate ? formatDMY(new Date(o.orderDate)) : '—'

              const handleEdit = () => {
                navigate(`/orders/${o._id}/edit`, { state: { originPath: location.pathname } })
              }

              const askCancel = (orderId) => {
                // Open confirm modal; we defer to onCancelOrder prop on confirm
                // (keeps this component UI-only, no fetch here)
                // eslint-disable-next-line no-undef
                setConfirmId(orderId)
                // eslint-disable-next-line no-undef
                setConfirmOpen(true)
              }

              return (
                <tr
                  key={o._id}
                  className={`border-t border-neutral-200 hover:bg-neutral-50/60 dark:border-neutral-800 dark:hover:bg-neutral-800/50 ${
                    isSel ? 'bg-neutral-50 dark:bg-neutral-800/60' : ''
                  }`}
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

                  {/* Main money column */}
                  <td className="px-3 py-2 text-right align-middle">
                    <span className="font-medium tabular-nums">
                      {fmtCurrency(mainMoneyGetter(o))}
                    </span>
                  </td>

                  {/* Optional separate "Due" column */}
                  {showDueColumn && (
                    <td className="px-3 py-2 text-right align-middle">
                      <span className="tabular-nums">{fmtCurrency(getOrderDue(o))}</span>
                    </td>
                  )}

                  {/* Actions */}
                  <td className="px-3 py-2 align-middle">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        title={t('button.edit') || 'Edit'}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleEdit()
                        }}
                        className="rounded p-1 text-blue-600 hover:bg-neutral-100 hover:text-blue-800 dark:text-blue-400/70 dark:hover:bg-neutral-700 dark:hover:text-blue-400/90"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        title={t('button.delete') || 'Delete'}
                        onClick={(e) => {
                          e.stopPropagation()
                          setConfirmId(o._id)
                          setConfirmOpen(true)
                        }}
                        className="rounded p-1 text-red-600 hover:bg-neutral-100 dark:text-red-400/70 dark:hover:bg-neutral-700 dark:hover:text-red-400/90"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })
          )}
        </tbody>
      </table>

      {/* Cancel order confirmation */}
      <ConfirmModal
        open={confirmOpen}
        onClose={() => {
          if (busyId) return // don't close while working
          setConfirmOpen(false)
          setConfirmId(null)
        }}
        onConfirm={async () => {
          if (!confirmId) return
          try {
            setBusyId(confirmId)
            await onCancelOrder?.(confirmId)
          } finally {
            setBusyId(null)
            setConfirmOpen(false)
            setConfirmId(null)
          }
        }}
        title={t('confirm.cancelOrder.title') || 'Cancel this order?'}
        message={t('confirm.cancelOrder.message') || 'This action cannot be undone.'}
        confirmText={
          busyId && confirmId === busyId
            ? t('common.working') || 'Working...'
            : t('common.delete') || 'Delete'
        }
        cancelText={t('common.cancel') || 'Cancel'}
      />
    </div>
  )
}
