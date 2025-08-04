// src/context/AuthContext.jsx
import { createContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUserFromToken, isTokenExpired } from '../utils/jwt'
import { showError, showSuccess } from '../utils/toastUtils'

// No default export ❌
export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const storedToken = localStorage.getItem('token')

    if (!storedToken) {
      setLoading(false)
      return
    }

    const expired = isTokenExpired(storedToken)
    const decoded = getUserFromToken(storedToken)

    if (decoded && !expired) {
      setUser(decoded)
      setToken(storedToken)
    } else {
      console.warn('[Auth] Token inválido o expirado en hot reload.')
      setUser(null)
      setToken(null)
      logout(true) // true = expired session
    }

    setLoading(false)
  }, [])

  const login = async (email, password) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) throw new Error('auth.loginFailed')
      const data = await res.json()
      if (!data.token) throw new Error('auth.invalidToken')

      localStorage.setItem('token', data.token)
      setToken(data.token)
      const decoded = getUserFromToken(data.token)
      setUser(decoded)
      navigate('/home')
    } catch (err) {
      const key = err.message?.startsWith('auth.')
        ? err.message
        : 'auth.serverError'
      showError(key)
    }
  }

  const logout = (expired = false) => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    expired
      ? showError('auth.sessionExpired')
      : showSuccess('auth.loggedOut')
    navigate('/', { replace: true })
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isLoggedIn: Boolean(user),
        isAdmin: user?.role === 'admin',
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
