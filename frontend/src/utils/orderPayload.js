// src/utils/orderPayload.js
// Central builder for creating the API payload from an order draft.
import { ensureStatus } from './orderBuilder'

// ----------------- Helpers -----------------
export function normalizeImage(img) {
  if (!img) return null

  // Objeto ya normalizado
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

  // Respuesta de Cloudinary
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

  // String (URL legacy)
  if (typeof img === 'string') {
    return { url: img, alt: '', primary: false }
  }

  // File/Blob preview: no lo persistimos
  return null
}

function toDateSafe(value) {
  if (!value) return undefined
  if (value instanceof Date) return value

  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    // Pega al mediodía local para evitar off-by-one por timezone
    return new Date(`${value}T12:00:00`)
  }

  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? undefined : d
}

// GLAZES
function idsEqual(a, b) {
  return String(a) === String(b)
}

export function getGlazeTriplet(glazeId, allGlazes = []) {
  if (!glazeId) return null
  const g = allGlazes.find((x) => idsEqual(x._id, glazeId))
  return g ? { id: g._id, name: g.name, hex: g.hex, image: g.image || g.url || null } : null
}

/**
 * Acepta:
 * - p.glazeInterior / p.glazeExterior (IDs) desde el form
 * - o p.glazes.interior / p.glazes.exterior (IDs u objetos) si viene de edición
 */
export function toProductPayload(p, allGlazes = []) {
  const interiorId =
    p.glazeInterior || (p.glazes && (p.glazes.interior?._id || p.glazes.interior)) || null

  const exteriorId =
    p.glazeExterior || (p.glazes && (p.glazes.exterior?._id || p.glazes.exterior)) || null

  const gi = getGlazeTriplet(interiorId, allGlazes)
  const ge = getGlazeTriplet(exteriorId, allGlazes)

  const images = (p.images || []).map(normalizeImage).filter(Boolean)

  const figures = Number(p.figures || 1)
  const quantity = Number(p.quantity || 1)
  const price = Number(p.price || 0)
  const discount = Number(p.discount || 0)

  return {
    type: p.type,
    quantity, // normalmente 1
    figures, // # de figuritas en el producto
    price, // precio por pieza
    discount, // descuento por pieza (moneda)
    description: (p.description || '').trim(),
    glazes: {
      interior: gi ? gi.id : interiorId || null,
      exterior: ge ? ge.id : exteriorId || null,
      interiorName: gi ? gi.name : (p.glazes?.interiorName ?? null),
      interiorHex: gi ? gi.hex : (p.glazes?.interiorHex ?? null),
      exteriorName: ge ? ge.name : (p.glazes?.exteriorName ?? null),
      exteriorHex: ge ? ge.hex : (p.glazes?.exteriorHex ?? null),
      // UI-only (thumbnails antes de guardar definitivo)
      interiorImage: gi ? gi.image : null,
      exteriorImage: ge ? ge.image : null,
    },
    decorations: {
      hasGold: !!(p.decorations && p.decorations.hasGold),
      hasName: !!(p.decorations && p.decorations.hasName),
      outerDrawing: !!(p.decorations && p.decorations.outerDrawing),
      customText: (p.decorations && p.decorations.customText
        ? p.decorations.customText
        : ''
      ).trim(),
    },
    images,
    ...(p._id ? { _id: p._id } : {}),
  }
}

// ----------------- Builder principal -----------------
export function buildOrderPayload(orderDraft, cleanAddresses, allGlazes = []) {
  // 1) Normaliza cada producto usando la misma función
  const cleanProducts = (orderDraft.products || []).map((p) => toProductPayload(p, allGlazes))

  // 2) Limpia direcciones (si te pasan la función); si no, usa tal cual
  const cleanedAddresses =
    typeof cleanAddresses === 'function'
      ? cleanAddresses(orderDraft.shipping?.addresses || [])
      : orderDraft.shipping?.addresses || []

  // 3) Arma el payload final
  return {
    customer: {
      name: orderDraft.customer?.name,
      lastName: orderDraft.customer?.lastName,
      email: orderDraft.customer?.email || undefined,
      phone: orderDraft.customer?.phone,
      socialMedia: orderDraft.customer?.socialMedia,
    },
    orderDate: toDateSafe(orderDraft.orderDate),
    deliverDate: toDateSafe(orderDraft.deliverDate),
    status: ensureStatus(orderDraft.status),
    deposit: Number(orderDraft.deposit || 0),
    notes: orderDraft.notes || '',
    shipping: {
      isRequired: !!orderDraft.shipping?.isRequired && cleanedAddresses.length > 0,
      addresses: cleanedAddresses,
    },
    products: cleanProducts,
  }
}
