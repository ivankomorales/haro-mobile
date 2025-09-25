// src/components/AddedProductsCart.jsx
import { Trash2, Pencil, ShoppingCart } from 'lucide-react'

// Simple pluralization helper: adds "s" when count !== 1
// Examples: "figure" -> "figures", "product" -> "products"
function pluralLabel(count, singular) {
  return count === 1 ? singular : `${singular}s`
}

// Money formatter (keeps it consistent like $12.00)
function formatMoney(n) {
  const value = Number.isFinite(n) ? n : 0
  return `$${value.toFixed(2)}`
}

/**
 * AddedProductsCart
 *
 * Props:
 * - products: array of items with shape:
 *    {
 *      type,            // string key for i18n, e.g. "mug"
 *      price,           // unit price (number)
 *      discount,        // unit discount (number, >= 0)
 *      quantity,        // integer >= 1
 *      figures,         // integer >= 1
 *      glazes: { interiorName, interiorHex, exteriorName, exteriorHex }
 *    }
 * - onEdit(index), onRemove(index)
 * - t: translation function
 * - deposit: number (optional). Pass parent value, e.g. order.deposit
 */
export default function AddedProductsCart({
  products = [],
  onEdit,
  onRemove,
  t,
  deposit = 0, // <-- Parent can pass order.deposit here
}) {
  // Normalize helpers
  const qtyOf = (p) => Math.max(1, Number(p.quantity || 1))
  const unitPriceOf = (p) => Number(p.price || 0)
  const unitDiscountOf = (p) => Math.max(0, Number(p.discount || 0))

  // Aggregates (MINIMAL UI approach)
  // Subtotal = sum of all unit prices times quantity (no discounts applied here)
  const subtotal = products.reduce((acc, p) => acc + unitPriceOf(p) * qtyOf(p), 0)
  // Discounts = sum of all unit discounts times quantity
  const discounts = products.reduce((acc, p) => acc + unitDiscountOf(p) * qtyOf(p), 0)
  // Deposit is provided by parent (already normalized in render)
  const depositSafe = Math.max(0, Number(deposit || 0))

  // Final total (no IVA yet): Subtotal − Discounts − Deposit
  const total = Math.max(0, subtotal - discounts - depositSafe)

  // Header key changes depending on number of items
  const itemsCount = products.length
  const addedKey = itemsCount === 1 ? 'product.added' : 'product.addedOther'

  return (
    <div className="rounded-xl border border-neutral-200 p-4 shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
      <div className="mb-3 flex justify-between">
        <h2 className="mb-3 text-sm font-semibold text-gray-600 dark:text-gray-200">
          {t(addedKey)}
        </h2>
        <ShoppingCart />
      </div>

      {products.length === 0 ? (
        // Empty cart state
        <div className="rounded-xl border border-dashed border-neutral-300 p-6 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
          {t('cart.empty')}
        </div>
      ) : (
        <>
          <ul className="space-y-2 text-sm text-gray-800 dark:text-white">
            {products.map((p, i) => {
              const qty = qtyOf(p)
              const figures = Math.max(1, Number(p.figures || 1))
              const price = unitPriceOf(p)
              const typeLabel = t(`product.${p.type}`) || p.type

              return (
                <li
                  key={i}
                  className="flex items-center justify-between rounded bg-neutral-100 p-2 dark:bg-neutral-800"
                >
                  <div className="min-w-0 flex-1 pr-2">
                    {/* FIRST LINE: qty + Type (pluralized by qty) + figures */}
                    <div className="truncate">
                      {qty} {pluralLabel(qty, typeLabel)}
                      {' — '}
                      {figures}{' '}
                      {pluralLabel(
                        figures,
                        // Keep figures label lowercased (as in your original)
                        t('product.figure')?.toLowerCase() || 'figure'
                      )}
                    </div>

                    {/* SECOND LINE (MINIMAL): only show the product price (unit price) */}
                    <div className="text-xs text-gray-600 dark:text-gray-300">
                      {formatMoney(price)}
                    </div>

                    {/* Glazes mini with swatches (unchanged) */}
                    {(p.glazes?.interiorName || p.glazes?.exteriorName) && (
                      <div className="mt-1 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                        {p.glazes?.interiorName && (
                          <span className="inline-flex items-center gap-1">
                            <span
                              className="inline-block h-3 w-3 rounded-full"
                              style={{ backgroundColor: p.glazes?.interiorHex || '#ccc' }}
                            />
                            {p.glazes?.interiorName}
                          </span>
                        )}
                        {p.glazes?.exteriorName && (
                          <span className="inline-flex items-center gap-1">
                            <span
                              className="inline-block h-3 w-3 rounded-full"
                              style={{ backgroundColor: p.glazes?.exteriorHex || '#ccc' }}
                            />
                            {p.glazes?.exteriorName}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Action buttons (Edit / Remove) */}
                  <div className="ml-2 flex items-center">
                    <button
                      type="button"
                      onClick={() => onEdit?.(i)}
                      className="text-blue-600 hover:text-blue-800"
                      aria-label={t('aria.editProduct')}
                      title={t('aria.editProduct')}
                    >
                      <Pencil className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemove?.(i)}
                      className="ml-2 text-red-500 hover:text-red-700"
                      aria-label={t('aria.removeProduct')}
                      title={t('aria.removeProduct')}
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </li>
              )
            })}
          </ul>

          {/* Totals (compact, right-aligned values) */}
          <div className="mt-4 border-t border-neutral-200 pt-3 text-sm dark:border-neutral-700">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">{t('cart.subtotal')}</span>
              <span className="font-medium">{formatMoney(subtotal)}</span>
            </div>

            {/* Only show Discounts if there are any */}
            {discounts > 0 && (
              <div className="mt-1 flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">
                  {t('cart.discounts') || 'Discounts'}
                </span>
                <span className="font-medium">−{formatMoney(discounts)}</span>
              </div>
            )}

            {/* Only show Deposit if provided (> 0) */}
            {depositSafe > 0 && (
              <div className="mt-1 flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">
                  {t('cart.deposit') || 'Deposit'}
                </span>
                <span className="font-medium">−{formatMoney(depositSafe)}</span>
              </div>
            )}

            {/* IVA (commented for future use Do not delete) */}
            {/*
            const ivaRate = 0.16 // 16% example
            const ivaAmount = Math.max(0, (subtotal - discounts - depositSafe) * ivaRate)
            <div className="mt-1 flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">{t('cart.iva') || 'IVA'}</span>
              <span className="font-medium">+{formatMoney(ivaAmount)}</span>
            </div>
            */}

            {/* Total */}
            <div className="mt-2 flex justify-between border-t border-neutral-200 pt-2 dark:border-neutral-700">
              <span className="font-semibold text-gray-800 dark:text-white">
                {t('cart.total') || 'Total'}
              </span>
              <span className="font-semibold">{formatMoney(total)}</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
