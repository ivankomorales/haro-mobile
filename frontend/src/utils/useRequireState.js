// src/utils/useRequireState.js

import { useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

/**
 * Hook that verifies a condition based on location.state. Redirects if the condition fails.
 *
 * @param {(state: any) => boolean} check - Function that returns true if state is valid
 * @param {string} redirectTo - Route to redirect to if check fails
 * @param {() => any} [buildState] - Optional function to build state for the redirect
 */
export function useRequireState(check, redirectTo, buildState) {
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const ok = check(location.state)
    if (!ok) {
      navigate(redirectTo, {
        replace: true,
        state: buildState ? buildState() : undefined,
      })
    }

    /**
     * Note: If the linter complains about "exhaustive-deps",
     * you can wrap `check` and `buildState` in useCallback in the calling component,
     * or disable the rule for this line.
     * eslint-disable-next-line react-hooks/exhaustive-deps
     */
  }, [location.state, navigate, redirectTo])
}
