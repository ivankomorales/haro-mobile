// src/components/ScrollToTop.jsx
import { useEffect } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

export default function ScrollToTop({ behavior = 'instant' }) {
  const { pathname } = useLocation()
  const navType = useNavigationType() // 'PUSH' | 'POP' | 'REPLACE'

  useEffect(() => {
    // Sube al top solo en navegaciones nuevas o reemplazos.
    // Si es 'POP' (volver atrás/adelante), conserva el scroll del usuario.
    if (navType !== 'POP') {
      window.scrollTo({ top: 0, left: 0, behavior })
    }
  }, [pathname, navType, behavior])

  return null
}
