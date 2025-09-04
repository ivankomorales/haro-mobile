// src/components/ImageUploader.jsx
import { useRef, useMemo, useEffect } from 'react'
import { ImagePlus, X } from 'lucide-react'

export default function ImageUploader({
  label,
  multiple = false,
  value = [],
  onChange,
  inputRef,
}) {
  const localRef = useRef(null)

  // Build preview URLs. Only createObjectURL for File items.
  // We keep track to revoke them on cleanup.
  const { previews, toRevoke } = useMemo(() => {
    const revokeList = []
    const list = (value || []).map((item) => {
      // 1) legacy string URL
      if (typeof item === 'string') return item
      // 2) normalized object with url (Cloudinary or our ImageSchema)
      if (item && typeof item === 'object' && item.url) return item.url
      // 3) File before upload → create object URL
      if (item instanceof File) {
        const url = URL.createObjectURL(item)
        revokeList.push(url)
        return url
      }
      // fallback: nothing to preview
      return ''
    })
    return { previews: list, toRevoke: revokeList }
  }, [value])

  useEffect(() => {
    return () => {
      // Revoke only the URLs created in this render cycle
      toRevoke.forEach((u) => {
        try {
          URL.revokeObjectURL(u)
        } catch {}
      })
    }
  }, [toRevoke])

  const handleFiles = (e) => {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    const newFiles = multiple ? [...value, ...files] : files
    onChange(newFiles)
  }

  const removeImage = (index) => {
    const updated = [...value]
    updated.splice(index, 1)
    onChange(updated)
    // No need to revoke here; effect above revokes prev object URLs on next render
  }

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-800 dark:text-gray-200">
          {label}
        </label>
      )}

      <div className="flex items-center gap-3 flex-wrap">
        {previews.map((src, idx) => {
          if (!src) return null
          return (
            <div
              key={idx}
              className="relative w-20 h-20 rounded overflow-hidden border dark:border-gray-600"
            >
              <img
                src={src}
                alt={`preview-${idx}`}
                className="object-cover w-full h-full"
                loading="lazy"
              />
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute top-0 right-0 bg-black/60 text-white p-1 rounded-bl"
                aria-label="Remove image"
                title="Remove"
              >
                <X size={14} />
              </button>
            </div>
          )
        })}

        <label className="w-20 h-20 border border-dashed dark:border-gray-600 flex items-center justify-center rounded cursor-pointer hover:bg-gray-100 dark:hover:bg-neutral-700">
          <ImagePlus className="w-5 h-5 text-gray-500 dark:text-gray-300" />
          <input
            type="file"
            accept="image/*"
            ref={inputRef || localRef} // keep external ref support
            onChange={handleFiles}
            className="hidden"
            multiple={multiple}
          />
        </label>
      </div>
    </div>
  )
}
