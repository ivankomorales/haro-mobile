import fetchWithAuth from '../utils/fetchWithAuth'

export async function createOrder(orderData) {
  return await fetchWithAuth('/api/orders', {
    method: 'POST',
    body: JSON.stringify(orderData),
  })
}

export async function getOrders({ status, sort, limit } = {}) {
  const params = new URLSearchParams()
  if (status) params.append('status', status)
  if (sort) params.append('sort', sort)
  if (limit) params.append('limit', limit)

  const query = params.toString() ? `?${params.toString()}` : ''
  return await fetchWithAuth(`/api/orders${query}`)
}

// NEW: server-side pagination + filters
export async function getOrdersPage(params = {}) {
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
  if (params.includeStats !== false) qs.set('includeStats', 'true')

  // ✅ Already parsed JSON; never call .json() here
  const payload = await fetchWithAuth(`/api/orders?${qs.toString()}`)

  // If backend accidentally returns legacy array, normalize to a consistent shape
  if (Array.isArray(payload)) {
    return { data: payload, meta: null, stats: null, legacy: true }
  }
  return payload // { data, meta, stats }
}

export async function getOrderById(id) {
  const res = await fetchWithAuth(`/api/orders/${id}`)
  return res
}

export async function getRecentOrders() {
  return await fetchWithAuth('/api/orders?limit=10&sort=desc')
}

export async function getPendingCount() {
  const data = await fetchWithAuth('/api/orders?status=pending&countOnly=true')
  return data.count
}

export async function updateOrderById(id, updatedData) {
  return await fetchWithAuth(`/api/orders/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updatedData),
  })
}

export async function updateManyOrderStatus(orderIds, newStatus) {
  const data = await fetchWithAuth('/api/orders/bulk/status', {
    method: 'PATCH',
    body: JSON.stringify({ orderIds, newStatus }),
    headers: {
      'Content-Type': 'application/json',
    },
  })

  // ✅ If any error, fetchWithAuth throws exception
  return data
}
