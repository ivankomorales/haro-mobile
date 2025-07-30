// src/hooks/useCreateGlaze.js
import fetchWithAuth from '../utils/fetchWithAuth'

export const useCreateGlaze = (navigate) => {
  const create = async (glazeData) => {
    try {
      const res = await fetchWithAuth('/api/glazes', {
        method: 'POST',
        body: JSON.stringify(glazeData),
      })
      return res
    } catch (err) {
      console.error('❌ Error completo:', err) // 👈 log aquí
      throw new Error(err.message || 'Failed to create glaze')
    }
  }

  return { create }
}
