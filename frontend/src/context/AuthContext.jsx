// src/context/AuthContext.jsx
// comments in English only
import { createContext, useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { login, logoutServer } from '../api/auth'
import { getMe } from '../api/users'
import { getUserFromToken, isTokenExpired } from '../utils/jwt'
import { showError, showSuccess } from '../utils/toastUtils'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const location = useLocation()

  const refreshUser = useCallback(async () => {
    try {
      const me = await getMe() // uses fetchWithAuth under the hood
      setUser((prev) => ({ ...(prev || {}), ...me })) // merge
    } catch (e) {
      const msg = String(e?.message || '')
      // fetchWithAuth throws 'auth.sessionExpired' on 401/403
      if (msg === 'auth.sessionExpired' || /401|403/.test(msg)) {
        // silent local cleanup; fetchWithAuth already handled toast + redirect
        setToken(null)
        setUser(null)
      } else {
        // transient/network error → keep session
        console.warn('[refreshUser] non-auth error ignored:', e)
      }
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

  // One-time toast when redirected due to session expiration (works even if logout() wasn't called)
  useEffect(() => {
    try {
      const params = new URLSearchParams(location.search)
      const reason = params.get('reason')
      const flag = sessionStorage.getItem('loginReason')
      // Show exactly once
      if (reason === 'sessionExpired' || flag === 'sessionExpired') {
        sessionStorage.removeItem('loginReason')
        showError('auth.sessionExpired')
      }
    } catch {}
  }, [location])

  // Renamed to avoid confusion with apiLogin
  const handleLogin = useCallback(
    async (email, password) => {
      const data = await login({ email, password }) // throws on error
      if (!data?.token) throw new Error('auth.invalidToken')

      // Save the token
      localStorage.setItem('token', data.token)
      setToken(data.token)
      setUser(getUserFromToken(data.token))
      await refreshUser()

      // Redirect: back to where user was, or fallback to /home
      const redirectTo = sessionStorage.getItem('postLoginRedirect') || '/home'
      sessionStorage.removeItem('postLoginRedirect')
      navigate(redirectTo, { replace: true })
    },
    [navigate, refreshUser] // deps
  )

  const logout = useCallback(
    async (expired = false) => {
      // Audit the logout only if not expired; ignore failures silently
      if (!expired) {
        try {
          await logoutServer()
        } catch {}
      }
      localStorage.removeItem('token')
      setToken(null)
      setUser(null)
      expired ? showError('auth.sessionExpired') : showSuccess('auth.loggedOut')
      navigate('/', { replace: true })
    },
    [navigate]
  )

  const value = useMemo(
    () => ({
      user,
      token,
      login: handleLogin,
      logout,
      isLoggedIn: Boolean(user),
      isAdmin: user?.role === 'admin',
      loading,
      refreshUser,
    }),
    [user, token, handleLogin, logout, loading, refreshUser]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
