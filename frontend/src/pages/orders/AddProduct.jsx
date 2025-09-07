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
import { showLoading, dismissToast, showError, showSuccess } from '../../utils/toastUtils'
import { useRequireState } from '../../utils/useRequireState'
import { getOriginPath } from '../../utils/navigationUtils'

export default function AddProduct() {
  const navigate = useNavigate()
  const location = useLocation()
  const originPath = getOriginPath(location.state?.originPath ?? location.state?.from)

  const baseOrder = location.state || {}
  const editIndex = location.state?.editIndex
  const isEdit = typeof editIndex === 'number'

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

  // Redirect to NewOrder if no minimal data found
  useRequireState(
    (st) => st?.customer?.name && st?.orderDate && typeof st?.shipping?.isRequired === 'boolean',
    '/orders/new',
    () => ({ originPath: location.state?.originPath ?? '/orders' })
  )

  // Fetch Glazes
  useEffect(() => {
    async function fetchGlazes() {
      try {
        const response = await getAllGlazes({ navigate }) //TODO
        setGlazes(response)
      } catch (error) {
        console.error('Failed to fetch glazes', error)
      }
    }
    fetchGlazes()
  }, [])

  // Preload product if on EditMode
  useEffect(() => {
    if (isEdit && baseOrder.products && baseOrder.products[editIndex]) {
      const product = baseOrder.products[editIndex]
      // helpers (top-level or inline)
      const toId = (v) => (typeof v === 'object' && v?._id ? v._id : v || '')
      setFormData({
        type: product.type,
        quantity: product.quantity,
        price: product.price,
        glazeInterior: toId(product.glazes?.interior), // ✅ works with id or object
        glazeExterior: toId(product.glazes?.exterior), // ✅
        description: product.description || '',
        images: product.images || [], // URLs en modo edición
      })
    }
  }, [isEdit, editIndex, baseOrder.products])

  const handleChange = (e) => {
    const { name, value } = e.target

    setFormData((prev) => {
      const updated = { ...prev, [name]: value }

      if (name === 'type') {
        // Clean invalid glaze fields
        if (value === 'figurine') {
          updated.glazeInterior = ''
          updated.glazeExterior = ''
        } else if (value === 'plate') {
          updated.glazeInterior = ''
        } else if (value === 'cup' || value === 'handmadeCup') {
          // keep both
        }
      }

      return updated
    })
    setErrors((prev) => ({ ...prev, [name]: null }))
  }

  // Cleanup de previews al desmontar
  useEffect(() => {
    return () => {
      objectUrls.current.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [])

  // Add product to local list (no images yet)
  const handleAddProduct = async () => {
    const newErrors = {}
    const interior = glazes.find((g) => g._id === formData.glazeInterior)
    const exterior = glazes.find((g) => g._id === formData.glazeExterior)

    if (!formData.type.trim()) newErrors.type = t('errors.product.typeRequired')
    if (!formData.quantity || formData.quantity <= 0) {
      newErrors.quantity = 'errors.invalid_quantity'
    }
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
          interior: interior?._id || null,
          exterior: exterior?._id || null,
          interiorName: interior?.name || '',
          interiorHex: interior?.hex || '',
          exteriorName: exterior?.name || '',
          exteriorHex: exterior?.hex || '',
          // optional:
          // interiorImage: interior?.image || '',
          // exteriorImage: exterior?.image || '',
        },
      }
      console.log('A) handleAddProduct -> newProduct.glazes:', newProduct.glazes)
      setProducts((prev) => [...prev, newProduct])
      showSuccess('success.product.added')

      // Reset form
      setFormData({
        type: '',
        quantity: 1,
        price: '',
        glazeInterior: '',
        glazeExterior: '',
        description: '',
        images: [],
      })

      // Clean previews
      objectUrls.current = []
      fileInputRef.current && (fileInputRef.current.value = null)
      setErrors({})
    } catch (err) {
      console.error('Error adding product:', err)
      setErrors({ ...newErrors, images: t('errors.image.uploadFailed') })
    }
  } // end handleAddProduct

  // Delete product from local list
  const handleRemoveProduct = (i) => {
    const imgs = products[i]?.images || []

    // Free memory previews (Object URLs)
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

  // Confirm $ navigate to OrderConfirmation (uploading images first)
  // Confirm $ navigate to OrderConfirmation (uploading images first)
  const handleSubmitAll = async () => {
    const shouldUploadImages = isEdit
      ? formData.images && formData.images.length > 0
      : products.some((p) => p.images && p.images.length > 0)

    const toastId = shouldUploadImages ? showLoading('loading.image') : null

    try {
      let finalProducts

      if (isEdit) {
        // Upload only new Files; keep existing URLs/objects
        const uploads = await Promise.all(
          (formData.images || []).map((item) =>
            item instanceof File ? uploadToCloudinary(item, 'haromobile/products') : item
          )
        )

        const editedUiProduct = {
          ...formData,
          images: uploads,
        }

        const editedPayload = toProductPayload(editedUiProduct, glazes)

        // ✅ Reemplazar SOLO el producto editado, no tocar los demás
        finalProducts = (baseOrder.products || []).map((p, i) =>
          i === editIndex ? editedPayload : p
        )
      } else {
        if (products.length === 0) {
          showError(t('errors.order.missingProduct'))
          return
        }

        const updatedProducts = await Promise.all(
          products.map(async (product) => {
            const uploads = await Promise.all(
              (product.images || []).map((item) =>
                item instanceof File ? uploadToCloudinary(item, 'haromobile/products') : item
              )
            )
            return { ...product, images: uploads }
          })
        )

        finalProducts = updatedProducts.map((p) => toProductPayload(p, glazes))
      }

      if (toastId) dismissToast(toastId)
      if (shouldUploadImages) showSuccess('success.image.uploaded')

      const fullOrder = {
        ...baseOrder,
        products: finalProducts,
      }

      navigate('/orders/confirmation', {
        state: {
          ...fullOrder,
          originPath: baseOrder.originPath ?? '/orders',
        },
      })
    } catch (err) {
      console.error('Error uploading images before submit:', err)
      if (toastId) dismissToast(toastId)
      showError(t('errors.image.uploadFailed'))
    }
  }

  // en handleSubmitAll

  // Normalize anything (File, URL string, Cloudinary response, existing image object) into ImageSchema-like object
  function normalizeImage(img) {
    if (!img) return null

    // Already normalized object with url
    if (img && typeof img === 'object' && img.url) {
      return {
        url: img.url,
        publicId: img.publicId || img.public_id,
        width: img.width,
        height: img.height,
        format: img.format,
        bytes: img.bytes,
        alt: img.alt || '',
        primary: !!img.primary,
      }
    }

    // Cloudinary upload response
    if (img && typeof img === 'object' && (img.secure_url || img.public_id)) {
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
    }

    // Legacy string URL
    if (typeof img === 'string') {
      return { url: img, alt: '', primary: false }
    }

    // Fallback (e.g., File preview) — we avoid persisting blob://
    return null
  }

  // Given selected glaze _id, return { id, name, hex } or null
  function getGlazeTriplet(glazeId, allGlazes) {
    if (!glazeId) return null
    const g = (allGlazes || []).find((x) => x._id === glazeId)
    return g ? { id: g._id, name: g.name, hex: g.hex } : null
  }

  // Build final product payload that matches the new schema
  function toProductPayload(p, allGlazes) {
    const gi = getGlazeTriplet(p.glazeInterior, allGlazes)
    const ge = getGlazeTriplet(p.glazeExterior, allGlazes)

    return {
      type: p.type,
      quantity: Number(p.quantity),
      price: Number(p.price), // whole pesos (integers)
      description: (p.description || '').trim(),
      glazes: {
        interior: gi ? gi.id : null,
        exterior: ge ? ge.id : null,
        interiorName: gi ? gi.name : null,
        interiorHex: gi ? gi.hex : null, // keep "#RRGGBB"
        exteriorName: ge ? ge.name : null,
        exteriorHex: ge ? ge.hex : null,
      },
      decorations: {
        hasGold: !!(p.decorations && p.decorations.hasGold),
        hasName: !!(p.decorations && p.decorations.hasName),
        outerDrawing: !!(p.decorations && p.decorations.outerDrawing),
        customText: (p.decorations && p.decorations.customText
          ? p.decorations.customText
          : ''
        ).trim(),
      },
      images: (p.images || []).map(normalizeImage).filter(Boolean),
      // Preserve _id only in edit mode (if present)
      ...(p._id ? { _id: p._id } : {}),
    }
  }

  return (
    <div className="min-h-screen bg-white pb-24 dark:bg-neutral-900 dark:text-gray-100">
      <div className="mx-auto max-w-xl space-y-6 px-4 py-4">
        <h1 className="mb-8 text-center text-xl font-semibold">
          {isEdit ? t('product.edit') : t('product.title')}
        </h1>

        <div className="space-y-4">
          <FormInput
            as="select"
            name="type"
            label={t('product.type')}
            value={formData.type}
            onChange={handleChange}
            error={errors.type}
            errorFormatter={t}
            required
          >
            <option value="">{t('product.select')}</option>
            <option value="cup">{t('product.cup')}</option>
            <option value="handmadeCup">{t('product.handmadeCup')}</option>
            <option value="plate">{t('product.plate')}</option>
            <option value="figurine">{t('product.figurine')}</option>
          </FormInput>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm">{t('product.qty')}:</label>
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({
                      ...prev,
                      quantity: Math.max(1, prev.quantity - 1),
                    }))
                  }
                  className="rounded bg-gray-300 px-2 py-1 dark:bg-gray-600"
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
                  className="rounded bg-gray-300 px-2 py-1 dark:bg-gray-600"
                >
                  +
                </button>
              </div>
            </div>

            <div className="ml-auto">
              <FormInput
                label={t('product.price')}
                floating={false}
                prefix={t('product.pricePrefix')}
                name="price"
                type="number"
                min="0"
                step="1"
                value={formData.price}
                onChange={handleChange}
                placeholder="0"
                error={errors.price}
              />
            </div>
          </div>

          {/* Esmaltes */}
          {formData.type !== 'figurine' && (
            <details className="rounded bg-neutral-100 p-4 dark:bg-neutral-800">
              <summary className="cursor-pointer text-sm font-medium dark:text-white">
                {t('product.glazeTitle')}
              </summary>
              <div className="mt-4 space-y-2">
                {formData.type !== 'plate' && (
                  <GlazeSelect
                    label={t('product.glazeInt')}
                    glazes={glazes}
                    selected={formData.glazeInterior}
                    onChange={(value) => setFormData((prev) => ({ ...prev, glazeInterior: value }))}
                    placeholderText={t('product.glazeSearch')} //Consider using a general i18n word
                    noneText={t('product.glazeNone')}
                    noResultsText={t('product.glazeNoResult')}
                    ariaLabelText={t('product.glazeTitle')} //Consider using a general i18n word
                  />
                )}
                <GlazeSelect
                  label={t('product.glazeExt')}
                  glazes={glazes}
                  selected={formData.glazeExterior}
                  onChange={(value) => setFormData((prev) => ({ ...prev, glazeExterior: value }))}
                  placeholderText={t('product.glazeSearch')}
                  noneText={t('product.glazeNone')}
                  noResultsText={t('labels.glaze.noResults')}
                  ariaLabelText={t('product.glazeTitle')}
                />
              </div>
            </details>
          )}

          {/* Imágenes */}
          <ImageUploader
            multiple={true}
            label={t('product.images')}
            value={formData.images}
            onChange={(imgs) => setFormData({ ...formData, images: imgs })}
            inputRef={fileInputRef}
          />

          <FormInput
            label={t('product.description')}
            name="description"
            value={formData.description}
            onChange={handleChange}
            maxLength={200}
          />
          <p className="-mt-2 text-right text-xs text-gray-400">
            {formData.description.length}/200
          </p>
        </div>

        {!isEdit && (
          <button
            type="button"
            onClick={handleAddProduct}
            //disabled={!isFormValid()}
            className={`w-full rounded py-2 font-semibold transition-colors duration-200 ${
              isFormValid()
                ? 'bg-black text-white hover:bg-neutral-800'
                : 'cursor-not-allowed bg-gray-300 text-gray-500'
            }`}
          >
            + {t('product.addButton')}
          </button>
        )}

        {products.length > 0 && (
          <>
            <h2 className="mt-6 mb-2 text-sm font-semibold text-gray-600 dark:text-gray-200">
              {t('product.added')}
            </h2>
            <ul className="space-y-2 text-sm text-gray-800 dark:text-white">
              {products.map((p, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between rounded border bg-neutral-100 p-2 dark:bg-neutral-800"
                >
                  <div className="flex-1 truncate">
                    <div className="flex-1 truncate">
                      {t(`product.${p.type}`)} — {p.quantity} {t('product.figure')}
                      {p.quantity > 1 ? 's' : ''} — ${p.price}
                    </div>
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
          submitButtonText={isEdit ? t('button.save') : t('button.confirm')}
          // Texto botón izquierdo (cancelar)
          cancelButtonText={t('formActions.cancel')}
          // Confirm modal al cancelar
          confirmTitle={
            isEdit ? t('formActionsEdit.confirmTitle') : t('formActionsCreate.confirmTitle')
          }
          confirmMessage={
            isEdit ? t('formActionsEdit.confirmMessage') : t('formActionsCreate.confirmMessage')
          }
          confirmText={t('formActions.confirmText')}
          cancelText={t('formActions.cancelText')}
          cancelRedirect={isEdit ? '/orders/confirmation' : originPath}
          cancelState={baseOrder}
        />
      </div>
    </div>
  )
}
