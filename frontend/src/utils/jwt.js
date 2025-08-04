// src/utils/jwt.js

// Extracts and returns user information from the JWT stored in localStorage.
// Returns null if there's no token, it's invalid, or it's expired.
export function getUserFromToken() {
  const token = localStorage.getItem('token')
  if (!token) return null

  try {
    const [, payload] = token.split('.') // [header, payload, signature]
    const decoded = JSON.parse(atob(payload))

    // Check if the token has expired
    const now = Date.now() / 1000 // in seconds
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

export function isTokenExpired(token) {
  try {
    const user = getUserFromToken(token)
    if (!user?.exp) return true
    const now = Date.now() / 1000
    return now > user.exp
  } catch {
    return true
  }
}
