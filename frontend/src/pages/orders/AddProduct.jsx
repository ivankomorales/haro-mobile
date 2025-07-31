// src/pages/orders/AddProduct.jsx
import { useEffect, useState, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getAllGlazes } from '../../api/glazes'
import FormInput from '../../components/FormInput'
import GlazeSelect from '../../components/GlazeSelect'
import { uploadToCloudinary } from '../../utils/uploadToCloudinary'
import ImageUploader from '../../components/ImageUploader'

export default function AddProduct() {
  const navigate = useNavigate()
  const location = useLocation()
  const baseOrder = location.state || {}

  const [glazes, setGlazes] = useState([])
  const [products, setProducts] = useState([])
  const objectUrls = useRef([]) // for previews cleanup
  const fileInputRef = useRef(null)

  const [errors, setErrors] = useState({})

  const [formData, setFormData] = useState({
    type: '',
    quantity: 1,
    price: '',
    glazeInterior: '',
    glazeExterior: '',
    description: '',
    images: [],
  })

  const isFormValid = () => {
    return formData.type.trim() !== '' && Number(formData.price) > 0
  }

  useEffect(() => {
    // Valida contra la nueva estructura que envías desde NewOrder
    const hasMinimumData =
      baseOrder?.customer?.name &&
      baseOrder?.orderDate &&
      typeof baseOrder?.shipping?.isRequired === 'boolean'

    if (!hasMinimumData) {
      navigate('/orders/new', { replace: true })
    }
  }, [baseOrder, navigate])

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

  // Image Cleanup for component dismount
  useEffect(() => {
    return () => {
      objectUrls.current.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [])

  // Add product
  const handleAddProduct = async () => {
    const newErrors = {}
    const interior = glazes.find((g) => g._id === formData.glazeInterior)
    const exterior = glazes.find((g) => g._id === formData.glazeExterior)

    if (!formData.type.trim()) newErrors.type = 'Tipo requerido'
    if (!formData.price || Number(formData.price) <= 0)
      newErrors.price = 'Precio inválido'

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      const newProduct = {
        ...formData,
        glazes: {
          interior: interior || null,
          exterior: exterior || null,
        },
      }

      setProducts((prev) => [...prev, newProduct])
      setFormData({
        type: '',
        quantity: 1,
        price: '',
        glazeInterior: '',
        glazeExterior: '',
        description: '',
        images: [],
      })
      objectUrls.current = [] // cleanup previews after product is added
      fileInputRef.current.value = null
      setErrors({}) // clean up

      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
      }, 50)
    } catch (err) {
      console.error('Error uploading product:', err)
      setErrors({ ...newErrors, images: 'Error al cargar producto' })
    }
  } // end handleAddProduct

  // Remove product
  const handleRemoveProduct = (i) => {
    // Free memory in previews
    const imgs = products[i]?.images || []

    imgs.forEach((file) => {
      if (file instanceof File) {
        const url = objectUrls.current.find((u) => u.includes(file.name))
        if (url) {
          URL.revokeObjectURL(url)
          objectUrls.current = objectUrls.current.filter((u) => u !== url)
        }
      }
    })

    setProducts((prev) => prev.filter((_, idx) => idx !== i))
  }

  // Confirm and submit all products added
  const handleSubmitAll = async () => {
    try {
      // Upload allimages before navigating to OrderConfirmation
      const updatedProducts = await Promise.all(
        products.map(async (product) => {
          const urls = await Promise.all(
            product.images.map((file) =>
              uploadToCloudinary(file, 'haromobile/products')
            )
          )

          return {
            ...product,
            images: urls,
          }
        })
      )

      const fullOrder = {
        ...baseOrder,
        products: updatedProducts,
      }
      if (products.length === 0) {
        alert('Debes agregar al menos un producto antes de continuar.')
        return
      }
      navigate(`/orders/confirmation`, { state: fullOrder })
    } catch (err) {
      console.error('Error uploading images before submit:', err)
      alert('Hubo un error al subir imágenes. Intenta de nuevo.')
    }
  }

  return (
    <div
      className="
        min-h-screen 
        pb-24
        bg-white dark:bg-neutral-900 
        dark:text-gray-100"
    >
      {/*
      <AppBar
        title="Agregar Producto"
        left={<button onClick={() => navigate(-1)}>←</button>}
        progress={0.66}
      />        
       
       */}

      <div className="max-w-xl mx-auto px-4 py-4 space-y-6">
        <h1 className="text-center mb-8 text-xl font-semibold">
          Agregar Producto
        </h1>
        <div className="space-y-4">
          <label className="block text-sm font-medium mb-2">Tipo:</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full p-2 border rounded dark:bg-neutral-800 dark:border-gray-700 dark:text-white"
            required
          >
            <option value="">Selecciona un tipo</option>
            <option value="Taza">Taza</option>
            <option value="Taza a mano">Taza a mano</option>
            <option value="Plato">Plato</option>
            <option value="Figura">Figura</option>
            {/* TODO obtenerlo de la base de datos*/}
          </select>
          {errors.type && (
            <p className="text-red-500 text-xs mt-1">{errors.type}</p>
          )}

          <div className="flex justify-between items-center">
            <div>
              <label className="text-sm">Figuras:</label>
              <div className="flex items-center gap-4">
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

            <div className="ml-auto">
              <FormInput
                label="Precio"
                name="price"
                type="number"
                min="0"
                value={formData.price}
                onChange={handleChange}
                placeholder="$"
              />
              {errors.price && (
                <p className="text-red-500 text-xs mt-1">{errors.price}</p>
              )}
            </div>
          </div>

          {/* Esmaltes */}
          {formData.type !== 'Figura' && (
            <details className="bg-neutral-100 dark:bg-neutral-800 rounded p-4">
              <summary className="cursor-pointer font-medium text-sm dark:text-white">
                Esmalte
              </summary>
              <div className="mt-4 space-y-2">
                {formData.type !== 'Plato' && (
                  <GlazeSelect
                    label="Interior:"
                    glazes={glazes}
                    selected={formData.glazeInterior}
                    onChange={(value) =>
                      setFormData((prev) => ({ ...prev, glazeInterior: value }))
                    }
                  />
                )}
                <GlazeSelect
                  label="Exterior:"
                  glazes={glazes}
                  selected={formData.glazeExterior}
                  onChange={(value) =>
                    setFormData((prev) => ({ ...prev, glazeExterior: value }))
                  }
                />
              </div>
            </details>
          )}

          {/* Imágenes */}
          <ImageUploader
            multiple={true}
            label="Agregar imagenes"
            value={formData.images}
            onChange={(imgs) => setFormData({ ...formData, images: imgs })}
          />

          <FormInput
            label="Descripción"
            name="description"
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        <button
          type="button"
          onClick={handleAddProduct}
          disabled={!isFormValid()}
          className={`w-full py-2 rounded font-semibold transition-colors duration-200 ${
            isFormValid()
              ? 'bg-black text-white hover:bg-neutral-800'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
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
                  className="p-2 border rounded bg-neutral-100 dark:bg-neutral-800 flex items-center justify-between"
                >
                  <div className="flex-1 truncate">
                    {p.type} — {p.quantity} piezas — ${p.price}
                  </div>
                  <button
                    onClick={() => handleRemoveProduct(i)}
                    className="ml-4 text-red-500 hover:text-red-700"
                  >
                    ✕
                  </button>
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
