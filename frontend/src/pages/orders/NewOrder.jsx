// src/pages/orders/NewOrder.jsx
import { Menu, MenuButton, MenuItem, MenuItems, Switch } from '@headlessui/react'
import { Instagram, Facebook, Plus, ChevronDown } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

import FormActions from '../../components/FormActions'
import FormAddress from '../../components/FormAddress'
import FormInput from '../../components/FormInput'
import { useLayout } from '../../context/LayoutContext'
import { useShippingAddresses } from '../../hooks/useShippingAddresses'
import { normalizeBaseOrder } from '../../utils/mappers/baseOrder'
import { getOriginPath } from '../../utils/navigationUtils'
import { prefillFormFromDraft, validateBaseForm, buildBaseOrder } from '../../utils/orderBuilder'
import { showSuccess, showError } from '../../utils/toastUtils'
import { getMessage as t } from '../../utils/getMessage'

export default function NewOrder() {
  const navigate = useNavigate()
  const location = useLocation()
  const { setTitle, setShowSplitButton, resetLayout } = useLayout()
  const socialInputRef = useRef(null)
  //console.log('location.state:', location.state) //CONSOLE LOG LOCATION STATE

  // Edit Mode Variables
  const isEditBase = location.state?.mode === 'editBase'
  const existingProducts = location.state?.products || []
  const returnTo = location.state?.returnTo

  const originPath = getOriginPath(location.state?.originPath ?? location.state?.from)

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
    status: 'new',
    // Payment
    deposit: '',
    // Shipping
    shipping: { isRequired: false, addresses: [] },
    // Notes
    notes: '',
  })

  // // after formData state init
  // useEffect(() => {
  //   if (!formData.orderDate) {
  //     const today = new Date().toISOString().slice(0, 10)
  //     setFormData((prev) => ({ ...prev, orderDate: today }))
  //   }
  //   // run once on mount
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [])

  // TITLE AND SPLITACTION BUTTON
  useEffect(() => {
    setTitle(isEditBase ? t('order.editTitle') : t('order.newTitle'))
    setShowSplitButton(true)

    return resetLayout
  }, [isEditBase, setTitle, setShowSplitButton, resetLayout, t])

  // Social media input states
  const [socialInput, setSocialInput] = useState('')
  const [currentSocialType, setCurrentSocialType] = useState('instagram')
  const socialOptions = [
    { type: 'instagram', label: 'Instagram', icon: Instagram },
    { type: 'facebook', label: 'Facebook', icon: Facebook },
  ]

  const getSocialIcon = (type) => socialOptions.find((o) => o.type === type)?.icon || Instagram

  const setTypeAndPrefill = (type) => {
    setCurrentSocialType(type)
    setSocialInput(formData.socialMedia?.[type] || '')
  }

  // Add or update social media manually
  const addOrUpdateSocial = () => {
    const val = socialInput.trim()
    if (!val) return

    // Minimal validation
    if (currentSocialType === 'instagram' && !val.startsWith('@')) {
      showError('validation.instagramFormat')
      return
    }
    if (currentSocialType === 'facebook' && !val.startsWith('/')) {
      // We can use http for full address later
      showError('validation.facebookFormat')
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
    showSuccess('success.order.socialAdded')
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

  // Address and Shipping handlers
  const emptyAddress = {
    street: '',
    city: '',
    state: '',
    zip: '',
    country: 'Mexico',
    phone: '',
    reference: '',
  }

  const { updateAddress, addAddress, removeAddress, toggleShipping } = useShippingAddresses(
    formData,
    setFormData
  )

  // Prefill from location.state (draft/baseOrder) -> formData
  useEffect(() => {
    if (!location.state) return
    const filled = prefillFormFromDraft(location.state)
    setFormData((prev) => normalizeBaseOrder({ ...prev, ...filled }))
  }, [location.state])

  // Single flow: validate, build baseOrder, then navigate
  const handleBaseSubmit = (e) => {
    e.preventDefault()
    setErrors({})

    // 1) Validate required fields
    const normalized = normalizeBaseOrder(formData)
    const errs = validateBaseForm(normalized)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      showError('validation.requiredFields')
      if (errs.deliverDate) showError('validation.invalidDeliveryDate')
      if (errs.addresses) showError('validation.incompleteShipping')
      return
    }

    // 2) Build the draft order from the current form state
    const baseOrder = buildBaseOrder(normalized, { socialInput, currentSocialType })

    // 3) Normalize dates: remove empty strings to avoid sending invalid values
    if (!baseOrder.deliverDate) delete baseOrder.deliverDate
    if (!baseOrder.orderDate) delete baseOrder.orderDate

    // 4) Branch by mode: edit base vs. create new
    if (isEditBase) {
      // Merge edited base with existing products and any prior state
      const updatedOrder = {
        ...location.state,
        ...baseOrder,
        products: existingProducts,
      }

      showSuccess('success.order.updated')

      // Go back to the caller (or confirmation) replacing history
      navigate(returnTo || '/orders/confirmation', {
        state: updatedOrder,
        replace: true,
      })
      return
    }

    // 5) New order base created: go to products step
    showSuccess('success.order.baseCreated')

    navigate('/orders/new/products', {
      state: {
        ...baseOrder,
        originPath,
        from: '/orders/new',
      },
    })
  }
  // end handleBaseSubmit

  const handleChangeAndClearError = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: null }))
  }

  return (
    <div className="h-full min-h-0 rounded-xl bg-white text-black dark:bg-neutral-900 dark:text-gray-100">
      <form
        onSubmit={handleBaseSubmit}
        className="mx-auto mb-[var(--bottom-bar-h)] max-w-2xl space-y-6 px-4 py-6 sm:mb-2"
      >
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
                  onChange={handleChangeAndClearError}
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
                  onChange={handleChangeAndClearError}
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
                  {t('order.shippingHint') || 'Enable to add one or more shipping addresses.'}
                </p>
              </div>
              <Switch
                checked={!!formData.shipping?.isRequired}
                onChange={toggleShipping}
                className={`${formData.shipping?.isRequired ? 'bg-green-500' : 'bg-neutral-300 dark:bg-neutral-700'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200`}
              >
                <span
                  className={`${formData.shipping?.isRequired ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                />
              </Switch>
            </div>

            {/* Addresses (conditional) */}
            {formData.shipping?.isRequired && (
              <FormAddress
                addresses={formData.shipping.addresses}
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
        </section>

        {/* ───────────────────────────── Actions ─────────────────────────────── */}
        <FormActions
          onSubmit={handleBaseSubmit}
          submitButtonText={isEditBase ? t('formActions.saveChanges') : t('button.addProduct')}
          cancelButtonText={t('formActions.cancel')}
          confirmTitle={
            isEditBase ? t('formActionsEdit.confirmTitle') : t('formActionsCreate.confirmTitle')
          }
          confirmMessage={
            isEditBase ? t('formActionsEdit.confirmMessage') : t('formActionsCreate.confirmMessage')
          }
          confirmText={t('formActions.confirmText')}
          cancelText={t('formActions.cancelText')}
          cancelRedirect={isEditBase ? returnTo || '/orders/confirmation' : originPath}
          cancelState={isEditBase ? location.state : undefined}
        />
      </form>
    </div>
  )
}
