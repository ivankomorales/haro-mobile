// src/components/OrderDetailsCard.js
import { format } from 'date-fns'
import { Phone, Mail, Globe, AlertCircle, SquarePen } from 'lucide-react'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMessage as t } from '../utils/getMessage'
import { makeGlazeMap, resolveGlazeFlexible } from '../utils/glazeUtils'

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

// 🔑 Single place to derive qty/unit/amount with smart fallbacks
function deriveLine(p) {
  const qty = Number(p?.quantity ?? 1)
  // Treat price as UNIT by default
  let unit = p?.unitPrice ?? p?.rate ?? (p?.price != null ? Number(p.price) : null)
  // Prefer explicit totals if they exist
  let amount = p?.total ?? p?.lineTotal ?? null
  // If no explicit total, compute from unit×qty
  if (amount == null && unit != null && qty) amount = unit * qty
  // If total exists but no unit, infer unit from total/qty
  if (unit == null && amount != null && qty) unit = amount / qty
  return { qty, unit, amount }
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
    totals: totalsObj,
  } = order || {}

  const nf = useMemo(
    () =>
      new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 2 }),
    [currency]
  )
  const $ = (v) => (v == null ? '—' : nf.format(Number(v)))

  const glazeMap = useMemo(() => makeGlazeMap(glazes), [glazes])

  // Totals (prefer backend; fallback to local sum of amounts)
  const fallbackGross =
    products.length > 0 ? products.reduce((sum, p) => sum + (deriveLine(p).amount ?? 0), 0) : null

  const gross = (totalsObj && 'gross' in totalsObj ? totalsObj.gross : order.gross) ?? fallbackGross
  const discount = (totalsObj && 'discount' in totalsObj ? totalsObj.discount : order.discount) ?? 0
  const deposit = (totalsObj && 'deposit' in totalsObj ? totalsObj.deposit : order.deposit) ?? 0
  const total =
    (totalsObj && 'total' in totalsObj ? totalsObj.total : order.total) ??
    (gross != null ? Number(gross) - Number(discount) - Number(deposit) : null)

  const goEditCustomer = () => {
    if (!_id) return
    navigate(`/orders/${_id}/edit`) // we’ll adjust tab routing later
  }
  const goEditProductAt = (index) => {
    if (!_id) return
    navigate(`/orders/${_id}/edit`) // we’ll adjust tab routing later
  }

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

      {/* Desktop invoice table */}
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
              const { qty, unit, amount } = deriveLine(p)

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
                  </td>

                  <td className="px-3 py-3 text-right align-top text-neutral-900 dark:text-neutral-100">
                    {qty}
                  </td>
                  <td className="px-3 py-3 text-right align-top text-neutral-900 dark:text-neutral-100">
                    {unit != null ? $(unit) : '—'}
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

      {/* Mobile list: type, qty, amount only */}
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

      {/* Summary */}
      <section className="ml-auto w-full max-w-sm">
        <div className="grid grid-cols-[1fr_auto] gap-y-1 text-sm">
          <div className="text-neutral-600 dark:text-neutral-400">
            {t('cart.subtotal') || 'Subtotal'}
          </div>
          <div className="font-medium text-neutral-900 dark:text-neutral-100">{$(gross)}</div>

          {discount != null && Number(discount) > 0 && (
            <>
              <div className="text-neutral-600 dark:text-neutral-400">
                {t('cart.discounts') || 'Discounts'}
              </div>
              <div className="font-medium text-emerald-600 dark:text-emerald-400">
                −{$(discount)}
              </div>
            </>
          )}

          <div className="text-neutral-600 dark:text-neutral-400">
            {t('cart.deposit') || 'Deposit'}
          </div>
          <div className="font-medium text-amber-600 dark:text-amber-400">−{$(deposit)}</div>

          <div className="mt-2 border-t border-neutral-200 pt-2 text-base font-semibold dark:border-neutral-700 dark:text-neutral-400">
            {t('cart.total') || 'Total'}
          </div>
          <div className="mt-2 border-t border-neutral-200 pt-2 text-base font-semibold dark:border-neutral-700 dark:text-neutral-400">
            {$(total)}
          </div>
        </div>
      </section>
    </div>
  )
}
