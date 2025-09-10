// comments in English only
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getOrders, updateManyOrderStatus } from '../../api/orders'
import { parseFlexible, formatDMY, endOfDay } from '../../utils/date'
import { getMessage as t } from '../../utils/getMessage'
import FormInput from '../../components/FormInput'
import { useLayout } from '../../context/LayoutContext'
import { OrderCard } from '../../components/OrderCard'
import OrderDetailsModal from '../../components/OrderDetailsModal'
import { formatProductsWithLabels } from '../../utils/transformProducts'
import OrderActionsBar from '../../components/OrderActionsBar'
import StatusModal from '../../components/StatusModal'
import OrdersFilters from '../../components/OrdersFilters'
import { showError, showSuccess, showLoading, dismissToast } from '../../utils/toastUtils'
import { XCircle, FileSpreadsheet, FileText, RotateCcw, X } from 'lucide-react'

const DEFAULT_FILTERS = {
  status: 'all',
  dateFrom: '',
  dateTo: '',
  isUrgent: '',
  shippingRequired: '',
}

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [selectedOrders, setSelectedOrders] = useState([])
  const [glazes, setGlazes] = useState(null) // lazy: null = not loaded yet
  const [filters, setFilters] = useState(DEFAULT_FILTERS)

  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const { setTitle, setShowSplitButton, resetLayout } = useLayout()
  const [showStatusModal, setShowStatusModal] = useState(false)

  // header setup
  useEffect(() => {
    setTitle(t('order.title'))
    setShowSplitButton(true)
    return resetLayout
  }, [setTitle, setShowSplitButton, resetLayout])

  // fetch orders
  useEffect(() => {
    async function fetchOrders() {
      try {
        const data = await getOrders()
        setOrders(data)
      } catch (err) {
        console.error('Failed to fetch orders', err)
      } finally {
        setLoading(false)
      }
    }
    fetchOrders()
  }, [])

  // -- helper: folds accents/diacritics for accent-insensitive search --
  const fold = (s) =>
    (s ?? '')
      .toString()
      .normalize('NFD') // split base letters and accents
      .replace(/[\u0300-\u036f]/g, '') // remove diacritic marks
      .toLowerCase()

  // derived: filtered orders
  const filteredOrders = useMemo(() => {
    const q = fold(search.trim())
    const df = filters.dateFrom ? parseFlexible(filters.dateFrom) : null
    const dt = filters.dateTo ? endOfDay(parseFlexible(filters.dateTo)) : null

    return orders.filter((order) => {
      const name = fold(`${order.customer?.name || ''} ${order.customer?.lastName || ''}`)
      const email = (order.customer?.email || '').toLowerCase()
      const orderID = (order.orderID || '').toLowerCase()
      const matchesSearch = !q || name.includes(q) || email.includes(q) || orderID.includes(q)

      const statusOk = filters.status === 'all' || order.status === filters.status

      const dateVal = order.orderDate || order.createdAt
      const when = dateVal ? new Date(dateVal) : null
      const dateOk = (!df || (when && when >= df)) && (!dt || (when && when <= dt))

      const urgentOk =
        filters.isUrgent === '' ? true : Boolean(order.isUrgent) === (filters.isUrgent === 'true')

      const shippingOk =
        filters.shippingRequired === ''
          ? true
          : Boolean(order.shippingRequired) === (filters.shippingRequired === 'true')

      return matchesSearch && statusOk && dateOk && urgentOk && shippingOk
    })
  }, [orders, search, filters])

  const selectedStatuses = useMemo(() => {
    const set = new Set()
    for (const o of orders) {
      if (selectedOrders.includes(o._id)) set.add(o.status)
    }
    return Array.from(set)
  }, [orders, selectedOrders])

  // bulk status change
  const handleBulkStatusUpdate = async (newStatus) => {
    const toastId = showLoading('order.updatingStatus')
    try {
      await updateManyOrderStatus(selectedOrders, newStatus)
      const updated = orders.map((o) =>
        selectedOrders.includes(o._id) ? { ...o, status: newStatus } : o
      )
      setOrders(updated)
      setSelectedOrders([])
      dismissToast(toastId)
      showSuccess('order.statusUpdated')
    } catch (err) {
      console.error(err)
      dismissToast(toastId)
      showError('order.updateError')
    }
  }

  // chips for active filters
  const chips = useMemo(() => {
    const arr = []
    if (filters.status !== 'all')
      arr.push({
        key: 'status',
        label: `Estado: ${statusLabel(filters.status)}`,
      })
    if (filters.dateFrom) {
      const d = parseFlexible(filters.dateFrom)
      arr.push({
        key: 'dateFrom',
        label: `Desde: ${d ? formatDMY(d) : filters.dateFrom}`,
      })
    }
    if (filters.dateTo) {
      const d = parseFlexible(filters.dateTo)
      arr.push({
        key: 'dateTo',
        label: `Hasta: ${d ? formatDMY(d) : filters.dateTo}`,
      })
    }
    if (filters.isUrgent !== '')
      arr.push({
        key: 'isUrgent',
        label: filters.isUrgent === 'true' ? 'Urgente: Sí' : 'Urgente: No',
      })
    if (filters.shippingRequired !== '')
      arr.push({
        key: 'shippingRequired',
        label: filters.shippingRequired === 'true' ? 'Envío requerido: Sí' : 'Envío requerido: No',
      })
    return arr
  }, [filters])

  const clearChip = (key) => {
    setFilters((f) => {
      const next = { ...f }
      if (key === 'status') next.status = 'all'
      else if (key === 'dateFrom') next.dateFrom = ''
      else if (key === 'dateTo') next.dateTo = ''
      else if (key === 'isUrgent') next.isUrgent = ''
      else if (key === 'shippingRequired') next.shippingRequired = ''
      return next
    })
  }

  const clearAllChips = () => setFilters(DEFAULT_FILTERS)

  return (
    <div className="h-full min-h-0 bg-white pb-[max(1.5rem,var(--bottom-bar-h))] text-black dark:bg-neutral-900 dark:text-white">
      {/* Sticky header (full-bleed inside this component) */}
      <div className="sticky top-0 z-40">
        {/* Single background layer for the header; no shadow to avoid "card" look */}

        <div className="border-b border-gray-200 bg-white px-2 pt-3 dark:border-neutral-800 dark:bg-neutral-900">
          <div className="flex w-full items-end gap-2">
            {/* Search */}
            <div className="flex-1">
              <FormInput
                name="search"
                label={t('button.search')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                floating={false}
                placeholder={t('order.search')}
              />
            </div>

            {/* Filters button + menu */}
            <OrdersFilters value={filters} onChange={setFilters} />
          </div>

          {/* Active filter chips */}
          {chips.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {chips.map((c) => (
                <span
                  key={c.key}
                  className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-2.5 py-1 text-sm dark:bg-neutral-800"
                >
                  {c.label}
                  <button
                    onClick={() => clearChip(c.key)}
                    className="inline-flex h-5 w-5 items-center justify-center rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700"
                    title="Quitar"
                  >
                    ×
                  </button>
                </span>
              ))}
              <button
                onClick={clearAllChips}
                className="ml-1 rounded px-2 py-1 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                Limpiar todo
              </button>
            </div>
          )}

          <OrderActionsBar
            selectedOrders={selectedOrders}
            allVisibleOrders={filteredOrders}
            onClearSelection={() => setSelectedOrders([])}
            onSelectAll={(ids) => setSelectedOrders(ids)}
            onBulkStatusChange={() => setShowStatusModal(true)}
          />
        </div>
      </div>

      {/* Page content padding only below the header */}
      <div className="p-2">
        {/* List */}
        {loading ? (
          <p>{t('order.loading')}</p>
        ) : orders.length === 0 ? (
          <p>{t('order.empty')}</p>
        ) : (
          <ul className="space-y-3 pt-2 pb-14 sm:pt-6">
            {filteredOrders.map((order) => (
              <OrderCard
                key={order._id}
                order={order}
                selectable={true}
                isSelected={selectedOrders.includes(order._id)}
                onSelect={() => {
                  if (selectedOrders.includes(order._id)) {
                    setSelectedOrders(selectedOrders.filter((id) => id !== order._id))
                  } else {
                    setSelectedOrders([...selectedOrders, order._id])
                  }
                }}
                onClick={async () => {
                  if (!glazes) {
                    try {
                      const { getAllGlazes } = await import('../../api/glazes')
                      // pass { navigate } so 401/403 redirects to /login
                      const all = await getAllGlazes({ navigate })
                      setGlazes(all)

                      const labeled = formatProductsWithLabels(order.products, t, all || [])
                      setSelectedOrder({ ...order, products: labeled })
                      return
                    } catch (e) {
                      console.error(e)
                      return
                    }
                  }

                  // already cached
                  const labeled = formatProductsWithLabels(order.products, t, glazes)
                  setSelectedOrder({ ...order, products: labeled })
                }}
              />
            ))}
          </ul>
        )}

        {/* Modals */}
        <OrderDetailsModal
          open={!!selectedOrder}
          order={selectedOrder}
          glazes={glazes || []}
          onClose={() => setSelectedOrder(null)}
        />
        <StatusModal
          open={showStatusModal}
          onClose={() => setShowStatusModal(false)}
          onConfirm={(newStatus) => {
            handleBulkStatusUpdate(newStatus)
            setShowStatusModal(false)
          }}
          currentStatus={selectedStatuses.length === 1 ? selectedStatuses[0] : ''}
          currentStatuses={selectedStatuses.length > 1 ? selectedStatuses : []}
        />
      </div>
    </div>
  )
}

// ---- tiny helpers ----
function statusLabel(k) {
  switch (k) {
    case 'new':
      return 'Nuevo'
    case 'pending':
      return 'Pendiente'
    case 'inProgress':
      return 'En progreso'
    case 'completed':
      return 'Completado'
    case 'cancelled':
      return 'Cancelado'
    default:
      return 'Todos'
  }
}
