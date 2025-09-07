// src/pages/orders/OrderConfirmation.jsx
import { useLocation, useNavigate } from 'react-router-dom'
import { useMemo, useState } from 'react'
import OrderDetailsCard from '../../components/OrderDetailsCard'
import { useRequireState } from '../../utils/useRequireState'
import { getMessage as t } from '../../utils/getMessage'
import FormActions from '../../components/FormActions'
import { showError, showSuccess, showLoading, dismissToast } from '../../utils/toastUtils'
import { createOrder } from '../../api/orders'
import { cleanAddresses } from '../../utils/orderBuilder'

// --- helpers (JS) ---

function normalizeImage(img) {
  if (!img) return null
  if (img && typeof img === 'object' && img.url) {
    return {
      url: img.url,
      publicId: img.publicId || img.public_id,
      width: img.width,
      height: img.height,
      format: img.format,
      bytes: img.bytes,
      alt: img.alt || '',
      primary: !!img.primary,
    }
  }
  if (img && typeof img === 'object' && (img.secure_url || img.public_id)) {
    return {
      url: img.secure_url || img.url,
      publicId: img.public_id || img.publicId,
      width: img.width,
      height: img.height,
      format: img.format,
      bytes: img.bytes,
      alt: img.alt || '',
      primary: !!img.primary,
    }
  }
  if (typeof img === 'string') return { url: img, alt: '', primary: false }
  return null
}

function ensureStatus(s) {
  const map = {
    New: 'new',
    Pending: 'pending',
    'In Progress': 'inProgress',
    Completed: 'completed',
    Cancelled: 'cancelled',
  }
  if (!s) return 'new'
  return map[s] || String(s).toLowerCase()
}

export default function OrderConfirmation() {
  const location = useLocation()
  const navigate = useNavigate()
  const order = location.state || null
  const glazes = order?.glazes || []

  // Group and label products for display only
  const groupedProducts = (order?.products || []).reduce((acc, p) => {
    if (!acc[p.type]) acc[p.type] = []
    acc[p.type].push(p)
    return acc
  }, {})
  const labeledProducts = []
  Object.entries(groupedProducts).forEach(([type, items]) => {
    items.forEach((item, i) => {
      labeledProducts.push({
        ...item,
        label: `${t(`product.${type}`)} ${i + 1}`,
      })
    })
  })

  useRequireState(
    (st) => st?.customer?.name && Array.isArray(st?.products) && st.products.length > 0,
    '/orders/new',
    () => ({ originPath: location.state?.originPath ?? '/orders' })
  )

  if (!order) return null

  const originPath = order.originPath ?? '/orders'
  const [submitting, setSubmitting] = useState(false)

  // Subtotal = sum of line prices (NOT qty * price)
  const totals = useMemo(() => {
    const subtotal = (order.products || []).reduce((acc, p) => {
      const price = Number(p.price || 0)
      return acc + price
    }, 0)
    const deposit = Number(order.deposit || 0)
    const remaining = Math.max(subtotal - deposit, 0)
    return { subtotal, deposit, remaining }
  }, [order.products, order.deposit])

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

  const handleEditProducts = (index) => {
    navigate('/orders/new/products', {
      state: {
        ...order,
        originPath,
        mode: 'editProducts',
        returnTo: '/orders/confirmation',
        editIndex: index,
      },
    })
  }

  const handleConfirm = async () => {
    try {
      setSubmitting(true)
      showLoading(t('loading.orderCreate'))

      // Build products compatible with new schema
      const cleanProducts = (order.products || []).map((p) => {
        const intId = p.glazes?.interior?._id || p.glazes?.interior || null
        const extId = p.glazes?.exterior?._id || p.glazes?.exterior || null

        const giName = p.glazes?.interiorName || p.glazes?.interior?.name || null
        const giHex = p.glazes?.interiorHex || p.glazes?.interior?.hex || null
        const geName = p.glazes?.exteriorName || p.glazes?.exterior?.name || null
        const geHex = p.glazes?.exteriorHex || p.glazes?.exterior?.hex || null

        return {
          type: p.type,
          quantity: Number(p.quantity || 0),
          price: Number(p.price || 0), // line total
          description: (p.description || '').trim(),
          glazes: {
            interior: intId,
            exterior: extId,
            interiorName: giName,
            interiorHex: giHex,
            exteriorName: geName,
            exteriorHex: geHex,
          },
          decorations: {
            hasGold: !!(p.decorations && p.decorations.hasGold),
            hasName: !!(p.decorations && p.decorations.hasName),
            outerDrawing: !!(p.decorations && p.decorations.outerDrawing),
            customText: (p.decorations && p.decorations.customText
              ? p.decorations.customText
              : ''
            ).trim(),
          },
          images: (p.images || []).map(normalizeImage).filter(Boolean),
          ...(p._id ? { _id: p._id } : {}),
        }
      })

      const cleanedAddresses = cleanAddresses(order.shipping?.addresses || [])
      const payload = {
        customer: {
          name: order.customer.name,
          lastName: order.customer.lastName,
          email: order.customer.email || undefined,
          phone: order.customer.phone,
          socialMedia: order.customer.socialMedia,
        },
        // omit empty dates so backend default (+5 weeks) can apply
        orderDate: order.orderDate ? new Date(order.orderDate) : undefined,
        deliverDate: order.deliverDate ? new Date(order.deliverDate) : undefined,
        status: ensureStatus(order.status),
        deposit: Number(order.deposit || 0),
        notes: order.notes || '',
        shipping: {
          isRequired: !!order.shipping?.isRequired && cleanedAddresses.length > 0,
          addresses: cleanedAddresses,
        },
        products: cleanProducts,
        // totals optional; backend can compute its own
      }

      console.log('Payload being sent to createOrder:', payload)
      const saved = await createOrder(payload)

      dismissToast()
      showSuccess(t('success.order.created'))

      if (saved?._id) {
        navigate(`/orders/${saved._id}/details`, {
          replace: true,
          state: { originPath },
        })
      } else {
        navigate('/orders', { replace: true })
      }
    } catch (err) {
      console.error('Failed to confirm order:', err)
      dismissToast()
      showError(t('auth.serverError'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center bg-white px-4 py-6 dark:bg-neutral-900">
      <h1 className="mb-4 text-xl font-semibold text-black dark:text-white">
        {t('order.confirm') || 'Confirm Order'}
      </h1>

      <div className="w-full max-w-2xl">
        <OrderDetailsCard
          order={{ ...order, products: labeledProducts }}
          glazes={glazes}
          t={t}
          onEditBase={handleEditBase}
          onEditProducts={handleEditProducts}
          shippingRequired={t('order.shippingRequired')}
          subtotalLabel={t('order.subtotal')}
          advanceLabel={t('order.deposit')}
          totalLabel={t('order.total')}
          figureLabel={t('product.figure')}
          glazeLabel={t('glaze.title')}
          descriptionLabel={t('product.description')}
        />
      </div>

      <div className="mt-6 w-full max-w-2xl">
        <FormActions
          onSubmit={handleConfirm}
          submitButtonText={submitting ? t('loading.order') : t('order.submit') || 'Create Order'}
          cancelButtonText={t('formActions.cancel')}
          confirmTitle={t('formActionsConfirm.confirmTitle')}
          confirmMessage={t('formActions.confirmMessage')}
          confirmText={t('formActions.confirmText')}
          cancelText={t('formActions.cancelText')}
          cancelRedirect={originPath}
        />
      </div>
    </div>
  )
}
