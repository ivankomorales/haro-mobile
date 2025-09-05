// src/components/AppBar.jsx
export default function AppBar({ title, left, right, extra, progress }) {
  return (
    <div
      className="
        w-full z-50
        bg-white dark:bg-neutral-900 
        border-b border-gray-200 dark:border-neutral-700
        shadow-sm
      "
    >
      <div className="max-w-[95%] mx-auto px-4 flex items-center justify-between h-14">
        {/* Left icon (e.g. X, ←, ☰) */}
        <div className="flex w-10 justify-start">{left}</div>

        {/* Spacer + Title */}
        <div className="flex-1 relative">
          <h1 className="absolute left-1/2 -translate-x-1/2 text-base font-semibold truncate max-w-[60%] text-center">
            {title}
          </h1>
        </div>

        {/* Extra actions (e.g., split button) */}
        {extra && <div className="mr-19">{extra}</div>}

        {/* Right icon (e.g. avatar, settings) */}
        <div className="flex items-center gap-2 justify-end">{right}</div>
      </div>

      {/* Optional progress bar */}
      {typeof progress === 'number' && (
        <div className="w-full h-1 bg-gray-200 dark:bg-neutral-800">
          <div
            className="h-1 bg-green-500 transition-all"
            style={{ width: `${Math.min(progress * 100, 100)}%` }}
          ></div>
        </div>
      )}
    </div>
  )
}
