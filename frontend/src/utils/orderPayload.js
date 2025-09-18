// src/utils/orderPayload.js
// comments in English only

import { ensureStatus } from './orderBuilder'

/* ----------------------------- Number helpers ----------------------------- */

function toNumberSafe(raw, { min = 0, defaultValue = 0 } = {}) {
  if (raw === null || raw === undefined) return defaultValue
  const str = String(raw).trim()
  if (str === '') return defaultValue
  const num = Number(str.replace(/[^\d.]/g, ''))
  if (!Number.isFinite(num)) return defaultValue
  return num < min ? min : num
}

/**
 * If the field is empty, returns undefined so the client can omit it.
 * If negative or NaN, coerces to 0.
 */
export function normalizeDeposit(raw) {
  if (raw === null || raw === undefined) return undefined
  const str = String(raw).trim()
  if (str === '') return undefined // omit in payload
  const num = Number(str.replace(/[^\d.]/g, ''))
  if (!Number.isFinite(num) || num < 0) return 0
  return num
}

/* ------------------------------- Date helper ------------------------------ */

/**
 * Accepts: Date | 'YYYY-MM-DD' | number | string.
 * Returns ISO string at local noon to avoid off-by-one issues.
 */
function toISOLocalNoon(value) {
  if (!value) return undefined
  if (value instanceof Date && !isNaN(value)) {
    const d = new Date(value)
    d.setHours(12, 0, 0, 0)
    return d.toISOString()
  }
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const d = new Date(`${value}T12:00:00`)
    return isNaN(d) ? undefined : d.toISOString()
  }
  const d = new Date(value)
  if (isNaN(d)) return undefined
  d.setHours(12, 0, 0, 0)
  return d.toISOString()
}

/* ------------------------------ Image helper ------------------------------ */

export function normalizeImage(img) {
  if (!img) return null

  // Already normalized object
  if (typeof img === 'object' && img.url) {
    return {
      url: img.url,
      publicId: img.publicId || img.public_id,
      width: img.width,
      height: img.height,
      format: img.format,
      bytes: img.bytes,
      alt: img.alt || '',
      primary: !!img.primary,
    }
  }

  // Cloudinary response
  if (typeof img === 'object' && (img.secure_url || img.public_id)) {
    return {
      url: img.secure_url || img.url,
      publicId: img.public_id || img.publicId,
      width: img.width,
      height: img.height,
      format: img.format,
      bytes: img.bytes,
      alt: img.alt || '',
      primary: !!img.primary,
    }
  }

  // Legacy URL string
  if (typeof img === 'string') {
    return { url: img, alt: '', primary: false }
  }

  // File/Blob preview → do not persist
  return null
}

/* ------------------------------- Glaze helper ----------------------------- */

function idsEqual(a, b) {
  return String(a) === String(b)
}

export function getGlazeTriplet(glazeId, allGlazes = []) {
  if (!glazeId) return null
  const g = allGlazes.find(
    (x) => idsEqual(x._id, glazeId) || idsEqual(x.id, glazeId) || idsEqual(x.code, glazeId)
  )
  return g
    ? { id: g._id || g.id || g.code, name: g.name, hex: g.hex, image: g.image || g.url || null }
    : null
}

/* ------------------------------ Shipping helper --------------------------- */

/**
 * Normalize shipping into a single shape: { isRequired: boolean, addresses: Array }
 * - Keeps isRequired exactly as the UI toggle states (do NOT auto-false when addresses are empty).
 * - Trims strings and removes empty blocks.
 */
// --- Address normalization ---
function normalizeAddress(raw) {
  if (!raw || typeof raw !== 'object') return null

  const out = {
    // keep _id only (subdoc key); do not forward "id"
    ...('_id' in raw && raw._id ? { _id: raw._id } : {}),
    street: String(raw.street || raw.address || '').trim(),
    city: String(raw.city || '').trim(),
    state: String(raw.state || '').trim(),
    zip: String(raw.zip || '')
      .replace(/\D+/g, '')
      .slice(0, 5),
    country: String(raw.country || 'Mexico').trim(),
    phone: String(raw.phone || '')
      .replace(/\D+/g, '')
      .slice(0, 10),
    reference: String(raw.reference || '').trim(),
    countryCode: String(raw.countryCode || '+52').trim(),
    name: String(raw.name || '').trim(),
  }

  const isComplete =
    out.street &&
    out.city &&
    out.state &&
    /^\d{5}$/.test(out.zip) &&
    out.country &&
    /^\d{10}$/.test(out.phone)

  // Drop optional empties so naïve backend guards don't choke
  if (!out.reference) delete out.reference
  if (!out.name) delete out.name
  if (!out.countryCode) delete out.countryCode

  return isComplete ? out : null
}

function normalizeShipping(shipping) {
  const on = !!shipping?.isRequired
  const src = Array.isArray(shipping?.addresses) ? shipping.addresses : []
  const list = src.map(normalizeAddress).filter(Boolean)
  return { isRequired: on, addresses: on ? list : [] }
}

/* ----------------------------- Product mapping ---------------------------- */

/**
 * Map a UI product into API product.
 * If glazes are not loaded, DO NOT touch existing glaze fields to avoid wiping data.
 */
export function toProductPayload(p, allGlazes = [], { glazesLoaded } = {}) {
  const images = (p.images || []).map(normalizeImage).filter(Boolean)

  const figures = toNumberSafe(p.figures, { min: 1, defaultValue: 1 })
  const quantity = toNumberSafe(p.quantity, { min: 1, defaultValue: 1 })
  const price = toNumberSafe(p.price, { min: 0, defaultValue: 0 })
  const discount = toNumberSafe(p.discount, { min: 0, defaultValue: 0 })

  const base = {
    type: p.type || 'figure',
    quantity,
    figures,
    price, // price per item
    discount, // discount per item
    description: (p.description || '').trim(),
    decorations: {
      hasGold: !!p?.decorations?.hasGold,
      hasName: !!p?.decorations?.hasName,
      // outerDrawing: !!p?.decorations?.outerDrawing,
      decorationDescription: (
        p?.decorations?.decorationDescription ??
        p?.decorations?.customText ??
        ''
      ).trim(),
    },
    images,
    ...(p._id ? { _id: p._id } : {}),
  }

  if (!glazesLoaded) {
    // Preserve whatever the UI had; do not rewrite glaze fields
    if (p.glazes) base.glazes = { ...p.glazes }
    if (p.glazeInterior !== undefined) base.glazeInterior = p.glazeInterior
    if (p.glazeExterior !== undefined) base.glazeExterior = p.glazeExterior
    return base
  }

  // When glazes are loaded, normalize id/name/hex
  const interiorId =
    p.glazeInterior ||
    (p.glazes && (p.glazes.interior?._id || p.glazes.interior?.id || p.glazes.interior)) ||
    null
  const exteriorId =
    p.glazeExterior ||
    (p.glazes && (p.glazes.exterior?._id || p.glazes.exterior?.id || p.glazes.exterior)) ||
    null

  const gi = getGlazeTriplet(interiorId, allGlazes)
  const ge = getGlazeTriplet(exteriorId, allGlazes)

  base.glazes = {
    interior: gi ? gi.id : interiorId || null,
    exterior: ge ? ge.id : exteriorId || null,
    interiorName: gi ? gi.name : (p.glazes?.interiorName ?? null),
    interiorHex: gi ? gi.hex : (p.glazes?.interiorHex ?? null),
    exteriorName: ge ? ge.name : (p.glazes?.exteriorName ?? null),
    exteriorHex: ge ? ge.hex : (p.glazes?.exteriorHex ?? null),
    interiorImage: gi ? gi.image : (p.glazes?.interiorImage ?? null),
    exteriorImage: ge ? ge.image : (p.glazes?.exteriorImage ?? null),
  }

  return base
}

/* ----------------------------- Main payload API --------------------------- */

/**
 * Build the final order payload for create/update.
 *
 * @param {object} orderDraft - UI order draft (customer, dates, status, deposit, notes, shipping, products)
 * @param {object} options
 *  - allGlazes: array of glazes to resolve ids/names (optional)
 *  - glazesLoaded: boolean to guard against wiping glaze fields (default: true if allGlazes has items)
 *  - quick: if true, omit products/images for a "light" save (default: false)
 */
export function buildOrderPayload(orderDraft, options = {}) {
  const {
    allGlazes = [],
    glazesLoaded = Array.isArray(allGlazes) && allGlazes.length > 0,
    quick = false,
  } = options

  // Customer
  const customer = {
    name: (orderDraft.customer?.name || orderDraft.customer?.firstName || '').trim(),
    lastName: (orderDraft.customer?.lastName || '').trim(),
    email: (orderDraft.customer?.email || '').trim() || undefined,
    phone: (orderDraft.customer?.phone || '').trim(),
    countryCode: (orderDraft.customer?.countryCode || '+52').trim(),
    socialMedia: orderDraft.customer?.socialMedia,
  }

  // Dates (ISO strings at local noon)
  const orderDate = toISOLocalNoon(orderDraft.orderDate)
  const deliverDate = toISOLocalNoon(orderDraft.deliverDate)

  // Deposit (omit if empty)
  const deposit = normalizeDeposit(orderDraft.deposit)

  // Shipping (single consistent shape)
  const shipping = normalizeShipping(orderDraft.shipping || {})

  // Products
  const products = quick
    ? undefined
    : (orderDraft.products || []).map((p) => toProductPayload(p, allGlazes, { glazesLoaded }))

  // Notes
  const notes = (orderDraft.notes || '').trim()

  const payload = {
    customer,
    orderDate,
    deliverDate,
    status: ensureStatus(orderDraft.status),
    notes: notes || undefined,
    shipping,
  }

  if (deposit !== undefined) payload.deposit = deposit
  if (!quick) payload.products = products

  return payload
}
