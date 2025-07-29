// src/pages/orders/AddProduct.jsx
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import AppBar from '../../components/AppBar'
import { getAllGlazes } from '../../api/glazes'
import FloatingInput from '../../components/FloatingInput'

export default function AddProduct() {
  const navigate = useNavigate()
  const location = useLocation()
  const baseOrder = location.state || {}

  const [glazes, setGlazes] = useState([])
  const [products, setProducts] = useState([])

  const [formData, setFormData] = useState({
    type: '',
    quantity: 1,
    price: '',
    glazeInterior: '',
    glazeExterior: '',
    description: '',
    images: [],
  })

  useEffect(() => {
    if (!baseOrder.name) {
      navigate('/orders/new') // fallback si entras directo
    }
  }, [])

  useEffect(() => {
    async function fetchGlazes() {
      try {
        const response = await getAllGlazes()
        setGlazes(response)
      } catch (error) {
        console.error('Failed to fetch glazes', error)
      }
    }

    fetchGlazes()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddImage = (e) => {
    const files = Array.from(e.target.files)
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, ...files],
    }))
  }

  const handleAddProduct = () => {
    setProducts((prev) => [...prev, formData])
    setFormData({
      type: '',
      quantity: 1,
      price: '',
      glazeInterior: '',
      glazeExterior: '',
      description: '',
      images: [],
    })

    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
    }, 50)
  }

  const handleSubmitAll = () => {
    const fullOrder = {
      ...baseOrder,
      products,
    }

    navigate(`/orders/confirmation`, { state: fullOrder })
  }

  return (
    <div
      className="
        min-h-screen 
        pb-24
        bg-white dark:bg-neutral-900 
        dark:text-gray-100"
    >
      <AppBar
        title="Agregar Producto"
        left={<button onClick={() => navigate(-1)}>←</button>}
        progress={0.66}
      />

      <div className="max-w-xl mx-auto px-4 py-4 space-y-6">
        <div className="space-y-4">
          <label className="block text-sm font-medium">Tipo:</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full p-2 border rounded dark:bg-neutral-800 dark:border-gray-700 dark:text-white"
            required
          >
            <option value="">Selecciona un tipo</option>
            <option value="Taza a mano">Taza a mano</option>
            <option value="Plato">Plato</option>
            <option value="Figura">Figura</option>
            {/* TODO obtenerlo de la base de datos*/}
          </select>

          <div className="flex items-center gap-4">
            <div>
              <label className="text-sm">Figuras:</label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      quantity: Math.max(1, prev.quantity - 1),
                    }))
                  }
                  className="px-2 py-1 bg-gray-300 dark:bg-gray-600 rounded"
                >
                  −
                </button>
                <span>{formData.quantity}</span>
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      quantity: prev.quantity + 1,
                    }))
                  }
                  className="px-2 py-1 bg-gray-300 dark:bg-gray-600 rounded"
                >
                  +
                </button>
              </div>
            </div>

            <div className="flex-1">
              <FloatingInput
                label="Precio"
                name="price"
                type="number"
                min="0"
                value={formData.price}
                onChange={handleChange}
                placeholder="$"
              />
            </div>
          </div>

          {/* Esmaltes */}
          <details className="bg-neutral-100 dark:bg-neutral-800 rounded p-4">
            <summary className="cursor-pointer font-medium text-sm dark:text-white">
              Esmalte
            </summary>
            <div className="mt-4 space-y-2">
              <div>
                <label className="text-sm">Interior:</label>
                <select
                  name="glazeInterior"
                  value={formData.glazeInterior}
                  onChange={handleChange}
                  className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-gray-700 dark:text-white"
                >
                  <option value="">Sin esmalte</option>
                  {glazes.map((g) => (
                    <option key={g._id} value={g._id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-sm">Exterior:</label>
                <select
                  name="glazeExterior"
                  value={formData.glazeExterior}
                  onChange={handleChange}
                  className="w-full p-2 border rounded dark:bg-neutral-900 dark:border-gray-700 dark:text-white"
                >
                  <option value="">Sin esmalte</option>
                  {glazes.map((g) => (
                    <option key={g._id} value={g._id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </details>

          {/* Imágenes */}
          <div>
            <label className="block mb-1 text-sm font-medium">
              Agregar imágenes
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

          <FloatingInput
            label="Descripción"
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        <button
          type="button"
          onClick={handleAddProduct}
          className="w-full py-2 bg-black text-white rounded hover:bg-neutral-800"
        >
          + Agregar
        </button>

        {products.length > 0 && (
          <>
            <h2 className="text-sm font-semibold mt-6 mb-2 text-gray-600 dark:text-gray-200">
              Productos agregados:
            </h2>
            <ul className="space-y-2 text-sm text-gray-800 dark:text-white">
              {products.map((p, i) => (
                <li
                  key={i}
                  className="p-2 border rounded bg-neutral-100 dark:bg-neutral-800"
                >
                  {p.type} — {p.quantity} piezas — ${p.price}
                </li>
              ))}
            </ul>
          </>
        )}

        {/* Mobile button (only check icon) */}
        <div className="fixed bottom-5 inset-x-0 flex justify-center md:hidden">
          <button
            type="button"
            onClick={handleSubmitAll}
            className="bg-green-600 text-white p-4 rounded-full shadow-lg hover:bg-green-700"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </button>
        </div>

        {/* Desktop button (text + icon) */}
        <div className="hidden md:flex justify-center mt-8">
          <button
            type="button"
            onClick={handleSubmitAll}
            className="bg-green-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-700 flex items-center gap-2"
          >
            Confirmar
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
