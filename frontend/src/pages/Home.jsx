import { useEffect, useState } from 'react'
import { getRecentOrders, getPendingCount } from '../api/orders'
import { useNavigate } from 'react-router-dom'
import { getMessage as t } from '../utils/getMessage'
import { useLayout } from '../context/LayoutContext'
import OrderCard from '../components/OrderCard'
import {
  STATUS_COLORS,
  STATUS_TEXT_COLORS,
  STATUS_LABELS
} from '../utils/orderStatusUtils'

const statusKeyMap = {
  New: 'new',
  Pending: 'pending',
  'In Progress': 'inProgress',
  Completed: 'completed',
  Cancelled: 'cancelled',
}

export default function Home() {
  const [lastUpdated, setLastUpdated] = useState(null)
  const [recentOrders, setRecentOrders] = useState([])
  const [pendingCount, setPendingCount] = useState(0)
  const navigate = useNavigate()
  const { setTitle, setShowSplitButton } = useLayout()

  useEffect(() => {
    setTitle(t('home.title'))
    setShowSplitButton(true)

    return () => {
      setTitle('Haro Mobile')
      setShowSplitButton(true)
    }
  }, [])

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
      {/* Optional h1 for accessibility */}
      {/*<h1 className="text-xl font-semibold mb-4">{t('home.title')}</h1>*/}

      <div
        className="
          text-center
          p-4 mb-6
          bg-white dark:bg-neutral-800
          rounded-lg shadow
        "
      >
        <h2 className="text-base text-gray-500 dark:text-gray-300">
          {t('home.pendingTitle')}
        </h2>
        <p className="my-2 text-3xl font-bold">{pendingCount}</p>
        <span className="text-sm text-gray-400">
          {t('home.updatedAt')}{' '}
          {lastUpdated
            ? lastUpdated.toLocaleString('es-MX', {
                hour: '2-digit',
                minute: '2-digit',
                day: '2-digit',
                month: 'short',
                year: '2-digit',
              })
            : t('loading.generic')}
        </span>
      </div>

      <section className="mb-10">
        <h3 className="mb-2 text-lg font-medium">{t('home.recentTitle')}</h3>
        <ul className="space-y-2">
          {recentOrders.map((order) => (
            <OrderCard
              key={order.orderID || order._id}
              order={{
                ...order,
                statusLabel: t(
                  `status.${STATUS_LABELS[order.status] || 'unknown'}`
                ),
              }}
              onClick={() => navigate(`/orders/${order._id}/details`)}
            />
          ))}
        </ul>
      </section>
    </div>
  )
}
