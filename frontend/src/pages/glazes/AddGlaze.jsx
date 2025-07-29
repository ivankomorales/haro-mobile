import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeftIcon } from '@heroicons/react/24/outline'
import FloatingInput from '../../components/FloatingInput'
import { useCreateGlaze } from '../../hooks/useCreateGlaze'

export default function AddGlaze() {
  const navigate = useNavigate()
  const { create } = useCreateGlaze(navigate)

  const [formData, setFormData] = useState({
    name: '',
    hex: '',
    image: [],
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
      await create(formData) // We need create from Hook or api

      setSuccess('Glaze created successfully!')
      setFormData({
        name: '',
        hex: '',
        image: '',
      })
    } catch (err) {
      setError(err.message)
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

      <h1 className="text-xl font-semibold mb-6 text-center">
        Crear nuevo esmalte
      </h1>

      <form onSubmit={handleSubmit} className="max-w-md mx-auto space-y-6">
        <FloatingInput
          label="Nombre"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
        /*Aqui un input que permita elegir un color (?) */
        {/* Imagen */}
        <div>
          <label className="block mb-1 text-sm font-medium">
            Agregar imagen
          </label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleAddImage}
            className="w-full h-30 border border-dashed p-2 rounded dark:bg-neutral-800 dark:border-gray-700"
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.images.map((img, idx) => (
              <div key={idx} className="w-16 h-16 rounded overflow-hidden">
                <img
                  src={URL.createObjectURL(img)}
                  alt={`preview-${idx}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
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
