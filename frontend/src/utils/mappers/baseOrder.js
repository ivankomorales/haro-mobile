// src/utils/mappers/baseOrder.js
export function normalizeBaseOrder(raw = {}) {
  // Shipping
  let shipping = raw.shipping
  if (!shipping || typeof shipping === 'boolean') {
    shipping = { isRequired: !!shipping, addresses: [] }
  }
  const trim = (v) => (v ?? '').toString().trim()
  shipping.addresses = Array.isArray(shipping.addresses)
    ? shipping.addresses.map((a, idx) => ({
        id: a?.id ?? idx,
        street: trim(a?.street || a?.address),
        city: trim(a?.city),
        state: trim(a?.state),
        zip: trim(a?.zip),
        country: trim(a?.country || 'Mexico'),
        phone: trim(a?.phone),
        reference: trim(a?.reference),
        countryCode: trim(a?.countryCode || '+52'),
        name: trim(a?.name),
      }))
    : []

  // Keep only addresses with meaningful content (adjust if you want "all required")
  shipping.addresses = shipping.addresses.filter((a) =>
    [a.street, a.city, a.state, a.zip, a.country, a.phone, a.reference, a.name].some(Boolean)
  )

  // Customer
  const customer = {
    name: raw.customer?.name || '',
    lastName: raw.customer?.lastName || '',
    email: raw.customer?.email || '',
    phone: raw.customer?.phone || '',
    countryCode: raw.customer?.countryCode || '+52',
    socialMedia: raw.customer?.socialMedia || {},
  }

  // Dates (yyyy-mm-dd or empty)
  const onlyDate = (v) => (v && /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : '')
  const orderDate = onlyDate(raw.orderDate)
  const deliverDate = onlyDate(raw.deliverDate)

  return {
    ...raw,
    customer,
    shipping,
    orderDate,
    deliverDate,
    deposit: Number(raw.deposit || 0),
    products: Array.isArray(raw.products) ? raw.products : [],
  }
}
