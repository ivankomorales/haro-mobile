// src/pages/orders/Orders.jsx
import { useEffect, useState } from 'react'
import { getOrderById, getOrders } from '../../api/orders'
import { useNavigate } from 'react-router-dom'
import { getMessage as t } from '../../utils/getMessage'
import FormInput from '../../components/FormInput'
import { useLayout } from '../../context/LayoutContext'
import OrderCard from '../../components/OrderCard'
import {
  STATUS_COLORS,
  STATUS_TEXT_COLORS,
  STATUS_LABELS,
} from '../../utils/orderStatusUtils'
import OrderDetailsModal from '../../components/OrderDetailsModal'
import { formatProductsWithLabels } from '../../utils/transformProducts'
import { getAllGlazes } from '../../api/glazes'
import OrderActionsBar from '../../components/OrderActionsBar'
import StatusModal from '../../components/StatusModal'

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [selectedOrders, setSelectedOrders] = useState([])

  const [glazes, setGlazes] = useState([])

  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
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

  useEffect(() => {
    async function fetchGlazes() {
      try {
        const all = await getAllGlazes()
        setGlazes(all)
      } catch (err) {
        console.error('Error loading glazes', err)
      }
    }

    fetchGlazes()
  }, [])

  const filteredOrders = orders.filter((order) => {
    const name =
      `${order.customer?.name || ''} ${order.customer?.lastName || ''}`.toLowerCase()
    const email = (order.customer?.email || '').toLowerCase()
    const orderID = (order.orderID || '').toLowerCase()
    const query = search.toLowerCase()

    const matchesSearch =
      name.includes(query) || email.includes(query) || orderID.includes(query)

    const matchesStatus =
      statusFilter === 'All' || order.status === statusFilter

    return matchesSearch && matchesStatus
  })

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
          <option value="All">{t('status.all')}</option>
          <option value="New">{t('status.new')}</option>
          <option value="Pending">{t('status.pending')}</option>
          <option value="In Progress">{t('status.inProgress')}</option>
          <option value="Completed">{t('status.completed')}</option>
          <option value="Cancelled">{t('status.cancelled')}</option>
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
        <p>{t('loading.orders')}</p>
      ) : orders.length === 0 ? (
        <p>{t('labels.orders.empty')}</p>
      ) : (
        <ul className="space-y-3">
          {filteredOrders.map((order) => (
            <OrderCard
              key={order._id}
              order={{
                ...order,
                statusLabel: t(
                  `status.${STATUS_LABELS[order.status] || 'unknown'}`
                ),
              }}
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
                const labeled = formatProductsWithLabels(order.products, t)
                setSelectedOrder({ ...order, products: labeled })
              }}
            />
          ))}
        </ul>
      )}
      <OrderDetailsModal
        open={!!selectedOrder}
        order={selectedOrder}
        glazes={glazes}
        onClose={() => setSelectedOrder(null)}
      />
      <StatusModal
        open={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        onConfirm={(newStatus) => {
          // Aquí haces la lógica real de actualización
          console.log('Cambiar todos los seleccionados a:', newStatus)
          // luego llamas tu función backend → PATCH /orders/bulk/status
        }}
      />
    </div>
  )
}
