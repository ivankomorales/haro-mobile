// src/components/GlazeTypeahead.jsx
import { useEffect, useMemo, useRef, useState } from 'react'

function normalize(s) {
  return (s || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
}

export default function GlazeTypeahead({
  label,
  glazes = [], // [{_id, name, image?, hex?}]
  selectedId = '',
  onChange, // (id: string | '') => void
  glazeMap,
  t,
}) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const rootRef = useRef(null)
  const inputRef = useRef(null)

  const map = useMemo(() => {
    if (glazeMap) return glazeMap
    const m = new Map()
    for (const g of glazes) m.set(String(g._id), g)
    return m
  }, [glazeMap, glazes])

  const selectedGlaze = useMemo(
    () => (selectedId ? map.get(String(selectedId)) : null),
    [map, selectedId]
  )

  const filtered = useMemo(() => {
    const q = normalize(query)
    if (!q) return glazes
    // best match: starts with + contains
    const starts = []
    const contains = []
    for (const g of glazes) {
      const n = normalize(g.name)
      if (n.startsWith(q)) starts.push(g)
      else if (n.includes(q)) contains.push(g)
    }
    return [...starts, ...contains]
  }, [glazes, query])

  // Close when clicking outside
  useEffect(() => {
    const onDocPointerDown = (e) => {
      if (!rootRef.current) return
      if (!rootRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', onDocPointerDown)
    return () => document.removeEventListener('pointerdown', onDocPointerDown)
  }, [])

  const commit = (id) => {
    onChange(id)
    setQuery('') // clear filter
    setOpen(false)
    // keep focus so the user can keep typing if needed
    // requestAnimationFrame(() => inputRef.current?.focus())
  }

  return (
    <div className="mb-4" ref={rootRef}>
      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-white">
        {label}
      </label>

      <div className="relative">
        <div
          className="flex items-center gap-2 rounded border p-2 dark:border-gray-700 dark:bg-neutral-900"
          onClick={() => setOpen(true)}
        >
          {/* thumbnail or color */}
          {selectedGlaze?.image ? (
            <img
              src={selectedGlaze.image}
              alt={selectedGlaze.name}
              title={selectedGlaze.name}
              className="h-6 w-6 flex-shrink-0 rounded object-cover"
            />
          ) : (
            <span
              className="h-6 w-6 flex-shrink-0 rounded border"
              style={{ backgroundColor: selectedGlaze?.hex || '#fff' }}
              title={selectedGlaze?.name || ''}
            />
          )}

          <input
            ref={inputRef}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setOpen(true)
            }}
            onFocus={() => setOpen(true)}
            placeholder={selectedGlaze?.name || t('product.glazeSearch')}
            className="flex-1 bg-transparent text-sm text-black outline-none dark:text-white"
            autoComplete="off"
            autoCorrect="off"
            spellCheck={false}
            inputMode="search"
          />

          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-label="Abrir"
            className="ui-open:rotate-180 ml-1 rounded p-1 transition"
          >
            ▼
          </button>
        </div>

        {open && (
          <div
            // IMPORTANT: don't use a portal here to keep it simple and stable
            className="absolute z-[9999] mt-1 max-h-60 w-full touch-manipulation overflow-auto overscroll-contain rounded border border-gray-300 bg-white shadow dark:border-gray-700 dark:bg-neutral-800"
          >
            {/* Empty option */}
            <button
              type="button"
              // pointerdown ensures selection before blur on iOS
              onPointerDown={(e) => {
                e.preventDefault()
                commit('')
              }}
              className="ui-active:bg-gray-100 dark:ui-active:bg-neutral-700 block w-full cursor-pointer px-4 py-2 text-left text-sm"
            >
              {t('product.glazeNone')}
            </button>

            {filtered.length > 0 ? (
              filtered.map((g) => (
                <button
                  key={g._id}
                  type="button"
                  onPointerDown={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    commit(g._id)
                  }}
                  className="block w-full cursor-pointer px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-neutral-700"
                >
                  <span className="flex items-center gap-2">
                    {g.image ? (
                      <img src={g.image} alt={g.name} className="h-6 w-6 rounded object-cover" />
                    ) : (
                      <span className="h-6 w-6 rounded border" style={{ backgroundColor: g.hex }} />
                    )}
                    {g.name}
                  </span>
                </button>
              ))
            ) : (
              <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-300">
                {t('product.glazeNoResult')}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
