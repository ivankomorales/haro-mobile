// src/components/LanguageSwitcher.jsx
// comments in English only
import { useMemo, useState } from 'react'
import { useI18n } from '../context/I18nContext'
import { AVAILABLE_LOCALES } from '../utils/getMessage'
// optional: persist to backend
import { useAuthedFetch } from '../hooks/useAuthedFetch'

const LABELS = {
  es: 'Español',
  en: 'English',
}

export default function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n()
  const authedFetch = useAuthedFetch()
  const [saving, setSaving] = useState(false)

  const options = useMemo(
    () => AVAILABLE_LOCALES.map((lc) => ({ value: lc, label: LABELS[lc] || lc })),
    []
  )

  async function onChange(e) {
    const next = e.target.value
    setLocale(next) // triggers runtime re-render + persists to localStorage via I18nProvider

    // Optional: persist user preference to backend (ignore errors silently)
    setSaving(true)
    try {
      await authedFetch('/api/users/me/preferences', {
        method: 'PATCH',
        body: { locale: next },
      })
    } catch {
      /* noop */
    } finally {
      setSaving(false)
    }
  }

  return (
    <label className="inline-flex items-center gap-2 text-sm">
      <span className="sr-only">{t('i18n.language')}</span>
      <select
        value={locale}
        onChange={onChange}
        disabled={saving}
        aria-label={t('i18n.language')}
        className="rounded border px-2 py-1 dark:border-neutral-700 dark:bg-neutral-900"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  )
}
