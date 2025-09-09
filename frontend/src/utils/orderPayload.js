// src/utils/orderPayload.js
// Central builder for creating the API payload from an order draft.
import { ensureStatus } from './orderBuilder'

export function normalizeImage(img) {
  if (!img) return null
  if (typeof img === 'string') return { url: img, alt: '', primary: false }
  if (img && typeof img === 'object' && (img.url || img.secure_url || img.public_id)) {
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
  return null
}

export function buildOrderPayload(orderDraft, cleanAddresses) {
  const cleanProducts = (orderDraft.products || []).map((p) => {
    const intId = p.glazes?.interior?._id || p.glazes?.interior || null
    const extId = p.glazes?.exterior?._id || p.glazes?.exterior || null

    const giName = p.glazes?.interior?.name || p.glazes?.interiorName || null
    const giHex = p.glazes?.interior?.hex || p.glazes?.interiorHex || null
    const geName = p.glazes?.exterior?.name || p.glazes?.exteriorName || null
    const geHex = p.glazes?.exterior?.hex || p.glazes?.exteriorHex || null

    return {
      type: p.type,
      quantity: Number(p.quantity || 0),
      price: Number(p.price || 0),
      description: (p.description || '').trim(),
      glazes: {
        interior: intId,
        exterior: extId,
        interiorName: giName,
        interiorHex: giHex,
        exteriorName: geName,
        exteriorHex: geHex,
      },
      decorations: {
        hasGold: !!p?.decorations?.hasGold,
        hasName: !!p?.decorations?.hasName,
        outerDrawing: !!p?.decorations?.outerDrawing,
        customText: (p?.decorations?.customText || '').trim(),
      },
      images: (p.images || []).map(normalizeImage).filter(Boolean),
      ...(p._id ? { _id: p._id } : {}),
    }
  })

  const cleanedAddresses = cleanAddresses(orderDraft.shipping?.addresses || [])

  return {
    customer: {
      name: orderDraft.customer.name,
      lastName: orderDraft.customer.lastName,
      email: orderDraft.customer.email || undefined,
      phone: orderDraft.customer.phone,
      socialMedia: orderDraft.customer.socialMedia,
    },
    orderDate: orderDraft.orderDate ? new Date(orderDraft.orderDate) : undefined,
    deliverDate: orderDraft.deliverDate ? new Date(orderDraft.deliverDate) : undefined,
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
