// src/components/ImageUploader.jsx
import { ImagePlus, X, RefreshCcw } from 'lucide-react'
import { useRef, useMemo, useEffect, useId } from 'react'

import DropWrap from './DropWrap' // 👈 está en /src/components

export default function ImageUploader({
  label,
  multiple = false,
  value = [],
  onChange,
  inputRef,
  withDropWrap = true, // 👈 por defecto usa DropWrap interno
}) {
  const localRef = useRef(null)
  const fileInput = inputRef || localRef
  const inputId = useId()

  // helper: agrega archivos respetando "multiple"
  const addFiles = (filesLike) => {
    const files = Array.from(filesLike || []).filter((f) => f?.type?.startsWith?.('image/'))
    if (!files.length) return
    onChange(multiple ? [...value, ...files] : [files[0]]) // ← replace si multiple=false
  }

  // input file
  const handleInputChange = (e) => addFiles(e.target.files)

  // Previews
  const { previews, toRevoke } = useMemo(() => {
    const revokeList = []
    const list = (value || []).map((item) => {
      if (typeof item === 'string') return item
      if (item && typeof item === 'object' && item.url) return item.url
      if (item instanceof File) {
        const url = URL.createObjectURL(item)
        revokeList.push(url)
        return url
      }
      return ''
    })
    return { previews: list, toRevoke: revokeList }
  }, [value])

  useEffect(() => {
    return () => {
      toRevoke.forEach((u) => {
        try {
          URL.revokeObjectURL(u)
        } catch {}
      })
    }
  }, [toRevoke])

  const removeImage = (index) => {
    const updated = [...value]
    updated.splice(index, 1)
    onChange(updated)
  }

  // Lógica para ocultar el tile “+” cuando multiple=false y ya hay 1 imagen
  const hasAny = previews.some(Boolean)
  const showPickerTile = multiple || !hasAny
  const openFileDialog = () => fileInput.current?.click()

  // pequeño wrapper para no duplicar código
  const Zone = ({ children }) =>
    withDropWrap ? (
      <DropWrap onFiles={(files) => addFiles(files)}>{children}</DropWrap>
    ) : (
      <>{children}</>
    )

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-800 dark:text-gray-200">
          {label}
        </label>
      )}

      <Zone>
        <div className="flex flex-wrap items-center gap-3">
          {previews.map((src, idx) => {
            if (!src) return null
            return (
              <div
                key={idx}
                className={`relative h-20 w-20 overflow-hidden rounded border dark:border-gray-600 ${
                  !multiple ? 'cursor-pointer' : ''
                }`}
                onClick={!multiple ? openFileDialog : undefined} // ← clic en preview = reemplazar
                title={!multiple ? 'Click para reemplazar' : undefined}
              >
                <img
                  src={src}
                  alt={`preview-${idx}`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                {/* botón reemplazar opcional (además del click en la imagen) */}
                {!multiple && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      openFileDialog()
                    }}
                    className="absolute top-0 left-0 rounded-br bg-black/60 p-1 text-white"
                    aria-label="Replace image"
                    title="Replace"
                  >
                    <RefreshCcw size={14} />
                  </button>
                )}
                {/* botón eliminar */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeImage(idx)
                  }}
                  className="absolute top-0 right-0 rounded-bl bg-black/60 p-1 text-white"
                  aria-label="Remove image"
                  title="Remove"
                >
                  <X size={14} />
                </button>
              </div>
            )
          })}

          {/* solo mostramos el tile de “+” si se puede agregar más */}
          {showPickerTile && (
            <label
              htmlFor={inputId} // ← vincula el label con el input
              className="flex h-20 w-20 cursor-pointer items-center justify-center rounded border border-dashed hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-neutral-700"
            >
              <ImagePlus className="h-5 w-5 text-gray-500 dark:text-gray-300" />
            </label>
          )}
        </div>
      </Zone>

      {/* input SIEMPRE presente (aunque ocultemos el tile) para poder abrir desde la preview */}
      <input
        id={inputId}
        type="file"
        accept="image/*"
        ref={fileInput}
        onChange={handleInputChange}
        className="hidden"
        multiple={multiple}
      />
    </div>
  )
}
