// src/components/AppBar.jsx
export default function AppBar({ title, left, right, extra, progress }) {
  return (
    <div className="z-50 w-full border-b border-gray-200 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-900">
      <div className="mx-auto flex h-14 max-w-[95%] items-center justify-between px-4">
        {/* Left icon (e.g. X, ←, ☰) */}
        <div className="flex w-10 justify-start">{left}</div>

        {/* Spacer + Title */}
        <div className="relative flex-1">
          <h1 className="absolute left-1/2 max-w-[60%] -translate-x-1/2 truncate text-center text-base font-semibold">
            {title}
          </h1>
        </div>

        {/* Extra actions (e.g., split button) */}
        {extra && <div className="mr-19">{extra}</div>}

        {/* Right icon (e.g. avatar, settings) */}
        <div className="flex items-center justify-end gap-2">{right}</div>
      </div>

      {/* Optional progress bar */}
      {typeof progress === 'number' && (
        <div className="h-1 w-full bg-gray-200 dark:bg-neutral-800">
          <div
            className="h-1 bg-green-500 transition-all"
            style={{ width: `${Math.min(progress * 100, 100)}%` }}
          ></div>
        </div>
      )}
    </div>
  )
}
