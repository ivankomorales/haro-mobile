// src/utils/uploadToCloudinary.js

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_NAME
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_PRESET
const BASE_URL_CLOUDINARY = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`

/**
 * Upload a single image file to Cloudinary.
 *
 * @param {File} file - The image file to upload.
 * @param {string} folder - Cloudinary folder path, e.g. "haromobile/glazes"
 * @returns {Promise<string>} - The uploaded image's secure_url.
 */
export async function uploadToCloudinary(file, folder = 'haromobile/misc') {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', UPLOAD_PRESET)
  formData.append('folder', folder)

  const res = await fetch(BASE_URL_CLOUDINARY, {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) {
    const errorText = await res.text()
    throw new Error(`Cloudinary upload failed: ${res.status} - ${errorText}`)
  }

  const data = await res.json()
  return data.secure_url
}
