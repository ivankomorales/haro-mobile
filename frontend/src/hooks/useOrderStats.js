// src/hooks/useOrderStats.js
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { getOrderStats } from '../api/orders'

export function useOrderStats({ filters, search, range = 'month', dateField = 'orderDate' }) {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [stats, setStats] = useState(null)
  const [curRange, setCurRange] = useState(range)
  const bump = useRef(0) // manual invalidation counter

  // Build stable params from current filters
  const params = useMemo(() => {
    const p = {
      range: curRange,
      dateField,
      q: search || undefined,
      status: filters?.status && filters.status !== 'all' ? filters.status : undefined,
      urgent: filters?.isUrgent === '' ? undefined : filters?.isUrgent === 'true',
      shipping: filters?.shippingRequired === '' ? undefined : filters?.shippingRequired === 'true',
    }
    // Custom explicit dates override range
    if (filters?.dateFrom) p.from = filters.dateFrom
    if (filters?.dateTo) p.to = filters.dateTo
    return p
  }, [filters, search, curRange, dateField])

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
    let ignore = false
    ;(async () => {
      await fetchStats()
    })()
    return () => {
      ignore = true
    }
  }, [fetchStats, bump.current]) // eslint-disable-line

  const refresh = useCallback(() => {
    bump.current++
    fetchStats()
  }, [fetchStats])

  return { stats, loading, error, refresh, range: curRange, setRange: setCurRange }
}
