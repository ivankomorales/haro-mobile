// src/pages/orders/OrderConfirmation.jsx
import { useLocation, useNavigate } from 'react-router-dom'
import { useMemo, useState, useEffect } from 'react'
import OrderDetailsCard from '../../components/OrderDetailsCard'
import { useRequireState } from '../../utils/useRequireState'
import { getMessage as t } from '../../utils/getMessage'
import FormActions from '../../components/FormActions'
import { showError, showSuccess, showLoading, dismissToast } from '../../utils/toastUtils'
import { createOrder } from '../../api/orders'
import { cleanAddresses } from '../../utils/orderBuilder'
import { formatProductsWithLabels } from '../../utils/transformProducts'
import { makeGlazeMap, ensureGlazeObjects } from '../../utils/glazeUtils'
import { buildOrderPayload } from '../../utils/orderPayload'

function summarizeProducts(products = []) {
  return products.map((p, i) => ({
    i,
    type: p.type,
    qty: p.quantity,
    price: p.price,
    gi_id: p?.glazes?.interior?._id ?? p?.glazes?.interior ?? null,
    gi_name: p?.glazes?.interior?.name ?? p?.glazes?.interiorName ?? null,
    gi_hex: p?.glazes?.interior?.hex ?? p?.glazes?.interiorHex ?? null,
    ge_id: p?.glazes?.exterior?._id ?? p?.glazes?.exterior ?? null,
    ge_name: p?.glazes?.exterior?.name ?? p?.glazes?.exteriorName ?? null,
    ge_hex: p?.glazes?.exterior?.hex ?? p?.glazes?.exteriorHex ?? null,
    images: Array.isArray(p.images) ? p.images.length : 0,
  }))
}

// --- helpers (JS) ---
// Hydrate products' glaze fields from the glazes list in state
function hydrateGlazes(products = [], glazes = []) {
  const idx = new Map((glazes || []).map((g) => [String(g._id ?? g.id ?? g.value), g]))
  return (products || []).map((p) => {
    const gi = p?.glazes?.interior
    const ge = p?.glazes?.exterior
    const giObj = gi && typeof gi === 'object' ? gi : idx.get(String(gi))
    const geObj = ge && typeof ge === 'object' ? ge : idx.get(String(ge))
    return {
      ...p,
      glazes: {
        ...(p.glazes || {}),
        interior: giObj?._id ?? gi ?? null,
        exterior: geObj?._id ?? ge ?? null,
        interiorName: p.glazes?.interiorName ?? giObj?.name ?? null,
        interiorHex: p.glazes?.interiorHex ?? giObj?.hex ?? null,
        exteriorName: p.glazes?.exteriorName ?? geObj?.name ?? null,
        exteriorHex: p.glazes?.exteriorHex ?? geObj?.hex ?? null,
        interiorImage: p.glazes?.interiorImage ?? giObj?.image ?? giObj?.url ?? null,
        exteriorImage: p.glazes?.exteriorImage ?? geObj?.image ?? geObj?.url ?? null,
      },
    }
  })
}

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

export default function OrderConfirmation() {
  const location = useLocation()
  const navigate = useNavigate()
  const order = location.state || null
  const glazes = order?.glazes || []
  const glazeMap = useMemo(() => makeGlazeMap(glazes), [glazes])

  // Group and label products for display only
  // const groupedProducts = (order?.products || []).reduce((acc, p) => {
  //   if (!acc[p.type]) acc[p.type] = []
  //   acc[p.type].push(p)
  //   return acc
  // }, {})
  // const labeledProducts = []
  // Object.entries(groupedProducts).forEach(([type, items]) => {
  //   items.forEach((item, i) => {
  //     labeledProducts.push({
  //       ...item,
  //       label: `${t(`product.${type}`)} ${i + 1}`,
  //     })
  //   })
  // })
  // IMPORTANT: hydrate glaze labels & hex like in OrderDetails
  // 1) hydrate products with glaze names/hex/images using the glazes list
  const hydratedProducts = useMemo(
    () => ensureGlazeObjects(order?.products || [], glazeMap),
    [order?.products, glazeMap]
  )

  // 2) then format labels like in OrderDetails
  const labeledProducts = useMemo(() => {
    return formatProductsWithLabels(hydratedProducts, t, glazes)
  }, [hydratedProducts, t, glazes])

  // Build nested glaze objects so resolveGlaze() can render them
  const uiReadyProducts = labeledProducts // already object-enriched

  useRequireState(
    (st) => st?.customer?.name && Array.isArray(st?.products) && st.products.length > 0,
    '/orders/new',
    () => ({ originPath: location.state?.originPath ?? '/orders' })
  )

  if (!order) return null

  const originPath = order.originPath ?? '/orders'
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    // 1) Ver todo el objeto 'order'
    console.log('CONF > order (raw):', order)

    // 2) Resumen tabla de productos
    console.table(summarizeProducts(order?.products || []))

    // 3) Ver si traes lista de glazes separada
    console.log('CONF > glazes list (state):', glazes)

    // 4) Exponer para inspección manual en consola
    window.__ORDER_CONF__ = order
  }, [order, glazes])

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
      const payload = buildOrderPayload({ ...order, products: hydratedProducts }, cleanAddresses)

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
    <div className="h-full min-h-0 bg-white dark:bg-neutral-900">
      <div className="mx-auto max-w-2xl px-4 py-6">
        <h1 className="mb-4 text-xl font-semibold text-black dark:text-white">
          {t('order.confirm') || 'Confirm Order'}
        </h1>

        <div className="w-full">
          <OrderDetailsCard
            order={{ ...order, products: uiReadyProducts }}
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

        <div className="mt-6 w-full">
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
    </div>
  )
}
