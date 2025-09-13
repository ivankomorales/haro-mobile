// comments in English only
import { createContext, useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUserFromToken, isTokenExpired } from '../utils/jwt'
import { showError, showSuccess } from '../utils/toastUtils'
import { apiLogin, apiLogout } from '../api/auth'
import { getMe } from '../api/users'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const refreshUser = useCallback(async () => {
    try {
      const me = await getMe()
      setUser((prev) => ({ ...(prev || {}), ...me })) // merge
    } catch {
      // si falla, no tumbes la sesión aquí
    }
  }, [])

  useEffect(() => {
    const stored = localStorage.getItem('token')
    if (!stored) {
      setLoading(false)
      return
    }
    if (!isTokenExpired(stored)) {
      setToken(stored)
      setUser(getUserFromToken(stored))
      refreshUser().finally(() => setLoading(false))
    } else {
      localStorage.removeItem('token')
      setLoading(false)
    }
  }, [refreshUser])

  // Rename to avoid confusion with apiLogin
  const handleLogin = async (email, password) => {
    const data = await apiLogin(email, password) // throws on error
    if (!data?.token) throw new Error('auth.invalidToken')
    localStorage.setItem('token', data.token)
    setToken(data.token)
    setUser(getUserFromToken(data.token))
    await refreshUser()
    navigate('/home')
  }

  const logout = (expired = false) => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    expired ? showError('auth.sessionExpired') : showSuccess('auth.loggedOut')
    navigate('/', { replace: true })
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login: handleLogin, // expose the context login
        logout,
        isLoggedIn: Boolean(user),
        isAdmin: user?.role === 'admin',
        loading,
        refreshUser,
        // setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
