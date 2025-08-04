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
