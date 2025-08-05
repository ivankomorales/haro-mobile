// utils/transformProducts.js

/**
 * Formats a product list by grouping items by type and assigning human-readable labels.
 * Example output: "Mug 1", "Mug 2", "Bowl 1", etc.
 *
 * @param {Array} products - The array of product objects.
 * @param {Function} t - Translation function (defaults to identity).
 * @returns {Array} - The labeled and normalized product list.
 */
export function formatProductsWithLabels(products = [], t = (x) => x) {
  // Group products by type
  const grouped = products.reduce((acc, p) => {
    if (!acc[p.type]) acc[p.type] = []
    acc[p.type].push(p)
    return acc
  }, {})

  const labeled = []

  // For each group, assign numbered labels and normalize glazes
  Object.entries(grouped).forEach(([type, items]) => {
    items.forEach((item, i) => {
      const label = `${t(`product.${type}`)} ${i + 1}`

      const glazes = {
        interior: item?.glazes?.interior || null,
        exterior: item?.glazes?.exterior || null,
      }

      labeled.push({
        ...item,
        label,
        glazes,
      })
    })
  })

  return labeled
}
