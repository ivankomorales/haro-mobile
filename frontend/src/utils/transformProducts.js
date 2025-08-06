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
export function formatProductsWithLabels(
  products = [],
  t = (x) => x,
  glazes = []
) {
  // Group products by type
  const grouped = products.reduce((acc, p) => {
    if (!acc[p.type]) acc[p.type] = []
    acc[p.type].push(p)
    return acc
  }, {})

  const resolveGlaze = (id) => glazes.find((g) => g._id === id) || null

  const labeled = []

  // For each group, assign numbered labels and normalize glazes
  Object.entries(grouped).forEach(([type, items]) => {
    items.forEach((item, i) => {
      const label = `${t(`product.${type}`)} ${i + 1}`

      const rawGlazes = item?.glazes || {}
      const normalizedGlazes = {
        interior:
          typeof rawGlazes.interior === 'string'
            ? resolveGlaze(rawGlazes.interior)
            : rawGlazes.interior || null,
        exterior:
          typeof rawGlazes.exterior === 'string'
            ? resolveGlaze(rawGlazes.exterior)
            : rawGlazes.exterior || null,
      }

      labeled.push({
        ...item,
        label,
        glazes: normalizedGlazes,
      })
    })
  })

  return labeled
}
