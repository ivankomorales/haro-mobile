// src/api/auth.js
import fetchWithAuth from '../utils/fetchWithAuth'
/**
 * Login user and receive token.
 *
 * @param {object} credentials - Must include email and password.
 * @returns {Promise<{ token: string, user: object }>}
 */
export const login = async (credentials) => {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.message || 'Login failed')
  }

  return data
}

/**
 * Logout user by clearing session and redirecting.
 *
 * @param {function} navigate - Router navigate function.
 */
export const logout = (navigate) => {
  localStorage.removeItem('token')
  navigate('/')
}

export async function apiLogin(email, password) {
  return await fetchWithAuth('/api/auth/login', {
    method: 'POST',
    body: { email, password },
  })
}

export function apiLogout() {
  // optional server call if you had one; for now just a placeholder
  return Promise.resolve()
}
