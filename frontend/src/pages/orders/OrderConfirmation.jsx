// src/pages/orders/OrderConfirmation.jsx
import { useMemo, useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { createOrder } from '../../api/orders'
import FormActions from '../../components/FormActions'
import OrderDetailsCard from '../../components/OrderDetailsCard'
import { getMessage as t } from '../../utils/getMessage'
import { makeGlazeMap, ensureGlazeObjects } from '../../utils/glazeUtils'
import { buildOrderPayload } from '../../utils/orderPayload'
import { showError, showSuccess, showLoading, dismissToast } from '../../utils/toastUtils'
import { formatProductsWithLabels } from '../../utils/transformProducts'
import { useRequireState } from '../../utils/useRequireState'

// comments in English only
function getApiMessage(err, fallback = 'error.generic') {
  const msg = err?.response?.data?.message ?? err?.response?.data?.error ?? err?.message ?? fallback
  return typeof msg === 'string' ? msg : JSON.stringify(msg)
}

// comments in English only
// Normalize the order object coming from navigation state.
// - Enforce shipping shape: { isRequired, addresses[] }
// - Accept legacy fields (addresses[] at root, "address" alias for "street")
// - Preserve both `street` and a UI-friendly `address` alias for downstream components
function normalizeOrderForConfirmation(raw) {
  if (!raw) return null
  const order = { ...raw }

  let shipping = order.shipping
  if (!shipping || typeof shipping === 'boolean') {
    shipping = { isRequired: !!shipping, addresses: [] }
  }
  if (!Array.isArray(shipping.addresses)) shipping.addresses = []

  shipping.addresses = shipping.addresses
    .map((a, idx) => {
      const street = (a?.street || a?.address || '').trim() // <-- alias
      const city = (a?.city || '').trim()
      const state = (a?.state || '').trim()
      const zip = (a?.zip || '').trim()
      const country = (a?.country || 'Mexico').trim()
      const phone = (a?.phone || '').trim()
      const reference = (a?.reference || '').trim()
      const countryCode = (a?.countryCode || '+52').trim()
      const name = (a?.name || '').trim()
      return {
        id: a?.id ?? idx,
        street,
        city,
        state,
        zip,
        country,
        phone,
        reference,
        countryCode,
        name,
      }
    })
    // Borra sólo si TODOS los campos están vacíos
    .filter((a) =>
      [a.street, a.city, a.state, a.zip, a.country, a.phone, a.reference, a.name].some(Boolean)
    )

  order.shipping = shipping
  delete order.addresses

  order.customer = {
    name: order.customer?.name || '',
    lastName: order.customer?.lastName || '',
    email: order.customer?.email || '',
    phone: order.customer?.phone || '',
    countryCode: order.customer?.countryCode || '+52',
    socialMedia: order.customer?.socialMedia,
  }

  order.products = Array.isArray(order.products) ? order.products : []
  return order
}

// comments in English only
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

export default function OrderConfirmation() {
  const location = useLocation()
  const navigate = useNavigate()
  const rawOrder = location.state || null

  // Normalize the incoming state once
  const order = useMemo(() => normalizeOrderForConfirmation(rawOrder), [rawOrder])
  if (!order) return null

  const glazes = order.glazes || []
  const glazeMap = useMemo(() => makeGlazeMap(glazes), [glazes])

  // Hydrate glaze objects for UI (names/hex/images) without mutating original
  const hydratedProducts = useMemo(
    () => ensureGlazeObjects(order.products || [], glazeMap),
    [order.products, glazeMap]
  )

  // UI formatting for labels (keeps objects)
  const uiReadyProducts = useMemo(() => {
    return formatProductsWithLabels(hydratedProducts, t, glazes)
  }, [hydratedProducts, t, glazes])

  // Require minimal state
  useRequireState(
    (st) => st?.customer?.name && Array.isArray(st?.products) && st.products.length > 0,
    '/orders/new',
    () => ({ originPath: order.originPath ?? '/orders' })
  )

  const originPath = order.originPath ?? '/orders'
  const [submitting, setSubmitting] = useState(false)

  // Totals (sum of quantity * price). Adjust if you use per-line discounts in UI.
  const totals = useMemo(() => {
    const subtotal = (order.products || []).reduce((acc, p) => {
      const qty = Number(p.quantity || 1)
      const price = Number(p.price || 0)
      return acc + qty * price
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

      // Build server payload:
      // - Pass hydrated products so glaze objects are complete for mapping
      // - Pass allGlazes and glazesLoaded to avoid wiping glaze IDs if list is not ready
      const payload = buildOrderPayload(
        { ...order, products: hydratedProducts },
        { allGlazes: glazes, glazesLoaded: glazes.length > 0, quick: false }
      )

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
      showError(getApiMessage(err, 'error.creatingOrder'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="h-full min-h-0 rounded-xl bg-white dark:bg-neutral-900">
      <div className="mx-auto max-w-2xl px-4 py-6">
        <h1 className="mb-4 text-center text-xl font-semibold text-black dark:text-white">
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
