// src/api/orderDrafts.js
import { fx } from './_fetcher'

export async function createOrderDraft(payload, { fetcher } = {}) {
  return fx(fetcher)('/api/order-drafts', { method: 'POST', body: payload })
}

export async function getOrderDraft(id, { fetcher } = {}) {
  return fx(fetcher)(`/api/order-drafts/${id}`)
}

export async function updateOrderDraft(id, payload, { fetcher } = {}) {
  return fx(fetcher)(`/api/order-drafts/${id}`, { method: 'PUT', body: payload })
}

export async function deleteOrderDraft(id, { fetcher } = {}) {
  return fx(fetcher)(`/api/order-drafts/${id}`, { method: 'DELETE' })
}
