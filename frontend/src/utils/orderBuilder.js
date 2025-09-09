// src/utils/orderBuilder.js
//Date Helpers
// Parse 'YYYY-MM-DD' (local) → Date | undefined
export function parseDateInput(s) {
  if (!s) return undefined
  if (s instanceof Date) return s // ya es Date
  if (typeof s !== 'string') {
    const d = new Date(s)
    return isNaN(d) ? undefined : d
  }
  const m = s.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!m) {
    const d = new Date(s)
    return isNaN(d) ? undefined : d
  }
  const [, yy, mm, dd] = m.map(Number)
  return new Date(yy, mm - 1, dd)
}

// Date | ISO | epoch → 'YYYY-MM-DD' (para value del input date)
export function toDateInputValue(val) {
  if (!val) return ''
  let d = val instanceof Date ? val : new Date(val)
  if (isNaN(d)) return ''
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

// Helpers to split full name ,parse phone number and clean empty shipping addresses
export function splitName(fullName = '') {
  const parts = fullName.trim().split(/\s+/)
  const name = parts[0] || ''
  const lastName = parts.slice(1).join(' ') || ''
  return { name, lastName }
}

export function parsePhone(fullPhone = '') {
  // Example formats: "+52XXXXXXXXXX" or "XXXXXXXXXX"
  const match = fullPhone.match(/^(\+\d{1,3})?(\d{10})$/)
  if (!match) return { countryCode: '+52', phone: '' }
  const countryCode = match[1] || '+52'
  const phone = match[2] || ''
  return { countryCode, phone }
}

// Normalize legacy/loose status values to lowercase enum
const LEGACY_STATUS_MAP = {
  New: 'new',
  Pending: 'pending',
  'In Progress': 'inProgress',
  Completed: 'completed',
  Cancelled: 'cancelled',
}
export function ensureStatus(s) {
  if (!s) return 'new'
  const mapped = LEGACY_STATUS_MAP[s]
  if (mapped) return mapped
  return String(s).toLowerCase()
}

// Keep only COMPLETE addresses (avoid half-filled entries)
export function cleanAddresses(addresses = []) {
  return addresses.filter((addr) => {
    const a = (addr?.address || '').trim()
    const c = (addr?.city || '').trim()
    const z = (addr?.zip || '').trim()
    const p = (addr?.phone || '').trim()
    return !!(a && c && z && p)
  })
}
/**
 * Generates initial form values from a draft (location.state).
 * Only sets the fields that exist in the draft object.
 */
export function prefillFormFromDraft(draft = {}) {
  const name = draft.customer?.name || ''
  const lastName = draft.customer?.lastName || ''
  const { countryCode, phone } = parsePhone(draft.customer?.phone || '')

  return {
    // Customer
    name,
    lastName,
    countryCode,
    phone,
    email: draft.customer?.email || '',
    socialMedia: draft.customer?.socialMedia || { instagram: '', facebook: '' },

    // Dates & status
    orderDate: toDateInputValue(draft.orderDate),
    deliverDate: toDateInputValue(draft.deliverDate),
    status: ensureStatus(draft.status),

    // Payment
    deposit: draft.deposit ?? '',

    // Shipping
    shipping: Boolean(draft.shipping?.isRequired),
    addresses: draft.shipping?.addresses || [],

    // Notes
    notes: draft.notes || '',
  }
}

/**
 * Validates the basic order form (NewOrder).
 * Returns an `errors` object with i18n-compatible error keys.
 * If no errors are found, returns an empty object.
 */
export function validateBaseForm(formData) {
  const errors = {}

  // Only letters (including accents), spaces, apostrophes and hyphens
  const NAME_RE = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s'-]+$/

  // First name: required + only letters
  if (!formData.name?.trim()) {
    errors.name = 'errors.customer.missingName'
  } else if (!NAME_RE.test(formData.name.trim())) {
    errors.name = 'validation.nameOnlyLetters'
  }

  // Last name: optional, but if present must be only letters
  if (formData.lastName?.trim() && !NAME_RE.test(formData.lastName.trim())) {
    errors.lastName = 'validation.lastNameOnlyLetters'
  }
  if (!formData.status) errors.status = 'validation.requiredFields'
  if (!formData.orderDate) errors.orderDate = 'errors.order.missingDate'

  // Validate delivery date is not before the order date
  // Validate delivery date is not before the order date
  if (formData.deliverDate && formData.orderDate) {
    const od = parseDateInput(formData.orderDate)
    const dd = parseDateInput(formData.deliverDate)
    if (dd < od) {
      errors.deliverDate = 'validation.invalidDeliveryDate'
    }
  }

  // Phone (optional) — must be 10 digits if present
  if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
    errors.phone = 'errors.user.invalidPhone'
  }

  // Email (optional) — must be valid format if present
  if (formData.email && !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email)) {
    errors.email = 'errors.user.invalidEmail'
  }

  // Shipping validation (only if shipping is required)
  if (formData.shipping) {
    const addresses = formData.addresses || []
    const addressErrors = []

    addresses.forEach((addr, i) => {
      const errs = {}

      if (Object.values(addr).every((val) => !val || val.trim() === '')) {
        // skip empty form
        return
      }

      if (!addr.address?.trim()) errs.address = 'validation.address'
      if (!addr.city?.trim()) errs.city = 'validation.city'
      if (!addr.zip?.trim()) errs.zip = 'validation.zip'
      if (!addr.phone?.trim()) errs.phone = 'validation.phone'

      addressErrors[i] = errs
    })

    // At least one complete address required
    const nonEmpty = addressErrors.filter((e) => Object.keys(e).length === 0)
    if (nonEmpty.length === 0) {
      errors.addresses = addressErrors.length > 0 ? addressErrors : ['incomplete']
    } else if (addressErrors.some((e) => Object.keys(e).length > 0)) {
      errors.addresses = addressErrors
    }
  }

  return errors
}

/**
 * Builds the base order object from form data.
 * `opts` allows merging a pending social media input (e.g., a typed handle).
 */
export function buildBaseOrder(formData, opts = {}) {
  const { socialInput = '', currentSocialType = 'instagram' } = opts

  const socialMedia = { ...(formData.socialMedia || {}) }
  if (socialInput.trim()) {
    socialMedia[currentSocialType] = socialInput.trim()
  }

  // Normalize dates: if empty, omit field to let backend defaults kick in
  const orderDate = parseDateInput(formData.orderDate)
  const deliverDate = parseDateInput(formData.deliverDate)

  // Normalize status to new enum (lowercase)
  const status = ensureStatus(formData.status)

  // Clean addresses (only keep complete ones)
  const addresses = formData.shipping ? cleanAddresses(formData.addresses) : []

  return {
    orderDate,
    deliverDate,
    status,
    deposit: Number(formData.deposit || 0),
    notes: formData.notes,

    shipping: {
      isRequired: !!formData.shipping,
      addresses,
    },

    // NOTE: This 'customer' is the base info. Your final create endpoint
    // should findOrCreate a Customer and replace with its ObjectId server-side.
    customer: {
      name: formData.name,
      lastName: formData.lastName,
      phone: formData.phone ? `${formData.countryCode}${formData.phone}` : '',
      email: formData.email,
      socialMedia,
    },
  }
}
