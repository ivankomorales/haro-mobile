// comments in English only

// ───────────────────────────────────────────────────────────────────────────────
// External libs
// ───────────────────────────────────────────────────────────────────────────────
import { useEffect, useMemo, useState, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { XCircle, Plus, X, Calendar } from 'lucide-react' // Icons

// ───────────────────────────────────────────────────────────────────────────────
// App hooks & context
// ───────────────────────────────────────────────────────────────────────────────
import { useLayout } from '../../context/LayoutContext'
import { useOrderStats } from '../../hooks/useOrderStats'

// ───────────────────────────────────────────────────────────────────────────────
// API
// ───────────────────────────────────────────────────────────────────────────────
import { getOrdersPage, updateManyOrderStatus, cancelOrderById } from '../../api/orders'

// ───────────────────────────────────────────────────────────────────────────────
// Utils
// ───────────────────────────────────────────────────────────────────────────────
import { parseFlexible, formatDMY } from '../../utils/date'
import { getMessage as t } from '../../utils/getMessage'
import { showError, showSuccess, showLoading, dismissToast } from '../../utils/toastUtils'
import { formatProductsWithLabels } from '../../utils/transformProducts'

// ───────────────────────────────────────────────────────────────────────────────
// UI components
// ───────────────────────────────────────────────────────────────────────────────
import FormInput from '../../components/FormInput'
import { OrderCard } from '../../components/OrderCard'
import OrderDetailsModal from '../../components/OrderDetailsModal'
import OrderActionsBar from '../../components/OrderActionsBar'
import StatusModal from '../../components/StatusModal'
import OrdersFilters from '../../components/OrdersFilters'
import PaginationBar from '../../components/PaginationBar'
import OrdersTable from '../../components/OrdersTable'
import TableSkeleton from '../../components/TableSkeleton'
import StatCards from '../../components/StatCards'

// ───────────────────────────────────────────────────────────────────────────────
// Constants
// ───────────────────────────────────────────────────────────────────────────────
const DEFAULT_FILTERS = {
  status: 'all',
  dateFrom: '',
  dateTo: '',
  isUrgent: '',
  shippingRequired: '',
}

const DEFAULT_META = { page: 1, limit: 20, totalDocs: 0, totalPages: 1 }

// ───────────────────────────────────────────────────────────────────────────────
// Pure helpers (no hooks here)
// ───────────────────────────────────────────────────────────────────────────────
function normalizeMeta(meta, fallback) {
  const curPage = Number(meta?.page ?? fallback.page ?? 1)
  const curLimit = Number(meta?.limit ?? fallback.limit ?? 20)
  const total = Number(meta?.totalDocs ?? fallback.totalDocs ?? 0)
  const totalPages = Math.max(1, Math.ceil(total / Math.max(1, curLimit)))
  const pageClamped = Math.min(Math.max(1, curPage), totalPages)
  return {
    page: pageClamped,
    limit: curLimit,
    totalDocs: total,
    totalPages,
    hasNextPage: pageClamped < totalPages,
    hasPrevPage: pageClamped > 1,
  }
}

// Simple debounce for primitive values
function useDebounced(value, ms = 100) {
  const [v, setV] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setV(value), ms)
    return () => clearTimeout(id)
  }, [value, ms])
  return v
}

// Simple mobile cards skeleton (pure, reusable)
function MobileOrdersSkeleton({ count = 8 }) {
  return (
    <div>
      <div className="mt-10 h-4 w-1/2 rounded bg-neutral-200 dark:bg-neutral-700" />
      <ul className="space-y-3 pt-2 pb-14 sm:pt-6">
        {Array.from({ length: count }).map((_, i) => (
          <li key={i} className="rounded border border-neutral-200 p-3 dark:border-neutral-800">
            <div className="flex animate-pulse items-center gap-3">
              {/* Left: avatar / color box */}
              <div className="h-5 w-5 rounded-md border bg-neutral-200 dark:bg-neutral-700" />

              <div className="flex w-full items-center justify-between">
                {/* LEFT: name + date */}
                <div className="min-w-0 flex-1 pr-3">
                  {/* Name */}
                  <div
                    className="h-4 w-2/3 rounded bg-neutral-200 dark:bg-neutral-700"
                    aria-hidden="true"
                  />
                  {/* Date */}
                  <div
                    className="mt-1 h-3 w-24 rounded bg-neutral-200 dark:bg-neutral-700"
                    aria-hidden="true"
                  />
                  setStats
                </div>

                {/* RIGHT: order id + status (non-shrinking block) */}
                <div className="flex shrink-0 flex-col items-end gap-2 whitespace-nowrap">
                  {/* ORD#6010 */}
                  <div
                    className="h-4 w-24 rounded bg-neutral-200 dark:bg-neutral-700"
                    aria-hidden="true"
                  />
                  {/* Status pill */}
                  <div
                    className="h-6 w-28 rounded-full bg-neutral-200 dark:bg-neutral-700"
                    aria-hidden="true"
                  />
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

// ───────────────────────────────────────────────────────────────────────────────
// Component
// ───────────────────────────────────────────────────────────────────────────────
export default function Orders() {
  // App/Navigation
  const navigate = useNavigate()
  const location = useLocation()
  const { setTitle, setShowSplitButton, resetLayout } = useLayout()

  // Data state
  const [orders, setOrders] = useState([])
  const [stats, setStats] = useState(null)
  const [meta, setMeta] = useState(DEFAULT_META)
  const [glazes, setGlazes] = useState(null)

  // View/UI state
  const [loading, setLoading] = useState(true)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)

  // Query state
  const [search, setSearch] = useState('')
  const [filters, setFilters] = useState(DEFAULT_FILTERS)
  const [sort, setSort] = useState('orderDate:desc')
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(5)
  const debouncedSearch = useDebounced(search, 400)
  // Selection state
  const [selectedOrders, setSelectedOrders] = useState([])

  // Stats (cards)
  const {
    stats: agg,
    loading: statsLoading,
    refresh: refreshStats,
    range,
    setRange,
    // Optional if we need to expose them later
    // includeCancelled, setIncludeCancelled,
    // dateField, setDateField,
  } = useOrderStats({ range: 'all', dateField: 'orderDate' })

  // Derived values
  const pageIds = useMemo(() => orders.map((o) => o._id), [orders])

  const chips = useMemo(() => {
    const arr = []
    if (filters.status !== 'all')
      arr.push({ key: 'status', label: `${t('status.label')}: ${t(`status.${filters.status}`)}` })
    if (filters.dateFrom) {
      const d = parseFlexible(filters.dateFrom)
      arr.push({
        key: 'dateFrom',
        label: `${t('labels.from')}: ${d ? formatDMY(d) : filters.dateFrom}`,
      })
    }
    if (filters.dateTo) {
      const d = parseFlexible(filters.dateTo)
      arr.push({ key: 'dateTo', label: `${t('labels.to')}: ${d ? formatDMY(d) : filters.dateTo}` })
    }
    if (filters.isUrgent !== '')
      arr.push({
        key: 'isUrgent',
        label: `${t('labels.urgent')}: ${filters.isUrgent === 'true' ? t('labels.yes') : t('labels.no')}`,
      })
    if (filters.shippingRequired !== '')
      arr.push({
        key: 'shippingRequired',
        label: `${t('labels.shippingRequired')}: ${filters.shippingRequired === 'true' ? t('labels.yes') : t('labels.no')}`,
      })
    return arr
  }, [filters])

  const selectedStatuses = useMemo(() => {
    const set = new Set()
    for (const o of orders) if (selectedOrders.includes(o._id)) set.add(o.status)
    return Array.from(set)
  }, [orders, selectedOrders])

  // Effects
  useEffect(() => {
    setTitle(t('order.title'))
    setShowSplitButton(true)
    return resetLayout
  }, [setTitle, setShowSplitButton, resetLayout])

  useEffect(() => {
    let ignore = false
    const ac = new AbortController()

    async function fetchPaged() {
      setLoading(true)
      try {
        const payload = await getOrdersPage({
          page,
          limit,
          sort,
          status: filters.status !== 'all' ? filters.status : undefined,
          from: filters.dateFrom || undefined,
          to: filters.dateTo || undefined,
          q: debouncedSearch || undefined,
          signal: ac.signal, // API can opt-in later; safe to pass now
          urgent: filters.isUrgent === '' ? undefined : filters.isUrgent === 'true',
          shipping:
            filters.shippingRequired === '' ? undefined : filters.shippingRequired === 'true',
          includeStats: false,
        })
        if (ignore) return

        if (payload.legacy) {
          const list = payload.data || []
          setOrders(list)
          setMeta({
            page: 1,
            limit,
            totalDocs: list.length,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false,
          })
          setStats(null)
        } else {
          const { data, meta /*stats*/ } = payload
          const list = Array.isArray(data) ? data : []
          setOrders(list)

          const safeMeta = normalizeMeta(meta, {
            page,
            limit,
            totalDocs: typeof meta?.totalDocs === 'number' ? meta.totalDocs : 0,
          })
          setMeta(safeMeta)
          setStats(stats || null)

          if (safeMeta.page > safeMeta.totalPages) setPage(safeMeta.totalPages || 1)
        }
        setSelectedOrders([]) // clear selection after context change
      } catch (e) {
        if (e?.name === 'AbortError') return
        console.error('Failed to fetch paged orders', e)
        showError('labels.orderLoadingError') // or your key
      } finally {
        if (!ignore) setLoading(false)
      }
    }
    fetchPaged()
    return () => {
      ignore = true
      ac.abort()
    }
  }, [page, limit, sort, filters, debouncedSearch])

  // Handlers (memoized)
  const onToggleRow = useCallback((id) => {
    setSelectedOrders((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }, [])

  const onTogglePage = useCallback(
    (checked) => {
      setSelectedOrders((prev) => {
        const set = new Set(prev)
        if (checked) pageIds.forEach((id) => set.add(id))
        else pageIds.forEach((id) => set.delete(id))
        return Array.from(set)
      })
    },
    [pageIds]
  )

  const clearChip = useCallback((key) => {
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
  }, [])

  const clearAllChips = useCallback(() => {
    setPage(1)
    setFilters(DEFAULT_FILTERS)
  }, [])

  async function handleBulkStatusUpdate(newStatus) {
    const toastId = showLoading('order.updatingStatus')
    try {
      await updateManyOrderStatus(selectedOrders, newStatus)
      // optimistic local update
      setOrders((prev) =>
        prev.map((o) => (selectedOrders.includes(o._id) ? { ...o, status: newStatus } : o))
      )
      setSelectedOrders([])
      dismissToast(toastId)
      showSuccess('order.statusUpdated')
      refreshStats()
    } catch (err) {
      console.error(err)
      dismissToast(toastId)
      showError('order.updateError')
    }
  }

  // Cancel one order (lightweight: optimistic UI + refresh StatCards)
  const onCancelOrder = useCallback(
    async (orderId) => {
      try {
        await cancelOrderById(orderId) // DELETE (tu helper actual)
        // Optimistic list update
        const showingCancelled = filters.status === 'cancelled'
        setOrders((prev) =>
          showingCancelled
            ? prev.map((o) => (o._id === orderId ? { ...o, status: 'cancelled' } : o))
            : prev.filter((o) => o._id !== orderId)
        )
        setSelectedOrders((sel) => sel.filter((id) => id !== orderId))
        await refreshStats() // ya tienes el hook; evita segunda llamada manual
        showSuccess('success.order.cancelled')
      } catch (err) {
        console.error(err)
        showError('error.cancellingOrder')
        throw err
      }
    },
    [filters.status, refreshStats]
  )

  // ───────────────────────────────────────────────────────────────────────────
  // Render
  // ───────────────────────────────────────────────────────────────────────────
  return (
    <div className="h-full min-h-0 rounded-xl bg-white p-5 pb-[calc(var(--bottom-bar-h,0px)+3.25rem)] text-black lg:pb-6 dark:bg-neutral-900 dark:text-white">
      {/* Subheader (mobile sticky, desktop static) */}
      <div className="sticky z-30 border-gray-200 bg-white lg:static lg:top-auto lg:z-auto dark:border-neutral-800 dark:bg-neutral-900">
        <div className="px-2 py-0">
          {/* Row 1: Subtitle + Add */}
          <div className="flex items-center justify-between gap-2">
            <h2 className="mb-3 text-xl font-semibold">{t('order.all') || 'All Orders'}</h2>

            <button
              type="button"
              onClick={() =>
                navigate('/orders/new', {
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
                'mb-3 inline-flex items-center rounded-md border border-blue-200 bg-blue-600 px-3 py-2 text-sm font-medium text-white',
                'hover:bg-blue-700 dark:border-blue-700 dark:bg-blue-400/70 dark:hover:bg-blue-400/80',
              ].join(' ')}
            >
              <Plus className="h-5 w-5 sm:mr-2" />
              <span>{t('order.add') || 'Add new'}</span>
            </button>
          </div>

          {/* Tiny range selector; optional to move inside OrdersFilters later */}
          <div className="relative inline-block">
            {/* Overlaid icon */}
            <Calendar
              className="pointer-events-none absolute top-1/2 left-2 h-4 w-4 -translate-y-1/2 text-neutral-500 dark:text-neutral-400"
              aria-hidden="true"
            />
            <select
              className="rounded-md border border-neutral-200 bg-stone-50 py-1 pr-8 pl-8 text-neutral-600 dark:border-neutral-700 dark:bg-neutral-700 dark:text-neutral-400"
              value={range}
              onChange={(e) => setRange(e.target.value)}
              title={t('stats.range') || 'Range'}
            >
              <option value="week">{t('stats.week') || 'Last 7 days'}</option>
              <option value="15d">{t('stats.15d') || 'Last 15 days'}</option>
              <option value="30d">{t('stats.30d') || 'Last 30 days'}</option>
              <option value="month">{t('stats.month') || 'This month'}</option>
              <option value="quarter">{t('stats.quarter') || 'This quarter'}</option>
              <option value="year">{t('stats.year') || 'This year'}</option>
              <option value="all">{t('stats.all') || 'All time'}</option>
            </select>
          </div>

          {/* Row 2: Stat cards + range selector spacer */}
          <div className="mt-2 flex items-center justify-between gap-2">
            <StatCards
              stats={agg} // only hook
              loading={statsLoading} // does not depends on table loading state
              t={t}
              size="sm"
              className="flex-1"
            />
            <div className="shrink-0" />
          </div>

          {/* Row 3: Search + Filters */}
          <div className="mt-2 flex items-end gap-2">
            {/* Search (shorter, with clear X) */}
            <div className="relative max-w-[520px] flex-1">
              <FormInput
                name="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                floating={false}
                placeholder={t('order.search')}
                inputClassName="pr-9" // keep right padding so X does not overlap text
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  aria-label={t('button.clear') || 'Clear'}
                  className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-neutral-500 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Filters */}
            <OrdersFilters
              t={t}
              value={filters}
              onChange={(v) => {
                setPage(1)
                setFilters(v)
              }}
            />
          </div>

          {/* Row 4: Filter chips */}
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
                    title={t('button.clear') || 'Clear'}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <button
                onClick={clearAllChips}
                className="ml-1 rounded px-2 py-1 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-800"
                title={t('clear') || 'Clear all'}
              >
                {t('clear') || 'Clear all'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Table Actions Bar */}
      <OrderActionsBar
        selectedOrders={selectedOrders}
        allVisibleOrders={orders} // server-paged slice
        onClearSelection={() => setSelectedOrders([])}
        onSelectAll={(ids) => setSelectedOrders(ids)}
        onBulkStatusChange={() => setShowStatusModal(true)}
        t={t}
      />

      <div className="p-0">
        {/* Loading / Empty / Content */}
        {loading ? (
          <>
            {/* Desktop skeleton (table) */}
            <div className="hidden lg:block">
              <TableSkeleton
                rows={limit}
                columns={['w-10', 'w-32', 'flex-1', 'w-36', 'w-32', 'w-28', 'w-28']}
                header
                approxRowHeight={56}
                showSpinner
                spinnerLabel={t('labels.orderLoading')}
              />
            </div>
            {/* Mobile skeleton (cards) */}
            <div className="lg:hidden">
              <MobileOrdersSkeleton count={Math.min(limit, 10)} />
            </div>
          </>
        ) : orders.length === 0 ? (
          <p>{t('order.empty')}</p>
        ) : (
          <>
            {/* Desktop: table */}
            <div className="hidden lg:block">
              <OrdersTable
                orders={orders}
                selectedIds={selectedOrders}
                onToggleRow={onToggleRow}
                onTogglePage={onTogglePage}
                onRowClick={async (order) => {
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
                onCancelOrder={onCancelOrder}
              />
            </div>

            {/* Mobile: cards */}
            <div className="lg:hidden">
              <ul className="space-y-3 pt-2 pb-14 sm:pt-6">
                {orders.map((order) => (
                  <OrderCard
                    key={order._id}
                    order={order}
                    selectable
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
                    t={t}
                  />
                ))}
              </ul>
            </div>
          </>
        )}

        {/* Pagination */}
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
            leftContent={
              selectedOrders.length > 0 && (
                <span className="text-sm" aria-live="polite">
                  {selectedOrders.length} selected
                  <span className="mx-1 opacity-70">•</span>
                  {meta.totalDocs} results
                </span>
              )
            }
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
