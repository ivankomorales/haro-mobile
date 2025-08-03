// src/utils/orderBuilder.js

// Helpers to split name & parse phone
export function splitName(fullName = '') {
  const parts = fullName.trim().split(/\s+/)
  const name = parts[0] || ''
  const lastName = parts.slice(1).join(' ') || ''
  return { name, lastName }
}

export function parsePhone(fullPhone = '') {
  // Example: "+52XXXXXXXXXX", "XXXXXXXXXX"
  const match = fullPhone.match(/^(\+\d{1,3})?(\d{10})$/)
  if (!match) return { countryCode: '+52', phone: '' }
  const countryCode = match[1] || '+52'
  const phone = match[2] || ''
  return { countryCode, phone }
}

/**
 * Generates initial form values from a draft (location.state).
 * Does not set everything — only the fields that are present in the draft.
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
    orderDate: draft.orderDate || '',
    deliverDate: draft.deliverDate || '',
    status: draft.status || 'New',
    deposit: draft.deposit ?? '',
    // Shipping
    shipping: Boolean(draft.shipping?.isRequired),
    addresses: draft.shipping?.addresses || [],
    // Notes
    notes: draft.notes || '',
  }
}

/**
 * Validates the base form (NewOrder). Returns an `errors` object with i18n keys.
 * If there are no errors => errors = {}
 */
export function validateBaseForm(formData) {
  const errors = {}

  if (!formData.name) errors.name = 'errors.customer.missingName'
  if (!formData.lastName) errors.lastName = 'validation.requiredFields'
  if (!formData.status) errors.status = 'validation.requiredFields'
  if (!formData.orderDate) errors.orderDate = 'errors.order.missingDate'

  // Fechas
  if (
    formData.deliverDate &&
    formData.orderDate &&
    formData.deliverDate < formData.orderDate
  ) {
    errors.deliverDate = 'validation.invalidDeliveryDate'
  }

  // Phone Optional, 10 digits
  if (formData.phone && !/^\d{10}$/.test(formData.phone)) {
    errors.phone = 'errors.user.invalidPhone'
  }

  // Email optional / has to be valid
  if (
    formData.email &&
    !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email)
  ) {
    errors.email = 'errors.user.invalidEmail'
  }

  // Shipping (only if applies)
  if (formData.shipping) {
    const hasAnyAddressError = (formData.addresses || []).some((addr) => {
      return !addr.address || !addr.city || !addr.zip || !addr.phone
    })
    if (hasAnyAddressError) {
      errors.addresses = 'validation.incompleteShipping'
    }
  }

  return errors
}

/**
 * Builds the baseOrder object from the form data.
 * `opts` allows merging the pending social input if provided.
 */
export function buildBaseOrder(formData, opts = {}) {
  const { socialInput = '', currentSocialType = 'instagram' } = opts

  const socialMedia = { ...(formData.socialMedia || {}) }
  if (socialInput.trim()) {
    socialMedia[currentSocialType] = socialInput.trim()
  }

  return {
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
      name: formData.name,
      lastName: formData.lastName,
      phone: formData.phone ? `${formData.countryCode}${formData.phone}` : '',
      email: formData.email,
      socialMedia,
    },
  }
}
