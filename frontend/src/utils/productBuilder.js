// utils/productBuilder.js

// Builds a formatted product payload for create or edit operations.
// The `mode` parameter can be 'create' (default) or 'editDB' to preserve existing data.
export function buildProductListPayload(product, mode = 'create') {
  const payload = {
    type: product.type,
    quantity: Number(product.quantity),
    price: Number(product.price),
    description: product.description || '',
    glazes: {
      interior: product.glazes?.interior || null,
      exterior: product.glazes?.exterior || null,
    },
    decorations: {
      hasGold: product.decorations?.hasGold || false,
      hasName: product.decorations?.hasName || false,
      outerDrawing: product.decorations?.outerDrawing || false,
      customText: product.decorations?.customText || '',
    },
    images: [],
  }

  if (mode === 'editDB') {
    // Preserve images that are already uploaded (via URL)
    payload.images =
      product.images?.filter(
        (img) => typeof img === 'string' && img.startsWith('http')
      ) || []

    // Include _id if available, needed for PUT/update operations
    if (product._id) payload._id = product._id
  }

  return payload
}
