// src/api/orders.js
// comments in English only
import { fx } from './_fetcher'

/**
 * Create a new order
 * @param {object} orderData
 * @param {{ fetcher?: Function }} opts
 */
export async function createOrder(orderData, { fetcher } = {}) {
  const f = fx(fetcher)
  return f('/api/orders', {
    method: 'POST',
    body: orderData,
  })
}

/**
 * Simple list (legacy)
 * @param {{ status?: string, sort?: string, limit?: number }} params
 * @param {{ fetcher?: Function }} opts
 */
export async function getOrders({ status, sort, limit } = {}, { fetcher } = {}) {
  const f = fx(fetcher)
  const qs = new URLSearchParams()
  if (status) qs.append('status', status)
  if (sort) qs.append('sort', sort)
  if (limit) qs.append('limit', String(limit))
  const query = qs.toString() ? `?${qs.toString()}` : ''
  return f(`/api/orders${query}`)
}

/**
 * Server-side pagination + filters
 * Returns { data, meta, stats } or normalizes legacy array.
 * @param {object} params
 * @param {{ fetcher?: Function }} opts
 */
export async function getOrdersPage(params = {}, { fetcher } = {}) {
  const f = fx(fetcher)
  const qs = new URLSearchParams()
  qs.set('page', String(params.page ?? 1))
  qs.set('limit', String(params.limit ?? 20))
  qs.set('sort', params.sort ?? 'orderDate:desc')
  if (params.status) qs.set('status', params.status)
  if (params.from) qs.set('from', params.from)
  if (params.to) qs.set('to', params.to)
  if (params.q) qs.set('q', params.q)
  if (params.urgent !== undefined && params.urgent !== '') qs.set('urgent', String(params.urgent))
  if (params.shipping !== undefined && params.shipping !== '')
    qs.set('shipping', String(params.shipping))
  if (params.dateField) qs.set('dateField', params.dateField) // orderDate|deliverDate|createdAt
  if (params.includeStats === true) qs.set('includeStats', 'true')

  const payload = await f(`/api/orders?${qs.toString()}`)

  if (Array.isArray(payload)) {
    return { data: payload, meta: null, stats: null, legacy: true }
  }
  return payload // { data, meta, stats }
}

/**
 * Aggregated stats
 * @param {object} params
 * @param {{ fetcher?: Function }} opts
 */
export async function getOrderStats(params = {}, { fetcher } = {}) {
  const f = fx(fetcher)
  const qs = new URLSearchParams()
  if (params.range) qs.set('range', params.range)
  if (params.from) qs.set('from', params.from) // YYYY-MM-DD
  if (params.to) qs.set('to', params.to) // YYYY-MM-DD
  if (params.dateField) qs.set('dateField', params.dateField)
  if (params.status && params.status !== 'all') qs.set('status', params.status)
  if (params.q) qs.set('q', params.q)
  if (params.urgent !== undefined && params.urgent !== '') qs.set('urgent', String(params.urgent))
  if (params.shipping !== undefined && params.shipping !== '')
    qs.set('shipping', String(params.shipping))
  return f(`/api/orders/stats?${qs.toString()}`)
}
/**
 * Get one by id
 */
export async function getOrderById(id, { fetcher } = {}) {
  const f = fx(fetcher)
  return f(`/api/orders/${id}`)
}

/**
 * Shortcuts
 */
export async function getRecentOrders({ limit = 10, sort = 'desc' } = {}, { fetcher } = {}) {
  const f = fx(fetcher)
  const qs = new URLSearchParams({ limit: String(limit), sort })
  return f(`/api/orders?${qs.toString()}`)
}

export async function getPendingCount({ status = 'pending' } = {}, { fetcher } = {}) {
  const f = fx(fetcher)
  const qs = new URLSearchParams({ status, countOnly: 'true' })
  const data = await f(`/api/orders?${qs.toString()}`)
  return data.count
}

/**
 * Updates
 */
export async function updateOrderById(id, updatedData, { fetcher } = {}) {
  const f = fx(fetcher)
  return f(`/api/orders/${id}`, {
    method: 'PUT',
    body: updatedData,
  })
}

export async function updateManyOrderStatus(orderIds, newStatus, { fetcher } = {}) {
  const f = fx(fetcher)
  return f('/api/orders/bulk/status', {
    method: 'PATCH',
    body: { orderIds, newStatus },
  })
}

/**
 * Delete / Cancel
 */
export async function cancelOrderById(id, { fetcher } = {}) {
  const f = fx(fetcher)
  return f(`/api/orders/${id}`, { method: 'DELETE' })
}

// Optional alias to match naming used elsewhere:
export const cancelOrder = (id, opts) => cancelOrderById(id, opts)
