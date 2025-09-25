// src/context/I18nContext.jsx
// comments in English only
import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react'
import * as i18nUtil from '../utils/getMessage'

// Safe wrappers around whatever getMessage.js actually exports
const utilGetMessage = i18nUtil.getMessage || ((key) => key)
const utilSetLocale = i18nUtil.setLocale || (() => {})
const utilGetLocale = i18nUtil.getLocale || (() => null)

const I18nContext = createContext(null)
I18nContext.displayName = 'I18nContext'

export function I18nProvider({ children }) {
  // Prefer saved locale -> util's current -> default 'es'
  const [locale, setLocaleState] = useState(() => {
    return localStorage.getItem('locale') || utilGetLocale() || 'en'
  })

  useEffect(() => {
    try {
      utilSetLocale(locale) // noop if not provided
      localStorage.setItem('locale', locale)
      document.documentElement.lang = locale
      document.documentElement.dir = ['ar', 'he', 'fa', 'ur'].includes(locale) ? 'rtl' : 'ltr'
    } catch {}
  }, [locale])

  const setLocale = useCallback((next) => setLocaleState(next), [])

  // Bind the translator; it will use whatever util implements internally
  const t = useCallback((key, vars) => utilGetMessage(key, vars), [])

  const value = useMemo(() => ({ locale, setLocale, t }), [locale, setLocale, t])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within <I18nProvider>.')
  return ctx
}
