// src/pages/orders/EditOrder.jsx
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { getOrderById, updateOrderById } from '../../api/orders'
import { getAllGlazes } from '../../api/glazes'
import { uploadToCloudinary } from '../../utils/uploadToCloudinary'
import { toProductPayload } from '../../utils/orderPayload'
import AddedProductsCart from '../../components/AddedProductsCart'
import { getMessage as t } from '../../utils/getMessage'
import { getOriginPath } from '../../utils/navigationUtils'
import { showError, showSuccess, showLoading, dismissToast } from '../../utils/toastUtils'
import { Menu, MenuButton, MenuItem, MenuItems, Switch } from '@headlessui/react'
import { validateBaseForm, cleanAddresses } from '../../utils/orderBuilder'
import { useLayout } from '../../context/LayoutContext'
import FormInput from '../../components/FormInput'
import FormActions from '../../components/FormActions'
import FormAddress from '../../components/FormAddress'
import {
  Instagram,
  Facebook,
  Music2,
  Plus,
  ChevronDown,
  Dog,
  Paintbrush,
  Sparkles,
  Type as TypeIcon,
} from 'lucide-react'
import GlazeTypeahead from '../../components/GlazeTypeahead'
import ImageUploader from '../../components/ImageUploader'

const TABS = { CUSTOMER: 'customer', PRODUCT: 'product' }

export default function EditOrder() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  // Current URL
  const here = location.pathname + location.search
  // State or Fallback to /orders (list)
  const originPath = getOriginPath(location.state?.originPath ?? location.state?.from ?? '/orders')

  // Active Tab:
  const [tab, setTab] = useState(TABS.CUSTOMER)

  const { setTitle, setShowSplitButton } = useLayout()

  // productos y glazes
  const [products, setProducts] = useState([])
  const [glazes, setGlazes] = useState([])
  const [editingIndex, setEditingIndex] = useState(null) // para editar un producto
  const isEditingProduct = editingIndex !== null

  const emptyAddress = { address: '', city: '', zip: '', phone: '' }
  const isShippingOn = (v) => v === true || v?.isRequired === true || v?.active === true

  const [formData, setFormData] = useState({
    name: '',
    lastName: '',
    phone: '',
    countryCode: '+52',
    email: '',
    orderDate: '',
    deliverDate: '',
    deposit: '',
    shipping: { isRequired: false, addresses: [] },
    socialMedia: { instagram: '', facebook: '' },
    status: 'new',
    notes: '',
  })

  const [pForm, setPForm] = useState({
    type: '',
    quantity: 1,
    figures: 1,
    price: '', // string para que el 0 placeholder no se “pegue”
    discount: '', // idem
    glazeInterior: '',
    glazeExterior: '',
    description: '',
    images: [],
    decorations: { hasGold: false, hasName: false, decorationDescription: '' },
  })
  const [pErrors, setPErrors] = useState({})
  const fileInputRef = useRef(null)
  const [errors, setErrors] = useState({})

  // helpers de inputs (EditOrder / NewOrder)
  const handleChangeAndClearError = (eOrName, maybeValue) => {
    // Soporta tanto onChange(e) como set programático: handleChangeAndClearError('campo', valor)
    if (eOrName && eOrName.target) {
      const { name, value, type } = eOrName.target
      setFormData((prev) => ({
        ...prev,
        // Para inputs type="number" guardamos como string para no forzar NaN ni concatenar ceros
        [name]: type === 'number' ? String(value) : value,
      }))
      setErrors((prev) => ({ ...prev, [name]: null }))
    } else {
      const name = eOrName
      const value = maybeValue
      setFormData((prev) => ({ ...prev, [name]: value }))
      setErrors((prev) => ({ ...prev, [name]: null }))
    }
  }

  // opcional: versión simple si a veces quieres solo setear sin tocar errors
  const handleChange = (e) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({ ...prev, [name]: type === 'number' ? String(value) : value }))
  }
  //Shipping - Address Handlers
  const handleToggleShipping = (next) => {
    setErrors((prev) => ({ ...prev, addresses: null }))
    setFormData((prev) => {
      const on = typeof next === 'boolean' ? next : !isShippingOn(prev.shipping)
      return { ...prev, shipping: { isRequired: on } }
    })
  }

  const addAddress = () => {
    const last = formData.shipping?.addresses?.at(-1)
    const isIncomplete = last && (!last.address || !last.city || !last.zip || !last.phone)

    if (isIncomplete) {
      showError('validation.incompleteAddressBeforeAdding')
      return
    }

    setFormData((prev) => {
      const list = Array.isArray(prev.shipping?.addresses) ? prev.shipping.addresses : []
      return {
        ...prev,
        shipping: { ...prev.shipping, isRequired: true, addresses: [...list, { ...emptyAddress }] },
      }
    })
  }

  const updateAddress = (index, field, value) => {
    setFormData((prev) => {
      const list = Array.isArray(prev.shipping?.addresses) ? [...prev.shipping.addresses] : []
      list[index] = { ...list[index], [field]: value }
      return { ...prev, shipping: { ...prev.shipping, addresses: list } }
    })
  }

  const removeAddress = (index) => {
    setFormData((prev) => {
      const list = Array.isArray(prev.shipping?.addresses) ? [...prev.shipping.addresses] : []
      list.splice(index, 1)
      return { ...prev, shipping: { ...prev.shipping, addresses: list } }
    })
  } // end Shipping - Address Handlers

  const [currentSocialType, setCurrentSocialType] = useState('instagram')
  const [socialInput, setSocialInput] = useState('')

  const getSocialIcon = (type) => {
    if (type === 'facebook') return Facebook
    if (type === 'tiktok') return Music2
    return Instagram
  }
  const socialOptions = [
    { type: 'instagram', label: 'Instagram', icon: Instagram },
    { type: 'facebook', label: 'Facebook', icon: Facebook },
    { type: 'tiktok', label: 'TikTok', icon: Music2 },
  ]
  const setTypeAndPrefill = (type) => {
    setCurrentSocialType(type)
    const v = formData?.socialMedia?.[type] || ''
    setSocialInput(v)
  }
  const addOrUpdateSocial = () => {
    const v = (socialInput || '').trim()
    if (!v) return
    setFormData((prev) => ({
      ...prev,
      socialMedia: { ...(prev.socialMedia || {}), [currentSocialType]: v },
    }))
    setSocialInput('')
  }
  const removeSocial = (type) => {
    setFormData((prev) => {
      const next = { ...(prev.socialMedia || {}) }
      delete next[type]
      return { ...prev, socialMedia: next }
    })
  }

  const toggleDecoration = (key) =>
    setPForm((prev) => ({
      ...prev,
      decorations: {
        ...(prev.decorations || {
          hasGold: false,
          hasName: false,
          decorationDescription: '',
        }),
        [key]: !prev?.decorations?.[key],
      },
    }))

  useEffect(() => {
    setTitle(t('order.editTitle'))
    setShowSplitButton(false)
    return () => {
      setTitle('Haro Mobile')
      setShowSplitButton(true)
    }
  }, [])

  // Carga inicial: orden + glazes (en 1 solo efecto)
  useEffect(() => {
    let alive = true // evita setState si el componente se desmonta

    ;(async () => {
      try {
        const [order, glz] = await Promise.all([getOrderById(id), getAllGlazes({ navigate })])

        if (!alive) return

        // 1) Glazes
        setGlazes(glz)

        // 2) Productos (para el carrito)
        setProducts(order.products || [])

        // 3) Form base con shipping.addresses adentro
        setFormData({
          name: order.customer?.name || '',
          lastName: order.customer?.lastName || '',
          phone: order.customer?.phone || '',
          countryCode: order.customer?.countryCode || '+52',
          email: order.customer?.email || '',
          orderDate: order.orderDate?.slice(0, 10) || '',
          deliverDate: order.deliverDate?.slice(0, 10) || '',
          deposit: String(order.deposit ?? ''), // mantener como string en UI
          shipping: {
            isRequired: !!(order.shipping?.isRequired || order.shipping?.active),
            // fallback por si hay pedidos legacy con addresses a nivel raíz
            addresses: order.shipping?.addresses || order.addresses || [],
          },
          socialMedia: order.customer?.socialMedia || { instagram: '', facebook: '' },
          status: order.status || 'new',
          notes: order.notes || '',
        })
      } catch (err) {
        if (!alive) return
        showError('error.loadingOrder')
        navigate('/orders')
      }
    })()

    return () => {
      alive = false
    }
  }, [id, navigate])

  const handleUpdateOrder = async (e) => {
    e.preventDefault()
    setErrors({})

    const errs = validateBaseForm(formData)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      showError('validation.requiredFields')
      if (errs.deliverDate) showError('validation.invalidDeliveryDate')
      if (errs.addresses) showError('validation.incompleteShipping')
      return
    }

    const coerceShippingForPayload = (fd) => ({
      isRequired: isShippingOn(fd.shipping),
      addresses:
        typeof fd.shipping === 'boolean'
          ? cleanAddresses(fd.addresses || [])
          : cleanAddresses(fd.shipping?.addresses || fd.addresses || []),
    })
    // ✅ Build payload in correct shape for backend
    const payload = {
      customer: {
        name: formData.name,
        lastName: formData.lastName,
        phone: formData.phone,
        countryCode: formData.countryCode,
        email: formData.email,
        socialMedia: formData.socialMedia,
      },
      orderDate: formData.orderDate,
      deliverDate: formData.deliverDate,
      deposit: Number(formData.deposit || 0),
      shipping: coerceShippingForPayload(formData),
      status: formData.status,
      notes: formData.notes,
    }

    try {
      await updateOrderById(id, payload)
      showSuccess('success.orderUpdated')
      navigate(`/orders/${id}`)
    } catch (err) {
      showError('error.updatingOrder')
    }
  }

  // Validation and product edit helpers (compact)
  const pValidate = () => {
    const e = {}
    if (!pForm.type.trim()) e.type = t('errors.product.typeRequired')
    if (!pForm.quantity || Number(pForm.quantity) < 1) e.quantity = t('errors.invalid_quantity')
    if (!pForm.figures || Number(pForm.figures) < 1) e.figures = t('errors.product.figuresRequired')
    if (!pForm.price || Number(pForm.price) <= 0) e.price = t('errors.product.priceInvalid')
    const priceNum = Number(pForm.price || 0)
    const discNum = Number(pForm.discount || 0)
    if (discNum < 0 || discNum > priceNum) e.discount = t('errors.product.discountInvalid')
    return e
  }

  const pReset = () =>
    setPForm({
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

  const startEditProduct = (i) => {
    const p = products[i]
    const toId = (v) => (typeof v === 'object' && v?._id ? v._id : v || '')
    setPForm({
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
    setEditingIndex(i)
    setPErrors({})
    setTab(TABS.PRODUCT) // te lleva a la pestaña de producto al editar
  }

  const cancelEditProduct = () => {
    setEditingIndex(null)
    pReset()
    setPErrors({})
  }

  const removeProduct = (i) => {
    setProducts((prev) => prev.filter((_, idx) => idx !== i))
    if (editingIndex === i) cancelEditProduct()
    if (editingIndex !== null && i < editingIndex) setEditingIndex((prev) => prev - 1)
  }

  const addOrSaveProduct = () => {
    const e = pValidate()
    if (Object.keys(e).length) {
      setPErrors(e)
      return
    }

    const interior = glazes.find((g) => g._id === pForm.glazeInterior)
    const exterior = glazes.find((g) => g._id === pForm.glazeExterior)

    const uiProduct = {
      ...pForm,
      price: Number(pForm.price || 0),
      discount: Number(pForm.discount || 0),
      quantity: Number(pForm.quantity || 1),
      figures: Number(pForm.figures || 1),
      glazes: {
        interior: interior?._id || null,
        exterior: exterior?._id || null,
        interiorName: interior?.name || '',
        interiorHex: interior?.hex || '',
        exteriorName: exterior?.name || '',
        exteriorHex: exterior?.hex || '',
        interiorImage: interior?.image || '',
        exteriorImage: exterior?.image || '',
      },
      ...(isEditingProduct && products[editingIndex]?._id
        ? { _id: products[editingIndex]._id }
        : {}),
    }

    if (isEditingProduct) {
      setProducts((prev) => prev.map((p, i) => (i === editingIndex ? uiProduct : p)))
      showSuccess('success.product.updated')
    } else {
      setProducts((prev) => [...prev, uiProduct])
      showSuccess('success.product.added')
    }
    cancelEditProduct()
  }
  // End validation and product helperss

  // Save All
  const saveAll = async (e) => {
    e?.preventDefault?.()

    // 1) Si hay un producto en edición y no diste "Save", lo volcamos al array.
    let workingProducts = products
    if (isEditingProduct) {
      const eProd = pValidate()
      if (Object.keys(eProd).length) {
        setPErrors(eProd)
        showError(t('errors.product.fixBeforeSave') || 'Please fix product errors before saving.')
        setTab(TABS.PRODUCT)
        return
      }

      const interior = glazes.find((g) => g._id === pForm.glazeInterior)
      const exterior = glazes.find((g) => g._id === pForm.glazeExterior)

      const uiProduct = {
        ...pForm,
        price: Number(pForm.price || 0),
        discount: Number(pForm.discount || 0),
        quantity: Number(pForm.quantity || 1),
        figures: Number(pForm.figures || 1),
        glazes: {
          interior: interior?._id || null,
          exterior: exterior?._id || null,
          interiorName: interior?.name || '',
          interiorHex: interior?.hex || '',
          exteriorName: exterior?.name || '',
          exteriorHex: exterior?.hex || '',
          interiorImage: interior?.image || '',
          exteriorImage: exterior?.image || '',
        },
        // conserva _id si el producto ya existe en DB
        ...(products[editingIndex]?._id ? { _id: products[editingIndex]._id } : {}),
      }

      workingProducts = products.map((p, i) => (i === editingIndex ? uiProduct : p))
      setProducts(workingProducts) // refleja en UI
      setEditingIndex(null) // salimos de modo edición
      // pReset() opcional si quieres limpiar el formulario de producto
      // pReset()
    }

    // 2) Debe haber al menos un producto
    if (!workingProducts.length) {
      showError(t('errors.order.missingProduct') || 'Add at least one product.')
      setTab(TABS.PRODUCT)
      return
    }

    // 3) Subida de imágenes si hay Files pendientes
    const shouldUpload = workingProducts.some((p) =>
      (p.images || []).some((it) => it instanceof File)
    )
    const toastId = shouldUpload ? showLoading('loading.image') : null

    try {
      const uploaded = await Promise.all(
        workingProducts.map(async (p) => {
          const imgs = await Promise.all(
            (p.images || []).map((it) =>
              it instanceof File ? uploadToCloudinary(it, 'haromobile/products') : it
            )
          )
          return { ...p, images: imgs }
        })
      )

      const finalProducts = uploaded.map((p) => toProductPayload(p, glazes))

      // 4) Payload — usa shipping.addresses (no formData.addresses)
      const payload = {
        customer: {
          name: formData.name,
          lastName: formData.lastName,
          phone: formData.phone,
          countryCode: formData.countryCode,
          email: formData.email,
          socialMedia: formData.socialMedia,
        },
        orderDate: formData.orderDate,
        deliverDate: formData.deliverDate,
        // si deposit viene vacío, no lo mandes para no disparar validación en backend
        ...(String(formData.deposit ?? '').trim() === ''
          ? {}
          : { deposit: Number(formData.deposit) }),
        shipping: {
          isRequired: isShippingOn(formData.shipping),
          addresses: cleanAddresses(formData.shipping?.addresses || []),
        },
        status: formData.status,
        notes: formData.notes,
        products: finalProducts,
      }

      // 5) Guardar en backend
      await updateOrderById(id, payload)

      if (toastId) dismissToast(toastId)
      if (shouldUpload) showSuccess('success.image.uploaded')
      showSuccess('success.order.updated')

      navigate(originPath || `/orders/${id}`)
    } catch (err) {
      console.error(err)
      if (toastId) dismissToast(toastId)
      const apiMsg = err?.response?.data?.message
      showError(apiMsg || 'error.updatingOrder')
    }
  }

  return (
    <div className="h-full min-h-0 bg-white text-black dark:bg-neutral-900 dark:text-gray-100">
      <form
        onSubmit={saveAll}
        className="mx-auto max-w-6xl space-y-6 px-4 py-6 pb-[calc(var(--bottom-bar-h)+20px)]"
      >
        {/* ───────── Tabs header (left column) ───────── */}
        <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
          <div>
            <div className="mb-3 flex gap-2">
              <button
                type="button"
                onClick={() => setTab(TABS.CUSTOMER)}
                className={`rounded-md px-3 py-2 text-sm font-medium ${tab === TABS.CUSTOMER ? 'bg-neutral-900 text-white dark:bg-white dark:text-black' : 'bg-neutral-200 dark:bg-neutral-700'}`}
              >
                {t('product.section.customerInfo') || 'Customer Info'}
              </button>
              <button
                type="button"
                onClick={() => setTab(TABS.PRODUCT)}
                className={`rounded-md px-3 py-2 text-sm font-medium ${tab === TABS.PRODUCT ? 'bg-neutral-900 text-white dark:bg-white dark:text-black' : 'bg-neutral-200 dark:bg-neutral-700'}`}
              >
                {t('product.section.productInfo') || 'Product Info'}
              </button>
            </div>

            {/* ───────── Customer Info (tu sección actual) ───────── */}
            {tab === TABS.CUSTOMER && (
              <>
                {/* ───────────────────────────── Customer Info ───────────────────────────── */}
                <section className="rounded-xl border border-neutral-200/70 bg-white shadow-sm ring-1 ring-black/5 dark:border-neutral-700 dark:bg-neutral-900/60 dark:ring-white/5">
                  {/* Section header */}
                  <div className="border-b border-neutral-200 px-4 py-3 dark:border-neutral-700">
                    <h2 className="text-base font-semibold tracking-wide">
                      {t('order.section.customerInfo') || 'Customer Info'}
                    </h2>
                    <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                      {t('order.section.customerInfoHint') ||
                        'Basic customer details and social information.'}
                    </p>
                  </div>

                  {/* Section body */}
                  <div className="space-y-5 p-4">
                    {/* Name + Lastname */}
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                      <FormInput
                        label={t('order.name')}
                        name="name"
                        value={formData.name}
                        onChange={handleChangeAndClearError}
                        error={errors.name}
                        errorFormatter={t}
                      />
                      <FormInput
                        label={t('order.lastName')}
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChangeAndClearError}
                        error={errors.lastName}
                        errorFormatter={t}
                      />
                    </div>

                    {/* Phone & email */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      {/* Phone group (country code + number) */}
                      <div className="flex gap-2">
                        <select
                          name="countryCode"
                          aria-label={t('order.countryCode') || 'Country code'}
                          value={formData.countryCode}
                          onChange={handleChange}
                          className="h-11 w-24 rounded-md border border-neutral-300 bg-white px-2 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                        >
                          <option value="+52">+52</option>
                          <option value="+1">+1</option>
                          <option value="+54">+54</option>
                        </select>

                        <FormInput
                          label={t('order.phone')}
                          name="phone"
                          type="tel"
                          pattern="\d{10}"
                          maxLength={10}
                          value={formData.phone}
                          onChange={handleChangeAndClearError}
                          error={errors.phone}
                          errorFormatter={t}
                        />
                      </div>

                      <FormInput
                        label={t('order.email')}
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChangeAndClearError}
                        error={errors.email}
                        errorFormatter={t}
                      />
                    </div>

                    {/* Social media (kept your logic, just placed inside the section) */}
                    <div className="w-full md:max-w-md">
                      <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-200">
                        {t('order.social')}
                      </label>

                      <Menu as="div" className="relative w-full">
                        {({ open }) => (
                          <>
                            <div className="mb-2 flex items-stretch gap-2">
                              {/* Menu button with social icon and animated chevron */}
                              <div className="relative shrink-0">
                                <MenuButton
                                  aria-label={t('order.social')}
                                  className="relative flex h-10 w-10 cursor-pointer items-center justify-center rounded-md border border-neutral-300 bg-white dark:border-neutral-700 dark:bg-neutral-800"
                                >
                                  {(() => {
                                    const Icon = getSocialIcon(currentSocialType)
                                    return <Icon size={20} />
                                  })()}
                                  <ChevronDown
                                    size={14}
                                    className={`pointer-events-none absolute right-0.5 bottom-0.5 opacity-70 transition-transform duration-200 ${open ? 'rotate-180' : 'rotate-0'}`}
                                  />
                                </MenuButton>
                              </div>

                              {/* Social input */}
                              <input
                                type="text"
                                placeholder={
                                  currentSocialType === 'instagram'
                                    ? '@username'
                                    : currentSocialType === 'facebook'
                                      ? '/username'
                                      : currentSocialType === 'tiktok'
                                        ? '@handle'
                                        : t('order.usernamePlaceholder')
                                }
                                value={socialInput}
                                onChange={(e) => setSocialInput(e.target.value)}
                                onKeyDown={(e) =>
                                  e.key === 'Enter' && (e.preventDefault(), addOrUpdateSocial())
                                }
                                className="h-10 min-w-0 flex-1 rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                              />

                              {/* Add/Update button */}
                              <button
                                type="button"
                                onClick={addOrUpdateSocial}
                                className="shrink-0 rounded-md bg-neutral-200 px-3 py-1 text-sm hover:bg-neutral-300 dark:bg-neutral-700 dark:text-white dark:hover:bg-neutral-600"
                                title={t('order.addUpdate')}
                              >
                                <Plus size={16} />
                              </button>
                            </div>

                            {/* Dropdown menu */}
                            <MenuItems className="absolute z-10 mt-1 w-40 overflow-hidden rounded-md border border-neutral-200 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-800">
                              {socialOptions.map((opt) => (
                                <MenuItem
                                  key={opt.type}
                                  as="button"
                                  type="button"
                                  onClick={() => setTypeAndPrefill(opt.type)}
                                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm data-[headlessui-state=active]:bg-neutral-100 data-[headlessui-state=active]:dark:bg-neutral-700"
                                >
                                  <opt.icon size={16} />
                                  {opt.label}
                                </MenuItem>
                              ))}
                            </MenuItems>
                          </>
                        )}
                      </Menu>

                      {/* Social chips */}
                      <div className="mt-2 flex flex-wrap gap-2">
                        {['instagram', 'facebook', 'tiktok'].map((type) => {
                          const value = formData.socialMedia?.[type]
                          if (!value) return null
                          const Icon = getSocialIcon(type)
                          return (
                            <span
                              key={type}
                              className="flex items-center gap-2 rounded-full bg-neutral-200 px-3 py-1 text-sm dark:bg-neutral-700"
                            >
                              <Icon size={14} />
                              {value}
                              {/* Edit */}
                              <button
                                type="button"
                                className="text-xs underline-offset-2 hover:underline"
                                onClick={() => {
                                  setTypeAndPrefill(type)
                                  setTimeout(() => {
                                    document
                                      .querySelector(
                                        'input[placeholder="@username"], input[placeholder^="/"], input[placeholder^="URL"]'
                                      )
                                      ?.focus()
                                  }, 0)
                                }}
                              >
                                {t('order.editLabel')}
                              </button>
                              {/* Remove */}
                              <button
                                type="button"
                                onClick={() => removeSocial(type)}
                                className="text-xs text-red-600 underline-offset-2 hover:underline"
                              >
                                ×
                              </button>
                            </span>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </section>
                {/* ───────────────────────────── Order Info ─────────────────────────────── */}
                <section className="rounded-xl border border-neutral-200/70 bg-white shadow-sm ring-1 ring-black/5 dark:border-neutral-700 dark:bg-neutral-900/60 dark:ring-white/5">
                  {/* Section header */}
                  <div className="border-b border-neutral-200 px-4 py-3 dark:border-neutral-700">
                    <h2 className="text-base font-semibold tracking-wide">
                      {t('order.section.orderInfo') || 'Order Info'}
                    </h2>
                    <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                      {t('order.section.orderInfoHint') ||
                        'Dates, status, payment and shipping preferences.'}
                    </p>
                  </div>

                  {/* Section body */}
                  <div className="space-y-5 p-4">
                    {/* Dates */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <FormInput
                        type="date"
                        name="orderDate"
                        label={t('order.orderDate') || 'Order date'}
                        placeholder={t('order.datePlaceholder')}
                        value={formData.orderDate}
                        onChange={handleChangeAndClearError}
                        error={errors.orderDate}
                        errorFormatter={t}
                        icon="calendar"
                        floating={false}
                      />
                      <FormInput
                        type="date"
                        name="deliverDate"
                        label={t('order.deliveryDate') || 'Delivery date'}
                        placeholder={t('order.datePlaceholder')}
                        value={formData.deliverDate}
                        onChange={handleChangeAndClearError}
                        error={errors.deliverDate}
                        errorFormatter={t}
                        icon="calendar"
                        floating={false}
                      />
                    </div>

                    {/* Status & deposit */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-neutral-700 dark:text-neutral-200">
                          {t('order.status')}
                        </label>
                        <select
                          name="status"
                          value={formData.status}
                          onChange={handleChange}
                          className="h-11 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                        >
                          <option value="new">{t('status.new')}</option>
                          <option value="pending">{t('status.pending')}</option>
                          <option value="inProgress">{t('status.inProgress')}</option>
                          <option value="completed">{t('status.completed')}</option>
                          <option value="cancelled">{t('status.cancelled')}</option>
                        </select>
                      </div>

                      <FormInput
                        label={t('order.deposit')}
                        name="deposit"
                        type="number"
                        value={formData.deposit}
                        onChange={handleChangeAndClearError}
                        prefix="$"
                        min={0}
                        step="1"
                        placeholder="0"
                        error={errors.deposit}
                        errorFormatter={t}
                        floating={false}
                        onWheel={(e) => e.target.blur()} // Prevent accidental scroll change
                      />
                    </div>

                    {/* Shipping toggle */}
                    <div className="flex items-center justify-between rounded-lg border border-dashed border-neutral-300 p-3 dark:border-neutral-700">
                      <div className="space-y-0.5">
                        <p className="text-sm font-medium">{t('order.shippingRequired')}?</p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400">
                          {t('order.shippingHint') ||
                            'Enable to add one or more shipping addresses.'}
                        </p>
                      </div>
                      <Switch
                        checked={isShippingOn(formData.shipping)}
                        onChange={handleToggleShipping}
                        className={`${
                          isShippingOn(formData.shipping)
                            ? 'bg-green-500'
                            : 'bg-neutral-300 dark:bg-neutral-700'
                        } relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200`}
                      >
                        <span
                          className={`${
                            isShippingOn(formData.shipping) ? 'translate-x-6' : 'translate-x-1'
                          } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                        />
                      </Switch>
                    </div>

                    {/* Addresses (conditional) */}
                    {isShippingOn(formData.shipping) && (
                      <FormAddress
                        addresses={formData.shipping?.addresses || []}
                        onAdd={addAddress}
                        onRemove={removeAddress}
                        onChange={updateAddress}
                        errors={errors.addresses || []}
                        errorFormatter={t}
                        shippingAddress={t('order.shippingAddress')}
                        addButton={t('order.addAddress')}
                        addressInputTexts={{
                          address: t('order.address'),
                          city: t('order.city'),
                          zip: t('order.zip'),
                          phone: t('order.phoneShipping'),
                          remove: t('order.remove'),
                        }}
                      />
                    )}

                    {/* Notes */}
                    <div>
                      <FormInput
                        label={t('order.notes')}
                        name="notes"
                        value={formData.notes}
                        onChange={handleChangeAndClearError}
                        maxLength={200}
                        error={errors.notes}
                        errorFormatter={t}
                      />
                      <p className="-mt-4 text-right text-xs text-neutral-400">
                        {formData.notes.length}/200
                      </p>
                    </div>
                  </div>
                </section>{' '}
              </>
            )}

            {/* ───────── Product Info (form inline) ───────── */}
            {tab === TABS.PRODUCT && (
              <div className="space-y-6">
                {/* ───────────────────────── Product Info ───────────────────────── */}
                <section className="rounded-xl border border-neutral-200/70 bg-white shadow-sm ring-1 ring-black/5 dark:border-neutral-700 dark:bg-neutral-900/60 dark:ring-white/5">
                  {/* Section header */}
                  <div className="border-b border-neutral-200 px-4 py-3 dark:border-neutral-700">
                    <h2 className="text-base font-semibold tracking-wide">
                      {t('product.section.productInfo') || 'Información del producto'}
                    </h2>
                    <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                      {t('product.section.productInfoHint') ||
                        'Selecciona el tipo, cantidad y precio.'}
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
                          value={pForm.type}
                          onChange={(e) => {
                            setPForm((prev) => ({ ...prev, type: e.target.value }))
                            setPErrors((prev) => ({ ...prev, type: null }))
                          }}
                          error={pErrors.type}
                          errorFormatter={t}
                          required
                          floating={false}
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
                        <div className="mt-1 flex items-center gap-3">
                          <button
                            type="button"
                            aria-label="Decrease quantity"
                            onClick={() =>
                              setPForm((prev) => ({
                                ...prev,
                                quantity: Math.max(1, Number(prev.quantity || 1) - 1),
                              }))
                            }
                            className="rounded bg-gray-300 px-2 py-1 dark:bg-gray-600"
                          >
                            −
                          </button>
                          <span className="min-w-[1.5ch] text-center">{pForm.quantity}</span>
                          <button
                            type="button"
                            aria-label="Increase quantity"
                            onClick={() =>
                              setPForm((prev) => ({
                                ...prev,
                                quantity: Math.max(1, Number(prev.quantity || 1) + 1),
                              }))
                            }
                            className="rounded bg-gray-300 px-2 py-1 dark:bg-gray-600"
                          >
                            +
                          </button>
                        </div>
                        {pErrors.quantity && (
                          <p className="mt-1 text-xs text-red-500">{t(pErrors.quantity)}</p>
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
                        value={pForm.price}
                        onChange={(e) => {
                          setPForm((prev) => ({ ...prev, price: e.target.value }))
                          setPErrors((prev) => ({ ...prev, price: null }))
                        }}
                        placeholder="0"
                        error={pErrors.price}
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
                        value={pForm.discount}
                        onChange={(e) => {
                          setPForm((prev) => ({ ...prev, discount: e.target.value }))
                          setPErrors((prev) => ({ ...prev, discount: null }))
                        }}
                        placeholder="0"
                        error={pErrors.discount}
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
                        {pErrors.figures && (
                          <p className="mt-0.5 text-xs text-red-500">{t(pErrors.figures)}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3 rounded-lg border border-neutral-300">
                        <button
                          type="button"
                          aria-label="Decrease figures"
                          onClick={() =>
                            setPForm((prev) => ({
                              ...prev,
                              figures: Math.max(1, Number(prev.figures || 1) - 1),
                            }))
                          }
                          className="rounded bg-gray-300 px-2 py-1 dark:bg-gray-600"
                        >
                          −
                        </button>
                        <span className="min-w-[1.5ch] text-center">{pForm.figures}</span>
                        <button
                          type="button"
                          aria-label="Increase figures"
                          onClick={() =>
                            setPForm((prev) => ({
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

                    {/* Glazes group */}
                    {pForm.type !== 'figurine' && (
                      <div className="space-y-2">
                        {pForm.type !== 'plate' && (
                          <GlazeTypeahead
                            label={
                              <span className="inline-flex items-center gap-2">
                                <Paintbrush className="h-4 w-4 opacity-70" />
                                {t('fields.glazeInteriorName')}
                              </span>
                            }
                            glazes={glazes}
                            selectedId={pForm.glazeInterior}
                            onChange={(id) => setPForm((prev) => ({ ...prev, glazeInterior: id }))}
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
                          selectedId={pForm.glazeExterior}
                          onChange={(id) => setPForm((prev) => ({ ...prev, glazeExterior: id }))}
                          t={t}
                        />
                      </div>
                    )}

                    {/* Decorations & personalization */}
                    <div>
                      <div className="mb-2 text-sm font-medium">
                        {t('product.decorations') || 'Decoración y personalización'}
                      </div>

                      <div className="grid gap-3 sm:grid-cols-2">
                        {/* Gold details card */}
                        <button
                          type="button"
                          role="checkbox"
                          aria-checked={pForm.decorations?.hasGold}
                          onClick={() => toggleDecoration('hasGold')}
                          className={`flex items-start gap-3 rounded-lg border p-3 text-left transition-colors ${
                            pForm.decorations?.hasGold
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
                              {t('product.hasGoldHint') || 'Aplicado en bordes y detalles.'}
                            </div>
                          </div>
                          <input
                            type="checkbox"
                            readOnly
                            checked={!!pForm.decorations?.hasGold}
                            className="mt-0.5 h-4 w-4 accent-amber-500"
                            aria-hidden="true"
                            tabIndex={-1}
                          />
                        </button>

                        {/* Personalized name card */}
                        <button
                          type="button"
                          role="checkbox"
                          aria-checked={pForm.decorations?.hasName}
                          onClick={() => toggleDecoration('hasName')}
                          className={`flex items-start gap-3 rounded-lg border p-3 text-left transition-colors ${
                            pForm.decorations?.hasName
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
                            checked={!!pForm.decorations?.hasName}
                            className="mt-0.5 h-4 w-4 accent-blue-500"
                            aria-hidden="true"
                            tabIndex={-1}
                          />
                        </button>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Media + Notes */}
                <ImageUploader
                  multiple={true}
                  label={t('product.images')}
                  value={pForm.images}
                  onChange={(imgs) => setPForm((prev) => ({ ...prev, images: imgs }))}
                  inputRef={fileInputRef}
                />

                <FormInput
                  label={t('product.description')}
                  name="description"
                  value={pForm.description}
                  onChange={(e) => setPForm((prev) => ({ ...prev, description: e.target.value }))}
                  maxLength={200}
                />
                <p className="-mt-2 text-right text-xs text-gray-400">
                  {pForm.description.length}/200
                </p>

                {/* Add / Save + Cancel edit */}
                <div className="grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={addOrSaveProduct}
                    className="rounded bg-blue-600 py-2 font-semibold text-white hover:bg-blue-800"
                  >
                    {isEditingProduct ? t('button.save') : `+ ${t('product.addButton')}`}
                  </button>

                  {isEditingProduct && (
                    <button
                      type="button"
                      onClick={cancelEditProduct}
                      className="rounded border border-neutral-300 py-2 font-semibold hover:bg-neutral-50 dark:border-neutral-700 dark:hover:bg-neutral-800"
                    >
                      {t('button.cancelEdit') || 'Cancel edit'}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* ───────── Carrito (derecha, fijo en desktop) ───────── */}
          <aside className="lg:sticky lg:top-4 lg:h-fit">
            <AddedProductsCart
              products={products}
              onEdit={startEditProduct}
              onRemove={removeProduct}
              t={t}
            />
          </aside>
        </div>

        {/* ───────── Actions (guardar / cancelar con originPath) ───────── */}
        <FormActions
          onSubmit={saveAll}
          submitButtonText={t('formActions.saveChanges')}
          cancelButtonText={t('formActions.cancel')}
          confirmTitle={t('formActionsEdit.confirmTitle')}
          confirmMessage={t('formActionsEdit.confirmMessage')}
          confirmText={t('formActions.confirmText')}
          cancelText={t('formActions.cancelText')}
          cancelRedirect={originPath || `/orders/${id}`}
          cancelState={{ ...location.state, from: here }}
        />
      </form>
    </div>
  )
}
