// src/components/GlazeSelect.jsx
import {
  Combobox,
  ComboboxInput,
  ComboboxOptions,
  ComboboxOption,
  ComboboxButton,
  // opcional si más abajo usas <Portal>
  // Portal,
} from '@headlessui/react'
import { useMemo, useState } from 'react'
import { ChevronDown } from 'lucide-react'

export default function GlazeSelect({
  label,
  glazes = [],
  selected,
  onChange,
  placeholderText = 'Buscar esmalte...',
  noneText = 'Sin esmalte',
  noResultsText = 'Sin resultados',
  ariaLabelText = 'Esmalte',
}) {
  const [query, setQuery] = useState('')

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

      <Combobox
        value={selectedId}
        onChange={(val) => {
          onChange(val)
          setQuery('') // 👈 limpia el filtro después de seleccionar
        }}
      >
        <div className="relative">
          <div className="flex items-center gap-2 rounded border p-2 dark:border-gray-700 dark:bg-neutral-900">
            {selectedGlaze?.image ? (
              <img
                src={selectedGlaze.image}
                alt={selectedGlaze.name}
                title={selectedGlaze.name}
                className="h-6 w-6 rounded object-cover"
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
              displayValue={(id) => glazes.find((g) => g._id === id)?.name || ''}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={placeholderText}
              autoComplete="off" // 👈 ayuda en iOS/Android
              autoCorrect="off"
              spellCheck={false}
              inputMode="search"
            />

            <ComboboxButton className="ui-open:rotate-180 ml-1 rounded p-1 transition">
              <ChevronDown size={16} />
            </ComboboxButton>
          </div>

          {/* Si tu HeadlessUI es v2 puedes usar anchor="bottom start" aquí */}
          <ComboboxOptions
            // anchor="bottom start"  // 👈 (solo v2) posiciona bien y mejora toques
            className="absolute z-50 mt-1 max-h-60 w-full touch-manipulation overflow-auto rounded border border-gray-300 bg-white shadow dark:border-gray-700 dark:bg-neutral-800"
          >
            {/* Opción "ninguno" como botón clickeable */}
            <ComboboxOption
              as="button" // 👈 opción es un botón real
              type="button"
              value=""
              className="ui-active:bg-gray-100 ui-active:dark:bg-neutral-700 block w-full cursor-pointer px-4 py-2 text-left text-sm"
            >
              {noneText}
            </ComboboxOption>

            {filteredGlazes.length > 0 ? (
              filteredGlazes.map((g) => (
                <ComboboxOption
                  as="button" // 👈 botón = taps fiables en móvil
                  type="button"
                  key={g._id}
                  value={g._id}
                  className="ui-active:bg-gray-100 ui-active:dark:bg-neutral-700 block w-full cursor-pointer px-4 py-2 text-left text-sm"
                >
                  <span className="flex items-center gap-2">
                    {g.image ? (
                      <img src={g.image} alt={g.name} className="h-6 w-6 rounded object-cover" />
                    ) : (
                      <span className="h-6 w-6 rounded border" style={{ backgroundColor: g.hex }} />
                    )}
                    {g.name}
                  </span>
                </ComboboxOption>
              ))
            ) : (
              <div className="px-4 py-2 text-sm text-gray-500 dark:text-gray-300">
                {noResultsText}
              </div>
            )}
          </ComboboxOptions>

          {/* --- OPCIONAL SI AÚN TIENES TOQUES “FANTASMA” ---
              Envuelve <ComboboxOptions> en <Portal> para sacarlo del contenedor y evitar
              solapes/z-index raros en móviles:
              
              <Portal>
                <ComboboxOptions ...>...</ComboboxOptions>
              </Portal>
          */}
        </div>
      </Combobox>
    </div>
  )
}
