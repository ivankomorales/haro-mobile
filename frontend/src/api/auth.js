// src/api/auth.js

/**
 * Login user and receive token.
 *
 * @param {object} credentials - Must include email and password.
 * @returns {Promise<{ token: string, user: object }>}
 */
export const login = async (credentials) => {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data.message || 'Login failed')
  }

  return data
}

/**
 * Logout user by clearing session and redirecting.
 *
 * @param {function} navigate - Router navigate function.
 */
export const logout = (navigate) => {
  localStorage.removeItem('token')
  navigate('/login')
}
