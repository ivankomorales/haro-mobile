export default async function fetchWithAuth(
  url,
  options = {},
  navigate = null
) {
  const token = localStorage.getItem('token')

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
      // fallback if body isn't JSON
      try {
        const raw = await clone.text()
        data = { message: raw }
      } catch {
        data = { message: 'Unknown error' }
      }
    }

    if (!res.ok) {
      console.error('[fetchWithAuth] Server error:', res.status, data)

      if (res.status === 401 || res.status === 403) {
        if (navigate) navigate('/login')
        throw new Error('Unauthorized: token expired or invalid')
      }

      if (res.status === 422 || res.status === 400) {
        const fieldErrors = (data.errors || [])
          .map((e, i) => `${e.param || `[field ${i + 1}]`}: ${e.msg}`)
          .join(' | ')
        throw new Error(
          `${data.message || 'Validation failed'}: ${fieldErrors}`
        )
      }

      throw new Error(data.message || 'Request failed')
    }

    return data
  } catch (err) {
    console.error('fetchWithAuth error:', err)
    throw err
  }
}
