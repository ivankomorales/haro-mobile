// src/pages/orders/Orders.jsx
import { useEffect, useState, useMemo } from 'react'
import { getOrderById, getOrders } from '../../api/orders'
import { useNavigate } from 'react-router-dom'
import { getMessage as t } from '../../utils/getMessage'
import FormInput from '../../components/FormInput'
import { useLayout } from '../../context/LayoutContext'
import { OrderCard } from '../../components/OrderCard'
import {
  STATUS_COLORS,
  STATUS_TEXT_COLORS,
  STATUS_LABELS,
} from '../../utils/orderStatusUtils'
import OrderDetailsModal from '../../components/OrderDetailsModal'
import { formatProductsWithLabels } from '../../utils/transformProducts'
import OrderActionsBar from '../../components/OrderActionsBar'
import StatusModal from '../../components/StatusModal'
import { updateManyOrderStatus } from '../../api/orders'
import {
  showError,
  showSuccess,
  showLoading,
  dismissToast,
} from '../../utils/toastUtils'

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [selectedOrders, setSelectedOrders] = useState([])
  const [glazes, setGlazes] = useState(null) // lazy: null = not loaded yet

  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const { setTitle, setShowSplitButton } = useLayout()

  const [showStatusModal, setShowStatusModal] = useState(false)

  useEffect(() => {
    setTitle(t('order.title')) //    setTitle(t('home.title'))
    setShowSplitButton(true)

    // Opcional: restaurar a valores por defecto al salir
    return () => {
      setTitle('Haro Mobile')
      setShowSplitButton(true)
    }
  }, [])

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

  const filteredOrders = useMemo(() => {
    const query = search.toLowerCase()
    return orders.filter((order) => {
      const name =
        `${order.customer?.name || ''} ${order.customer?.lastName || ''}`.toLowerCase()
      const email = (order.customer?.email || '').toLowerCase()
      const orderID = (order.orderID || '').toLowerCase()

      const matchesSearch =
        name.includes(query) || email.includes(query) || orderID.includes(query)
      const matchesStatus =
        statusFilter === 'all' || order.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [orders, search, statusFilter])

  const handleBulkStatusUpdate = async (newStatus) => {
    const toastId = showLoading('order.updatingStatus')

    try {
      await updateManyOrderStatus(selectedOrders, newStatus)

      // opcional: actualizar los pedidos localmente para reflejar el nuevo estado
      const updated = orders.map((order) =>
        selectedOrders.includes(order._id)
          ? { ...order, status: newStatus }
          : order
      )

      setOrders(updated)
      setSelectedOrders([]) // limpiar selección

      dismissToast(toastId)
      showSuccess('order.statusUpdated')
    } catch (err) {
      console.error(err)
      dismissToast(toastId)
      showError('order.updateError')
    }
  }

  const selectedStatuses = useMemo(() => {
    const set = new Set()
    for (const o of orders) {
      if (selectedOrders.includes(o._id)) set.add(o.status)
    }
    return Array.from(set) // canonical values
  }, [orders, selectedOrders])

  return (
    <div className="min-h-screen p-4 bg-white dark:bg-neutral-900 text-black dark:text-white">
      {/* Optional h1 for accessibility */}
      {/*<h1 className="text-xl font-semibold mb-4">{t('labels.orders.title')}</h1>*/}
      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <FormInput
          name="search"
          label={t('button.search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          floating={false}
          placeholder={t('order.search')}
        />

        <FormInput
          as="select"
          name="statusFilter"
          label={t('status.label')}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          floating={false}
        >
          <option value="all">{t('status.all')}</option>
          <option value="new">{t('status.new')}</option>
          <option value="pending">{t('status.pending')}</option>
          <option value="inProgress">{t('status.inProgress')}</option>
          <option value="completed">{t('status.completed')}</option>
          <option value="cancelled">{t('status.cancelled')}</option>
        </FormInput>
      </div>
      {selectedOrders.length > 0 && (
        <OrderActionsBar
          selectedOrders={selectedOrders}
          allVisibleOrders={filteredOrders}
          onClearSelection={() => setSelectedOrders([])}
          onSelectAll={(ids) => setSelectedOrders(ids)}
          onBulkStatusChange={() => setShowStatusModal(true)}
        />
      )}
      {loading ? (
        <p>{t('order.loading')}</p>
      ) : orders.length === 0 ? (
        <p>{t('order.empty')}</p>
      ) : (
        <ul className="space-y-3">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              selectable={true}
              isSelected={selectedOrders.includes(order._id)}
              onSelect={() => {
                if (selectedOrders.includes(order._id)) {
                  setSelectedOrders(
                    selectedOrders.filter((id) => id !== order._id)
                  )
                } else {
                  setSelectedOrders([...selectedOrders, order._id])
                }
              }}
              onClick={() => {
                // Lazy load glazes only when needed
                if (!glazes) {
                  import('../../api/glazes').then(({ getAllGlazes }) => {
                    getAllGlazes().then(setGlazes).catch(console.error)
                  })
                }
                const labeled = formatProductsWithLabels(
                  order.products,
                  t,
                  glazes || []
                )
                setSelectedOrder({ ...order, products: labeled })
              }}
            />
          ))}
        </ul>
      )}
      <OrderDetailsModal
        open={!!selectedOrder}
        order={selectedOrder}
        glazes={glazes || []} // empty until lazy loaded
        onClose={() => setSelectedOrder(null)}
      />
      <StatusModal
        open={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        onConfirm={(newStatus) => {
          handleBulkStatusUpdate(newStatus)
          setShowStatusModal(false)
        }}
        currentStatus={selectedStatuses.length === 1 ? selectedStatuses[0] : ''} // single-selection
        currentStatuses={selectedStatuses.length > 1 ? selectedStatuses : []} // multi-selection
      />
    </div>
  )
}
