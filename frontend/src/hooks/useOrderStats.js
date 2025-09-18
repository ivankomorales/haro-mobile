// src/hooks/useOrderStats.js
import { useCallback, useEffect, useMemo, useState } from 'react'
import { getOrderStats } from '../api/orders'

export function useOrderStats({
  range = 'all',
  dateField = 'orderDate',
  includeCancelled = false,
} = {}) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState(null)

  // Current state (configurable from outside)
  const [curRange, setRange] = useState(range)
  const [curIncludeCancelled, setIncludeCancelled] = useState(includeCancelled)
  const [curDateField, setDateField] = useState(dateField)

  // Manual invalidation counter — but now using state
  const [refreshIndex, setRefreshIndex] = useState(0)

  // Parameters for the API
  const params = useMemo(() => {
    const p = {
      range: curRange,
      dateField: curDateField,
    }
    if (curIncludeCancelled) p.includeCancelled = true
    return p
  }, [curRange, curDateField, curIncludeCancelled])

  const fetchStats = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getOrderStats(params)
      setStats(data)
    } catch (e) {
      console.error('[useOrderStats] fetch error', e)
      setError(e)
    } finally {
      setLoading(false)
    }
  }, [params])

  useEffect(() => {
    fetchStats()
  }, [fetchStats, refreshIndex]) // notice refreshIndex here

  const refresh = useCallback(() => {
    // increment refreshIndex, triggering useEffect
    setRefreshIndex((i) => i + 1)
  }, [])

  return {
    stats,
    loading,
    error,
    range: curRange,
    setRange,
    dateField: curDateField,
    setDateField,
    includeCancelled: curIncludeCancelled,
    setIncludeCancelled,
    refresh,
  }
}
