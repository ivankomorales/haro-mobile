import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function PrivateRoute({ children }) {
  const { token, loading } = useAuth()

  if (loading) return null // or a spinner

  return token ? children : <Navigate to="/" replace />
}
