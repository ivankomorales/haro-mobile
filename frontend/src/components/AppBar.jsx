// components/AppBar.jsx

import React from 'react'

export default function AppBar({ left, right, progress }) {
  return (
    <div
      className="
        w-full 
        bg-white dark:bg-neutral-900 
        border-b border-gray-200 dark:border-neutral-700
        shadow-sm
      "
    >
      <div className="max-w-[95%] mx-auto px-4 flex items-center justify-between h-14">
        {/* Left icon (e.g. X, ←, ☰) */}
        <div className="flex w-10 justify-start">{left}</div>

        {/* Spacer to keep layout consistent */}
        <div className="flex-1" />

        {/* Right icon (e.g. avatar, settings) */}
        <div className="flex w-10 justify-end">{right}</div>
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
