// src/pages/orders/Orders.jsx
import { useEffect, useState } from 'react'
import { getOrders } from '../../api/orders'
import { useNavigate } from 'react-router-dom'
import { getMessage as t } from '../../utils/getMessage'
import FormInput from '../../components/FormInput'
import { useLayout } from '../../context/LayoutContext'

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [selectedOrders, setSelectedOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const { setTitle, setShowSplitButton } = useLayout()

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
          label="Buscar"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          floating={false}
          placeholder="Nombre, correo o ID"
        />

        <FormInput
          as="select"
          name="statusFilter"
          label="Estado"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          floating={false}
        >
          <option value="All">Todos</option>
          <option value="New">Nuevo</option>
          <option value="Pending">Pendiente</option>
          <option value="Completed">Completado</option>
          <option value="Cancelled">Cancelado</option>
        </FormInput>
      </div>

      {loading ? (
        <p>{t('loading.orders')}</p>
      ) : orders.length === 0 ? (
        <p>{t('labels.orders.empty')}</p>
      ) : (
        <ul className="space-y-3">
          {filteredOrders.map((order) => (
            <li
              key={order._id}
              onClick={() => navigate(`/orders/${order._id}/details`)}
              className="p-4 rounded-lg shadow bg-white dark:bg-neutral-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-neutral-700 transition"
            >
              <div className="flex items-center gap-3">
                {/* Checkbox */}
                <input
                  type="checkbox"
                  checked={selectedOrders.includes(order._id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedOrders([...selectedOrders, order._id])
                    } else {
                      setSelectedOrders(
                        selectedOrders.filter((id) => id !== order._id)
                      )
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-5 h-5 accent-blue-500"
                />

                {/* Order details */}
                <div className="flex justify-between items-center w-full">
                  <div>
                    <p className="text-sm font-semibold">
                      {order.customer?.name} {order.customer?.lastName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.orderDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{order.orderID}</p>
                    <span className="px-2 py-0.5 text-xs rounded bg-yellow-300 text-gray-800">
                      {order.status}
                    </span>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
