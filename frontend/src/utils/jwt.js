// src/utils/jwt.js
export function getUserFromToken() {
  const token = localStorage.getItem('token')
  if (!token) return null

  try {
    const [, payload] = token.split('.') // [header, payload, signature]
    const decoded = JSON.parse(atob(payload))

    // Validar si el token ha expirado
    const now = Date.now() / 1000 // en segundos
    if (decoded.exp && decoded.exp < now) {
      console.warn('Token expired')
      return null
    }

    return decoded
  } catch (err) {
    console.error('Invalid token', err)
    return null
  }
}
