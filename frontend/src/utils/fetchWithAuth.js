// src/utils/fetchWithAuth.js

/**
 * Wrapper around fetch() that automatically includes JWT authentication,
 * handles expired sessions (401), and parses errors in a consistent way.
 *
 * @param {string} url - The endpoint URL.
 * @param {object} options - Fetch options (method, headers, body, etc).
 * @param {function|null} navigate - Optional react-router navigate function for redirecting on auth error.
 * @returns {Promise<any>} - Parsed JSON response if successful.
 */
export default async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem('token')

  const headers = {
    ...(options.body instanceof FormData
      ? {} // Don't set Content-Type; let browser do it
      : { 'Content-Type': 'application/json' }),
    ...(options.headers || {}),
    ...(token && { Authorization: `Bearer ${token}` }),
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    })

    const data = await res.json()

    if (!res.ok) {
      const errorMsg = data?.message || JSON.stringify(data) || 'Request failed'
      throw new Error(errorMsg)
    }

    return data
  } catch (err) {
    console.error('fetchWithAuth error:', err)
    throw err
  }
}
