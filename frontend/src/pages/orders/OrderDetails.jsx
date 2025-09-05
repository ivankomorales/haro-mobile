import OrderDetailsCard from '../../components/OrderDetailsCard'
import { getOrderById } from '../../api/orders'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { showError } from '../../utils/toastUtils'
import { getMessage as t } from '../../utils/getMessage'
import { formatProductsWithLabels } from '../../utils/transformProducts'

export default function OrderDetails() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()
  const originPath = location.state?.originPath || '/orders'

  useEffect(() => {
    async function fetchOrder() {
      try {
        const data = await getOrderById(id)
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
  }, [id])

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
          className="w-full sm:w-auto sm:px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-neutral-700 dark:text-gray-200 dark:hover:bg-neutral-600"
        >
          {t('button.close')}
        </button>
      </div>
    </div>
  )
}
