// src/api/glazes.js
// comments in English only
import { fx } from './_fetcher'

/**
 * Fetch all glazes.
 * @param {{ includeInactive?: boolean }} params
 * @param {{ fetcher?: Function }} opts
 * @returns {Promise<any[]>}
 */
export async function getAllGlazes(params = {}, { fetcher } = {}) {
  const f = fx(fetcher)
  const { includeInactive = false } = params
  const qs = new URLSearchParams(includeInactive ? { includeInactive: 'true' } : {}).toString()
  const url = qs ? `/api/glazes?${qs}` : '/api/glazes'
  return f(url)
}

/**
 * Fetch a single glaze by ID.
 * @param {string} id
 * @param {{ fetcher?: Function }} opts
 */
export async function getGlazeById(id, { fetcher } = {}) {
  const f = fx(fetcher)
  return f(`/api/glazes/${id}`)
}

/**
 * Create a new glaze.
 * @param {object} glazeData
 * @param {{ fetcher?: Function }} opts
 */
export async function createGlaze(glazeData, { fetcher } = {}) {
  const f = fx(fetcher)
  return f('/api/glazes', { method: 'POST', body: glazeData })
}

/**
 * Update a glaze.
 * @param {string} id
 * @param {object} glazeData
 * @param {{ fetcher?: Function }} opts
 */
export async function updateGlaze(id, glazeData, { fetcher } = {}) {
  const f = fx(fetcher)
  return f(`/api/glazes/${id}`, { method: 'PUT', body: glazeData })
}

/**
 * Deactivate a glaze.
 * @param {string} id
 * @param {{ fetcher?: Function }} opts
 */
export async function deactivateGlaze(id, { fetcher } = {}) {
  const f = fx(fetcher)
  // If your API uses DELETE instead, switch method/path accordingly
  return f(`/api/glazes/${id}/deactivate`, { method: 'PATCH' })
}

/**
 * Activate a glaze.
 * @param {string} id
 * @param {{ fetcher?: Function }} opts
 */
export async function activateGlaze(id, { fetcher } = {}) {
  const f = fx(fetcher)
  return f(`/api/glazes/${id}/activate`, { method: 'PATCH' })
}
