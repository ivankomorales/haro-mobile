import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import FormInput from '../../components/FormInput'
import { useCreateGlaze } from '../../hooks/useCreateGlaze'
import { uploadToCloudinary } from '../../utils/uploadToCloudinary'
import ImageUploader from '../../components/ImageUploader'
import { ChevronLeft } from 'lucide-react'
import { getMessage as t } from '../../utils/getMessage'
import FormActions from '../../components/FormActions'
import { getOriginPath } from '../../utils/navigationUtils'
import { useLayout } from '../../context/LayoutContext'
import DropWrap from '../../components/DropWrap'

export default function AddGlaze() {
  const navigate = useNavigate()
  const location = useLocation()
  const returnTo = location.state?.returnTo
  const originPath = getOriginPath(location.state?.originPath ?? location.state?.from)

  const { create } = useCreateGlaze(navigate)

  // Top bar actions
  const { setTitle, setShowSplitButton, resetLayout } = useLayout()

  useEffect(() => {
    setTitle(t('glaze.new'))
    // si NO necesitas el botón “split”, apágalo:
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

  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
    setError(null)
    setSuccess(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Upload all images to Cloudinary
      const urls = await Promise.all(
        formData.images.map((img) => uploadToCloudinary(img, 'haromobile/glazes'))
      )

      // Build glaze payload
      const glazeData = {
        name: formData.name,
        colorHex: formData.hex,
        code: formData.code,
        image: urls[0] || '', // Only first image for now
      }

      await create(glazeData)

      setSuccess(`Esmalte ${formData.name} creado!`)
      setFormData({ name: '', hex: '#ffffff', code: '', images: [] })
      if (imageInputRef.current) {
        imageInputRef.current.value = ''
      }
    } catch (err) {
      console.error(err)
      setError(err.message || 'Error creating glaze')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full min-h-0 bg-white px-4 font-sans text-gray-800 dark:bg-neutral-900 dark:text-gray-100">
      {/* AppBar already provides top offset via .app-main padding-top */}
      {/* Avoid big extra top padding; add small spacing if needed */}
      <div className="pt-2 pb-4">
        <form onSubmit={handleSubmit} className="mx-auto max-w-md space-y-6">
          <div className="flex items-center gap-4">
            <FormInput
              label={t('glaze.name')}
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="flex items-center gap-4">
            {/* Code optional */}
            <FormInput
              label={t('glaze.code')}
              name="code"
              value={formData.code}
              onChange={handleChange}
            />
            <div className="flex items-center gap-2">
              <input
                type="color"
                name="hex"
                value={formData.hex}
                onChange={handleChange}
                className="h-10 w-10 cursor-pointer rounded border border-gray-300 dark:border-gray-600"
              />
              <span className="w-16 text-sm text-gray-700 dark:text-gray-300">{formData.hex}</span>
            </div>
          </div>

            <ImageUploader
              multiple={false}
              value={formData.images}
              onChange={(imgs) => setFormData({ ...formData, images: imgs })}
              
            />


          {error && <div className="text-sm text-red-500">{error}</div>}
          {success && <div className="text-sm text-green-600">{success}</div>}

          <FormActions
            onSubmit={handleSubmit}
            cancelRedirect={returnTo || originPath || '/products/glazes'}
          />
        </form>
      </div>
    </div>
  )
}
