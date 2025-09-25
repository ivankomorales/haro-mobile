import { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'

import { getOrderById } from '../../api/orders'
import OrderDetailsCard from '../../components/OrderDetailsCard'
import { getMessage as t } from '../../utils/getMessage'
import { showError } from '../../utils/toastUtils'
import { formatProductsWithLabels } from '../../utils/transformProducts'
import { useAuthedFetch } from '../../hooks/useAuthedFetch' // ✅ inject fetcher

export default function OrderDetails() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()
  const originPath = location.state?.originPath || '/orders'

  const authedFetch = useAuthedFetch() // ✅
  const opts = { fetcher: authedFetch } // ✅

  useEffect(() => {
    async function fetchOrder() {
      try {
        const data = await getOrderById(id, opts) // ✅ pass fetcher
        const labeled = formatProductsWithLabels(data.products, t)
        setOrder({ ...data, products: labeled })
      } catch (err) {
        console.error(err)
        showError(t('errors.order.notFound')) // toast
        navigate('/orders')
      } finally {
        setLoading(false)
      }
    }
    fetchOrder()
  }, [id, authedFetch, navigate]) // ✅ include authedFetch (stable) & navigate

  if (loading) return <p className="p-4">{t('loading.order')}</p>
  if (!order) return <p className="p-4">{t('errors.order.notFound')}</p>

  return (
    <div className="p-4 pb-24">
      <OrderDetailsCard
        order={order}
        shippingRequired={t('order.shippingRequired')}
        subtotalLabel={t('order.subtotal')}
        advanceLabel={t('order.deposit')}
        totalLabel={t('order.total')}
        figureLabel={t('product.figure')}
        glazeLabel={t('glaze.title')}
        descriptionLabel={t('product.description')}
      />
      <div className="mt-6 flex justify-center">
        <button
          type="button"
          onClick={() => navigate(originPath)}
          className="w-full rounded bg-gray-200 py-2 text-gray-700 hover:bg-gray-300 sm:w-auto sm:px-4 dark:bg-neutral-700 dark:text-gray-200 dark:hover:bg-neutral-600"
        >
          {t('button.close')}
        </button>
      </div>
    </div>
  )
}
