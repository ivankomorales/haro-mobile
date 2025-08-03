// src/context/AuthContext.jsx
import { createContext, useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUserFromToken } from '../utils/jwt'
import { showError, showSuccess } from '../utils/toastUtils'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    if (token) {
      const decoded = getUserFromToken(token)
      if (decoded) {
        setUser(decoded)
      } else {
        logout(true) // sesión expirada
      }
    }
    setLoading(false)
  }, [token])

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
      const messageKey = err?.message?.startsWith('auth.')
        ? err.message
        : 'auth.serverError'

      showError(messageKey)
    }
  }

  const logout = (expired = false) => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    if (expired) {
      showError('auth.sessionExpired')
    } else {
      showSuccess('auth.loggedOut')
    }
    navigate('/')
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

export const useAuth = () => useContext(AuthContext)
