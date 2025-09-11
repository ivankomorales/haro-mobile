// src/pages/home/Home.jsx
import { useEffect, useState } from 'react'
import { getRecentOrders, getPendingCount } from '../api/orders'
import { useNavigate } from 'react-router-dom'
import { getMessage as t } from '../utils/getMessage'
import { useLayout } from '../context/LayoutContext'
import { OrderCard } from '../components/OrderCard'
import { STATUS_COLORS, STATUS_TEXT_COLORS, STATUS_LABELS } from '../utils/orderStatusUtils'
import OrderDetailsModal from '../components/OrderDetailsModal'

export default function Home() {
  const [lastUpdated, setLastUpdated] = useState(null)
  const [recentOrders, setRecentOrders] = useState([])
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [pendingCount, setPendingCount] = useState(0)
  const [glazes, setGlazes] = useState(null) // lazy: null = not loaded yet
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
        const [recent, pending] = await Promise.all([getRecentOrders(), getPendingCount()])
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
    <div className="h-full min-h-0 bg-white font-sans text-gray-800 dark:bg-neutral-900 dark:text-gray-100">
      {/* Optional h1 for accessibility */}
      {/*<h1 className="text-xl font-semibold mb-4">{t('home.title')}</h1>*/}

      <div className="mx-auto max-w-5xl px-4 py-6">
        <div className="mb-6 rounded-lg bg-white p-4 text-center shadow dark:bg-neutral-800">
          <h2 className="text-base text-gray-500 dark:text-gray-300">{t('home.pendingTitle')}</h2>
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
              : t('home.loading') || 'Loading...'}
          </span>
        </div>

        <section className="mb-10">
          <h3 className="mb-2 text-lg font-medium">{t('home.recentTitle')}</h3>
          <ul className="space-y-2">
            {recentOrders.slice(0, 5).map((order) => (
              <OrderCard
                key={order.orderID || order._id}
                order={{
                  ...order,
                  statusLabel: t(`status.${STATUS_LABELS[order.status] || 'unknown'}`),
                }}
                onClick={async () => {
                  // Lazy-load glazes only when user opens an order
                  if (!glazes) {
                    try {
                      const mod = await import('../api/glazes')
                      const all = await mod.getAllGlazes({ navigate }) // TODO
                      setGlazes(all)
                    } catch (e) {
                      console.error('Error loading glazes', e)
                    }
                  }
                  setSelectedOrder(order)
                }}
              />
            ))}
          </ul>
        </section>
        <OrderDetailsModal
          open={!!selectedOrder}
          order={selectedOrder}
          glazes={glazes || []} // empty until lazy-loaded
          onClose={() => setSelectedOrder(null)}
        />
      </div>
    </div>
  )
}
