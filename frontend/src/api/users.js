// src/api/users.js

import fetchWithAuth from '../utils/fetchWithAuth'

/**
 * Create a new user.
 * Requires admin privileges on the backend.
 *
 * @param {object} userData - Object containing name, email, password, and role.
 * @returns {Promise<any>}
 */
export const createUser = (userData) => {
  return fetchWithAuth('/api/users', {
    method: 'POST',
    body: JSON.stringify(userData),
  })
}

/**
 * Get the list of all users.
 * Requires admin privileges.
 *
 * @returns {Promise<any[]>}
 */
export const getUsers = () => {
  return fetchWithAuth('/api/users')
}

/**
 * Delete a user by ID.
 * Requires admin privileges.
 *
 * @param {string} id - User ID to delete.
 * @returns {Promise<any>}
 */
export const deleteUser = (id) => {
  return fetchWithAuth(`/api/users/${id}`, {
    method: 'DELETE',
  })
}
