// src/components/OrderDetailsCard.jsx
import { Phone, Mail, Globe, AlertCircle, SquarePen } from 'lucide-react'
import { parseISO, format } from 'date-fns'

export default function OrderDetailsCard({
  order = {},
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
    customer = {},
    deposit = 0,
    products = [],
    shipping = {},
  } = order

  // Billing
  const subtotal = products.reduce(
    (acc, item) => acc + Number(item.price || 0),
    0
  )
  const total = subtotal - deposit

  return (
    <div className="relative w-full max-w-2xl mx-auto p-4 bg-white dark:bg-neutral-900 text-black dark:text-white rounded-xl shadow-md space-y-6">
      {/* Header */}
      <div className="text-center space-y-1">
        <p className="text-2xl font-bold">{orderID}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {orderDate ? format(orderDate, 'MMM dd, yyyy') : 'No date'}
        </p>
      </div>

      {/* Customer Info */}
      <div className="relative p-3 rounded border border-gray-200 dark:border-neutral-700">
        <button
          onClick={onEditBase}
          className="absolute top-2 right-2 p-1 rounded hover:bg-gray-200 dark:hover:bg-neutral-700"
        >
          <SquarePen className="w-4 h-4" />
        </button>
        <div className="space-y-1">
          <p className="font-semibold">
            {customer.name} {customer.lastName}
          </p>


          
          {customer.phone && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Phone className="w-4 h-4" /> {customer.phone}
            </div>
          )}
          {customer.email && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Mail className="w-4 h-4" /> {customer.email}
            </div>
          )}
          {customer.social && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Globe className="w-4 h-4" /> {customer.social}
            </div>
          )}
          {shipping?.isRequired && (
            <div className="flex items-center gap-1 text-sm text-red-600 mt-2">
              <AlertCircle className="w-4 h-4" />
              <span className="font-medium">{shippingRequired}</span>
            </div>
          )}
        </div>
      </div>

      {/* Payment */}
      <div className="text-sm text-center space-y-1">
        <hr className="border-gray-300 dark:border-neutral-700" />

        <div className="inline-grid grid-cols-2 gap-x-4 text-sm text-left">
          <span className="text-right">{subtotalLabel}</span>
          <span className="font-medium text-left">${subtotal}</span>

          <span className="text-right">{advanceLabel}</span>
          <span className="text-red-500 text-left">-${deposit}</span>

          <span className="text-right text-lg font-bold">{totalLabel}</span>
          <span className="text-lg font-bold text-left">${total}</span>
        </div>

        <hr className="border-gray-300 dark:border-neutral-700" />
      </div>

      {/* Products */}
      <div className="space-y-6">
        {products.map((product, index) => (
          <div
            key={index}
            className="relative p-3 rounded border border-gray-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 space-y-2"
          >
            <button
              onClick={() => onEditProducts?.(index)}
              className="absolute top-2 right-2 p-1 rounded hover:bg-gray-200 dark:hover:bg-neutral-700"
            >
              <SquarePen className="w-4 h-4" />
            </button>

            <p className="font-semibold">{product.label}</p>
            <p className="text-sm">
              {(() => {
                const label =
                  product.quantity === 1 ? figureLabel : `${figureLabel}s`
                return `${product.quantity} ${label}`
              })()}
            </p>

            {(product.glazes?.interior || product.glazes?.exterior) && (
              <div className="flex items-center gap-2">
                {(() => {
                  const count = [
                    product.glazes?.interior,
                    product.glazes?.exterior,
                  ].filter(Boolean).length
                  return (
                    <p className="text-sm font-medium">
                      {glazeLabel}
                      {count > 1 ? 's' : ''}:
                    </p>
                  )
                })()}
                {product.glazes?.interior?.image && (
                  <img
                    src={product.glazes.interior.image}
                    alt={product.glazes.interior.name}
                    title={product.glazes.interior.name}
                    className="w-6 h-6 rounded border"
                  />
                )}
                {product.glazes?.exterior?.image && (
                  <img
                    src={product.glazes.exterior.image}
                    alt={product.glazes.exterior.name}
                    title={product.glazes.exterior.name}
                    className="w-6 h-6 rounded border"
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
              <div className="flex gap-2 overflow-x-auto scrollbar-hide mt-2">
                {product.images.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt={`Imagen ${i + 1}`}
                    className="w-24 h-20 object-cover rounded border flex-shrink-0"
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
