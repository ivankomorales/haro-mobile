// src/utils/glazeUtils.js
// Utilities to resolve glazes consistently across the UI.

/**
 * Create a dictionary for O(1) glaze lookup by _id.
 */
export function makeGlazeMap(glazes = []) {
  return new Map((glazes || []).map((g) => [String(g._id), g]))
}

/**
 * Build a fallback glaze object from product flat fields when lookup fails.
 */
export function fallbackFromProduct(product, side) {
  const g = product?.glazes || {}
  const id = g?.[side]
  const name = g?.[`${side}Name`] ?? g?.[side]?.name ?? null
  const hex = g?.[`${side}Hex`] ?? g?.[side]?.hex ?? null
  const image = g?.[`${side}Image`] ?? g?.[side]?.image ?? g?.[side]?.url ?? null

  return id || name || hex || image
    ? {
        _id: typeof id === 'string' ? id : (id?._id ?? null),
        name,
        hex,
        image,
      }
    : null
}

/**
 * Resolve a glaze value (string id or object) against a glaze map, with fallback.
 */
export function resolveGlazeFlexible(value, glazeMap, product, side) {
  if (!value) return fallbackFromProduct(product, side)
  if (typeof value === 'string') {
    return glazeMap.get(value) || fallbackFromProduct(product, side)
  }
  if (typeof value === 'object' && value._id) {
    return glazeMap.get(String(value._id)) || value
  }
  return fallbackFromProduct(product, side)
}

/**
 * Ensure products carry nested glaze objects so UI components can render safely.
 * For each product, enrich interior/exterior to objects (id → object) using map/fallback.
 */
export function ensureGlazeObjects(products = [], glazeMap = new Map()) {
  return (products || []).map((p) => {
    const gi = resolveGlazeFlexible(p?.glazes?.interior, glazeMap, p, 'interior')
    const ge = resolveGlazeFlexible(p?.glazes?.exterior, glazeMap, p, 'exterior')
    return {
      ...p,
      glazes: {
        ...(p.glazes || {}),
        interior: gi,
        exterior: ge,
      },
    }
  })
}
