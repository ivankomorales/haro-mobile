import OrderDetailsCard from '../../components/OrderDetailsCard'
import { getOrderById } from '../../api/orders'
import { useParams } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { showError } from '../../utils/toastUtils'
import { getMessage as t } from '../../utils/getMessage'
import { formatProductsWithLabels } from '../../utils/transformProducts'

export default function OrderDetails() {
  const { id } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)

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
    <div className="p-4 pb-20">
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
    </div>
  )
}
