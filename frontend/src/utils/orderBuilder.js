// src/utils/orderBuilder.js
const CANONICAL = new Set(['new', 'pending', 'inProgress', 'completed', 'cancelled'])

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
  in_progress: 'inProgress',
  inprogress: 'inProgress',
  Completed: 'completed',
  Cancelled: 'cancelled',
}

export function ensureStatus(s) {
  if (!s) return 'new'
  const raw = String(s).trim()
  if (CANONICAL.has(raw)) return raw

  // try exact legacy
  if (LEGACY_STATUS_MAP[raw]) return LEGACY_STATUS_MAP[raw]

  // try relaxed legacy (case/sep-insensitive)
  const lower = raw.toLowerCase()
  if (LEGACY_STATUS_MAP[lower]) return LEGACY_STATUS_MAP[lower]

  const clean = lower.replace(/[-_\s]+/g, '')
  if (clean === 'inprogress') return 'inProgress'
  if (clean === 'new') return 'new'
  if (clean === 'pending') return 'pending'
  if (clean === 'completed') return 'completed'
  if (clean === 'cancelled') return 'cancelled'

  // fallback seguro
  return 'new'
}

/**
 * Generates initial form values from a draft (location.state).
 * Only sets the fields that exist in the draft object.
 */
export function prefillFormFromDraft(draft = {}) {
  // --- Customer ---
  const name = draft.customer?.name || ''
  const lastName = draft.customer?.lastName || ''
  const { countryCode, phone } = parsePhone(draft.customer?.phone || '')

  // --- Shipping (canónico: { isRequired, addresses[] }) ---
  const rawShipping = draft.shipping
  const isRequired = !!rawShipping?.isRequired

  // Prefer canonical shipping.addresses; fallback a legacy draft.addresses
  const srcAddresses =
    Array.isArray(rawShipping?.addresses) && rawShipping.addresses.length
      ? rawShipping.addresses
      : Array.isArray(draft.addresses)
        ? draft.addresses
        : []

  // Normalizar SOLO para UI (sin filtrar incompletas, sin inventar IDs)
  const addresses = srcAddresses.map((a) => ({
    // preserva _id si existe (subdoc key); NO inventes "id"
    ...('_id' in (a || {}) && a._id ? { _id: a._id } : {}),
    street: (a?.street || a?.address || '').trim(),
    city: (a?.city || '').trim(),
    state: (a?.state || '').trim(),
    zip: String(a?.zip || '').trim(),
    country: (a?.country || 'Mexico').trim(),
    phone: String(a?.phone || '').trim(),
    reference: (a?.reference || '').trim(),
    countryCode: (a?.countryCode || '+52').trim(),
    name: (a?.name || '').trim(),
  }))

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

    // Shipping (canónico; NADA en la raíz)
    shipping: {
      isRequired,
      addresses, // si isRequired y vienen vacías, el validador de UI hará su trabajo
    },

    // Notas (si las manejas aquí)
    notes: draft.notes || '',
  }
} // end prefillFormFromDraft

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

  // --- Shipping validation (only if shipping is required) ---
  const isShippingRequired = !!formData.shipping?.isRequired

  // Prefer shipping.addresses; fallback to legacy addresses in root
  const addressesIn = Array.isArray(formData.shipping?.addresses)
    ? formData.shipping.addresses
    : Array.isArray(formData.addresses)
      ? formData.addresses
      : []

  const digitsOnly = (v) => String(v ?? '').replace(/\D+/g, '')
  const trim = (v) => String(v ?? '').trim()

  const REQUIRED_FIELDS = ['street', 'city', 'state', 'zip', 'country', 'phone']

  const isRowEmpty = (addr) => {
    if (!addr) return true
    // treat phone/zip after stripping non-digits
    const allEmpty =
      !trim(addr.street) &&
      !trim(addr.city) &&
      !trim(addr.state) &&
      !digitsOnly(addr.zip) &&
      !trim(addr.country) &&
      !digitsOnly(addr.phone) &&
      !trim(addr.reference)
    return allEmpty
  }

  const isRowComplete = (addr) => {
    if (!addr) return false
    const phone = digitsOnly(addr.phone)
    const zip = digitsOnly(addr.zip)
    return (
      !!trim(addr.street) &&
      !!trim(addr.city) &&
      !!trim(addr.state) &&
      zip.length === 5 &&
      !!trim(addr.country) &&
      phone.length === 10
    )
  }

  if (isShippingRequired) {
    const addressErrors = []

    addressesIn.forEach((addr, i) => {
      const errs = {}
      if (isRowEmpty(addr)) {
        addressErrors[i] = errs // ignore totally empty rows
        return
      }

      if (!trim(addr.street)) errs.street = 'validation.street'
      if (!trim(addr.city)) errs.city = 'validation.city'
      if (!trim(addr.state)) errs.state = 'validation.state'

      const zip = digitsOnly(addr.zip)
      if (!zip) errs.zip = 'validation.zip'
      else if (zip.length !== 5) errs.zip = 'errors.zip.mx5digits'

      if (!trim(addr.country)) errs.country = 'validation.country'

      const phone = digitsOnly(addr.phone)
      if (!phone) errs.phone = 'validation.phone'
      else if (phone.length !== 10) errs.phone = 'errors.user.invalidPhone'

      addressErrors[i] = errs
    })

    const hasValidAddress = addressesIn.some(isRowComplete)

    if (!hasValidAddress) {
      errors.addresses = addressErrors.length > 0 ? addressErrors : ['incomplete']
    } else if (addressErrors.some((e) => e && Object.keys(e).length > 0)) {
      errors.addresses = addressErrors
    }
  }

  return errors
} // end validateBaseForm

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
  // Determine shipping requirement and addresses source
  const isShippingRequired = !!formData?.shipping?.isRequired
  const rawAddresses = Array.isArray(formData?.shipping?.addresses)
    ? formData.shipping.addresses
    : []

  const shipping = {
    isRequired: isShippingRequired,
    // Pass-through; final normalization/filtering happens in orderPayload.normalizeShipping
    addresses: rawAddresses,
  }

  return {
    orderDate,
    deliverDate,
    status,
    deposit: Number(formData.deposit || 0),
    notes: formData.notes,

    shipping,

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
} // end buildBaseOrder
