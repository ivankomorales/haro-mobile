// src/api/auth.js
// comments in English only

// Plain JSON fetch helper for public endpoints (no Bearer, no 401 redirect logic)
async function fetchJson(url, { method = 'GET', body } = {}) {
  const res = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  let data = null
  try {
    data = await res.json()
  } catch {}
  if (!res.ok) {
    const msg = (data && (data.message || data.error)) || 'Request failed'
    throw new Error(msg)
  }
  return data
}

/** Login (no token, no authed fetch) */
export const login = (credentials) =>
  fetchJson('/api/auth/login', { method: 'POST', body: credentials })

/** Optional server-side logout/audit; keep name distinct from AuthContext.logout() */
export const logoutServer = async () => {
  // If you add a real endpoint later, do it here with fetchJson or fetchWithAuth
  return Promise.resolve()
}

// TEMP aliases if you still import the old names elsewhere:
export const apiLogin = login
export const apiLogout = logoutServer
