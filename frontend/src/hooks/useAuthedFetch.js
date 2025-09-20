// useAuthedFetch.js
import { useNavigate } from 'react-router-dom'
import fetchWithAuth from '../utils/fetchWithAuth'

export default function useAuthedFetch() {
  const navigate = useNavigate()
  const logout = (expired) => {
    localStorage.removeItem('token')
    // clear context/store if needed
  }
  return (url, options = {}) => fetchWithAuth(url, options, { navigate, logout })
}
