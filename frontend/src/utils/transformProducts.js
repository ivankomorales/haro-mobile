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
export function formatProductsWithLabels(products = [], t = (x) => x, glazes = []) {
  const glazeMap = new Map(glazes.map((g) => [g._id, g]))

  const grouped = products.reduce((acc, p) => {
    ;(acc[p.type] ||= []).push(p)
    return acc
  }, {})

  const labeled = []

  Object.entries(grouped).forEach(([type, items]) => {
    items.forEach((item, i) => {
      const label = `${t(`product.${type}`)} ${i + 1}`

      const raw = item?.glazes || {}
      const interior =
        typeof raw.interior === 'string'
          ? glazeMap.get(raw.interior) || raw.interior // <-- si no hay match, conserva el ID
          : (raw.interior ?? null) // <-- si ya es objeto, consérvalo

      const exterior =
        typeof raw.exterior === 'string'
          ? glazeMap.get(raw.exterior) || raw.exterior
          : (raw.exterior ?? null)

      labeled.push({
        ...item,
        label,
        // Opción 1: mantener glazes tal cual, pero sin perder información
        glazes: { interior, exterior },

        // Opción 2 (aún más segura): no tocar glazes y agregar resueltos aparte
        // glazesResolved: {
        //   interior: typeof interior === 'string' ? null : interior,
        //   exterior: typeof exterior === 'string' ? null : exterior,
        // },
      })
    })
  })

  return labeled
}
