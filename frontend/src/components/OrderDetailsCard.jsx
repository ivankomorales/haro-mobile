// src/components/OrderDetailsCard.jsx
import { Phone, Mail, Globe, AlertCircle, SquarePen } from 'lucide-react'
//import { formatDMY } from "../../utils/date";
import { format } from 'date-fns'

export default function OrderDetailsCard({
  order = {},
  glazes = [],
  onEditBase,
  onEditProducts,
  // i18n TEXTS
  shippingRequired = 'Requiere envío *',
  subtotalLabel = 'Subtotal: ',
  advanceLabel = 'Anticipo: ',
  totalLabel = 'Total: ',
  figureLabel = 'Figure',
  glazeLabel = 'Glaze',
  descriptionLabel = 'Descripción',
}) {
  const {
    orderID = '',
    orderDate,
    deliverDate,
    customer = {},
    deposit = 0,
    products = [],
    shipping = {},
  } = order

  // Build a map for quick lookup
  const glazeMap = new Map((glazes || []).map((g) => [g._id, g]))
  const resolveGlaze = (value) => {
    if (!value) return null
    if (typeof value === 'string') return glazeMap.get(value) || null
    if (typeof value === 'object' && value._id) return glazeMap.get(value._id) || value
    return null
  }

  // Billing
  const subtotal = products.reduce((acc, item) => acc + Number(item.price || 0), 0)
  const total = subtotal - deposit

  return (
    <div className="relative mx-auto w-full max-w-2xl space-y-6 rounded-xl bg-white p-4 text-black shadow-md dark:bg-neutral-900 dark:text-white">
      {/* Header */}
      <div className="space-y-1 text-center">
        <p className="text-2xl font-bold">{orderID}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {orderDate ? format(orderDate, 'MMM dd, yyyy') : 'No date'}
        </p>
      </div>

      {/* Customer Info */}
      <div className="relative rounded border border-gray-200 p-3 dark:border-neutral-700">
        <button
          onClick={onEditBase}
          className="absolute top-2 right-2 rounded p-1 hover:bg-gray-200 dark:hover:bg-neutral-700"
        >
          <SquarePen className="h-4 w-4" />
        </button>
        <div className="space-y-1">
          <p className="font-semibold">
            {customer.name} {customer.lastName}
          </p>

          {customer.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Phone className="h-4 w-4" /> {customer.phone}
            </div>
          )}
          {customer.email && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Mail className="h-4 w-4" /> {customer.email}
            </div>
          )}
          {customer.social && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Globe className="h-4 w-4" /> {customer.social}
            </div>
          )}
          {shipping?.isRequired && (
            <div className="mt-2 flex items-center gap-1 text-sm text-red-600">
              <AlertCircle className="h-4 w-4" />
              <span className="font-medium">{shippingRequired}</span>
            </div>
          )}
        </div>
      </div>

      {/* Payment */}
      <div className="space-y-1 text-center text-sm">
        <hr className="border-gray-300 dark:border-neutral-700" />

        <div className="inline-grid grid-cols-2 gap-x-4 text-left text-sm">
          <span className="text-right">{subtotalLabel}</span>
          <span className="text-left font-medium">${subtotal}</span>

          <span className="text-right">{advanceLabel}</span>
          <span className="text-left text-red-500">-${deposit}</span>

          <span className="text-right text-lg font-bold">{totalLabel}</span>
          <span className="text-left text-lg font-bold">${total}</span>
        </div>

        <hr className="border-gray-300 dark:border-neutral-700" />
      </div>

      {/* Products */}
      <div className="space-y-6">
        {products.map((product, index) => {
          const gi = resolveGlaze(product.glazes?.interior)
          const ge = resolveGlaze(product.glazes?.exterior)

          return (
            <div
              key={index}
              className="relative space-y-2 rounded border border-gray-200 bg-white p-3 dark:border-neutral-700 dark:bg-neutral-800"
            >
              <button
                onClick={() => onEditProducts?.(index)}
                className="absolute top-2 right-2 rounded p-1 hover:bg-gray-200 dark:hover:bg-neutral-700"
              >
                <SquarePen className="h-4 w-4" />
              </button>

              <p className="font-semibold">{product.label}</p>
              <p className="text-sm">
                {(() => {
                  const label = product.quantity === 1 ? figureLabel : `${figureLabel}s`
                  return `${product.quantity} ${label}`
                })()}
              </p>

              {(gi || ge) && (
                <div className="flex items-center gap-2">
                  {(() => {
                    const count = [gi, ge].filter(Boolean).length
                    return (
                      <p className="text-sm font-medium">
                        {glazeLabel}
                        {count > 1 ? 's' : ''}:
                      </p>
                    )
                  })()}
                  {gi?.image && (
                    <img
                      src={gi.image}
                      alt={gi.name}
                      title={gi.name}
                      className="h-6 w-6 rounded border"
                    />
                  )}
                  {ge?.image && (
                    <img
                      src={ge.image}
                      alt={ge.name}
                      title={ge.name}
                      className="h-6 w-6 rounded border"
                    />
                  )}
                </div>
              )}

              {product.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {descriptionLabel}: {product.description}
                </p>
              )}

              {product.images?.length > 0 && (
                <div className="scrollbar-hide mt-2 flex gap-2 overflow-x-auto">
                  {product.images.map((image, i) => (
                    <img
                      key={i}
                      src={typeof image === 'string' ? image : image.url}
                      alt={typeof image === 'string' ? '' : image.alt || ''}
                      className="h-20 w-20 rounded-md object-cover"
                    />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
