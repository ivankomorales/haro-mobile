// src/components/GlazeSelect.jsx
import {
  Combobox,
  ComboboxInput,
  ComboboxOptions,
  ComboboxOption,
  ComboboxButton,
} from '@headlessui/react'
import { useMemo, useState } from 'react'
import { ChevronDown } from 'lucide-react'

export default function GlazeSelect({
  label,
  glazes = [],
  selected, // string id | object {_id,...} | ''
  onChange, // (id: string | '') => void
  placeholderText = 'Buscar esmalte...',
  noneText = 'Sin esmalte',
  noResultsText = 'Sin resultados',
  ariaLabelText = 'Esmalte',
}) {
  const [query, setQuery] = useState('')

  // Normalize external selected to an ID (or '')
  const selectedId = useMemo(() => {
    if (!selected) return ''
    if (typeof selected === 'string') return selected
    return selected?._id ?? ''
  }, [selected])

  const selectedGlaze = useMemo(
    () => glazes.find((g) => g._id === selectedId),
    [glazes, selectedId]
  )

  const filteredGlazes = useMemo(() => {
    if (!query) return glazes
    const q = query.toLowerCase()
    return glazes.filter((g) => g.name.toLowerCase().includes(q))
  }, [glazes, query])

  return (
    <div className="mb-4">
      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-white">
        {label}
      </label>

      {/* Headless UI Combobox works best when value is the primitive we compare (id) */}
      <Combobox value={selectedId} onChange={(val) => onChange(val)}>
        <div className="relative">
          <div className="flex items-center gap-2 rounded border p-2 dark:border-gray-700 dark:bg-neutral-900">
            {/* Thumbnail or color square */}
            {selectedGlaze?.image ? (
              <img
                src={selectedGlaze.image}
                alt={selectedGlaze.name}
                title={selectedGlaze.name}
                className="h-6 w-6 rounded"
              />
            ) : (
              <span
                className="h-6 w-6 rounded border"
                style={{ backgroundColor: selectedGlaze?.hex || '#fff' }}
                title={selectedGlaze?.name || ''}
              />
            )}

            <ComboboxInput
              aria-label={ariaLabelText}
              className="flex-1 bg-transparent text-sm text-black outline-none dark:text-white"
              // IMPORTANT: let HeadlessUI render the visible value via displayValue
              displayValue={(id) => glazes.find((g) => g._id === id)?.name || ''}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholderText}
            />

            <ComboboxButton className="ui-open:rotate-180 ml-1 rounded p-1 transition">
              <ChevronDown size={16} />
            </ComboboxButton>
          </div>

          <ComboboxOptions className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded border border-gray-300 bg-white shadow dark:border-gray-700 dark:bg-neutral-800">
            {/* None option */}
            <ComboboxOption
              value=""
              className="ui-active:bg-gray-100 ui-active:dark:bg-neutral-700 cursor-pointer px-4 py-2 text-sm"
            >
              {noneText}
            </ComboboxOption>

            {filteredGlazes.length > 0 ? (
              filteredGlazes.map((g) => (
                <ComboboxOption
                  key={g._id}
                  value={g._id} // we always return the id
                  className="ui-active:bg-gray-100 ui-active:dark:bg-neutral-700 flex cursor-pointer items-center gap-2 px-4 py-2 text-sm"
                >
                  {g.image ? (
                    <img src={g.image} alt={g.name} className="h-6 w-6 rounded" />
                  ) : (
                    <span className="h-6 w-6 rounded border" style={{ backgroundColor: g.hex }} />
                  )}
                  {g.name}
                </ComboboxOption>
              ))
            ) : (
              <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-300">
                {noResultsText}
              </div>
            )}
          </ComboboxOptions>
        </div>
      </Combobox>
    </div>
  )
}
