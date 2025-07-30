// src/utils/jwt.js
export function getUserFromToken() {
  const token = localStorage.getItem('token')
  if (!token) return null

  try {
    const [, payload] = token.split('.') // [header, payload, signature]
    const decoded = JSON.parse(atob(payload))
    return decoded
  } catch (err) {
    console.error('Invalid token', err)
    return null
  }
}
