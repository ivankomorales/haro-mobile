// src/utils/fetchWithAuth.js
// comments in English only

const API_BASE = import.meta.env?.VITE_API_BASE ?? ''

function isPlainObject(v) {
  return v && typeof v === 'object' && v.constructor === Object
}

function joinUrl(base, path) {
  if (!path) return base || ''
  if (/^https?:\/\//i.test(path)) return path
  const b = (base || '').replace(/\/+$/, '')
  const p = String(path).replace(/^\/+/, '')
  return b ? `${b}/${p}` : `/${p}`
}

/**
 * Default: JSON helper. Returns parsed JSON (or {} on 204).
 * Handles 401/403 with cleanup + redirect + 'auth.sessionExpired' error.
 */
export default async function fetchWithAuth(
  url,
  options = {},
  { navigate = null, logout = null } = {}
) {
  const token = localStorage.getItem('token')
  const UNKNOWN_ERROR_KEY = 'auth.unknownError'

  const isFormData = options?.body instanceof FormData
  const hasBody = options?.body != null

  const headers = new Headers(options.headers || {})
  headers.set('Accept', 'application/json')
  if (!isFormData && hasBody) headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  let body = options.body
  if (!isFormData && hasBody && isPlainObject(options.body)) {
    body = JSON.stringify(options.body)
  }

  const finalUrl = joinUrl(API_BASE, url)
  if (!window.__netlog) {
    console.log('[NET] API_BASE =', API_BASE)
    window.__netlog = true
  }
  console.log('[NET] fetch(JSON) =>', finalUrl)

  let res
  try {
    res = await fetch(finalUrl, { ...options, headers, body })
  } catch (e) {
    console.error('[fetchWithAuth] Network error:', e)
    throw new Error('auth.networkError')
  }

  // Parse JSON (skip on 204)
  const isNoContent = res.status === 204
  let data = {}
  const clone = res.clone()
  if (!isNoContent) {
    try {
      data = await res.json()
    } catch {
      try {
        const raw = await clone.text()
        data = { message: raw && !raw.startsWith('<') ? raw : UNKNOWN_ERROR_KEY }
      } catch {
        data = { message: UNKNOWN_ERROR_KEY }
      }
    }
  }
  if (!data || typeof data !== 'object') data = { message: UNKNOWN_ERROR_KEY }

  if (!res.ok) {
    console.error('[fetchWithAuth] Server error:', res.status, data)

    if (res.status === 401 || res.status === 403) {
      try {
        localStorage.removeItem('token')
        const from = window.location.pathname + window.location.search + window.location.hash
        sessionStorage.setItem('postLoginRedirect', from)
        sessionStorage.setItem('loginReason', 'sessionExpired')
      } catch {}
      // Single-flight redirect; NO toast here (handled by AuthContext only once, avoid multiple toasts)
      if (!window.__AUTH_REDIRECTING__) {
        window.__AUTH_REDIRECTING__ = true
        const target = '/?reason=sessionExpired'
        if (navigate) navigate(target, { replace: true })
        else window.location.assign(target)
      }
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

    let msg = data.message
    if (Array.isArray(msg)) msg = msg.join(' | ')
    if (isPlainObject(msg)) msg = JSON.stringify(msg)
    throw new Error(msg || 'auth.requestError')
  }

  return data
}

/**
 * Named export: Response helper. Returns the raw Response for binaries (PDF/Excel).
 * Same auth handling as the JSON helper; callers can call res.blob(), res.text(), etc.
 */
export async function fetchWithAuthResponse(
  url,
  options = {},
  { navigate = null, logout = null } = {}
) {
  const token = localStorage.getItem('token')

  const isFormData = options?.body instanceof FormData
  const hasBody = options?.body != null

  const headers = new Headers(options.headers || {})
  // Important for binary endpoints: do not force JSON-only; allow */*
  if (!headers.has('Accept')) headers.set('Accept', '*/*')
  if (!isFormData && hasBody && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }
  if (token) headers.set('Authorization', `Bearer ${token}`)

  let body = options.body
  if (!isFormData && hasBody && body && body.constructor === Object) {
    body = JSON.stringify(body)
  }

  const finalUrl = joinUrl(API_BASE, url)
  console.log('[NET] fetch(Response) =>', finalUrl)

  let res
  try {
    res = await fetch(finalUrl, { ...options, headers, body })
  } catch (e) {
    console.error('[fetchWithAuthResponse] Network error:', e)
    throw new Error('auth.networkError')
  }

  if (res.ok) return res

  if (res.status === 401 || res.status === 403) {
    try {
      localStorage.removeItem('token')
      const from = window.location.pathname + window.location.search + window.location.hash
      sessionStorage.setItem('postLoginRedirect', from)
      sessionStorage.setItem('loginReason', 'sessionExpired')
    } catch {}
    if (logout) logout(true)
    const target = '/?reason=sessionExpired'
    if (navigate) navigate(target, { replace: true })
    else window.location.assign(target)
    throw new Error('auth.sessionExpired')
  }

  // Try to extract a helpful message
  let message = ''
  try {
    const json = await res.clone().json()
    message = json?.message || ''
  } catch {}
  if (!message) {
    try {
      const text = await res.text()
      if (text && !text.startsWith('<')) message = text
    } catch {}
  }
  throw new Error(message || 'auth.requestError')
}
