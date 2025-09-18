// src/utils/errorUtils.js
// comments in English only

/**
 * Extract a user-facing error message from common API error shapes (Axios).
 * Fallback is an i18n key like 'error.updatingOrder'.
 */
export function getApiMessage(err, fallback = 'error.generic') {
  try {
    // Axios: err.response.data can be a string or an object
    const data = err?.response?.data

    // 1) Direct string payloads
    if (typeof data === 'string' && data.trim()) return data.trim()

    // 2) Common object shapes
    if (data && typeof data === 'object') {
      // express-validator: { errors: [{ msg, param, ... }, ...] }
      if (Array.isArray(data.errors)) {
        const msgs = data.errors.map((e) => e?.msg || e?.message || e?.error || '').filter(Boolean)
        if (msgs.length) return msgs.join(' · ')
      }

      // Mongoose validation: { message, errors: { field: { message }, ... } }
      if (data.errors && typeof data.errors === 'object') {
        const msgs = Object.values(data.errors)
          .map((e) => e?.message || e?.msg || e?.error || '')
          .filter(Boolean)
        if (msgs.length) {
          // Prefer specific messages over generic "Validation failed"
          const generic = typeof data.message === 'string' ? data.message.trim() : ''
          const joined = msgs.join(' · ')
          return generic && generic.length > joined.length ? generic : joined
        }
      }

      // Generic keys seen in many APIs
      if (typeof data.message === 'string' && data.message.trim()) return data.message.trim()
      if (typeof data.error === 'string' && data.error.trim()) return data.error.trim()
      if (typeof data.detail === 'string' && data.detail.trim()) return data.detail.trim()
      if (typeof data.title === 'string' && data.title.trim()) return data.title.trim()
    }

    // 3) Fallback to error.message
    if (typeof err?.message === 'string' && err.message.trim()) return err.message.trim()

    // 4) Final fallback (i18n key)
    return fallback
  } catch {
    return fallback
  }
}

/**
 * HTTP status helper. Returns 0 if unknown.
 */
export function statusCode(err) {
  const s = err?.response?.status
  return Number.isFinite(s) ? Number(s) : 0
}

/**
 * Extract field-level errors when the API provides them.
 * Shapes supported:
 *  - express-validator: { errors: [{ param, msg }, ...] }
 *  - Mongoose: { errors: { field: { message }, ... } }
 *  - Flat: { path: 'field', message: '...' }
 *
 * Returns: { [fieldName]: message, ... } | null
 */
export function getFieldErrors(err) {
  const data = err?.response?.data
  if (!data) return null

  // express-validator style
  if (Array.isArray(data.errors)) {
    const out = {}
    for (const e of data.errors) {
      const key = e?.param || e?.path || e?.field
      const msg = e?.msg || e?.message || e?.error
      if (key && msg) out[key] = msg
    }
    return Object.keys(out).length ? out : null
  }

  // Mongoose style
  if (data.errors && typeof data.errors === 'object') {
    const out = {}
    for (const [k, v] of Object.entries(data.errors)) {
      const msg = v?.message || v?.msg || v?.error
      if (msg) out[k] = msg
    }
    return Object.keys(out).length ? out : null
  }

  // Flat single-field error
  if (data.path && (data.message || data.error)) {
    return { [data.path]: data.message || data.error }
  }

  return null
}

/**
 * Convenience: get the first field name that has an error (for autofocus later).
 */
export function firstErrorField(err) {
  const fields = getFieldErrors(err)
  return fields ? Object.keys(fields)[0] : null
}
