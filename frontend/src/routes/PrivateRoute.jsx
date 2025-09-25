// src/routes/PrivateRoute.jsx
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function PrivateRoute({ children }) {
  const { token, loading } = useAuth()
  const location = useLocation()

  if (loading) return null // or a spinner

  if (token) return children
  // Store where the user wanted to go, so login can return there
  try {
    const from = location.pathname + location.search + location.hash
    sessionStorage.setItem('postLoginRedirect', from)
  } catch {}
  return <Navigate to="/" replace />
}
