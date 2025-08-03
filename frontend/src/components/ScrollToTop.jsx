// src/components/ScrollToTop.jsx
import { useEffect } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

export default function ScrollToTop({ behavior = 'instant' }) {
  const { pathname } = useLocation()
  const navType = useNavigationType() // 'PUSH' | 'POP' | 'REPLACE'
  const main = document.getElementById('scrollable-content')

  useEffect(() => {
    if (navType !== 'POP') {
      const main = document.querySelector('main') // Choose id <main>
      if (main) {
        main.scrollTo({ top: 0, left: 0, behavior })
      } else {
        window.scrollTo({ top: 0, left: 0, behavior }) // fallback if <main> not found
      }
    }
  }, [pathname, navType, behavior])

  return null
}
