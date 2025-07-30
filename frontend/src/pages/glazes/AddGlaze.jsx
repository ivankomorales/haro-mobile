import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeftIcon } from '@heroicons/react/24/outline'
import FloatingInput from '../../components/FloatingInput'
import { useCreateGlaze } from '../../hooks/useCreateGlaze'
import { uploadToCloudinary } from '../../utils/uploadToCloudinary'
import ImageUploader from '../../components/ImageUploader'

export default function AddGlaze() {
  const navigate = useNavigate()
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

  const handleAddImage = (e) => {
    const files = Array.from(e.target.files)
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...files],
    }))
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
        <ChevronLeftIcon className="h-5 w-5 mr-1" />
        Volver
      </button>
      <h1 className="text-center mb-8 text-xl font-semibold">Nuevo Esmalte</h1>

      <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-6">
        {/* Nombre + color */}
        <div className="flex items-center gap-4">
          <FloatingInput
            label="Nombre"
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

        {/* Código opcional */}
        <FloatingInput
          label="Código (opcional)"
          name="code"
          value={formData.code}
          onChange={handleChange}
        />

        {/* Imagen */}
        <ImageUploader
          multiple={false}
          value={formData.images}
          onChange={(imgs) => setFormData({ ...formData, images: imgs})}
        />

        {error && <div className="text-red-500 text-sm">{error}</div>}
        {success && <div className="text-green-600 text-sm">{success}</div>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Creando...' : 'Crear esmalte'}
        </button>
      </form>
    </div>
  )
}
