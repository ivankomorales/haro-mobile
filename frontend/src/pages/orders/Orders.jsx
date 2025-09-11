// comments in English only
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getOrdersPage, updateManyOrderStatus } from '../../api/orders'
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
import { Trash2, XCircle, Plus, FileSpreadsheet, FileText, RotateCcw, X } from 'lucide-react'
import PaginationBar from '../../components/PaginationBar'
import OrdersTable from '../../components/OrdersTable'

const DEFAULT_FILTERS = {
  status: 'all',
  dateFrom: '',
  dateTo: '',
  isUrgent: '',
  shippingRequired: '',
}

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [sort, setSort] = useState('orderDate:desc') // server-side sort
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [selectedOrders, setSelectedOrders] = useState([])
  const [glazes, setGlazes] = useState(null)
  const [filters, setFilters] = useState(DEFAULT_FILTERS)

  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const { setTitle, setShowSplitButton, resetLayout } = useLayout()
  const [showStatusModal, setShowStatusModal] = useState(false)

  // pagination state
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(20)
  const [meta, setMeta] = useState({ page: 1, limit: 20, totalDocs: 0, totalPages: 1 })
  const [stats, setStats] = useState(null)

  // ids in current page (for "select page")
  const pageIds = orders.map((o) => o._id)

  // selection helpers
  const onToggleRow = (id) => {
    setSelectedOrders((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }
  const onTogglePage = (checked) => {
    setSelectedOrders((prev) => {
      const set = new Set(prev)
      if (checked) pageIds.forEach((id) => set.add(id))
      else pageIds.forEach((id) => set.delete(id))
      return Array.from(set)
    })
  }

  // header setup
  useEffect(() => {
    setTitle(t('order.title'))
    setShowSplitButton(true)
    return resetLayout
  }, [setTitle, setShowSplitButton, resetLayout])

  // server-side fetch (runs on page/limit/search/filters/sort change)
  useEffect(() => {
    let ignore = false

    async function fetchPaged() {
      setLoading(true)
      try {
        const payload = await getOrdersPage({
          page,
          limit,
          sort, // use state
          status: filters.status !== 'all' ? filters.status : undefined,
          from: filters.dateFrom || undefined,
          to: filters.dateTo || undefined,
          q: search || undefined,
          urgent: filters.isUrgent === '' ? undefined : filters.isUrgent === 'true',
          shipping:
            filters.shippingRequired === '' ? undefined : filters.shippingRequired === 'true',
          includeStats: true,
        })
        if (ignore) return

        if (payload.legacy) {
          // Legacy mode: backend returns everything at once
          setOrders(payload.data || [])
          setMeta({
            page: 1,
            limit,
            totalDocs: (payload.data || []).length,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false,
          })
          setStats(null)
        } else {
          const { data, meta, stats } = payload
          setOrders(Array.isArray(data) ? data : [])

          const safeMeta = normalizeMeta(meta, {
            page,
            limit,
            totalDocs: typeof meta?.totalDocs === 'number' ? meta.totalDocs : 0,
          })
          setMeta(safeMeta)
          setStats(stats || null)

          if (safeMeta.page > safeMeta.totalPages) {
            setPage(safeMeta.totalPages || 1)
          }
        }

        // clear selection on page/filters change
        setSelectedOrders([])
      } catch (e) {
        console.error('Failed to fetch paged orders', e)
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    fetchPaged()
    return () => {
      ignore = true
    }
  }, [page, limit, sort, filters, search])

  // Helper: normalize pagination meta
  function normalizeMeta(meta, fallback) {
    const curPage = Number(meta?.page ?? fallback.page ?? 1)
    const curLimit = Number(meta?.limit ?? fallback.limit ?? 20)
    const total = Number(meta?.totalDocs ?? fallback.totalDocs ?? 0)

    const totalPages = Math.max(1, Math.ceil(total / Math.max(1, curLimit)))
    const pageClamped = Math.min(Math.max(1, curPage), totalPages)

    const hasPrevPage = pageClamped > 1
    const hasNextPage = pageClamped < totalPages

    return {
      page: pageClamped,
      limit: curLimit,
      totalDocs: total,
      totalPages,
      hasNextPage,
      hasPrevPage,
    }
  }

  // chips (active filters)
  const chips = useMemo(() => {
    const arr = []
    // Estado
    if (filters.status !== 'all') {
      arr.push({
        key: 'status',
        label: `${t('status.label')}: ${t(`status.${filters.status}`)}`,
      })
    }
    // Fechas
    if (filters.dateFrom) {
      const d = parseFlexible(filters.dateFrom)
      arr.push({
        key: 'dateFrom',
        label: `${t('labels.from')}: ${d ? formatDMY(d) : filters.dateFrom}`,
      })
    }
    if (filters.dateTo) {
      const d = parseFlexible(filters.dateTo)
      arr.push({
        key: 'dateTo',
        label: `${t('labels.to')}: ${d ? formatDMY(d) : filters.dateTo}`,
      })
    }
    // Urgente
    if (filters.isUrgent !== '') {
      arr.push({
        key: 'isUrgent',
        label:
          `${t('labels.urgent')}: ` +
          (filters.isUrgent === 'true' ? t('labels.yes') : t('labels.no')),
      })
    }
    // Envío requerido
    if (filters.shippingRequired !== '') {
      arr.push({
        key: 'shippingRequired',
        label:
          `${t('labels.shippingRequired')}: ` +
          (filters.shippingRequired === 'true' ? t('labels.yes') : t('labels.no')),
      })
    }
    return arr
  }, [filters, t])

  const clearChip = (key) => {
    setPage(1)
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
  const clearAllChips = () => {
    setPage(1)
    setFilters(DEFAULT_FILTERS)
  }

  // derive selected statuses (for bulk status modal)
  const selectedStatuses = useMemo(() => {
    const set = new Set()
    for (const o of orders) if (selectedOrders.includes(o._id)) set.add(o.status)
    return Array.from(set)
  }, [orders, selectedOrders])

  // bulk status change (server)
  const handleBulkStatusUpdate = async (newStatus) => {
    const toastId = showLoading('order.updatingStatus')
    try {
      await updateManyOrderStatus(selectedOrders, newStatus)
      // optimistic update for current page
      setOrders((prev) =>
        prev.map((o) => (selectedOrders.includes(o._id) ? { ...o, status: newStatus } : o))
      )
      setSelectedOrders([])
      dismissToast(toastId)
      showSuccess('order.statusUpdated')
    } catch (err) {
      console.error(err)
      dismissToast(toastId)
      showError('order.updateError')
    }
  }

  return (
    <div className="h-full p-8 min-h-0 border bg-white pb-[calc(var(--bottom-bar-h,0px)+3.25rem)] text-black lg:pb-6 dark:bg-neutral-900 dark:text-white">
      {/* Subheader (mobile sticky, desktop static) */}
      <div className="sticky top-[var(--appbar-h,0px)] z-30 border-gray-200 bg-white lg:static lg:top-auto lg:z-auto dark:border-neutral-800 dark:bg-neutral-900">
        <div className="px-2 py-2">
          {/* Row 1: Subtitle + Add */}
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-semibold">{t('orders.all') || 'All Orders'}</h2>

            <button
              type="button"
              onClick={() =>
                navigate('/orders/add', {
                  state: {
                    originPath: location?.pathname,
                    from: location?.pathname,
                    returnTo: '/orders',
                  },
                })
              }
              aria-label={t('order.add') || 'Add new order'}
              title={t('order.add') || 'Add new order'}
              className={[
                'inline-flex items-center rounded-md border border-neutral-200 bg-white px-3 py-2 text-sm font-medium',
                'hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800',
              ].join(' ')}
            >
              <Plus className="h-5 w-5 sm:mr-2" />
              <span>{t('order.add') || 'Add new'}</span>
            </button>
          </div>

          {/* Row 2: Stat cards (3) */}
          <div className="mt-2 grid grid-cols-3 gap-2 sm:gap-3">
            {/* Card 1: Orders this month */}
            <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-800 dark:bg-neutral-900">
              <div className="opacity-70">{t('stats.thisMonth') || 'Orders this month'}</div>
              {stats?.month ? (
                <div className="mt-1 text-lg font-semibold tabular-nums">{stats.month.total}</div>
              ) : (
                <div className="mt-1 h-6 w-12 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
              )}
            </div>

            {/* Card 2: Pending */}
            <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-800 dark:bg-neutral-900">
              <div className="opacity-70">{t('stats.pending') || 'Pending'}</div>
              {stats?.month ? (
                <div className="mt-1 text-lg font-semibold tabular-nums">{stats.month.pending}</div>
              ) : (
                <div className="mt-1 h-6 w-12 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
              )}
            </div>

            {/* Card 3: Completed */}
            <div className="rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm dark:border-neutral-800 dark:bg-neutral-900">
              <div className="opacity-70">{t('stats.completed') || 'Completed'}</div>
              {stats?.month ? (
                <div className="mt-1 text-lg font-semibold tabular-nums">
                  {stats.month.shipped /* completed */}
                </div>
              ) : (
                <div className="mt-1 h-6 w-12 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
              )}
            </div>
          </div>

          {/* Row 3: Search + Filters */}
          <div className="mt-2 flex items-end gap-2">
            {/* Search (shorter, with clear X) */}
            <div className="relative max-w-[520px] flex-1">
              <FormInput
                name="search"
                // label={t('button.search')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                floating={false}
                placeholder={t('order.search')}
                inputClassName="pr-9" // ensure right padding so X does not cover text
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  aria-label={t('clear') || 'Clear'}
                  className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              )}
            </div>
            {/* Filters */}
            <OrdersFilters
              value={filters}
              onChange={(v) => {
                setPage(1)
                setFilters(v)
              }}
            />
          </div>

          {/* Row 4: Chips */}
          {chips.length > 0 && (
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {chips.map((c) => (
                <span
                  key={c.key}
                  className="inline-flex items-center gap-2 rounded-full bg-neutral-100 px-2.5 py-1 text-sm dark:bg-neutral-800"
                >
                  {c.label}
                  <button
                    onClick={() => clearChip(c.key)}
                    className="inline-flex h-5 w-5 items-center justify-center rounded-full hover:bg-neutral-200 dark:hover:bg-neutral-700"
                    title={t('clear') || 'Clear'}
                  >
                    ×
                  </button>
                </span>
              ))}
              <button
                onClick={clearAllChips}
                className="ml-1 rounded px-2 py-1 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                {t('clear') || 'Clear all'}
              </button>
            </div>
          )}

        </div>
      </div>

      <div className="p-2">
        {/* Optional: stat cards from `stats` */}
        {stats?.month && (
          <div className="mb-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {/* render four small cards with stats.month.total/pending/shipped/refunded */}
          </div>
        )}
        {/* Loading */}
        {loading ? (
          <p>{t('order.loading')}</p>
        ) : orders.length === 0 ? (
          <p>{t('order.empty')}</p>
        ) : (
          <>
            {/* Desktop: table */}
            <div className="hidden lg:block">
              <OrderActionsBar
                selectedOrders={selectedOrders}
                allVisibleOrders={orders} // server-paged slice
                onClearSelection={() => setSelectedOrders([])}
                onSelectAll={(ids) => setSelectedOrders(ids)}
                onBulkStatusChange={() => setShowStatusModal(true)}
              />
              <OrdersTable
                orders={orders}
                selectedIds={selectedOrders}
                onToggleRow={onToggleRow}
                onTogglePage={onTogglePage}
                onRowClick={async (order) => {
                  // reuse modal logic
                  if (!glazes) {
                    try {
                      const { getAllGlazes } = await import('../../api/glazes')
                      const all = await getAllGlazes({ navigate })
                      setGlazes(all)
                    } catch (e) {
                      console.error(e)
                    }
                  }
                  const labeled = formatProductsWithLabels(order.products, t, glazes || [])
                  setSelectedOrder({ ...order, products: labeled })
                }}
                sort={sort}
                onSort={(next) => {
                  setSort(next)
                  setPage(1)
                }}
              />
            </div>

            {/* Mobile: keep cards */}
            <div className="lg:hidden">
              <OrderActionsBar
                selectedOrders={selectedOrders}
                allVisibleOrders={orders} // server-paged slice
                onClearSelection={() => setSelectedOrders([])}
                onSelectAll={(ids) => setSelectedOrders(ids)}
                onBulkStatusChange={() => setShowStatusModal(true)}
              />
              <ul className="space-y-3 pt-2 pb-14 sm:pt-6">
                {orders.map((order) => (
                  <OrderCard
                    key={order._id}
                    order={order}
                    selectable={true}
                    isSelected={selectedOrders.includes(order._id)}
                    onSelect={() => onToggleRow(order._id)}
                    onClick={async () => {
                      if (!glazes) {
                        try {
                          const { getAllGlazes } = await import('../../api/glazes')
                          const all = await getAllGlazes({ navigate })
                          setGlazes(all)
                        } catch (e) {
                          console.error(e)
                        }
                      }
                      const labeled = formatProductsWithLabels(order.products, t, glazes || [])
                      setSelectedOrder({ ...order, products: labeled })
                    }}
                  />
                ))}
              </ul>
            </div>
          </>
        )}

        {/* simple pagination footer */}
        {!loading && (
          <PaginationBar
            page={meta.page || 1}
            totalPages={meta.totalPages || 1}
            totalDocs={meta.totalDocs}
            limit={limit}
            visibleCount={orders.length}
            onPrev={() => setPage((p) => Math.max(1, p - 1))}
            onNext={() => setPage((p) => p + 1)}
            onLimitChange={(val) => {
              setPage(1)
              setLimit(val)
            }}
            variant="auto" // sticky on mobile, block on desktop
          />
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
