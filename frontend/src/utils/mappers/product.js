// src/utils/mappers/product.js
export function normalizeProductForm(form, glazeMap = new Map()) {
  // Guard against non-Map or undefined
  const map = glazeMap instanceof Map ? glazeMap : new Map()

  const getGlaze = (id) => {
    if (!id) return null
    const key = typeof id === 'object' && id?._id ? String(id._id) : String(id)
    return map.get(key) || null
  }

  const priceNum = Math.max(0, Number(form.price || 0))
  const discNum = Math.max(0, Math.min(Number(form.discount || 0), priceNum))

  const gi = getGlaze(form.glazeInterior)
  const ge = getGlaze(form.glazeExterior)

  return {
    type: form.type || '',
    quantity: Math.max(1, Number(form.quantity || 1)),
    figures: Math.max(1, Number(form.figures || 1)),
    price: priceNum,
    discount: discNum,
    description: form.description || '',
    images: form.images || [],
    glazes: {
      // Prefer resolved glaze id; fall back to whatever id the form had
      interior: (gi?._id ?? form.glazeInterior) || null,
      exterior: (ge?._id ?? form.glazeExterior) || null,

      interiorName: gi?.name || '',
      interiorHex: gi?.hex || gi?.colorHex || '',
      interiorImage: gi?.image || '',

      exteriorName: ge?.name || '',
      exteriorHex: ge?.hex || ge?.colorHex || '',
      exteriorImage: ge?.image || '',
    },
    decorations: {
      hasGold: !!form?.decorations?.hasGold,
      hasName: !!form?.decorations?.hasName,
      decorationDescription: form?.decorations?.decorationDescription || '',
    },
  }
}
