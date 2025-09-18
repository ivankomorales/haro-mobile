// src/utils/fetchWithAuth.js
const API_BASE = import.meta.env?.VITE_API_BASE ?? ''

function isPlainObject(v) {
  return v && typeof v === 'object' && v.constructor === Object
}

function joinUrl(base, path) {
  if (!path) return base || ''
  if (/^https?:\/\//i.test(path)) return path // absolute URL passes through
  const b = (base || '').replace(/\/+$/, '')
  const p = String(path).replace(/^\/+/, '')
  return b ? `${b}/${p}` : `/${p}`
}

export default async function fetchWithAuth(
  url,
  options = {},
  { navigate = null, logout = null } = {}
) {
  const token = localStorage.getItem('token')
  const UNKNOWN_ERROR_KEY = 'auth.unknownError'

  const isFormData = options?.body instanceof FormData
  const hasBody = options?.body != null

  // Build headers safely
  const headers = new Headers(options.headers || {})
  headers.set('Accept', 'application/json')

  // Only set JSON Content-Type when we actually send a JSON body
  if (!isFormData && hasBody) {
    headers.set('Content-Type', 'application/json')
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  // Auto-JSON stringify when body is a plain object
  let body = options.body
  if (!isFormData && hasBody && isPlainObject(options.body)) {
    body = JSON.stringify(options.body)
  }

  const finalUrl = joinUrl(API_BASE, url)

  if (!window.__netlog) {
    console.log('[NET] API_BASE =', API_BASE)
    window.__netlog = true
  }
  console.log('[NET] fetch =>', finalUrl)

  let res
  try {
    res = await fetch(finalUrl, {
      ...options,
      headers,
      body,
    })
  } catch (networkErr) {
    // Network-level error (DNS, CORS preflight blocked, server down)
    console.error('[fetchWithAuth] Network error:', networkErr)
    throw new Error('auth.networkError')
  }

  // Handle no-content responses (e.g., 204)
  const isNoContent = res.status === 204 || res.headers.get('Content-Length') === '0'
  let data = {}
  const clone = res.clone()

  if (!isNoContent) {
    try {
      data = await res.json()
    } catch {
      // Fallback to text, try not to lose diagnostics
      try {
        const raw = await clone.text()
        data = {
          message: raw && !raw.startsWith('<') ? raw : UNKNOWN_ERROR_KEY,
        }
      } catch {
        data = { message: UNKNOWN_ERROR_KEY }
      }
    }
  }

  if (!data || typeof data !== 'object') {
    data = { message: UNKNOWN_ERROR_KEY }
  }

  if (!res.ok) {
    console.error('[fetchWithAuth] Server error:', res.status, data)

    if (res.status === 401 || res.status === 403) {
      if (logout) logout(true)
      else if (navigate) navigate('/') //Navigate to /login
      throw new Error('auth.sessionExpired')
    }

    if (res.status === 422 || res.status === 400) {
      const fieldErrors = (Array.isArray(data.errors) ? data.errors : [])
        .map((e, i) => `${e?.param || `[field ${i + 1}]`}: ${e?.msg || 'Invalid'}`)
        .join(' | ')
      throw new Error(
        `${data.message || 'auth.validationError'}${fieldErrors ? `: ${fieldErrors}` : ''}`
      )
    }

    // Normalize message if backend returned array/object
    let msg = data.message
    if (Array.isArray(msg)) msg = msg.join(' | ')
    if (isPlainObject(msg)) msg = JSON.stringify(msg)

    throw new Error(msg || 'auth.requestError')
  }

  return data
}
