// src/pages/orders/NewOrder.jsx
import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import FormInput from '../../components/FormInput'
import FormActions from '../../components/FormActions'
import FormAddress from '../../components/FormAddress'
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Switch,
} from '@headlessui/react'
import { Instagram, Facebook, Plus } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { getMessage as t } from '../../utils/getMessage'

// Edit Mode Variables
const isEditBase = location.state?.mode === 'editBase'
const returnTo = location.state?.returnTo
const existingProducts = location.state?.products || []

// Helpers para mapear el draft (location.state) -> formData aplanado
const splitName = (full = '') => {
  const parts = full.trim().split(/\s+/)
  const name = parts.shift() || ''
  const lastName = parts.join(' ') || ''
  return { name, lastName }
}

const parsePhone = (raw = '') => {
  // Espera "+52XXXXXXXXXX" → countryCode="+52", phone="XXXXXXXXXX"
  const m = raw.match(/^(\+\d{1,3})(\d{6,15})$/)
  if (m) return { countryCode: m[1], phone: m[2] }
  return { countryCode: '+52', phone: '' }
}

export default function NewOrder() {
  const navigate = useNavigate()
  const location = useLocation()

  const originPathRef = useRef(
    location.state?.originPath ??
      location.state?.from ?? // compat si algo viejo manda `from`
      '/orders' // fallback
  )

  const [errors, setErrors] = useState({})

  const [formData, setFormData] = useState({
    // Basic data
    name: '',
    lastName: '',
    phone: '',
    countryCode: '+52',
    email: '',
    // Social media
    socialMedia: {
      instagram: '',
      facebook: '',
    },
    // Dates and status
    orderDate: '',
    deliverDate: '',
    status: 'New',
    // Payment
    deposit: '',
    // Shipping
    shipping: false,
    addresses: [],
    // Notes
    notes: '',
  })

  // Social media input states
  const [socialInput, setSocialInput] = useState('')
  const [currentSocialType, setCurrentSocialType] = useState('instagram')

  const socialOptions = [
    { type: 'instagram', label: 'Instagram', icon: Instagram },
    { type: 'facebook', label: 'Facebook', icon: Facebook },
  ]

  const getSocialIcon = (type) =>
    socialOptions.find((o) => o.type === type)?.icon || Instagram

  const setTypeAndPrefill = (type) => {
    setCurrentSocialType(type)
    setSocialInput(formData.socialMedia?.[type] || '')
  }

  // General input handler
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Shipping toggle
  const handleToggleShipping = () => {
    setFormData((prev) => ({
      ...prev,
      shipping: !prev.shipping,
      addresses: !prev.shipping
        ? [{ address: '', city: '', zip: '', phone: '' }]
        : [],
    }))
  }

  // Add or update social media manually
  const addOrUpdateSocial = () => {
    const val = socialInput.trim()
    if (!val) return

    // Minimal validation
    if (currentSocialType === 'instagram' && !val.startsWith('@')) {
      toast.error(t('validation.instagramFormat'))
      return
    }
    if (currentSocialType === 'facebook' && !val.startsWith('/')) {
      // We can use http for full address later
      toast.error(t('validation.facebookFormat'))
      return
    }

    setFormData((prev) => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [currentSocialType]: val,
      },
    }))
    setSocialInput('')
  }

  const removeSocial = (type) => {
    setFormData((prev) => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [type]: '',
      },
    }))
    if (type === currentSocialType) setSocialInput('')
  }

  // Address handlers
  const emptyAddress = { address: '', city: '', zip: '', phone: '' }

  const addAddress = () => {
    const last = formData.addresses.at(-1)
    const isIncomplete =
      last && (!last.address || !last.city || !last.zip || !last.phone)

    if (isIncomplete) {
      toast.error(t('validation.incompleteAddressBeforeAdding'))
      return
    }

    setFormData((prev) => ({
      ...prev,
      addresses: [...(prev.addresses || []), { ...emptyAddress }],
    }))
  }

  const updateAddress = (index, field, value) => {
    setFormData((prev) => {
      const updated = [...prev.addresses]
      updated[index] = { ...updated[index], [field]: value }
      return { ...prev, addresses: updated }
    })
  }

  const removeAddress = (index) => {
    setFormData((prev) => {
      const updated = [...prev.addresses]
      updated.splice(index, 1)
      return { ...prev, addresses: updated }
    })
  }

  // Prefill desde location.state (draft/baseOrder) -> formData
  useEffect(() => {
    if (!location.state) return

    const draft = location.state
    const { name, lastName } = splitName(draft.customer?.name || '')
    const { countryCode, phone } = parsePhone(draft.customer?.phone || '')

    setFormData((prev) => ({
      ...prev,
      // Customer
      name,
      lastName,
      countryCode,
      phone,
      email: draft.customer?.email || '',
      socialMedia: draft.customer?.socialMedia || prev.socialMedia,
      // Dates & status
      orderDate: draft.orderDate || '',
      deliverDate: draft.deliverDate || '',
      status: draft.status || prev.status,
      deposit: draft.deposit ?? prev.deposit,
      // Shipping
      shipping: Boolean(draft.shipping?.isRequired),
      addresses: draft.shipping?.addresses || [],
      // Notes
      notes: draft.notes || '',
    }))
  }, [location.state])

  // Camino único: Validar + armar baseOrder + navegar
  const handleContinue = () => {
    setErrors({})
    const newErrors = {}

    // Merge social input if pending
    const socialMedia = { ...formData.socialMedia }
    if (socialInput.trim()) {
      socialMedia[currentSocialType] = socialInput.trim()
    }

    // Required fields
    if (!formData.name) newErrors.name = 'errors.customer.missingName'
    if (!formData.lastName)
      newErrors.lastName = 'errors.customer.missingLastName'
    // if (!formData.phone) newErrors.phone = 'validation.requiredFields'
    if (!formData.status) newErrors.status = 'validation.requiredFields'
    if (!formData.orderDate) newErrors.orderDate = 'errors.order.missingDate'

    // Date validation
    if (
      formData.deliverDate &&
      formData.orderDate &&
      formData.deliverDate < formData.orderDate
    ) {
      newErrors.deliverDate = 'validation.invalidDeliveryDate'
      toast.error(t('validation.invalidDeliveryDate'))
    }

    // Phone format
    if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
      newErrors.phone = 'errors.user.invalidPhone'
    }

    // Email format (optional but must be valid)
    if (
      formData.email &&
      !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email)
    ) {
      newErrors.email = 'errors.user.invalidEmail'
    }

    // Shipping addresses validation (if shipping)
    if (formData.shipping) {
      const addressErrors = formData.addresses.map((addr) => {
        const err = {}
        if (!addr.address) err.address = 'validation.addressRequired'
        if (!addr.city) err.city = 'validation.cityRequired'
        if (!addr.zip) err.zip = 'validation.zipRequired'
        if (!addr.phone) err.phone = 'validation.phoneRequired'
        return err
      })

      const hasErrors = addressErrors.some((e) =>
        Object.values(e).some(Boolean)
      )

      if (hasErrors) {
        const formatted = addressErrors.map((e) => {
          const formattedObj = {}
          for (const key in e) {
            formattedObj[key] = t(e[key])
          }
          return formattedObj
        })

        setErrors((prev) => ({ ...prev, addresses: formatted }))
        toast.error(t('validation.incompleteShipping'))
        return
      }
    }

    // If any error, show'em
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      toast.error(t('validation.requiredFields'))
      return
    }

    // Build baseOrder (draft) for AddProduct
    const baseOrder = {
      orderDate: formData.orderDate,
      deliverDate: formData.deliverDate,
      status: formData.status,
      deposit: Number(formData.deposit || 0),
      notes: formData.notes,
      shipping: {
        isRequired: formData.shipping,
        addresses: formData.shipping ? formData.addresses : [],
      },
      customer: {
        name: `${formData.name} ${formData.lastName}`.trim(),
        phone: formData.phone ? `${formData.countryCode}${formData.phone}` : '',
        email: formData.email,
        socialMedia,
      },
      originPath: originPathRef.current, // IMPORTANT: from location, this is the origin page where we came from
      from: '/orders/new', // OPTIONAL
    }

    // AddProduct Route
    navigate('/orders/new/products', {
      state: {
        ...baseOrder,
        from: '/orders/new', // 👈 para que AddProduct cancele SIEMPRE a NewOrder
      },
    })
  }

  return (
    <div className="min-h-screen pb-24 bg-white dark:bg-neutral-900 dark:text-gray-100">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleContinue()
        }}
        className="max-w-2xl mx-auto px-4 pt-6 space-y-6"
      >
        <h1 className="text-center mb-8 text-xl font-semibold">New Order</h1>

        {/* Name + Lastname */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormInput
            label="First Name"
            name="name"
            value={formData.name}
            onChange={(e) => {
              handleChange(e)
              setErrors((prev) => ({ ...prev, name: null }))
            }}
            error={errors.name}
            errorFormatter={t}
          />
          <FormInput
            label="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={(e) => {
              handleChange(e)
              setErrors((prev) => ({ ...prev, lastName: null }))
            }}
            error={errors.lastName}
            errorFormatter={t}
          />
        </div>

        {/* More info */}
        <div className="rounded border p-4 dark:border-neutral-700">
          <p className="mb-3 text-sm font-medium text-gray-800 dark:text-gray-200">
            More details
          </p>

          {/* Phone & email */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex gap-2">
              <select
                name="countryCode"
                value={formData.countryCode}
                onChange={handleChange}
                className="w-20 border rounded dark:bg-neutral-800 dark:border-gray-700"
              >
                <option value="+52">+52</option>
                <option value="+1">+1</option>
                <option value="+54">+54</option>
              </select>
              <FormInput
                label="Phone"
                name="phone"
                type="tel"
                pattern="\d{10}"
                maxLength={10}
                value={formData.phone}
                onChange={(e) => {
                  handleChange(e)
                  setErrors((prev) => ({ ...prev, phone: null }))
                }}
                error={errors.phone}
                errorFormatter={t}
              />
            </div>

            <FormInput
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={(e) => {
                handleChange(e)
                setErrors((prev) => ({ ...prev, email: null }))
              }}
              error={errors.email}
              errorFormatter={t}
            />
          </div>

          {/* Social media */}
          <div className="mt-4">
            <label className="block mb-1 text-sm font-medium text-gray-800 dark:text-gray-200">
              Social Media
            </label>

            <div className="flex gap-2 mb-2">
              <Menu as="div" className="relative">
                <MenuButton className="flex items-center justify-center w-6 h-10 border rounded dark:border-gray-600 dark:bg-neutral-800">
                  {(() => {
                    const Icon = getSocialIcon(currentSocialType)
                    return <Icon size={24} />
                  })()}
                </MenuButton>

                <MenuItems className="absolute z-10 mt-1 w-36 bg-white border rounded shadow dark:bg-neutral-800 dark:border-gray-700">
                  {socialOptions.map((opt) => (
                    <MenuItem
                      as="button"
                      type="button"
                      key={opt.type}
                      onClick={() => setTypeAndPrefill(opt.type)}
                      className={({ focus }) =>
                        `flex items-center gap-2 px-2 py-1 w-full text-left ${
                          focus ? 'bg-gray-100 dark:bg-neutral-700' : ''
                        }`
                      }
                    >
                      <opt.icon size={16} />
                      {opt.label}
                    </MenuItem>
                  ))}
                </MenuItems>
              </Menu>

              {/* Social input */}
              <input
                type="text"
                placeholder={
                  currentSocialType === 'instagram' ? '@username' : '/username'
                }
                value={socialInput}
                onChange={(e) => setSocialInput(e.target.value)}
                onKeyDown={(e) =>
                  e.key === 'Enter' && (e.preventDefault(), addOrUpdateSocial())
                }
                className="flex-1 h-10 px-3 text-sm border rounded dark:bg-neutral-800 dark:text-white dark:border-gray-600"
              />

              {/* Add button */}
              <button
                type="button"
                onClick={addOrUpdateSocial}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 dark:bg-neutral-700 dark:hover:bg-neutral-600 shrink-0"
                title="Add/Update"
              >
                <Plus size={16} />
              </button>
            </div>

            {/* Social chips */}
            <div className="flex flex-wrap gap-2">
              {['instagram', 'facebook'].map((type) => {
                const value = formData.socialMedia?.[type]
                if (!value) return null
                const Icon = getSocialIcon(type)
                return (
                  <span
                    key={type}
                    className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-100 rounded-full dark:bg-neutral-700"
                  >
                    <Icon size={14} />
                    {value}
                    <button
                      type="button"
                      className="text-xs underline"
                      onClick={() => {
                        setTypeAndPrefill(type)
                        setTimeout(() => {
                          document
                            .querySelector(
                              'input[placeholder="@username"], input[placeholder^="URL"]'
                            )
                            ?.focus()
                        }, 0)
                      }}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => removeSocial(type)}
                      className="text-xs text-red-600 hover:underline"
                    >
                      ×
                    </button>
                  </span>
                )
              })}
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-800 dark:text-gray-200">
              Order date
            </label>
            <input
              type="date"
              name="orderDate"
              value={formData.orderDate}
              onChange={(e) => {
                handleChange(e)
                setErrors((prev) => ({ ...prev, orderDate: null }))
              }}
              className={`w-full h-10 px-3 py-3 text-sm border rounded dark:bg-neutral-800 dark:text-white dark:border-gray-600
                ${errors.orderDate ? 'border-red-500' : ''}
              `}
            />
            {errors.orderDate && (
              <p className="text-red-500 text-sm mt-1">{t(errors.orderDate)}</p>
            )}
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-800 dark:text-gray-200">
              Delivery date
            </label>
            <input
              type="date"
              name="deliverDate"
              value={formData.deliverDate}
              onChange={(e) => {
                handleChange(e)
                setErrors((prev) => ({ ...prev, deliverDate: null }))
              }}
              className={`w-full h-10 px-3 py-3 text-sm border rounded dark:bg-neutral-800 dark:text-white dark:border-gray-600
                ${errors.deliverDate ? 'border-red-500' : ''}
              `}
            />
            {errors.deliverDate && (
              <p className="text-red-500 text-sm mt-1">
                {t(errors.deliverDate)}
              </p>
            )}
          </div>
        </div>

        {/* Status & deposit */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-800 dark:text-gray-200">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full h-10 px-3 py-3 text-sm border rounded dark:bg-neutral-800 dark:text-white dark:border-gray-600"
            >
              <option value="New">New</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <FormInput
              label="Deposit"
              name="deposit"
              type="number"
              value={formData.deposit}
              onChange={(e) => {
                handleChange(e)
                setErrors((prev) => ({ ...prev, deposit: null }))
              }}
              prefix="$"
              min={0}
              step="0.01"
              placeholder="0.00"
              error={errors.deposit}
              errorFormatter={t}
              floating={false}
            />
          </div>
        </div>

        {/* Shipping toggle */}
        <div className="flex flex-col items-center gap-2">
          <label className="text-sm font-medium text-gray-800 dark:text-gray-200">
            {t('forms.product.buttons.shipping')}
          </label>
          <Switch
            checked={formData.shipping}
            onChange={handleToggleShipping}
            className={`${
              formData.shipping ? 'bg-green-500' : 'bg-gray-300'
            } inline-flex relative w-11 h-6 items-center rounded-full transition-colors duration-200`}
          >
            <span
              className={`${
                formData.shipping ? 'translate-x-6' : 'translate-x-1'
              } inline-block w-4 h-4 transform rounded-full bg-white transition-transform`}
            />
          </Switch>
        </div>

        {/* Addresses */}
        {formData.shipping && (
          <FormAddress
            addresses={formData.addresses}
            onAdd={addAddress}
            onRemove={removeAddress}
            onChange={updateAddress}
            errors={errors.addresses || []}
          />
        )}

        {/* Notes */}
        <FormInput
          label="Notes"
          name="notes"
          value={formData.notes}
          onChange={(e) => {
            handleChange(e)
            setErrors((prev) => ({ ...prev, notes: null }))
          }}
          maxLength={200}
          error={errors.notes}
          errorFormatter={t}
        />
        <p className="-mt-4 text-right text-xs text-gray-400">
          {formData.notes.length}/200
        </p>

        {/* Actions */}
        <FormActions
          onSubmit={isEditBase ? handleSaveBaseEdits : handleContinue}
          submitButtonText={
            isEditBase
              ? t('formActions.saveChanges')
              : t('labels.order.addProduct')
          }
          cancelButtonText={t('formActions.cancel')}
          confirmTitle={t('formActions.confirmTitle')}
          confirmMessage={t('formActions.confirmMessage')}
          confirmText={t('formActions.confirmText')}
          cancelText={t('formActions.cancelText')}
          // Cancel: en edición vuelve a OrderConfirmation; en flujo normal, al origen
          cancelRedirect={
            isEditBase
              ? returnTo || '/orders/confirmation'
              : originPathRef.current
          }
          cancelState={isEditBase ? location.state : undefined}
        />
      </form>
    </div>
  )
}
