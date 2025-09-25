// src/api/users.js
// comments in English only
import { fx } from './_fetcher'

/**
 * Create a new user (admin only)
 * @param {object} userData
 * @param {{ fetcher?: Function }} opts
 */
export async function createUser(userData, { fetcher } = {}) {
  const f = fx(fetcher)
  return f('/api/users', {
    method: 'POST',
    body: userData,
  })
}

/**
 * Get list of all users (admin only)
 * @param {{ fetcher?: Function }} opts
 */
export async function getUsers({ fetcher } = {}) {
  const f = fx(fetcher)
  return f('/api/users')
}

/**
 * Delete a user by ID (admin only)
 * @param {string} id
 * @param {{ fetcher?: Function }} opts
 */
export async function deleteUser(id, { fetcher } = {}) {
  const f = fx(fetcher)
  return f(`/api/users/${id}`, { method: 'DELETE' })
}

/**
 * Get info about the currently authenticated user
 * @param {{ fetcher?: Function }} opts
 */
export async function getMe({ fetcher } = {}) {
  const f = fx(fetcher)
  return f('/api/users/me')
}

/**
 * Update info of the currently authenticated user
 * @param {object} patch
 * @param {{ fetcher?: Function }} opts
 */
export async function updateMe(payload, { fetcher } = {}) {
  const f = fx(fetcher)
  return f('/api/users/me', {
    method: 'PATCH',
    body: payload,
  })
}
