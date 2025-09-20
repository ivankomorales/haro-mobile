// src/components/AddedProductsCart.jsx
import { Trash2, Pencil, ShoppingCart } from 'lucide-react'

// Simple pluralization helper: adds "s" when count !== 1
// Examples: "figure" -> "figures", "product" -> "products"
function pluralLabel(count, singular) {
  return count === 1 ? singular : `${singular}s`
}

export default function AddedProductsCart({ products = [], onEdit, onRemove, t }) {
  // Compute line total for a product: (price - discount) * quantity
  const lineTotal = (p) => {
    const price = Number(p.price || 0)
    const discount = Math.max(0, Number(p.discount || 0))
    const qty = Math.max(1, Number(p.quantity || 1))
    return Math.max(0, price - discount) * qty
  }

  // Sum of all line totals
  const subtotal = products.reduce((acc, p) => acc + lineTotal(p), 0)

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
              // Normalize numbers
              const qty = Math.max(1, Number(p.quantity || 1))
              const figures = Math.max(1, Number(p.figures || 1))
              const price = Number(p.price || 0)
              const discount = Math.max(0, Number(p.discount || 0))
              const total = lineTotal(p)

              // Localized type label (keep original casing for display)
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

                    {/* SECOND LINE: price + (optional discount) + (qty only if > 1) + total */}
                    <div className="text-xs text-gray-600 dark:text-gray-300">
                      ${price}
                      {discount > 0 && <> − ${discount}</>}
                      {qty > 1 && <> × {qty}</>}
                      {' = '}
                      <strong>${total}</strong>
                    </div>

                    {/* Glazes mini with swatches (unchanged) */}
                    {(p.glazes?.interiorName || p.glazes?.exteriorName) && (
                      <div className="mt-1 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                        {p.glazes?.interiorName && (
                          <span className="inline-flex items-center gap-1">
                            <span
                              className="inline-block h-3 w-3 rounded-full" // TODO add border to stand out specially on Dark mode
                              style={{ backgroundColor: p.glazes?.interiorHex || '#ccc' }}
                            />
                            {p.glazes?.interiorName}
                          </span>
                        )}
                        {p.glazes?.exteriorName && (
                          <span className="inline-flex items-center gap-1">
                            <span
                              className="inline-block h-3 w-3 rounded-full" // TODO add border to stand out specially on Dark mode
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

          {/* Totals */}
          <div className="mt-4 border-t border-neutral-200 pt-3 text-sm dark:border-neutral-700">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-300">{t('cart.subtotal')}</span>
              <span className="font-semibold">${subtotal}</span>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
