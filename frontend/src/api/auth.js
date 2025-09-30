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

const API_BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/+$/, '');

// ✅ Login will now hit the backend (staging/prod) via VITE_API_BASE
export const login = (credentials) =>
  fetchJson(
    API_BASE ? `${API_BASE}/api/auth/login` : '/api/auth/login',
    { method: 'POST', body: credentials }
  );

/** Optional server-side logout/audit; keep name distinct from AuthContext.logout() */
export const logoutServer = async () => {
  return Promise.resolve();
};

// TEMP aliases if you still import the old names elsewhere:
export const apiLogin = login;
export const apiLogout = logoutServer;
