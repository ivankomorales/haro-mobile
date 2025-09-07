// comments in English only
import { useEffect, useRef, useState } from 'react'

export default function useKeyboardOpen() {
  const [open, setOpen] = useState(false)
  const baseHeightRef = useRef(null)
  const rafRef = useRef()

  useEffect(() => {
    // Helper: decide with a threshold if keyboard is open
    const isKbOpenFromHeights = (current, base) => {
      // threshold ~120px works bien en iOS/Android
      const THRESHOLD = 120
      return base - current > THRESHOLD
    }

    const vv = window.visualViewport

    // Set initial base height (prefer visualViewport.height)
    const setBaseHeight = () => {
      baseHeightRef.current = vv?.height ?? window.innerHeight
    }
    setBaseHeight()

    const onFocusIn = (e) => {
      const t = e.target
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) {
        // Likely opening the keyboard
        setOpen(true)
      }
    }

    const onFocusOut = () => {
      // If keyboard is still open (e.g. predictive bar?), resize handler will correct.
      setOpen(false)
    }

    // Handle keyboard open/close via viewport resize (when OS button toggles keyboard)
    const onViewportChange = () => {
      // Debounce with rAF to avoid jitter
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(() => {
        const current = vv?.height ?? window.innerHeight
        const base = baseHeightRef.current ?? current
        // If orientation changed or major layout change, refresh base height
        const ORIENTATION_JUMP = 300
        if (Math.abs(current - base) > window.innerHeight - 100 && !document.activeElement) {
          setBaseHeight()
          setOpen(false)
          return
        }
        setOpen(isKbOpenFromHeights(current, base))
      })
    }

    // Recompute base height on orientation changes or when the page becomes visible
    const onResize = () => {
      // If no element is focused, treat as layout change and refresh base
      if (!document.activeElement || document.activeElement === document.body) {
        setBaseHeight()
        setOpen(false)
      } else {
        // If something is focused, let visualViewport handler decide
        onViewportChange()
      }
    }

    window.addEventListener('focusin', onFocusIn)
    window.addEventListener('focusout', onFocusOut)
    window.addEventListener('resize', onResize)
    vv?.addEventListener('resize', onViewportChange)
    vv?.addEventListener('scroll', onViewportChange) // iOS sometimes fires scroll instead of resize

    return () => {
      window.removeEventListener('focusin', onFocusIn)
      window.removeEventListener('focusout', onFocusOut)
      window.removeEventListener('resize', onResize)
      vv?.removeEventListener('resize', onViewportChange)
      vv?.removeEventListener('scroll', onViewportChange)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  return open
}
