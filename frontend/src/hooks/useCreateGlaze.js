// src/hooks/useCreateGlaze.js
// comments in English only
import { useCallback } from 'react'
import { useAuthedFetch } from './useAuthedFetch'
import { createGlaze as apiCreateGlaze } from '../api/glazes'
import { showLoading, dismissToast, showSuccess, showError } from '../utils/toastUtils'

/**
 * Creates a glaze using an authenticated fetcher bound to router + logout.
 * Returns a stable `create(payload)` function that throws on error.
 */
export function useCreateGlaze() {
  const fetcher = useAuthedFetch()

  const create = useCallback(
    async (payload) => {
      const toastId = showLoading('glaze.creating') // i18n key
      try {
        const res = await apiCreateGlaze(payload, { fetcher })
        showSuccess('success.glaze.created') // i18n key
        return res
      } catch (err) {
        showError(err?.message || 'glaze.createFailed')
        throw err
      } finally {
        dismissToast(toastId)
      }
    },
    [fetcher]
  )

  return { create }
}
