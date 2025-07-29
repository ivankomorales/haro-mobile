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
    'Content-Type': 'application/json',
    ...(options.headers || {}),
    ...(token && { Authorization: `Bearer ${token}` }),
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    })

    console.log('🔎 Status:', res.status, url)

    let data
    try {
      data = await res.json()
    } catch (err) {
      console.warn('⚠️ Could not parse JSON for', url)
      data = null
    }

    if (!res.ok) {
      const errorMsg = data?.message || res.statusText || 'Request failed'
      throw new Error(errorMsg)
    }

    return data
  } catch (err) {
    console.error('fetchWithAuth error:', err)
    throw err
  }
}
