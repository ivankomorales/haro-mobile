// src/components/GlazeSelect.jsx
import {
  Combobox,
  ComboboxInput,
  ComboboxOptions,
  ComboboxOption,
} from '@headlessui/react'
import { useState } from 'react'

export default function GlazeSelect({
  label,
  glazes = [],
  selected,
  onChange,
}) {
  const [query, setQuery] = useState('')

  const filteredGlazes =
    query === ''
      ? glazes
      : glazes.filter((g) => g.name.toLowerCase().includes(query.toLowerCase()))

  const getDisplayName = (id) => {
    const match = glazes.find((g) => g._id === id)
    return match ? match.name : ''
  }

  const getDisplayImage = (id) => {
    const match = glazes.find((g) => g._id === id)
    return match?.image || null
  }

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
        {label}
      </label>
      <Combobox value={selected} onChange={onChange}>
        <div className="relative">
          <div className="flex items-center gap-2 border p-2 rounded dark:bg-neutral-900 dark:border-gray-700">
            {getDisplayImage(selected) ? (
              <img
                src={getDisplayImage(selected)}
                alt="glaze"
                className="w-6 h-6 rounded"
              />
            ) : (
              <span
                className="w-6 h-6 rounded border"
                style={{
                  backgroundColor:
                    glazes.find((g) => g._id === selected)?.hex || '#fff',
                }}
              />
            )}

            <ComboboxInput
              className="flex-1 outline-none bg-transparent text-sm text-black dark:text-white"
              onChange={(e) => setQuery(e.target.value)}
              displayValue={getDisplayName}
              placeholder="Buscar esmalte..."
            />
          </div>

          <ComboboxOptions className="absolute z-10 w-full mt-1 max-h-60 overflow-auto bg-white dark:bg-neutral-800 border border-gray-300 dark:border-gray-700 rounded shadow">
            <ComboboxOption
              value=""
              className={({ active }) =>
                `cursor-pointer px-4 py-2 text-sm ${
                  active ? 'bg-gray-100 dark:bg-neutral-700' : ''
                }`
              }
            >
              Sin esmalte
            </ComboboxOption>
            {filteredGlazes.map((g) => (
              <ComboboxOption
                key={g._id}
                value={g._id}
                className={({ active }) =>
                  `cursor-pointer px-4 py-2 text-sm flex items-center gap-2 ${
                    active ? 'bg-gray-100 dark:bg-neutral-700' : ''
                  }`
                }
              >
                {g.image ? (
                  <img src={g.image} alt={g.name} className="w-6 h-6 rounded" />
                ) : (
                  <span
                    className="w-6 h-6 rounded border"
                    style={{ backgroundColor: g.hex }}
                  />
                )}
                {g.name}
              </ComboboxOption>
            ))}
          </ComboboxOptions>
        </div>
      </Combobox>
    </div>
  )
}
