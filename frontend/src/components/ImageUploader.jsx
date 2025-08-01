// src/components/ImageUploader.jsx

import { useRef } from 'react'
import { ImagePlus, X } from 'lucide-react'

export default function ImageUploader({
  label,
  multiple = false,
  value = [],
  onChange,
  inputRef,
}) {
  const localRef = useRef(null)

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
  }

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-800 dark:text-gray-200">
          {label}
        </label>
      )}

      <div className="flex items-center gap-3 flex-wrap">
        {value.map((file, idx) => {
          const preview =
            typeof file === 'string'
              ? file
              : URL.createObjectURL(file)

          return (
            <div
              key={idx}
              className="relative w-20 h-20 rounded overflow-hidden border dark:border-gray-600"
            >
              <img
                src={preview}
                alt={`preview-${idx}`}
                className="object-cover w-full h-full"
              />
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="absolute top-0 right-0 bg-black bg-opacity-50 text-white p-1 rounded-bl"
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
            ref={inputRef || localRef} // ✅ usa inputRef si se provee
            onChange={handleFiles}
            className="hidden"
            multiple={multiple}
          />
        </label>
      </div>
    </div>
  )
}
