// utils/transformProducts.js

export function formatProductsWithLabels(products = [], t = (x) => x) {
  const grouped = products.reduce((acc, p) => {
    if (!acc[p.type]) acc[p.type] = []
    acc[p.type].push(p)
    return acc
  }, {})

  const labeled = []
  Object.entries(grouped).forEach(([type, items]) => {
    items.forEach((item, i) => {
      const label = `${t(`forms.product.types.${type}`)} ${i + 1}`

      // Normalize glazes
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
