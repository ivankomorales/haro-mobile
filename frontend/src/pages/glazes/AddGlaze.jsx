import { useState, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import FormInput from '../../components/FormInput'
import { useCreateGlaze } from '../../hooks/useCreateGlaze'
import { uploadToCloudinary } from '../../utils/uploadToCloudinary'
import ImageUploader from '../../components/ImageUploader'
import { ChevronLeft } from 'lucide-react'
import { getMessage as t } from '../../utils/getMessage'
import FormActions from '../../components/FormActions'
import { getOriginPath } from '../../utils/navigationUtils'

export default function AddGlaze() {
  const navigate = useNavigate()
  const location = useLocation()
  const originPath = getOriginPath(
    location.state?.originPath ?? location.state?.from
  )

  const { create } = useCreateGlaze(navigate)

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
        formData.images.map((img) =>
          uploadToCloudinary(img, 'haromobile/glazes')
        )
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
    <div className="pt-10 px-4 pb-20 min-h-screen bg-white dark:bg-neutral-900 text-gray-800 dark:text-gray-100 font-sans">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 flex items-center text-sm text-blue-600 dark:text-blue-400 hover:underline "
      >
        <ChevronLeft className="h-5 w-5 mr-1" />
        {t('button.back')}
      </button>
      {/* Optional Title */}
      <h1 className="text-center mb-8 text-xl font-semibold">
        {t('glaze.title')}
      </h1>

      <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-6">
        {/* Name + color */}
        <div className="flex items-center gap-4">
          <FormInput
            label={t('glaze.name')}
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <div className="flex items-center gap-2">
            <input
              type="color"
              name="hex"
              value={formData.hex}
              onChange={handleChange}
              className="w-10 h-10 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300 w-16">
              {formData.hex}
            </span>
          </div>
        </div>

        {/* Code optional */}
        <FormInput
          label={t('glaze.code')}
          name="code"
          value={formData.code}
          onChange={handleChange}
        />

        {/* Image */}
        <ImageUploader
          multiple={false}
          value={formData.images}
          onChange={(imgs) => setFormData({ ...formData, images: imgs })}
        />

        {error && <div className="text-red-500 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">{success}</div>}

        <FormActions onSubmit={handleSubmit} cancelRedirect={originPath} />
      </form>
    </div>
  )
}
