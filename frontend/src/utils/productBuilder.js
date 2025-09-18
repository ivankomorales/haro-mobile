// utils/productBuilder.js

// Builds a formatted product payload for create or edit operations.
// The `mode` parameter can be 'create' (default) or 'editDB' to preserve existing data.
export function buildProductListPayload(product, mode = 'create') {
  const payload = {
    type: product.type,
    quantity: Number(product.quantity),
    price: Number(product.price), // whole pesos (integers)
    description: product.description?.trim() || '',

    glazes: {
      interior: product.glazes?.interior || null,
      exterior: product.glazes?.exterior || null,
      // denormalized fields for Excel/quick UI (make sure you pass them from UI)
      interiorName: product.glazes?.interiorName || null,
      interiorHex: product.glazes?.interiorHex || null,
      exteriorName: product.glazes?.exteriorName || null,
      exteriorHex: product.glazes?.exteriorHex || null,
    },

    decorations: {
      hasGold: product.decorations?.hasGold || false,
      hasName: product.decorations?.hasName || false,
      // outerDrawing: product.decorations?.outerDrawing || false,
      decorationDescription: product.decorations?.decorationDescription?.trim() || '',
    },

    images: [],
  }

  // Handle images
  if (Array.isArray(product.images)) {
    payload.images = product.images.map((img) => {
      // If it's a raw string URL (legacy), wrap it
      if (typeof img === 'string') {
        return { url: img }
      }

      // If it's a File object (before upload), just pass a preview url
      if (img instanceof File) {
        return { url: URL.createObjectURL(img), alt: img.name }
      }

      // If it's already a Cloudinary-like object, normalize keys
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
    })
  }

  // Edit mode: preserve _id for existing product items in DB
  if (mode === 'editDB' && product._id) {
    payload._id = product._id
  }

  return payload
}
