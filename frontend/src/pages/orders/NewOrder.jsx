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
import {
  prefillFormFromDraft,
  validateBaseForm,
  buildBaseOrder,
} from '../../utils/orderBuilder'

export default function NewOrder() {
  const navigate = useNavigate()
  const location = useLocation()

  // Edit Mode Variables
  const isEditBase = location.state?.mode === 'editBase'
  const returnTo = location.state?.returnTo
  const originPath =
    location.state?.originPath ?? location.state?.from ?? '/orders'
  const existingProducts = location.state?.products || []
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
    const filled = prefillFormFromDraft(location.state)
    setFormData((prev) => ({ ...prev, ...filled }))
  }, [location.state])

  // Camino único: Validar + armar baseOrder + navegar
  const handleBaseSubmit = (e) => {
    e.preventDefault()
    setErrors({})

    const errs = validateBaseForm(formData)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      toast.error(t('validation.requiredFields'))
      if (errs.deliverDate) toast.error(t('validation.invalidDeliveryDate'))
      if (errs.addresses) toast.error(t('validation.incompleteShipping'))
      return
    }

    const baseOrder = buildBaseOrder(formData, {
      socialInput,
      currentSocialType,
    })

    if (isEditBase) {
      const updatedOrder = {
        ...location.state,
        ...baseOrder,
        products: existingProducts,
      }

      navigate(returnTo || '/orders/confirmation', {
        state: updatedOrder,
        replace: true,
      })
    } else {
      navigate('/orders/new/products', {
        state: {
          ...baseOrder,
          originPath,
          from: '/orders/new',
        },
      })
    }
  } // end handleBaseSubmit

  return (
    <div className="min-h-screen pb-24 bg-white dark:bg-neutral-900 dark:text-gray-100">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          handleContinue()
        }}
        className="max-w-2xl mx-auto px-4 pt-6 space-y-6"
      >
        <h1 className="text-center mb-8 text-xl font-semibold">
          {isEditBase ? t('titles.editOrder') : t('titles.newOrder')}
        </h1>

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
          <FormInput
            type="date"
            name="orderDate"
            label="Order date"
            placeholder="dd-mm-yyyy"
            value={formData.orderDate}
            onChange={(e) => {
              handleChange(e)
              setErrors((prev) => ({ ...prev, orderDate: null }))
            }}
            error={errors.orderDate}
            errorFormatter={t}
            icon="calendar"
            floating={false}
          />

          <FormInput
            type="date"
            name="deliverDate"
            label="Delivery date"
            placeholder="dd-mm-yyyy" //TODO to locale i18n
            value={formData.deliverDate}
            onChange={(e) => {
              handleChange(e)
              setErrors((prev) => ({ ...prev, deliverDate: null }))
            }}
            error={errors.deliverDate}
            errorFormatter={t}
            icon="calendar"
            floating={false}
          />
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
              step="0.00"
              placeholder="0.00"
              error={errors.deposit}
              errorFormatter={t}
              floating={false}
              onWheel={(e) => e.target.blur()} // Remove focus when using mousewheel
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
          onSubmit={handleBaseSubmit}
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
            isEditBase ? returnTo || '/orders/confirmation' : originPath
          }
          cancelState={isEditBase ? location.state : undefined}
        />
      </form>
    </div>
  )
}
