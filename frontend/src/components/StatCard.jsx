import { Spinner } from './Spinner' //
// src/components/StatCard.jsx
export default function StatCard({
  title,
  value,
  subtitle,
  loading = false,
  size = 'md', // 'sm' | 'md' | 'lg'
  className = '',
}) {
  const sizes = {
    sm: 'px-3 py-2 text-sm min-h-[56px]',
    md: 'px-4 py-3 text-base min-h-[72px]',
    lg: 'px-5 py-4 text-base min-h-[88px]',
  }
  return (
    <div
      className={`mb-5 rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 ${sizes[size]} ${className}`}
    >
      <div className="text-center opacity-70 sm:text-left">{title}</div>
      {loading ? (
        <div className="mt-2 flex justify-center sm:justify-start">
          <Spinner size={24} className="text-neutral-500 dark:text-neutral-300" />
        </div>
      ) : (
        <div className="mt-2 mb-5 text-center text-2xl font-semibold tabular-nums sm:pl-2 sm:text-left sm:text-xl">
          {value}
        </div>
      )}
      {subtitle ? <div className="mt-0.5 border-t-amber-50 text-right text-xs opacity-70">{subtitle}</div> : null}
    </div>
  )
}
