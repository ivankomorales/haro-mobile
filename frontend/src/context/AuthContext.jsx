import { createContext, useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUserFromToken } from '../utils/jwt'

const AuthContext = createContext()

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (token) {
      const decoded = getUserFromToken(token)
      setUser(decoded)
    }
  }, [token])

  const login = async (email, password) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      if (!res.ok) throw new Error('Invalid credentials')
      const data = await res.json()
      localStorage.setItem('token', data.token)
      setToken(data.token)
      setUser({}) // We can decode token here if we need more data
      navigate('/home')
    } catch (err) {
      alert('Login failed: ' + err.message)
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    setToken(null)
    setUser(null)
    navigate('/')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
