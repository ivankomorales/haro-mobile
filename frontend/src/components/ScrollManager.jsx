// src/components/ScrollManager.jsx
import { useEffect } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

export default function ScrollManager({
  behavior = 'auto', // 'auto' | 'smooth'
  keyBy = 'pathname', // 'pathname' | 'full' (full = pathname+search)
  respectBackForward = true, // keep browser's scroll restore on POP
}) {
  const location = useLocation()
  const navType = useNavigationType()

  // choose the key that triggers the scroll reset
  const key = keyBy === 'full' ? `${location.pathname}|${location.search}` : location.pathname

  useEffect(() => {
    const scroller = document.querySelector('#scrollable-content')

    // Si hay hash → scroll al elemento
    if (location.hash) {
      const el = document.getElementById(location.hash.slice(1))
      if (el) {
        el.scrollIntoView()
        return
      }
    }

    // Si es popstate (back/forward) y quieres respetar el scroll, salimos
    if (respectBackForward && navType === 'POP') return

    // Si el contenedor existe, reseteamos su scroll
    if (scroller) {
      scroller.scrollTo({ top: 0, behavior })
    }
  }, [key, location.hash, navType])

  return null
}
