// components/ImageUploader.jsx
import { useRef, useState, useEffect } from 'react'

export default function ImageUploader({
  multiple = false,
  label = 'Imagen',
  value = [],
  onChange,
  previewSize = 96,
  rounded = true,
  showDeleteButton = true,
}) {
  const inputRef = useRef(null)
  const [previews, setPreviews] = useState([])

  // Generate preview URLs
  useEffect(() => {
    const objectUrls = []

    if (value && value.length > 0) {
      const urls = value.map((file) => {
        const url = URL.createObjectURL(file)
        objectUrls.push(url)
        return url
      })
      setPreviews(urls)
    } else {
      setPreviews([])
    }

    return () => {
      objectUrls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [value])

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    const valid = files.filter(
      (f) => f.type.startsWith('image/') && f.size < 5 * 1024 * 1024
    )

    if (valid.length > 0) {
      const newFiles = multiple ? [...value, ...valid] : valid
      onChange?.(newFiles)
    }

    inputRef.current.value = ''
  }

  const handleRemove = (index) => {
    const updated = value.filter((_, i) => i !== index)
    onChange?.(updated)
  }

  return (
    <div>
      <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
        {label}
      </label>

      {(multiple || value.length === 0) && (
        <div className="relative w-full">
          <input
            id="imageInput"
            type="file"
            multiple={multiple}
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <label
            htmlFor="imageInput"
            className="block cursor-pointer text-center border border-dashed rounded p-4 bg-neutral-50 dark:bg-neutral-800 text-gray-500 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition"
          >
            📸 Haz clic o arrastra una imagen aquí
          </label>
        </div>
      )}

      {previews.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {previews.map((src, i) => (
            <div
              key={i}
              className="relative"
              style={{
                width: previewSize,
                height: previewSize,
              }}
            >
              <img
                src={src}
                alt={`preview-${i}`}
                className={`w-full h-full object-cover ${rounded ? 'rounded' : ''}`}
              />
              {showDeleteButton && (
                <button
                  type="button"
                  onClick={() => handleRemove(i)}
                  className="absolute top-[-6px] right-[-6px] bg-red-600 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center shadow"
                  title="Eliminar imagen"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
