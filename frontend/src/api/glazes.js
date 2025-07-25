// src/api/glazes.js

import fetchWithAuth from '../utils/fetchWithAuth'

/**
 * Fetch all glazes.
 *
 * @param {function|null} navigate - Optional navigation handler for redirecting on auth error.
 * @returns {Promise<any[]>}
 */
export const getAllGlazes = (navigate) => {
  return fetchWithAuth('/api/glazes', {}, navigate)
}

/**
 * Fetch a single glaze by ID.
 *
 * @param {string} id - Glaze ID.
 * @param {function|null} navigate
 * @returns {Promise<any>}
 */
export const getGlazeById = (id, navigate) => {
  return fetchWithAuth(`/api/glazes/${id}`, {}, navigate)
}

/**
 * Create a new glaze.
 *
 * @param {object} glazeData - Glaze properties (e.g., name, color, etc).
 * @param {function|null} navigate
 * @returns {Promise<any>}
 */
export const createGlaze = (glazeData, navigate) => {
  return fetchWithAuth(
    '/api/glazes',
    {
      method: 'POST',
      body: JSON.stringify(glazeData),
    },
    navigate
  )
}

/**
 * Delete a glaze by ID.
 *
 * @param {string} id - Glaze ID to delete.
 * @param {function|null} navigate
 * @returns {Promise<any>}
 */
export const deleteGlaze = (id, navigate) => {
  return fetchWithAuth(
    `/api/glazes/${id}`,
    {
      method: 'DELETE',
    },
    navigate
  )
}
