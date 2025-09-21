// src/pages/orders/EditOrder.jsx
import { Menu, MenuButton, MenuItem, MenuItems, Switch } from '@headlessui/react'

import { getApiMessage } from '../../utils/errorUtils' // if you have it
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
import { useEffect, useRef, useState, useMemo } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { getAllGlazes } from '../../api/glazes'
import { getOrderById, updateOrderById } from '../../api/orders'
import AddedProductsCart from '../../components/AddedProductsCart'
import GlazeTypeahead from '../../components/GlazeTypeahead'
import ImageUploader from '../../components/ImageUploader'
import { useShippingAddresses } from '../../hooks/useShippingAddresses'
import { getMessage as t } from '../../utils/getMessage'
import { normalizeProductForm } from '../../utils/mappers/product'
import { getOriginPath } from '../../utils/navigationUtils'
import { toProductPayload, buildOrderPayload } from '../../utils/orderPayload'
import { showError, showSuccess, showLoading, dismissToast } from '../../utils/toastUtils'
import { uploadToCloudinary } from '../../utils/uploadToCloudinary'

const TABS = { CUSTOMER: 'customer', PRODUCT: 'product' }

export default function EditOrder() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const socialInputRef = useRef(null)

  // Current URL
  const here = location.pathname + location.search
  // State or Fallback to /orders (list)
  const originPath = getOriginPath(location.state?.originPath ?? location.state?.from ?? '/orders')

  // Active Tab:
  const [tab, setTab] = useState(TABS.CUSTOMER)

  const { setTitle, setShowSplitButton } = useLayout()

  // products and glazes
  const [products, setProducts] = useState([])
  const [glazes, setGlazes] = useState([])
  const [editingIndex, setEditingIndex] = useState(null) // to edit a product
  const isEditingProduct = editingIndex !== null
  const glazeMap = useMemo(() => new Map(glazes.map((g) => [String(g._id), g])), [glazes])

  const emptyAddress = {
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'Mexico',
    phone: '',
    reference: '',
  }

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
    price: '', // string so the 0 placeholder doesn’t “stick”
    discount: '', // same idea
    glazeInterior: '',
    glazeExterior: '',
    description: '',
    images: [],
    decorations: { hasGold: false, hasName: false, decorationDescription: '' },
  })
  const [pErrors, setPErrors] = useState({})
  const fileInputRef = useRef(null)
  const [errors, setErrors] = useState({})

  // input helpers (EditOrder / NewOrder)
  const handleChangeAndClearError = (eOrName, maybeValue) => {
    // Supports both onChange(e) and programmatic set: handleChangeAndClearError('field', value)
    if (eOrName && eOrName.target) {
      const { name, value, type } = eOrName.target
      setFormData((prev) => ({
        ...prev,
        // For inputs type="number" store as string to avoid forcing NaN or concatenating zeros
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

  // optional: simple version if sometimes you just want to set without touching errors
  const handleChange = (e) => {
    const target = e.target
    const name = target.name
    let value = target.value
    // Solo transforma números si realmente es <input type="number">
    if (target.tagName === 'INPUT' && target.type === 'number') {
      value = String(value)
    }
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Shipping - Address Handlers
  const { updateAddress, addAddress, removeAddress, toggleShipping } = useShippingAddresses(
    formData,
    setFormData
  )
  // end Shipping - Address Handlers

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
    // Si ya tenemos el número de orden, lo usamos en el título
    if (formData?.orderId) {
      setTitle(`${t('order.editTitle')} – ${formData.orderId}`)
    } else {
      // Mientras no cargue, dejamos el título base
      setTitle(t('order.editTitle'))
    }

    setShowSplitButton(false)

    return () => {
      setTitle('Haro Mobile')
      setShowSplitButton(true)
    }
  }, [formData?.orderId, t])

  // Initial load: order + glazes (in a single effect)
  useEffect(() => {
    let alive = true // prevents setState if the component unmounts

    ;(async () => {
      try {
        const [order, glz] = await Promise.all([getOrderById(id), getAllGlazes({ navigate })])

        if (!alive) return

        // 1) Glazes
        setGlazes(glz)

        // 2) Products (for the cart)
        setProducts(order.products || [])
        // console.log('EDIT > raw order from API:', JSON.stringify(order.shipping, null, 2))
        // 3) Base form with shipping.addresses inside
        setFormData({
          orderId: order.orderID,
          name: order.customer?.name || '',
          lastName: order.customer?.lastName || '',
          phone: order.customer?.phone || '',
          countryCode: order.customer?.countryCode || '+52',
          email: order.customer?.email || '',
          orderDate: order.orderDate?.slice(0, 10) || '',
          deliverDate: order.deliverDate?.slice(0, 10) || '',
          deposit: String(order.deposit ?? ''), // keep as string in UI
          shipping: {
            isRequired: !!(order.shipping?.isRequired || order.shipping?.active),
            addresses: (order.shipping?.addresses || order.addresses || [])
              .map((a) => ({
                // keep subdoc _id only; DO NOT add "id"
                _id: a?._id ? String(a._id) : undefined,
                street: (a?.street || a?.address || '').trim(),
                city: (a?.city || '').trim(),
                state: (a?.state || '').trim(),
                zip: String(a?.zip || '')
                  .replace(/\D+/g, '')
                  .slice(0, 5),
                country: (a?.country || 'Mexico').trim(),
                phone: String(a?.phone || '')
                  .replace(/\D+/g, '')
                  .slice(0, 10),
                reference: (a?.reference || '').trim(),
                countryCode: (a?.countryCode || '+52').trim(),
                name: (a?.name || '').trim(),
              }))
              // keep only rows that are not totally empty (optional)
              .filter((a) => a.street || a.city || a.phone || a.name),
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
    setTab(TABS.PRODUCT) // takes you to the product tab when editing
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

    const uiProduct = {
      ...normalizeProductForm(pForm, glazeMap),
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
  } // end addOrSaveProduct
  // End validation and product helpers

  // Save All
  const saveAll = async (e) => {
    e?.preventDefault?.()

    // 1) If there’s a product being edited, validate and merge it into the array first.
    let workingProducts = products
    if (isEditingProduct) {
      const eProd = pValidate()
      if (Object.keys(eProd).length) {
        setPErrors(eProd)
        showError(t('errors.product.fixBeforeSave') || 'Please fix product errors before saving.')
        setTab(TABS.PRODUCT)
        return
      }

      const uiProduct = {
        ...normalizeProductForm(pForm, glazeMap),
        ...(products[editingIndex]?._id ? { _id: products[editingIndex]._id } : {}),
      }

      workingProducts = products.map((p, i) => (i === editingIndex ? uiProduct : p))
      setProducts(workingProducts)
      setEditingIndex(null)
    }

    // 2) Require at least one product
    if (!workingProducts.length) {
      showError(t('errors.order.missingProduct') || 'Add at least one product.')
      setTab(TABS.PRODUCT)
      return
    }

    // 3) Upload images if needed
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

      // 4) Map to API products with glaze guards
      const glazesLoaded = Array.isArray(glazes) && glazes.length > 0
      const finalProducts = uploaded.map((p) => toProductPayload(p, glazes, { glazesLoaded }))

      // 5) Build the final payload using the unified builder (no cleanAddresses, no manual shape)
      const draft = {
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
        deposit: formData.deposit, // empty string will be omitted by buildOrderPayload
        shipping: formData.shipping, // must be { isRequired, addresses }
        status: formData.status,
        notes: formData.notes,
        products: finalProducts,
      }

      // console.log('EDIT > shipping draft =', JSON.stringify(formData.shipping, null, 2))
      // console.log('[EDIT] form.shipping len =', (formData?.shipping?.addresses || []).length)

      const payload = buildOrderPayload(draft, {
        allGlazes: glazes,
        glazesLoaded,
        quick: false,
      })

      // console.log('[EDIT] payload keys =', Object.keys(payload))
      // console.log(
      //   '[EDIT] payload.shipping isRequired/len =',
      //   !!payload?.shipping?.isRequired,
      //   Array.isArray(payload?.shipping?.addresses) ? payload.shipping.addresses.length : 'NA'
      // )
      // console.log(
      //   '[EDIT] root addresses present? =',
      //   'addresses' in payload,
      //   Array.isArray(payload.addresses) ? payload.addresses.length : payload.addresses
      // )

      // const routeState = { draft: payload, from: '/orders/new' }

      // 6) Save to backend
      await updateOrderById(id, payload)

      if (toastId) dismissToast(toastId)
      if (shouldUpload) showSuccess('success.image.uploaded')
      showSuccess('success.order.updated')

      navigate(originPath || `/orders/${id}`)
    } catch (err) {
      console.error(err)
      if (toastId) dismissToast(toastId)
      const apiMsg = getApiMessage
        ? getApiMessage(err, 'error.updatingOrder')
        : err?.response?.data?.message || 'error.updatingOrder'
      showError(apiMsg)
    }
  } // end saveAll

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

            {/* ───────── Customer Info (your current section) ───────── */}
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
                                ref={socialInputRef}
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
                                  socialInputRef.current?.focus()
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
                <section className="mt-5 rounded-xl border border-neutral-200/70 bg-white shadow-sm ring-1 ring-black/5 dark:border-neutral-700 dark:bg-neutral-900/60 dark:ring-white/5">
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
                          value={formData.status || 'new'}
                          onChange={(e) => {
                            const v = e.target.value
                            console.log('[status:onChange] raw =', v, 'typeof =', typeof v)
                            // set it directly so no hay duda:
                            setFormData((prev) => ({ ...prev, status: v }))
                          }}
                          className="h-11 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm dark:border-neutral-700 dark:bg-neutral-800 dark:text-white"
                        >
                          <option value="new">{t('status.new')}</option>
                          {/* <option value="pending">{t('status.pending')}</option> */}
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
                        checked={!!formData.shipping?.isRequired}
                        onChange={toggleShipping}
                        className={`${!!formData.shipping?.isRequired ? 'bg-green-500' : 'bg-neutral-300 dark:bg-neutral-700'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200`}
                      >
                        <span
                          className={`${!!formData.shipping?.isRequired ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                        />
                      </Switch>
                    </div>

                    {/* Addresses (conditional) */}
                    {!!formData.shipping?.isRequired && (
                      <FormAddress
                        addresses={formData.shipping?.addresses}
                        onAdd={addAddress}
                        onRemove={removeAddress}
                        onChange={updateAddress}
                        errors={errors.addresses || []}
                        errorFormatter={t}
                        shippingAddress={t('order.shippingAddress')}
                        addButton={t('order.addAddress')}
                        addressInputTexts={{
                          street: t('order.street'),
                          city: t('order.city'),
                          state: t('order.state'),
                          zip: t('order.zip'),
                          country: t('order.country'),
                          phone: t('order.phoneShipping'),
                          reference: t('order.reference'),
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

            {/* ───────── Product Info (inline form) ───────── */}
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
                        <div className="mt-1 flex items-center gap-3 rounded-lg border border-neutral-300 dark:border-neutral-700">
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
                      <div className="flex items-center gap-3 rounded-lg border border-neutral-300 dark:border-neutral-700">
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
                            glazeMap={glazeMap}
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
                          glazeMap={glazeMap}
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

          {/* ───────── Cart (right, sticky on desktop) ───────── */}
          <aside className="lg:sticky lg:top-4 lg:h-fit">
            <AddedProductsCart
              products={products}
              onEdit={startEditProduct}
              onRemove={removeProduct}
              deposit={formData?.deposit}
              t={t}
            />
            {/* ───────── Actions (save / cancel with originPath) ───────── */}
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
          </aside>
        </div>
      </form>
    </div>
  )
}
