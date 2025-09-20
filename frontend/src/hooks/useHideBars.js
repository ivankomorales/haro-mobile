// useHideBars.js
import { useMediaQuery } from 'react-responsive'
import { useLocation, matchPath } from 'react-router-dom'

import { HIDE_BARS_ROUTES } from '../utils/constants'

export default function useHideBars() {
  const { pathname } = useLocation()
  const isDesktop = useMediaQuery({ minWidth: 1024 })

  // Si es desktop, no ocultamos barras aunque coincida la ruta
  if (isDesktop) return false

  return HIDE_BARS_ROUTES.some((pattern) => matchPath({ path: pattern, end: false }, pathname))
}
