// src/pages/orders/AddProduct.jsx
import { useEffect, useState, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { getAllGlazes } from '../../api/glazes'
import FormInput from '../../components/FormInput'
import GlazeSelect from '../../components/GlazeSelect'
import { uploadToCloudinary } from '../../utils/uploadToCloudinary'
import ImageUploader from '../../components/ImageUploader'
import FormActions from '../../components/FormActions'
import { getMessage as t } from '../../utils/getMessage'
import { showError } from '../../utils/toastUtils'
import { useRequireState } from '../../utils/useRequireState'

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

  // Redirige a /orders/new si no vienen los datos mínimos
  useRequireState(
    (st) =>
      st?.customer?.name &&
      st?.orderDate &&
      typeof st?.shipping?.isRequired === 'boolean',
    '/orders/new',
    () => ({ originPath: location.state?.originPath ?? '/orders' })
  )

  // Cargar esmaltes
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

  // Cleanup de previews al desmontar
  useEffect(() => {
    return () => {
      objectUrls.current.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [])

  // Agregar producto a la lista local (todavía no subimos imágenes)
  const handleAddProduct = async () => {
    const newErrors = {}
    const interior = glazes.find((g) => g._id === formData.glazeInterior)
    const exterior = glazes.find((g) => g._id === formData.glazeExterior)

    if (!formData.type.trim()) newErrors.type = t('errors.product.typeRequired')
    if (!formData.price || Number(formData.price) <= 0)
      newErrors.price = t('errors.product.priceInvalid')

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

      // Reset formulario del producto
      setFormData({
        type: '',
        quantity: 1,
        price: '',
        glazeInterior: '',
        glazeExterior: '',
        description: '',
        images: [],
      })

      // Limpia previews
      objectUrls.current = []
      fileInputRef.current && (fileInputRef.current.value = null)
      setErrors({})

      // Scroll para ver la lista actualizada
      setTimeout(() => {
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
      }, 50)
    } catch (err) {
      console.error('Error adding product:', err)
      setErrors({ ...newErrors, images: t('errors.image.uploadFailed') })
    }
  } // end handleAddProduct

  // Eliminar producto de la lista local
  const handleRemoveProduct = (i) => {
    const imgs = products[i]?.images || []

    // Liberar memory de previews (Object URLs) si fueran File
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

  // Confirmar y navegar a OrderConfirmation (subiendo imágenes antes)
  const handleSubmitAll = async () => {
    try {
      if (products.length === 0) {
        // Usa t(...) para mostrar el texto final en el toast
        showError(t('errors.order.missingProduct'))
        return
      }

      // Sube imágenes de cada producto y reemplaza File[] por urls[]
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

      navigate('/orders/confirmation', {
        state: {
          ...fullOrder,
          // Propaga el origen para que la confirmation/cierre sepan a dónde volver
          originPath: baseOrder.originPath ?? '/orders',
        },
      })
    } catch (err) {
      console.error('Error uploading images before submit:', err)
      showError(t('errors.image.uploadFailed'))
    }
  }

  return (
    <div className="min-h-screen pb-24 bg-white dark:bg-neutral-900 dark:text-gray-100">
      <div className="max-w-xl mx-auto px-4 py-4 space-y-6">
        <h1 className="text-center mb-8 text-xl font-semibold">
          {t('forms.product.title')}
        </h1>

        <div className="space-y-4">
          <label className="block text-sm font-medium mb-2">
            {t('labels.product.type')}:
          </label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full p-2 border rounded dark:bg-neutral-800 dark:border-gray-700 dark:text-white"
            required
          >
            <option value="">{t('forms.product.placeholders.type')}</option>
            <option value="Taza">Taza</option>
            <option value="Taza a mano">Taza a mano</option>
            <option value="Plato">Plato</option>
            <option value="Figura">Figura</option>
            {/* TODO: obtener tipos desde DB */}
          </select>
          {errors.type && (
            <p className="text-red-500 text-xs mt-1">{errors.type}</p>
          )}

          <div className="flex justify-between items-center">
            <div>
              <label className="text-sm">{t('labels.product.quantity')}:</label>
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
                label={t('labels.product.price')}
                floating={false}
                prefix={t('forms.product.placeholders.price')}
                name="price"
                type="number"
                min="0"
                value={formData.price}
                onChange={handleChange}
                placeholder="0.00"
                error={errors.price}
              />
            </div>
          </div>

          {/* Esmaltes */}
          {formData.type !== 'Figura' && (
            <details className="bg-neutral-100 dark:bg-neutral-800 rounded p-4">
              <summary className="cursor-pointer font-medium text-sm dark:text-white">
                {t('labels.glaze.title')}
              </summary>
              <div className="mt-4 space-y-2">
                {formData.type !== 'Plato' && (
                  <GlazeSelect
                    label={t('labels.glaze.interior')}
                    glazes={glazes}
                    selected={formData.glazeInterior}
                    onChange={(value) =>
                      setFormData((prev) => ({ ...prev, glazeInterior: value }))
                    }
                    placeholderText={t('forms.glaze.search')}
                    noneText={t('labels.glaze.none')}
                    noResultsText={t('labels.glaze.noResults')}
                    ariaLabelText={t('labels.glaze.title')}
                  />
                )}
                <GlazeSelect
                  label={t('labels.glaze.exterior')}
                  glazes={glazes}
                  selected={formData.glazeExterior}
                  onChange={(value) =>
                    setFormData((prev) => ({ ...prev, glazeExterior: value }))
                  }
                  placeholderText={t('forms.glaze.search')}
                  noneText={t('labels.glaze.none')}
                  noResultsText={t('labels.glaze.noResults')}
                  ariaLabelText={t('labels.glaze.title')}
                />
              </div>
            </details>
          )}

          {/* Imágenes */}
          <ImageUploader
            multiple={true}
            label={t('labels.product.images')}
            value={formData.images}
            onChange={(imgs) => setFormData({ ...formData, images: imgs })}
            inputRef={fileInputRef}
          />

          <FormInput
            label={t('labels.product.description')}
            name="description"
            value={formData.description}
            onChange={handleChange}
            maxLength={200}
          />
          <p className="-mt-2 text-right text-xs text-gray-400">
          {formData.description.length}/200
        </p>
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
          + {t('forms.product.buttons.add')}
        </button>

        {products.length > 0 && (
          <>
            <h2 className="text-sm font-semibold mt-6 mb-2 text-gray-600 dark:text-gray-200">
              {t('forms.product.sections.addedProducts')}
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

        {/* Footer */}
        <FormActions
          onSubmit={handleSubmitAll}
          // Texto botón derecho (siguiente/persistir)
          submitButtonText={t('formActions.submitDefault')}
          // Texto botón izquierdo (cancelar)
          cancelButtonText={t('formActions.cancel')}
          // Confirm modal al cancelar
          confirmTitle={t('formActions.confirmTitle')}
          confirmMessage={t('formActions.confirmMessage')}
          confirmText={t('formActions.confirmText')}
          cancelText={t('formActions.cancelText')}
          // ← Ir a NewOrder con el borrador (draft) para prefill
          cancelRedirect="/orders/new"
          cancelState={baseOrder}
        />
      </div>
    </div>
  )
}
