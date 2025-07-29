import fetchWithAuth from '../utils/fetchWithAuth'

export async function createOrder(orderData) {
  return await fetchWithAuth('/api/orders', {
    method: 'POST',
    body: JSON.stringify(orderData),
  })
}

export async function getRecentOrders() {
  return await fetchWithAuth('/api/orders?limit=10&sort=desc') // ✅ no hagas .json()
}

export async function getPendingCount() {
  const data = await fetchWithAuth('/api/orders?status=pending&countOnly=true') // ✅ igual aquí
  return data.count
}
