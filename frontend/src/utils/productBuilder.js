// utils/productBuilder.js
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
    // Preserva imágenes que ya estén subidas (URL)
    payload.images = product.images?.filter((img) =>
      typeof img === 'string' && img.startsWith('http')
    ) || []
    // Conserva _id si es necesario para PUT
    if (product._id) payload._id = product._id
  }

  return payload
}
