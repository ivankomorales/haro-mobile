// src/pages/orders/AddProduct.jsx
import { Paintbrush, Sparkles, Type as TypeIcon, Dog } from 'lucide-react' // icons for headers/cards
import { useEffect, useState, useRef, useMemo } from 'react'
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom'

import { getAllGlazes } from '../../api/glazes'
import {
  createOrderDraft,
  getOrderDraft,
  updateOrderDraft,
  deleteOrderDraft,
} from '../../api/orderDrafts'
import { createOrder } from '../../api/orders'
import AddedProductsCart from '../../components/AddedProductsCart'
import FormActions from '../../components/FormActions'
import FormInput from '../../components/FormInput'
import { useRequireState } from '../../utils/useRequireState'
import { getOriginPath } from '../../utils/navigationUtils'
import GlazeTypeahead from '../../components/GlazeTypeahead'
import ImageUploader from '../../components/ImageUploader'
import { toProductPayload } from '../../utils/orderPayload'
import { getApiMessage } from '../../utils/errorUtils' // o donde lo tengas
import { getMessage as t } from '../../utils/getMessage'
import { makeGlazeMap, ensureGlazeObjects } from '../../utils/glazeUtils'
import { normalizeBaseOrder } from '../../utils/mappers/baseOrder'
import { normalizeProductForm } from '../../utils/mappers/product'
import { buildOrderPayload } from '../../utils/orderPayload'
import { showLoading, dismissToast, showError, showSuccess } from '../../utils/toastUtils'
import { uploadToCloudinary } from '../../utils/uploadToCloudinary'

export default function AddProduct() {
  const navigate = useNavigate()
  const location = useLocation()
  const originPath = getOriginPath(location.state?.originPath ?? location.state?.from)
  // --- DRAFT HOOKS & STATE ---
  const [searchParams, setSearchParams] = useSearchParams()

  const draftIdFromUrl = searchParams.get('draft')
  const [draftId, setDraftId] = useState(draftIdFromUrl || null)
  // while we're loading an existing draft from the URL, keep a small "bootstrapping" flag
  const [bootstrapping, setBootstrapping] = useState(!!draftIdFromUrl)

  const baseOrder = location.state || {}
  const [baseDraft, setBaseDraft] = useState({
    customer: baseOrder?.customer || {},
    orderDate: baseOrder?.orderDate || '',
    deliverDate: baseOrder?.deliverDate || '',
    status: baseOrder?.status || 'new',
    deposit: baseOrder?.deposit ?? '',
    notes: baseOrder?.notes || '',
    shipping: baseOrder?.shipping || { isRequired: false, addresses: [] },
  })

  const [glazes, setGlazes] = useState([])
  const [products, setProducts] = useState(baseOrder.products || [])
  const [editingIndex, setEditingIndex] = useState(
    typeof baseOrder.editIndex === 'number' ? baseOrder.editIndex : null
  )

  const objectUrls = useRef([]) // for previews cleanup
  const fileInputRef = useRef(null)
  const [errors, setErrors] = useState({})

  const glazeMap = useMemo(() => makeGlazeMap(glazes), [glazes])

  const [formData, setFormData] = useState({
    type: '',
    quantity: 1,
    figures: 1,
    price: '',
    discount: '',
    glazeInterior: '',
    glazeExterior: '',
    description: '',
    images: [],
    // decorations kept in state; description is hidden in UI but preserved
    decorations: {
      hasGold: false,
      hasName: false,
      decorationDescription: '',
    },
  })

  const isEditing = editingIndex !== null
  const [submitting, setSubmitting] = useState(false)

  const isFormValid = () => {
    const priceOk = Number(formData.price) > 0
    const figuresOk = Number(formData.figures) >= 1
    const qtyOk = Number(formData.quantity) >= 1
    const discNum = Number(formData.discount || 0)
    const discountOk = discNum >= 0 && discNum <= Number(formData.price || 0)
    return formData.type.trim() !== '' && priceOk && figuresOk && qtyOk && discountOk
  }

  // Let people in if there’s either base data or a draft
  useRequireState(
    (st) => {
      const hasBase =
        st?.customer?.name && st?.orderDate && typeof st?.shipping?.isRequired === 'boolean'
      const hasDraft = !!searchParams.get('draft')
      return hasBase || hasDraft
    },
    '/orders/new',
    () => ({ originPath: location.state?.originPath ?? '/orders' })
  )

  // 1) If we don't have a draftId, create one immediately (use baseOrder as initial data)
  useEffect(() => {
    let ignore = false
    ;(async () => {
      if (draftId) return
      try {
        const label = `${baseOrder?.customer?.name || 'Order'} ${baseOrder?.orderDate || ''}`.trim()
        const initialData = {
          baseOrder: {
            customer: baseOrder?.customer || {},
            orderDate: baseOrder?.orderDate || '',
            deliverDate: baseOrder?.deliverDate || '',
            status: baseOrder?.status || 'new',
            deposit: baseOrder?.deposit ?? '',
            notes: baseOrder?.notes || '',
            shipping: baseOrder?.shipping || { isRequired: false, addresses: [] },
          },
          products: baseOrder?.products || [],
          productForm: null,
        }
        const { _id } = await createOrderDraft({ label, data: initialData })
        if (ignore) return
        setDraftId(_id)
        // put ?draft in the URL so refresh keeps the draft
        const sp = new URLSearchParams(searchParams)
        sp.set('draft', _id)
        setSearchParams(sp, { replace: true })
      } catch (e) {
        console.error('createOrderDraft failed', e)
        // non-fatal: user can still proceed, but autosave won’t work
      }
    })()
    return () => {
      ignore = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 2) If we arrived with ?draft=..., fetch it and hydrate UI
  useEffect(() => {
    let ignore = false
    ;(async () => {
      if (!draftIdFromUrl) return
      try {
        const { data } = await getOrderDraft(draftIdFromUrl)
        if (ignore || !data) return
        // hydrate lists & form
        if (Array.isArray(data.products)) setProducts(data.products)
        if (data.productForm) setFormData((prev) => ({ ...prev, ...data.productForm }))
        if (data.baseOrder) setBaseDraft(data.baseOrder)
        // (Optional) also hydrate baseOrder into local variables if you need it
      } catch (e) {
        console.error('getOrderDraft failed', e)
      } finally {
        if (!ignore) setBootstrapping(false)
      }
    })()
    return () => {
      ignore = true
    }
    // only run when the url-provided id changes
  }, [draftIdFromUrl, setProducts, setFormData])

  // 3) Debounced autosave whenever products/form change (and we have a draftId)
  useEffect(() => {
    if (!draftId || bootstrapping) return
    const t = setTimeout(() => {
      const payload = {
        baseOrder: baseDraft,
        products,
        productForm: formData,
      }
      updateOrderDraft(draftId, { data: payload }).catch((e) => console.warn('autosave failed', e))
    }, 600)
    return () => clearTimeout(t)
  }, [draftId, products, formData, baseDraft, bootstrapping])

  // Fetch Glazes
  useEffect(() => {
    async function fetchGlazes() {
      try {
        const response = await getAllGlazes({ navigate })
        setGlazes(response)
      } catch (error) {
        console.error('Failed to fetch glazes', error)
      }
    }
    fetchGlazes()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Seed form if editing
  useEffect(() => {
    if (isEditing && products[editingIndex]) {
      const p = products[editingIndex]
      const toId = (v) => (typeof v === 'object' && v?._id ? v._id : v || '')
      setFormData({
        type: p.type || '',
        quantity: Number(p.quantity || 1),
        figures: Number(p.figures || 1),
        price: String(Number(p.price || 0) || ''),
        discount: p.discount === 0 || p.discount === '0' ? '0' : String(p.discount ?? ''),
        glazeInterior: toId(p.glazes?.interior),
        glazeExterior: toId(p.glazes?.exterior),
        description: p.description || '',
        images: p.images || [],
        decorations: {
          hasGold: Boolean(p.decorations?.hasGold),
          hasName: Boolean(p.decorations?.hasName),
          decorationDescription: p.decorations?.decorationDescription || '',
        },
      })
    }
  }, [isEditing, editingIndex, products])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => {
      let updated = { ...prev, [name]: value }

      // Business rules that depend on fields:
      if (name === 'type') {
        if (value === 'figurine') {
          updated.glazeInterior = ''
          updated.glazeExterior = ''
        } else if (value === 'plate') {
          updated.glazeInterior = ''
        }
      }

      if (name === 'price') {
        const priceNum = Number(value || 0)
        const discNum = Number(updated.discount || 0)
        if (discNum > priceNum) {
          updated.discount = String(priceNum) // clamp
        }
      }

      return updated
    })

    setErrors((prev) => ({ ...prev, [name]: null }))
  }

  // Toggle helpers for decorations
  const toggleDecoration = (key) =>
    setFormData((prev) => ({
      ...prev,
      decorations: { ...prev.decorations, [key]: !prev.decorations[key] },
    }))

  // Cleanup previews on unmount
  useEffect(() => {
    return () => {
      objectUrls.current.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [])

  const resetForm = () =>
    setFormData({
      type: '',
      quantity: 1,
      figures: 1,
      price: '',
      discount: '',
      glazeInterior: '',
      glazeExterior: '',
      description: '',
      images: [],
      decorations: { hasGold: false, hasName: false, decorationDescription: '' },
    })

  const addOrSaveProduct = () => {
    const newErrors = {}

    if (!formData.type.trim()) newErrors.type = t('errors.product.typeRequired')
    if (!formData.figures || Number(formData.figures) < 1)
      newErrors.figures = t('errors.product.figuresRequired')
    if (!formData.quantity || Number(formData.quantity) < 1)
      newErrors.quantity = t('errors.invalid_quantity')
    if (!formData.price || Number(formData.price) <= 0)
      newErrors.price = t('errors.product.priceInvalid')

    const priceNum = Number(formData.price || 0)
    const discNum = Number(formData.discount || 0)
    if (discNum < 0 || discNum > priceNum) newErrors.discount = t('errors.product.discountInvalid')

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    const uiProduct = normalizeProductForm(formData, glazeMap)

    if (isEditing) {
      setProducts((prev) => prev.map((p, idx) => (idx === editingIndex ? uiProduct : p)))
      setEditingIndex(null)
      showSuccess('success.product.updated')
    } else {
      setProducts((prev) => [...prev, uiProduct])
      showSuccess('success.product.added')
    }

    resetForm()
    objectUrls.current = []
    fileInputRef.current && (fileInputRef.current.value = null)
    setErrors({})
  }

  const startEditAt = (i) => setEditingIndex(i)
  const cancelEdit = () => {
    setEditingIndex(null)
    resetForm()
  }

  const handleRemoveProduct = (i) => {
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
    if (editingIndex === i) cancelEdit()
    if (editingIndex !== null && i < editingIndex) {
      setEditingIndex((prev) => prev - 1)
    }
  }

  const handleSubmitAll = async () => {
    if (submitting) return
    if (!products.length) {
      showError(t('errors.order.missingProduct'))
      return
    }

    setSubmitting(true)

    // 1) Upload images if any
    const shouldUploadImages = products.some((p) => p.images && p.images.length > 0)
    const imgToastId = shouldUploadImages ? showLoading('loading.image') : null

    try {
      const uploadedProducts = await Promise.all(
        products.map(async (product) => {
          const uploads = await Promise.all(
            (product.images || []).map((item) =>
              item instanceof File ? uploadToCloudinary(item, 'haromobile/products') : item
            )
          )
          return { ...product, images: uploads }
        })
      )

      // 2) Adapt UI product → domain product (keeps glaze ids; adds label fields)
      const finalProducts = uploadedProducts.map((p) => toProductPayload(p, glazes))

      if (imgToastId) dismissToast(imgToastId)
      if (shouldUploadImages) showSuccess('success.image.uploaded')

      // 3) Submit: build draft from the restored base
      const draft = normalizeBaseOrder({ ...baseDraft, products: finalProducts })

      // 4) Hydrate glazes before payload to avoid wiping ids when list isn't ready
      const hydratedProducts = ensureGlazeObjects(draft.products || [], glazeMap)

      // 5) Build payload with same flags used in OrderConfirmation (quick: false)
      showLoading(t('loading.orderCreate'))
      const payload = buildOrderPayload(
        { ...draft, products: hydratedProducts },
        { allGlazes: glazes, glazesLoaded: glazes.length > 0, quick: false }
      )

      // 6) Create order
      const saved = await createOrder(payload)
      dismissToast()
      showSuccess(t('success.order.created'))
      // Clear server draft and remove ?draft from URL
      if (draftId) {
        deleteOrderDraft(draftId).catch(() => {})
        const sp = new URLSearchParams(searchParams)
        sp.delete('draft')
        setSearchParams(sp, { replace: true })
      }
      // 7) Go straight to details (replace to avoid back to AddProduct)
      if (saved?._id) {
        navigate(`/orders/${saved._id}/details`, {
          replace: true,
          state: { originPath: baseOrder.originPath ?? '/orders' },
        })
      } else {
        navigate('/orders', { replace: true })
      }
    } catch (err) {
      console.error('Error creating order from AddProduct:', err)
      dismissToast()
      if (imgToastId) dismissToast(imgToastId)
      showError(getApiMessage(err, 'error.creatingOrder'))
    } finally {
      setSubmitting(false)
    }
  } // end handleSubmitAll

  return (
    <div className="h-full min-h-0 rounded-xl bg-white dark:bg-neutral-900 dark:text-gray-100">
      {/* bottom padding so BottomNavBar doesn't overlap */}
      <div className="mx-auto max-w-6xl px-4 py-6 pb-[calc(var(--bottom-bar-h)+20px)]">
        <h1 className="mb-6 text-center text-xl font-semibold">
          {isEditing ? t('product.edit') : t('product.title')}
        </h1>

        {/* GRID: Form (left) + Cart (right) */}
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          {/* LEFT: FORM composed by two sections */}
          <div className="space-y-6">
            {/* ───────────────────────── Product Info ───────────────────────── */}
            <section className="rounded-xl border border-neutral-200/70 bg-white shadow-sm ring-1 ring-black/5 dark:border-neutral-700 dark:bg-neutral-900/60 dark:ring-white/5">
              {/* Section header */}
              <div className="border-b border-neutral-200 px-4 py-3 dark:border-neutral-700">
                <h2 className="text-base font-semibold tracking-wide">
                  {t('product.section.productInfo') || 'Información del producto'}
                </h2>
                <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                  {t('product.section.productInfoHint') || 'Selecciona el tipo, cantidad y precio.'}
                </p>
              </div>

              {/* Section body */}
              <div className="space-y-5 p-4">
                {/* Row: product type + quantity */}
                <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4">
                  {/* Product type select */}
                  <div className="min-w-0">
                    <FormInput
                      as="select"
                      name="type"
                      floating={false}
                      // label={t('product.type')}
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
                  </div>

                  {/* Quantity stepper */}
                  <div className="shrink-0 whitespace-nowrap">
                    <label className="text-sm">{t('product.qty') || 'Qty'}:</label>
                    <div className="mt-1 flex items-center gap-3 rounded-lg border border-neutral-300 dark:border-neutral-700">
                      <button
                        type="button"
                        aria-label="Decrease quantity"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            quantity: Math.max(1, Number(prev.quantity || 1) - 1),
                          }))
                        }
                        className="rounded bg-gray-300 px-2 py-1 dark:bg-gray-600"
                      >
                        −
                      </button>
                      <span className="min-w-[1.5ch] text-center">{formData.quantity}</span>
                      <button
                        type="button"
                        aria-label="Increase quantity"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            quantity: Math.max(1, Number(prev.quantity || 1) + 1),
                          }))
                        }
                        className="rounded bg-gray-300 px-2 py-1 dark:bg-gray-600"
                      >
                        +
                      </button>
                    </div>
                    {errors.quantity && (
                      <p className="mt-1 text-xs text-red-500">{t(errors.quantity)}</p>
                    )}
                  </div>
                </div>

                {/* Row: Price & Discount */}
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormInput
                    label={t('product.price')}
                    floating={false}
                    prefix={t('product.pricePrefix')}
                    name="price"
                    type="number"
                    min="1"
                    step="1"
                    inputMode="numeric"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="0"
                    error={errors.price}
                    errorFormatter={t}
                    onWheel={(e) => e.currentTarget.blur()}
                  />
                  <FormInput
                    label={t('product.discount')}
                    floating={false}
                    prefix={t('product.pricePrefix')}
                    name="discount"
                    type="number"
                    min="0"
                    step="1"
                    inputMode="numeric"
                    value={formData.discount}
                    onChange={handleChange}
                    placeholder="0"
                    error={errors.discount}
                    errorFormatter={t}
                    onWheel={(e) => e.currentTarget.blur()}
                  />
                </div>
              </div>
            </section>

            {/* ─────────────────────── Product Details ─────────────────────── */}
            <section className="rounded-xl border border-neutral-200/70 bg-white shadow-sm ring-1 ring-black/5 dark:border-neutral-700 dark:bg-neutral-900/60 dark:ring-white/5">
              {/* Section header */}
              <div className="border-b border-neutral-200 px-4 py-3 dark:border-neutral-700">
                <h2 className="text-base font-semibold tracking-wide">
                  {t('product.section.productDetails') || 'Detalles del Producto'}
                </h2>
                <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                  {t('product.section.productDetailsHint') ||
                    'Ajusta el número de figuras, esmaltes y personalización.'}
                </p>
              </div>

              {/* Section body */}
              <div className="space-y-1 p-4">
                {/* Figures: label + inline stepper */}
                <div className="ml-auto flex w-fit items-center gap-4">
                  <Dog className="h-6 w-6 shrink-0" />
                  <div>
                    <label className="text-base font-medium">
                      {t('product.figuresCountLabel') || 'Número de figuras (No. of Figures)'}
                    </label>
                    {errors.figures && (
                      <p className="mt-0.5 text-xs text-red-500">{t(errors.figures)}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 rounded-lg border border-neutral-300 dark:border-neutral-700">
                    <button
                      type="button"
                      aria-label="Decrease figures"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          figures: Math.max(1, Number(prev.figures || 1) - 1),
                        }))
                      }
                      className="rounded bg-gray-300 px-2 py-1 dark:bg-gray-600"
                    >
                      −
                    </button>
                    <span className="min-w-[1.5ch] text-center">{formData.figures}</span>
                    <button
                      type="button"
                      aria-label="Increase figures"
                      onClick={() =>
                        setFormData((prev) => ({
                          ...prev,
                          figures: Math.max(1, Number(prev.figures || 1) + 1),
                        }))
                      }
                      className="rounded bg-gray-300 px-2 py-1 dark:bg-gray-600"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Glazes group (icon moved next to each label) */}
                {formData.type !== 'figurine' && (
                  <div className="space-y-2">
                    {formData.type !== 'plate' && (
                      <GlazeTypeahead
                        // Label with icon inline
                        label={
                          <span className="inline-flex items-center gap-2">
                            <Paintbrush className="h-4 w-4 opacity-70" />
                            {t('fields.glazeInteriorName')}
                          </span>
                        }
                        glazes={glazes}
                        glazeMap={glazeMap}
                        selectedId={formData.glazeInterior}
                        onChange={(id) => setFormData((prev) => ({ ...prev, glazeInterior: id }))}
                        t={t}
                      />
                    )}

                    <GlazeTypeahead
                      label={
                        <span className="inline-flex items-center gap-2">
                          <Paintbrush className="h-4 w-4 opacity-70" />
                          {t('fields.glazeExteriorName')}
                        </span>
                      }
                      glazes={glazes}
                      glazeMap={glazeMap}
                      selectedId={formData.glazeExterior}
                      onChange={(id) => setFormData((prev) => ({ ...prev, glazeExterior: id }))}
                      t={t}
                    />
                  </div>
                )}

                {/* Decorations & personalization — checkbox cards */}
                <div>
                  <div className="mb-2 text-sm font-medium">
                    {t('product.decorations') || 'Decoración y personalización'}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-2">
                    {/* Gold details card */}
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={formData.decorations.hasGold}
                      onClick={() => toggleDecoration('hasGold')}
                      className={`flex items-start gap-3 rounded-lg border p-3 text-left transition-colors ${
                        formData.decorations.hasGold
                          ? 'border-amber-400 bg-amber-50 dark:border-amber-500/70 dark:bg-amber-500/10'
                          : 'border-neutral-200 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800'
                      }`}
                    >
                      <div className="mt-0.5">
                        <Sparkles className="h-4 w-4 opacity-80" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">
                          {t('product.hasGold') || 'Detalles en oro'}
                        </div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400">
                          {/* Short helper explaining the add-on */}
                          {t('product.hasGoldHint') || 'Aplicado en bordes y detalles.'}
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        readOnly
                        checked={formData.decorations.hasGold}
                        className="mt-0.5 h-4 w-4 accent-amber-500"
                        aria-hidden="true"
                        tabIndex={-1}
                      />
                    </button>

                    {/* Personalized name card */}
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={formData.decorations.hasName}
                      onClick={() => toggleDecoration('hasName')}
                      className={`flex items-start gap-3 rounded-lg border p-3 text-left transition-colors ${
                        formData.decorations.hasName
                          ? 'border-blue-400 bg-blue-50 dark:border-blue-500/70 dark:bg-blue-500/10'
                          : 'border-neutral-200 hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800'
                      }`}
                    >
                      <div className="mt-0.5">
                        <TypeIcon className="h-4 w-4 opacity-80" />
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">
                          {t('product.hasName') || 'Nombre personalizado'}
                        </div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400">
                          {t('product.hasNameHint') || 'Añade un nombre corto a la pieza.'}
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        readOnly
                        checked={formData.decorations.hasName}
                        className="mt-0.5 h-4 w-4 accent-blue-500"
                        aria-hidden="true"
                        tabIndex={-1}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Media + Notes (kept outside as you requested) */}
            <ImageUploader
              multiple={true}
              label={t('product.images')}
              value={formData.images}
              onChange={(imgs) => setFormData((prev) => ({ ...prev, images: imgs }))}
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

            {/* Add / Save buttons */}
            <div className="grid gap-2 sm:grid-cols-1">
              <button
                type="button"
                onClick={addOrSaveProduct}
                className={`w-full rounded py-2 font-semibold transition-colors duration-200 ${
                  isFormValid()
                    ? 'bg-blue-600 text-white hover:bg-blue-800'
                    : 'cursor-not-allowed bg-gray-300 text-gray-400'
                }`}
              >
                {isEditing ? t('button.save') : `+ ${t('product.addButton')}`}
              </button>

              {isEditing && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  className="rounded border border-neutral-300 py-2 font-semibold hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
                >
                  {t('button.cancelEdit') || 'Cancel edit'}
                </button>
              )}
            </div>
          </div>

          {/* RIGHT: CART (sticky on desktop) */}
          <aside className="lg:sticky lg:top-4 lg:h-fit">
            <AddedProductsCart
              products={products}
              onEdit={startEditAt}
              onRemove={handleRemoveProduct}
              deposit={Number(baseDraft?.deposit || 0)}
              t={t}
            />
            {/* FOOTER: actions */}
            <div className="mt-6">
              <FormActions
                onSubmit={handleSubmitAll}
                submitButtonText={t('button.checkout')}
                cancelButtonText={t('formActions.cancel')}
                confirmTitle={t('formActionsCreate.confirmTitle')}
                confirmMessage={t('formActionsCreate.confirmMessage')}
                confirmText={t('formActions.confirmText')}
                cancelText={t('formActions.cancelText')}
                cancelRedirect={originPath}
                cancelState={{ ...baseOrder, products }}
                submitDisabled={submitting || products.length === 0}
                submitLoading={submitting}
              />
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
