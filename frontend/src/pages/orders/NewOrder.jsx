import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import FormInput from '../../components/FormInput'
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Switch,
} from '@headlessui/react'
import { Instagram, Facebook, Plus } from 'lucide-react'
import ConfirmModal from '../../components/ConfirmModal'

export default function NewOrder() {
  const navigate = useNavigate()
  const location = useLocation()
  const prevLocation = location.state?.from

  const [isCancelOpen, setIsCancelOpen] = useState(false)

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
      alert('Instagram must start with @')
      return
    }
    if (currentSocialType === 'facebook' && !val.startsWith('http')) {
      alert('Facebook must be a valid URL')
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
  const addAddress = () => {
    if (formData.addresses.length > 0) {
      const last = formData.addresses[formData.addresses.length - 1]
      if (!last.address || !last.city || !last.zip || !last.phone) {
        alert('Complete the current address before adding another one')
        return
      }
    }
    setFormData((prev) => ({
      ...prev,
      addresses: [
        ...(prev.addresses || []),
        { address: '', city: '', zip: '', phone: '' },
      ],
    }))
  }

  const updateAddress = (index, field, value) => {
    setFormData((prev) => {
      const addresses = [...prev.addresses]
      addresses[index] = { ...addresses[index], [field]: value }
      return { ...prev, addresses }
    })
  }

  const removeAddress = (index) => {
    setFormData((prev) => {
      const addresses = [...prev.addresses]
      addresses.splice(index, 1)
      return { ...prev, addresses }
    })
  }

  // Submit handler
  const handleSubmit = (e) => {
    e.preventDefault()

    // Build a merged socialMedia object with pending input (if any)
    const socialMedia = { ...formData.socialMedia }
    if (socialInput.trim()) {
      socialMedia[currentSocialType] = socialInput.trim()
    }

    // Basic validations
    if (
      !formData.name ||
      !formData.lastName ||
      !formData.status ||
      !formData.orderDate
    ) {
      alert('Please complete all required fields')
      return
    }

    // Dates validation
    if (
      formData.deliverDate &&
      formData.orderDate &&
      formData.deliverDate < formData.orderDate
    ) {
      alert('Delivery date cannot be earlier than order date')
      return
    }

    // Address validation (if shipping is required)
    if (formData.shipping) {
      if (!formData.addresses || formData.addresses.length === 0) {
        alert('Please add at least one shipping address')
        return
      }
      const hasEmpty = formData.addresses.some(
        (a) => !a.address || !a.city || !a.zip || !a.phone
      )
      if (hasEmpty) {
        alert('Complete all the shipping address fields')
        return
      }
    }

    // Final clean data to send
    const cleanData = {
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
    }

    // Go to next step with state
    navigate('/orders/new/products', { state: cleanData })
    console.log(cleanData)
  }

  return (
    <div className="min-h-screen pb-24 bg-white dark:bg-neutral-900 dark:text-gray-100">
      <form
        onSubmit={handleSubmit}
        className="max-w-2xl mx-auto px-4 pt-6 space-y-6"
      >
        <h1 className="text-center mb-8 text-xl font-semibold">New Order</h1>

        {/* Name + Lastname */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <FormInput
            label="First Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <FormInput
            label="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
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
                onChange={handleChange}
              />
            </div>

            <FormInput
              label="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
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
                  currentSocialType === 'instagram' ? '@username' : 'URL'
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
              onChange={handleChange}
              required
              className="w-full h-10 px-3 py-3 text-sm border rounded dark:bg-neutral-800 dark:text-white dark:border-gray-600"
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-800 dark:text-gray-200">
              Delivery date
            </label>
            <input
              type="date"
              name="deliverDate"
              value={formData.deliverDate}
              onChange={handleChange}
              className="w-full h-10 px-3 py-3 text-sm border rounded dark:bg-neutral-800 dark:text-white dark:border-gray-600"
            />
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
              required
            >
              <option value="New">New</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium text-gray-800 dark:text-gray-200">
              Deposit
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-sm text-gray-500">
                $
              </span>
              <input
                type="number"
                name="deposit"
                value={formData.deposit}
                onChange={handleChange}
                min={0}
                step="0.01"
                placeholder="0.00"
                className="w-full h-10 pl-7 pr-3 py-3 text-sm border rounded dark:bg-neutral-800 dark:text-white dark:border-gray-600"
              />
            </div>
          </div>
        </div>

        {/* Shipping toggle */}
        <div className="flex flex-col items-center gap-2">
          <label className="text-sm font-medium text-gray-800 dark:text-gray-200">
            Requires shipping?
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
          <div className="p-4 border rounded bg-gray-50 dark:bg-neutral-800 dark:border-neutral-700">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                Shipping address(es)
              </p>
              <button
                type="button"
                onClick={addAddress}
                className="px-2 py-1 text-sm border rounded hover:bg-gray-100 dark:hover:bg-neutral-700"
              >
                + Add address
              </button>
            </div>

            {formData.addresses.map((addr, idx) => (
              <div
                key={idx}
                className="mb-4 rounded border p-3 dark:border-neutral-700"
              >
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <div>
                    <label className="block mb-1 text-xs font-medium">
                      Address
                    </label>
                    <input
                      type="text"
                      value={addr.address}
                      onChange={(e) =>
                        updateAddress(idx, 'address', e.target.value)
                      }
                      className="w-full h-10 px-3 text-sm border rounded dark:bg-neutral-800 dark:text-white dark:border-gray-600"
                      placeholder="Street, number, neighborhood"
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-xs font-medium">
                      City
                    </label>
                    <input
                      type="text"
                      value={addr.city}
                      onChange={(e) =>
                        updateAddress(idx, 'city', e.target.value)
                      }
                      className="w-full h-10 px-3 text-sm border rounded dark:bg-neutral-800 dark:text-white dark:border-gray-600"
                      placeholder="City"
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-xs font-medium">
                      ZIP
                    </label>
                    <input
                      type="text"
                      value={addr.zip}
                      onChange={(e) =>
                        updateAddress(idx, 'zip', e.target.value)
                      }
                      className="w-full h-10 px-3 text-sm border rounded dark:bg-neutral-800 dark:text-white dark:border-gray-600"
                      placeholder="ZIP Code"
                      inputMode="numeric"
                      maxLength={10}
                      required
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-xs font-medium">
                      Phone (shipping)
                    </label>
                    <input
                      type="tel"
                      value={addr.phone}
                      onChange={(e) =>
                        updateAddress(idx, 'phone', e.target.value)
                      }
                      className="w-full h-10 px-3 text-sm border rounded dark:bg-neutral-800 dark:text-white dark:border-gray-600"
                      placeholder="10 digits"
                      pattern="\d{10}"
                      maxLength={10}
                      required
                    />
                  </div>
                </div>

                <div className="mt-3 flex justify-end">
                  <button
                    type="button"
                    onClick={() => removeAddress(idx)}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Notes */}
        <FormInput
          label="Notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          maxLength={200}
        />
        <p className="text-right text-xs text-gray-400">
          {formData.notes.length}/200
        </p>

        {/* Actions */}
        <div className="flex gap-4 pt-2">
          {/* Cancel */}
          <button
            type="button"
            onClick={() => setIsCancelOpen(true)}
            className="w-1/2 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-neutral-700 dark:text-gray-200 dark:hover:bg-neutral-600"
          >
            Cancel
          </button>

          {/* Confirm modal */}
          <ConfirmModal
            open={isCancelOpen}
            onClose={() => setIsCancelOpen(false)}
            onConfirm={() => {
              setIsCancelOpen(false)
              navigate(prevLocation || '/orders')
            }}
            title="Cancel new order?"
            message="You will lose all entered data if you exit now."
            confirmText="Yes, exit"
            cancelText="No, stay"
          />

          {/* Submit */}
          <button
            type="submit"
            className="w-1/2 py-2 rounded bg-black text-white hover:bg-neutral-800"
          >
            Create
          </button>
        </div>
      </form>
    </div>
  )
}
