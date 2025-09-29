// components/Spinner.jsx
// comments in English only
export function Spinner({ className = 'h-5 w-5', label = 'Loading...' }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className="inline-flex items-center gap-2"
    >
      <svg
        aria-hidden="true"
        className={`${className} animate-spin fill-blue-600 text-gray-200 dark:text-gray-600`}
        viewBox="0 0 100 101"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M100 50.59C100 78.21 77.61 100.59 50 100.59 22.39 100.59 0 78.21 0 50.59 0 22.98 22.39 0.59 50 0.59c27.61 0 50 22.39 50 50Z"
          fill="currentColor"
        />
        <path
          d="M93.97 39.04c2.42-.64 3.89-3.13 3.04-5.49a49.9 49.9 0 0 0-7.19-13.2C85.85 15.12 80.88 10.72 75.21 7.41 69.54 4.1 63.28 1.94 56.77 1.05 51.77 0.37 46.70 0.45 41.73 1.28c-2.47.41-3.91 2.92-3.27 5.34.64 2.43 3.12 3.89 5.55 3.53 3.40-.56 6.87-.63 10.27-.09 5.32.83 10.45 2.60 15.09 5.21 4.64 2.65 8.70 6.18 11.95 10.45a40.0 40.0 0 0 1 7.65 13.27c.86 2.24 3.30 3.65 5.80 3.10Z"
          fill="currentFill"
        />
      </svg>
      <span className="sr-only">{label}</span>
    </div>
  )
}
