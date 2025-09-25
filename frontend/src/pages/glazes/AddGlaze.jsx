// src/pages/glazes/AddGlaze.jsx
// comments in English only
import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

import FormActions from '../../components/FormActions'
import FormInput from '../../components/FormInput'
import ImageUploader from '../../components/ImageUploader'
import { useLayout } from '../../context/LayoutContext'
import { useCreateGlaze } from '../../hooks/useCreateGlaze'
import { getMessage as t } from '../../utils/getMessage'
import { getOriginPath } from '../../utils/navigationUtils'
import { uploadToCloudinary } from '../../utils/uploadToCloudinary'

export default function AddGlaze() {
  const navigate = useNavigate()
  const location = useLocation()
  const returnTo = location.state?.returnTo
  const originPath = getOriginPath(
    location.state?.originPath ?? location.state?.from,
    '/products/glazes'
  )

  const { create } = useCreateGlaze()

  // Top bar actions
  const { setTitle, setShowSplitButton, resetLayout } = useLayout()
  useEffect(() => {
    setTitle(t('glaze.new'))
    setShowSplitButton(false)
    return resetLayout
  }, [setTitle, setShowSplitButton, resetLayout])

  const imageInputRef = useRef(null)
  const [formData, setFormData] = useState({
    name: '',
    hex: '#000000',
    code: '',
    images: [],
  })
  const [loading, setLoading] = useState(false)

  function handleChange(e) {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  function validate() {
    if (!formData.name.trim()) throw new Error(t('glaze.errors.nameRequired') || 'Name is required')
    if (!/^#[0-9a-fA-F]{6}$/.test(formData.hex))
      throw new Error(t('glaze.errors.hexInvalid') || 'Invalid hex color')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (loading) return
    setLoading(true)
    try {
      validate()
      // Upload images (only the first will be used as main image for now)
      const urls = await Promise.all(
        (formData.images || []).map((img) => uploadToCloudinary(img, 'haromobile/glazes'))
      )

      const payload = {
        name: formData.name.trim(),
        colorHex: formData.hex,
        code: formData.code.trim(),
        image: urls[0] || '',
      }

      await create(payload)

      // Reset local form
      setFormData({ name: '', hex: '#000000', code: '', images: [] })
      if (imageInputRef.current) imageInputRef.current.value = ''

      // Navigate back to list or origin
      navigate(returnTo || originPath || '/products/glazes', { replace: true })
    } catch (err) {
      // The hook already shows a toast; keep this for extra safety in case it's a validation error
      // Avoid double-toasting: only console.error here or show a tiny helper text if you want
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full min-h-0 bg-white px-4 font-sans text-gray-800 dark:bg-neutral-900 dark:text-gray-100">
      <div className="pt-2 pb-4">
        <form onSubmit={handleSubmit} className="mx-auto max-w-md space-y-6">
          <div className="flex items-center gap-4">
            <FormInput
              label={t('glaze.name')}
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={loading}
              required
            />
          </div>

          <div className="flex items-center gap-4">
            <FormInput
              label={t('glaze.code')}
              name="code"
              value={formData.code}
              onChange={handleChange}
              disabled={loading}
            />
            <div className="flex items-center gap-2">
              <input
                type="color"
                name="hex"
                value={formData.hex}
                onChange={handleChange}
                disabled={loading}
                className="h-10 w-10 cursor-pointer rounded border border-gray-300 dark:border-gray-600"
              />
              <span className="w-16 text-sm text-gray-700 dark:text-gray-300">{formData.hex}</span>
            </div>
          </div>

          <ImageUploader
            ref={imageInputRef}
            multiple={false}
            disabled={loading}
            value={formData.images}
            onChange={(imgs) => setFormData((prev) => ({ ...prev, images: imgs }))}
          />

          {/* Keep inline helper only if you want to show local validation messages
              otherwise rely on toasts and remove this block */}
          {/* {error && <div className="text-sm text-red-500">{error}</div>} */}

          <FormActions
            // Important: avoid double-calling. Make sure FormActions submit button is type="submit".
            onSubmit={handleSubmit}
            submitDisabled={loading}
            cancelRedirect={returnTo || originPath || '/products/glazes'}
          />
        </form>
      </div>
    </div>
  )
}
