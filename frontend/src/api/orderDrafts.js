import fetchWithAuth from '../utils/fetchWithAuth'

export async function createOrderDraft({ label, data }) {
  return await fetchWithAuth('/api/order-drafts', {
    method: 'POST',
    body: JSON.stringify({ label, data }),
  })
}

export async function getOrderDraft(draftId) {
  return await fetchWithAuth(`/api/order-drafts/${draftId}`)
}

export async function updateOrderDraft(draftId, { label, data }) {
  return await fetchWithAuth(`/api/order-drafts/${draftId}`, {
    method: 'PUT',
    body: JSON.stringify({ label, data }),
  })
}

export async function deleteOrderDraft(draftId) {
  return await fetchWithAuth(`/api/order-drafts/${draftId}`, {
    method: 'DELETE',
  })
}
