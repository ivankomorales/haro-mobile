// src/hooks/useAuthedFetch.js
// comments in English only
import { useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './useAuth'
import fetchWithAuth from '../utils/fetchWithAuth'

export function useAuthedFetch() {
  const navigate = useNavigate()
  const { logout } = useAuth()

  // Keep latest logout without changing the callback identity
  const logoutRef = useRef(logout)
  useEffect(() => {
    logoutRef.current = logout
  }, [logout])

  const call = useCallback(
    (url, options) => fetchWithAuth(url, options, { navigate, logout: logoutRef.current }),
    [navigate] // navigate is stable in react-router
  )

  return call
}
