// comments in English only
import { createContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUserFromToken, isTokenExpired } from '../utils/jwt'
import { showError, showSuccess } from '../utils/toastUtils'
import { apiLogin, apiLogout } from '../api/auth'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const stored = localStorage.getItem('token')
    if (!stored) {
      setLoading(false)
      return
    }
    if (!isTokenExpired(stored)) {
      setToken(stored)
      setUser(getUserFromToken(stored))
    } else {
      localStorage.removeItem('token')
    }
    setLoading(false)
  }, [])
  // Rename to avoid confusion with apiLogin
  const handleLogin = async (email, password) => {
    const data = await apiLogin(email, password) // throws on error
    if (!data?.token) throw new Error('auth.invalidToken')
    localStorage.setItem('token', data.token)
    setToken(data.token)
    setUser(getUserFromToken(data.token))
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
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
