// src/api/glazes.js
import fetchWithAuth from '../utils/fetchWithAuth'

/**
 * Fetch all glazes.
 *
 * @param {function|null} navigate - Optional navigation handler for redirecting on auth error.
 * @returns {Promise<any[]>}
 */
// normalize 3rd arg so callers can pass either `navigate` or `{ navigate }`
const ctx = (x) => (typeof x === 'function' ? { navigate: x } : x || {})
/**
 * Fetch all glazes.
 * @param {{navigate?: Function, includeInactive?: boolean}} opts
 */
export const getAllGlazes = (opts = {}) => {
  const { navigate, includeInactive = false } = opts // default: active only (keeps AddProduct behavior)
  const qs = includeInactive ? '?includeInactive=true' : ''
  return fetchWithAuth(`/api/glazes${qs}`, {}, ctx(navigate))
}

/**
 * Fetch a single glaze by ID.
 *
 * @param {string} id - Glaze ID.
 * @param {function|null} navigate
 * @returns {Promise<any>}
 */
export const getGlazeById = (id, nav) => fetchWithAuth(`/api/glazes/${id}`, {}, ctx(nav))

/**
 * Create a new glaze.
 *
 * @param {object} glazeData - Glaze properties (e.g., name, color, etc).
 * @param {function|null} navigate
 * @returns {Promise<any>}
 */
export const createGlaze = (glazeData, nav) =>
  fetchWithAuth('/api/glazes', { method: 'POST', body: glazeData }, ctx(nav))

/**
 * Delete a glaze by ID.
 *
 * @param {string} id - Glaze ID to delete.
 * @param {function|null} navigate
 * @returns {Promise<any>}
 */
export const deactivateGlaze = (id, nav) =>
  fetchWithAuth(`/api/glazes/${id}/deactivate`, { method: 'PATCH' }, ctx(nav))

export const updateGlaze = (id, glazeData, nav) =>
  fetchWithAuth(`/api/glazes/${id}`, { method: 'PUT', body: glazeData }, ctx(nav))

/**
 * Activate a glaze by ID.
 *
 * @param {string} id - Glaze ID to activate.
 * @param {function|null} navigate
 * @returns {Promise<any>}
 */
export const activateGlaze = (id, nav) =>
  fetchWithAuth(`/api/glazes/${id}/activate`, { method: 'PATCH' }, ctx(nav))
