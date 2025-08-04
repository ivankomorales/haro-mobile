// src/utils/fetchWithAuth.js
import { isTokenExpired } from './jwt'

export default async function fetchWithAuth(
  url,
  options = {},
  { navigate = null, logout = null } = {}
) {
  const token = localStorage.getItem('token')
  const UNKNOWN_ERROR_KEY = 'auth.unknownError'
  // Set Content-Type to JSON unless the body is FormData (let browser handle it automatically)

  // Detect expired token before fetch
  if (!token || isTokenExpired(token)) {
    console.warn('[fetchWithAuth] Token missing or expired')
    if (logout) logout(true)
    else if (navigate) navigate('/login')
    throw new Error('auth.sessionExpired')
  }

  const headers = {
    ...(options.body instanceof FormData
      ? {}
      : { 'Content-Type': 'application/json' }),
    ...(options.headers || {}),
    ...(token && { Authorization: `Bearer ${token}` }),
  }

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    })

    const clone = res.clone() // 🔁 Safe for text() fallback
    let data = {}

    try {
      data = await res.json()
    } catch {
      try {
        const raw = await clone.text()
        data = {
          message: raw.startsWith('<') ? UNKNOWN_ERROR_KEY : raw,
        }
      } catch {
        data = { message: UNKNOWN_ERROR_KEY }
      }
    }

    // Ensure data is always an object
    if (!data || typeof data !== 'object') {
      data = { message: UNKNOWN_ERROR_KEY }
    }

    if (!res.ok) {
      console.error('[fetchWithAuth] Server error:', res.status, data)

      if (res.status === 401 || res.status === 403) {
        if (logout) logout(true)
        else if (navigate) navigate('/login')
        throw new Error('auth.sessionExpired')
      }

      if (res.status === 422 || res.status === 400) {
        const fieldErrors = (data.errors || [])
          .map((e, i) => `${e.param || `[field ${i + 1}]`}: ${e.msg}`)
          .join(' | ')
        throw new Error(
          `${data.message || 'auth.validationError'}: ${fieldErrors}`
        )
      }

      throw new Error(data.message || 'auth.requestError')
    }

    return data
  } catch (err) {
    console.error('fetchWithAuth error:', err)
    throw err
  }
}
