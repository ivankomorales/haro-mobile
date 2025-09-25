// comments in English only
// src/hooks/useUserPrefs.js
import { useCallback, useEffect, useState } from 'react'
import { useAuthedFetch } from './useAuthedFetch'
import { getMyPreference, setMyPreference } from '../api/preferences'

export function useUserPrefs(namespace, defaultValue) {
  const authedFetch = useAuthedFetch()
  const [value, setValue] = useState(defaultValue)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const res = await getMyPreference(namespace, { fetcher: authedFetch })
        if (alive && res?.value != null) setValue(res.value)
      } catch (e) {
        // optional: fallback local here if te interesa offline
      } finally {
        if (alive) setLoading(false)
      }
    })()
    return () => {
      alive = false
    }
  }, [namespace, authedFetch])

  const save = useCallback(
    async (next) => {
      setValue(next)
      try {
        await setMyPreference(namespace, next, { fetcher: authedFetch })
      } catch (e) {
        setError(e)
      }
    },
    [namespace, authedFetch]
  )

  return { value, setValue, save, loading, error }
}
