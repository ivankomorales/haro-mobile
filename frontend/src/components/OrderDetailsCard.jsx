// src/components/OrderDetailsCard.js
import { format } from 'date-fns'
import { Phone, Mail, Globe, AlertCircle, SquarePen } from 'lucide-react'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMessage as t } from '../utils/getMessage'
import { makeGlazeMap, resolveGlazeFlexible } from '../utils/glazeUtils'

// Helpers
function GlazeThumb({ glaze }) {
  if (!glaze) return null
  if (glaze.image) {
    return (
      <img
        src={glaze.image}
        alt={glaze.name || ''}
        title={glaze.name || ''}
        className="h-5 w-5 rounded object-cover ring-1 ring-black/10 dark:ring-white/10"
      />
    )
  }
  if (glaze.hex) {
    return (
      <span
        title={glaze.name || glaze.hex}
        className="inline-block h-5 w-5 rounded ring-1 ring-black/10 dark:ring-white/10"
        style={{ background: glaze.hex }}
      />
    )
  }
  return null
}

function ProductImages({ images = [] }) {
  const list = Array.isArray(images)
    ? images
        .map((img) =>
          typeof img === 'string'
            ? { src: img, alt: '' }
            : { src: img?.url || '', alt: img?.alt || '' }
        )
        .filter((x) => x.src)
    : []

  if (!list.length) return null

  return (
    <div className="mt-2 flex gap-2 overflow-x-auto">
      {list.map((im, i) => (
        <img
          key={`${im.src}-${i}`}
          src={im.src}
          alt={im.alt}
          className="h-20 w-20 rounded-md object-cover"
          loading="lazy"
          referrerPolicy="no-referrer"
        />
      ))}
    </div>
  )
}

/** Per-unit discount model (display stays simple in rows):
 *  - unitPrice = product.price
 *  - unitDiscount = product.discount (per unit; used only for summary fallback)
 *  - amount = qty * max(unitPrice - unitDiscount, 0) unless explicit total provided
 */
function deriveLine(p) {
  const qty = Math.max(1, Number(p?.quantity ?? 1))
  const unitPrice =
    p?.price != null
      ? Number(p.price)
      : p?.unitPrice != null
        ? Number(p.unitPrice)
        : p?.rate != null
          ? Number(p.rate)
          : null

  const unitDiscount = Math.max(0, Math.min(Number(p?.discount ?? 0), Number(unitPrice ?? 0)))
  const unitNet = unitPrice != null ? Math.max(0, unitPrice - unitDiscount) : null

  const amount =
    p?.total != null
      ? Number(p.total)
      : p?.lineTotal != null
        ? Number(p.lineTotal)
        : unitNet != null
          ? qty * unitNet
          : null

  return { qty, unitPrice, unitDiscount, unitNet, amount }
}

export default function OrderDetailsCard({ order = {}, glazes = [] }) {
  const navigate = useNavigate()
  const {
    _id,
    orderID = '',
    orderDate,
    customer = {},
    products = [],
    shipping = {},
    currency = 'MXN',

    // Preferred (new) fields
    itemsSubtotal: itemsSubtotalFlat,
    discounts: discountsFlat,
    orderTotal: orderTotalFlat,
    amountDue: amountDueFlat,
    deposit: depositFlat,

    // Legacy nested totals
    totals: totalsObj,
  } = order || {}

  const glazeMap = useMemo(() => makeGlazeMap(glazes), [glazes])

  const nf = useMemo(
    () =>
      new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 2 }),
    [currency]
  )
  const $ = (v) => (v == null ? '—' : nf.format(Number(v)))

  // Fallbacks for old docs (compute from products)
  const fallbackItemsSubtotal = products.reduce((sum, p) => {
    const { qty, unitPrice } = deriveLine(p)
    return sum + (unitPrice != null ? qty * unitPrice : 0)
  }, 0)

  const fallbackDiscounts = products.reduce((sum, p) => {
    const { qty, unitDiscount } = deriveLine(p)
    return sum + qty * (unitDiscount || 0)
  }, 0)

  const itemsSubtotal =
    itemsSubtotalFlat ??
    totalsObj?.itemsSubtotal ??
    totalsObj?.gross ??
    (products.length ? fallbackItemsSubtotal : null)

  const discounts =
    discountsFlat ??
    totalsObj?.discounts ??
    totalsObj?.discount ??
    (products.length ? fallbackDiscounts : 0)

  const deposit = depositFlat ?? totalsObj?.deposit ?? 0

  const orderTotal =
    orderTotalFlat ??
    totalsObj?.orderTotal ??
    (itemsSubtotal != null ? Math.max(0, Number(itemsSubtotal) - Number(discounts || 0)) : null)

  const amountDue =
    amountDueFlat ??
    totalsObj?.amountDue ??
    (orderTotal != null ? Math.max(0, Number(orderTotal) - Number(deposit || 0)) : null)

  const goEditCustomer = () => _id && navigate(`/orders/${_id}/edit`)
  const goEditProductAt = (index) => _id && navigate(`/orders/${_id}/edit`)

  const asDate = orderDate ? new Date(orderDate) : null

  return (
    <div className="relative mx-auto w-full max-w-4xl rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-neutral-800 dark:bg-neutral-900">
      {/* Header */}
      <header className="mb-5 flex items-end justify-between">
        <div>
          {!!orderID && (
            <div className="text-lg font-semibold tracking-wide text-neutral-900 dark:text-neutral-100">
              {orderID}
            </div>
          )}
          <div className="text-xs text-neutral-600 dark:text-neutral-400">
            {asDate ? format(asDate, 'MMM dd, yyyy') : t('order.noDate') || 'No date'}
          </div>
        </div>
      </header>

      {/* Customer Data */}
      <section className="relative mb-6 rounded-xl bg-neutral-50/60 p-4 ring-1 ring-black/5 dark:bg-neutral-800/50 dark:ring-white/5">
        <button
          type="button"
          onClick={goEditCustomer}
          className="absolute top-2 right-2 rounded-md p-1.5 text-neutral-600 hover:bg-white/70 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-700"
          title={t('order.editCustomer') || 'Edit customer'}
        >
          <SquarePen className="h-4 w-4" />
        </button>

        <h3 className="mb-2 text-sm font-semibold tracking-wide text-neutral-800 dark:text-neutral-100">
          {t('order.section.customerInfo') || 'Customer Info'}
        </h3>

        <div className="space-y-1 text-sm">
          <div className="font-medium text-neutral-900 dark:text-neutral-100">
            {(customer.name || '') + (customer.lastName ? ` ${customer.lastName}` : '')}
          </div>

          {!!customer.phone && (
            <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
              <Phone className="h-4 w-4" />
              <span>{customer.phone}</span>
            </div>
          )}

          {!!customer.email && (
            <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
              <Mail className="h-4 w-4" />
              <span>{customer.email}</span>
            </div>
          )}

          {!!customer.socialMedia &&
            (customer.socialMedia.instagram ||
              customer.socialMedia.facebook ||
              customer.socialMedia.tiktok) && (
              <div className="flex items-center gap-2 text-neutral-700 dark:text-neutral-300">
                <Globe className="h-4 w-4" />
                <span className="truncate">
                  {[
                    customer.socialMedia.instagram,
                    customer.socialMedia.facebook,
                    customer.socialMedia.tiktok,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </span>
              </div>
            )}

          {!!shipping?.isRequired && (
            <div className="mt-2 inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 ring-1 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/30">
              <AlertCircle className="h-3.5 w-3.5" />
              <span>{t('order.shippingRequired') || 'Shipping required'}</span>
            </div>
          )}
        </div>
      </section>

      {/* Desktop invoice table (simple: Product / Qty / Rate / Amount) */}
      <section className="mb-4 hidden overflow-hidden rounded-xl ring-1 ring-black/5 md:block dark:ring-white/10">
        <table className="min-w-full border-separate border-spacing-0">
          <thead className="bg-neutral-50 text-xs tracking-wide text-neutral-500 uppercase dark:bg-neutral-800 dark:text-neutral-400">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">
                {t('invoice.product') || 'Product/Services'}
              </th>
              <th className="px-3 py-3 text-right font-semibold">{t('invoice.qty') || 'Qty'}</th>
              <th className="px-3 py-3 text-right font-semibold">{t('invoice.rate') || 'Rate'}</th>
              <th className="px-4 py-3 text-right font-semibold">
                {t('invoice.amount') || 'Amount'}
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-neutral-200 bg-white text-sm dark:divide-neutral-800 dark:bg-neutral-900">
            {products.map((p, index) => {
              const gi = resolveGlazeFlexible(p.glazes?.interior, glazeMap, p, 'interior')
              const ge = resolveGlazeFlexible(p.glazes?.exterior, glazeMap, p, 'exterior')
              const { qty, unitPrice, amount } = deriveLine(p)

              return (
                <tr key={p._id || index} className="group">
                  <td className="relative px-4 py-3 align-top">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-medium text-neutral-900 dark:text-neutral-100">
                        {p.label || p.type || t('product.unnamed') || 'Product'}
                      </div>
                      <button
                        type="button"
                        onClick={() => goEditProductAt(index)}
                        className="invisible rounded p-1 text-neutral-500 group-hover:visible hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
                        title={t('product.edit') || 'Edit'}
                      >
                        <SquarePen className="h-4 w-4" />
                      </button>
                    </div>
                    {(gi || ge) && (
                      <div className="mt-1 flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-300">
                        <span>{t('glaze.list') || 'Glazes'}:</span>
                        <GlazeThumb glaze={gi} />
                        <GlazeThumb glaze={ge} />
                      </div>
                    )}

                    {!!p.description && (
                      <div className="mt-1 text-xs text-neutral-600 dark:text-neutral-300">
                        {p.description}
                      </div>
                    )}
                    <ProductImages images={p.images} />
                  </td>

                  <td className="px-3 py-3 text-right align-top text-neutral-900 dark:text-neutral-100">
                    {qty}
                  </td>
                  <td className="px-3 py-3 text-right align-top text-neutral-900 dark:text-neutral-100">
                    {unitPrice != null ? $(unitPrice) : '—'}
                  </td>
                  <td className="px-4 py-3 text-right align-top font-medium text-neutral-900 dark:text-neutral-100">
                    {amount != null ? $(amount) : '—'}
                  </td>
                </tr>
              )
            })}

            {products.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-4 py-6 text-center text-neutral-600 dark:text-neutral-300"
                >
                  {t('cart.empty') || 'No products added'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      {/* Mobile list: product, qty, amount only */}
      <section className="mb-4 md:hidden">
        <div className="space-y-2">
          {products.map((p, index) => {
            const { qty, amount } = deriveLine(p)
            return (
              <div
                key={p._id || index}
                className="group rounded-lg bg-white p-3 ring-1 ring-black/5 dark:bg-neutral-900 dark:ring-white/10"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="font-medium text-neutral-900 dark:text-neutral-100">
                    {p.label || p.type || t('product.unnamed') || 'Product'}
                  </div>
                  <button
                    type="button"
                    onClick={() => goEditProductAt(index)}
                    className="rounded p-1 text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-300 dark:hover:bg-neutral-800"
                    title={t('product.edit') || 'Edit'}
                  >
                    <SquarePen className="h-4 w-4" />
                  </button>
                </div>

                <div className="mt-1 flex items-center gap-3 text-sm">
                  <div className="text-neutral-600 dark:text-neutral-300">
                    {t('invoice.qty') || 'Qty'}: <span className="font-medium">{qty}</span>
                  </div>
                  <div className="ml-auto font-semibold text-neutral-900 dark:text-neutral-100">
                    {amount != null ? $(amount) : '—'}
                  </div>
                  <ProductImages images={p.images} />
                </div>
              </div>
            )
          })}

          {products.length === 0 && (
            <div className="rounded-lg bg-white p-4 text-center text-neutral-600 ring-1 ring-black/5 dark:bg-neutral-900 dark:text-neutral-300 dark:ring-white/10">
              {t('cart.empty') || 'No products added'}
            </div>
          )}
        </div>
      </section>

      {/* Summary (right-aligned) */}
      <section className="ml-auto w-full max-w-sm">
        <div className="grid grid-cols-[1fr_auto] gap-y-1 text-sm">
          <div className="text-neutral-600 dark:text-neutral-400">
            {t('cart.subtotal') || 'Subtotal'}
          </div>
          <div className="font-medium text-neutral-900 dark:text-neutral-100">
            {$(itemsSubtotal)}
          </div>

          {discounts != null && Number(discounts) > 0 && (
            <>
              <div className="text-neutral-600 dark:text-neutral-400">
                {t('cart.discounts') || 'Discounts'}
              </div>
              <div className="font-medium text-emerald-600 dark:text-emerald-400">
                −{$(discounts)}
              </div>
            </>
          )}

          {orderTotal != null && (
            <>
              <div className="text-neutral-600 dark:text-neutral-400">
                {t('cart.orderTotal') || 'Order total'}
              </div>
              <div className="font-medium text-neutral-900 dark:text-neutral-100">
                {$(orderTotal)}
              </div>
            </>
          )}

          <div className="text-neutral-600 dark:text-neutral-400">
            {t('cart.deposit') || 'Deposit'}
          </div>
          <div className="font-medium text-amber-600 dark:text-amber-400">−{$(deposit)}</div>

          <div className="mt-2 border-t border-neutral-200 pt-2 text-base font-semibold dark:border-neutral-700 dark:text-neutral-100">
            {t('cart.total') || 'Total'}
          </div>
          <div className="mt-2 border-t border-neutral-200 pt-2 text-base font-semibold dark:border-neutral-700 dark:text-neutral-100">
            {$(amountDue)}
          </div>
        </div>
      </section>
    </div>
  )
}
