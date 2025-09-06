// components/DropWrap.jsx
// comments in English only
import { useState } from 'react'

export default function DropWrap({ onFiles, className = '', children }) {
  const [drag, setDrag] = useState(false)

  function handleDrop(e) {
    e.preventDefault()
    setDrag(false)
    const files = Array.from(e.dataTransfer.files || []).filter((f) =>
      f.type.startsWith('image/')
    )
    if (files.length) onFiles?.(files)
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setDrag(true)
      }}
      onDragLeave={() => setDrag(false)}
      onDrop={handleDrop}
      className={[
        'rounded-xl border-2 border-dashed transition p-3',
        drag ? 'border-amber-500 bg-amber-50' : 'border-neutral-300',
        className,
      ].join(' ')}
    >
      {children}
      <div className="text-xs text-neutral-500 mt-2 text-center">
        Drag & drop images here
      </div>
    </div>
  )
}
