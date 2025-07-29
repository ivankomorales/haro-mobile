// src/hooks/useCreateGlaze.js
import { createGlaze } from '../api/glazes'

export function useCreateGlaze(navigate) {
  const create = async (glazeData) => {
    const res = await createGlaze(glazeData, navigate)
    if (!res || res.error)
      throw new Error(res.message || 'Failed to create glaze')
    return res
  }

  return { create }
}
