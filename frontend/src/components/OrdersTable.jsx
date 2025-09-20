// comments in English only
import { ArrowUpDown, ArrowUp, ArrowDown, Pencil, Trash2 } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

import ConfirmModal from './ConfirmModal'
import { cancelOrderById } from '../api/orders' // NEW HELPER
import { formatDMY } from '../utils/date'
import { getMessage as t } from '../utils/getMessage'
import { getOriginPath } from '../utils/navigationUtils'
import { getStatusLabel, getStatusClasses } from '../utils/orderStatusUtils'
import { showError, showSuccess } from '../utils/toastUtils'

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

// Payment Calculations
function getOrderTotal(order) {
  if (typeof order?.total === 'number') return order.total
  // Fallback (por si entra uno sin backfill):
  const items = Array.isArray(order?.products) ? order.products : []
  const subtotal = items.reduce((acc, p) => {
    const qty = Number(p?.quantity ?? 1)
    const price = Number(p?.price ?? 0)
    const disc = Number(p?.discount ?? 0)
    return acc + qty * Math.max(price - disc, 0)
  }, 0)
  const deposit = Number(order?.deposit ?? 0)
  return Math.round(subtotal - deposit)
}

function getOrderSubtotal(order) {
  if (typeof order?.subtotal === 'number') return Math.round(order.subtotal)
  // Fallback (por si entra uno sin backfill):
  const items = Array.isArray(order?.products) ? order.products : []
  const subtotal = items.reduce((acc, p) => {
    const qty = Number(p?.quantity ?? 1)
    const price = Number(p?.price ?? 0)
    const disc = Number(p?.discount ?? 0)
    return acc + qty * Math.max(price - disc, 0)
  }, 0)
  return Math.round(subtotal)
}

function getOrderDue(order) {
  const subtotal = getOrderSubtotal(order)
  const deposit = Number(order?.deposit ?? 0)
  return Math.max(0, Math.round(subtotal - deposit))
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

const handleConfirm = async () => {
  if (confirmType !== 'delete' || !confirmId) return
  setLoading(true)
  try {
    // si quieres súper simple: sin filtros, usa solo refreshStats=true
    const qs = toQS({ refreshStats: true })

    const res = await fetch(`/api/orders/${confirmId}?${qs}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        // si usas JWT:
        Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
      },
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data?.message || 'Cancel failed')

    // ⬇️ Actualiza tus StatCards (asumiendo tienes setStats en props/estado)
    if (data.stats) {
      setStats(data.stats)
    } else {
      // por si aún no pegaste computeOrderStatsFromQuery en backend:
      const resStats = await fetch('/api/orders/stats')
      const stats = await resStats.json()
      setStats(stats)
    }

    // (opcional) también puedes reflejar el cambio en la tabla localmente:
    // setRows((rows) => rows.map(r => r._id === confirmId ? { ...r, status: 'cancelled' } : r))

    // feedback
    // toast.success('Pedido cancelado')
  } catch (err) {
    console.error(err)
    // toast.error(err.message || 'No se pudo cancelar')
  } finally {
    setLoading(false)
    setConfirmOpen(false)
    setConfirmId(null)
    setConfirmType(null)
  }
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
  onCancelOrder,
  currency = 'MXN',
}) {
  // Modal
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmId, setConfirmId] = useState(null)
  const [confirmType, setConfirmType] = useState(null)
  const [busyId, setBusyId] = useState(null)

  //Navigation
  const navigate = useNavigate()
  const location = useLocation()

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
            <th className="px-3 py-2 text-right font-semibold">Actions</th>
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

              // Edit Order
              const handleEdit = () => {
                navigate(`/orders/${o._id}/edit`, { state: { originPath: location.pathname } }) // o '/orders/:id/edit-products'
              }

              // Delete Order (soft-delete)
              const handleDelete = (orderId) => {
                setConfirmId(orderId)
                setConfirmType('delete')
                setConfirmOpen(true)
              }

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
                      {fmtCurrency(getOrderSubtotal(o))}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-3 py-2 align-middle">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        title={t('button.edit')}
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
                          handleDelete(o._id)
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
      <ConfirmModal
        open={confirmOpen}
        onClose={() => {
          if (busyId) return // do not close while working the request
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
