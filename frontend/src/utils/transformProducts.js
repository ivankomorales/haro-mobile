// utils/transformProducts.js

/**
 * Formats a product list by grouping items by type and assigning human-readable labels.
 * It can also resolve glaze IDs to full glaze objects if a list is provided.
 *
 * @param {Array} products - The array of product objects.
 * @param {Function} t - Translation function (defaults to identity).
 * @param {Array} glazes - Optional array of all glaze objects from DB.
 * @returns {Array} - The labeled and normalized product list.
 */
import { makeGlazeMap, ensureGlazeObjects } from './glazeUtils'

export function formatProductsWithLabels(products = [], t = (x) => x, glazes = []) {
  const glazeMap = makeGlazeMap(glazes)
  const normalized = ensureGlazeObjects(products, glazeMap)

  const grouped = normalized.reduce((acc, p) => {
    ;(acc[p.type] ||= []).push(p)
    return acc
  }, {})

  const labeled = []
  Object.entries(grouped).forEach(([type, items]) => {
    items.forEach((item, i) => {
      labeled.push({
        ...item,
        label: `${t(`product.${type}`)} ${i + 1}`,
      })
    })
  })
  return labeled
}
