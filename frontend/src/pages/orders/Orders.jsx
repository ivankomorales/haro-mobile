// src/pages/orders/Orders.jsx
import { useEffect, useState } from 'react'
import { getOrders } from '../../api/orders'
import { useNavigate } from 'react-router-dom'
import { getMessage as t } from '../../utils/getMessage'

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

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

  return (
    <div className="min-h-screen p-4 bg-white dark:bg-neutral-900 text-black dark:text-white">
      <h1 className="text-xl font-semibold mb-4">{t('labels.orders.title')}</h1>

      {loading ? (
        <p>{t('loading.orders')}</p>
      ) : orders.length === 0 ? (
        <p>{t('labels.orders.empty')}</p>
      ) : (
        <ul className="space-y-3">
          {orders.map((order) => (
            <li
              key={order._id}
              onClick={() => navigate(`/orders/${order._id}/details`)}
              className="p-4 rounded-lg shadow bg-white dark:bg-neutral-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-neutral-700 transition"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm font-semibold">{order.customer?.name}</p>
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
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
