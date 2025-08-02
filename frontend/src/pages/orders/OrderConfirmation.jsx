// src/pages/orders/OrderConfirmation.jsx
import { useLocation, useNavigate } from 'react-router-dom'
import { useMemo, useState } from 'react'
import OrderDetailsCard from '../../components/OrderDetailsCard'
import { useRequireState } from '../../utils/useRequireState'
import { getMessage as t } from '../../utils/getMessage'
import FormActions from '../../components/FormActions'
import {
  showError,
  showSuccess,
  showLoading,
  dismissToast,
} from '../../utils/toastUtils'
import { createOrder } from '../../api/orders'

export default function OrderConfirmation() {
  const location = useLocation()
  const navigate = useNavigate()
  const order = location.state || null

  // 1) Guard: Do not allow to enter without minimal data
  useRequireState(
    (st) =>
      st?.customer?.name &&
      Array.isArray(st?.products) &&
      st.products.length > 0,
    '/orders/new',
    () => ({ originPath: location.state?.originPath ?? '/orders' })
  )

  if (!order) return null

  const originPath = order.originPath ?? '/orders'
  const [submitting, setSubmitting] = useState(false)

  // 2) Totals (sum only price; price already includes the quantity in your model)
  const totals = useMemo(() => {
    const subtotal = (order.products || []).reduce((acc, p) => {
      const price = Number(p.price || 0)
      return acc + price
    }, 0)
    const deposit = Number(order.deposit || 0)
    const remaining = Math.max(subtotal - deposit, 0)
    return { subtotal, deposit, remaining }
  }, [order.products, order.deposit])

  // 3) Edit base data (customer/dates/shipping/notes)
  const handleEditBase = () => {
    navigate('/orders/new', {
      state: {
        ...order,
        originPath,
        mode: 'editBase',
        returnTo: '/orders/confirmation',
      },
    })
  }

  // 4) Edit products
  const handleEditProducts = (index) => {
    navigate('/orders/new/products', {
      state: {
        ...order, // todos los datos del pedido
        originPath,

        mode: 'editProducts',
        returnTo: '/orders/confirmation',
        editIndex: index,
      },
    })
  }

  // 5) Confirm order (API + toasts + redirect)
  const handleConfirm = async () => {
    try {
      setSubmitting(true)
      showLoading(t('loading.order')) // "Creating order..."

      const cleanProducts = order.products.map((p) => ({
        type: p.type,
        quantity: Number(p.quantity), // lo sigues guardando si te sirve
        price: Number(p.price),
        description: p.description || '',
        glazes: {
          interior: p.glazes?.interior?._id ?? null,
          exterior: p.glazes?.exterior?._id ?? null,
        },
        images: (p.images || []).map((img) => String(img)), // deben ser URLs
        decorations: p.decorations || {},
      }))

      const payload = {
        // baseOrder
        customer: {
          name: order.customer.name,
          lastName: order.customer.lastName,
          email: order.customer.email || undefined,
          phone: order.customer.phone,
          socialMedia: order.customer.socialMedia,
        },
        orderDate: order.orderDate || order.date || null,
        deliverDate: order.deliverDate || null,
        status: order.status || 'New',
        deposit: Number(order.deposit || 0),
        notes: order.notes || '',
        shipping: {
          isRequired: !!order.shipping?.isRequired,
          addresses: order.shipping?.addresses || [],
        },
        products: cleanProducts,
        totals, // opcional si el backend lo recalcula
      }
      console.log('Payload being sent to createOrder:', payload)
      const saved = await createOrder(payload)
      dismissToast()
      showSuccess(t('success.order.created')) // asegúrate camelCase en i18n

      if (saved?._id) {
        navigate(`/orders/${saved._id}/details`, { replace: true })
      } else {
        navigate('/orders', { replace: true })
      }
    } catch (err) {
      console.error('Failed to confirm order:', err)
      dismissToast()
      showError(t('auth.serverError')) // camelCase en i18n
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-900 flex flex-col items-center px-4 py-6">
      {/* Header */}
      <h1 className="text-xl font-semibold text-black dark:text-white mb-4">
        {t('labels.order.confirm') || 'Confirm Order'}
      </h1>

      {/* Card with details (your component) */}
      <div className="w-full max-w-2xl">
        <OrderDetailsCard
          order={order}
          onEditBase={handleEditBase}
          onEditProducts={handleEditProducts}
        />
      </div>

      {/* Footer actions */}
      <div className="w-full max-w-2xl mt-6">
        <FormActions
          onSubmit={handleConfirm}
          submitButtonText={
            submitting
              ? t('loading.order')
              : t('labels.order.submit') || 'Create Order'
          }
          cancelButtonText={t('formActions.cancel')}
          confirmTitle={t('formActions.confirmTitle')}
          confirmMessage={t('formActions.confirmMessage')}
          confirmText={t('formActions.confirmText')}
          cancelText={t('formActions.cancelText')}
          cancelRedirect={originPath}
        />
      </div>
    </div>
  )
}
