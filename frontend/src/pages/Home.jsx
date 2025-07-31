import { useEffect, useState } from 'react'
import { getRecentOrders, getPendingCount } from '../api/orders'
import { useNavigate } from 'react-router-dom'
import { useMediaQuery } from 'react-responsive'

export default function Home() {
  const [lastUpdated, setLastUpdated] = useState(null)
  const [recentOrders, setRecentOrders] = useState([])
  const [pendingCount, setPendingCount] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    async function fetchData() {
      try {
        const recent = await getRecentOrders()
        const pending = await getPendingCount()
        setRecentOrders(recent)
        setPendingCount(pending)
        setLastUpdated(new Date())
      } catch (err) {
        console.error('Error fetching orders:', err)
      }
    }
    fetchData()
  }, [])

  return (
    <div
      className="
        min-h-screen
        p-4 pb-20
        font-sans
        bg-white dark:bg-neutral-900
        text-gray-800 dark:text-gray-100
      "
    >
      <h1 className="text-xl font-semibold mb-4">Inicio</h1>

      <div
        className="
          text-center
          p-4 mb-6
          bg-white dark:bg-neutral-800
          rounded-lg shadow
        "
      >
        <h2 className="text-base text-gray-500 dark:text-gray-300">
          Pedidos pendientes
        </h2>
        <p className="my-2 text-3xl font-bold">{pendingCount}</p>
        <span className="text-sm text-gray-400">
          Última actualización:{' '}
          {lastUpdated
            ? lastUpdated.toLocaleString('es-MX', {
                hour: '2-digit',
                minute: '2-digit',
                day: '2-digit',
                month: 'short',
                year: '2-digit',
              })
            : 'Cargando...'}
        </span>
      </div>

      <section className="mb-10">
        <h3 className="mb-2 text-lg font-medium">Pedidos recientes</h3>
        <ul className="space-y-2">
          {recentOrders.map((order) => (
            <li
              key={order.orderID || order._id}
              className="
                flex justify-between items-center
                p-3
                bg-white dark:bg-neutral-800
                rounded-lg shadow
              "
            >
              <div>
                <strong className="block text-sm">
                  {order.customer?.name}
                </strong>
                <span className="text-xs text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {order.orderID || order._id}
                </div>
                <span
                  className="
                    px-2 py-0.5
                    text-sm
                    bg-yellow-300 text-gray-800
                    rounded
                  "
                >
                  {order.status}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
