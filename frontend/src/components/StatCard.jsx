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
      className={`rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900 ${sizes[size]} ${className}`}
    >
      <div className="text-center opacity-70 sm:text-left">{title}</div>
      {loading ? (
        <div className="mx-auto mt-2 h-6 w-8 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700" />
      ) : (
        <div className="mt-2 text-center sm:text-left sm:pl-2 text-2xl sm:text-4xl font-semibold tabular-nums">{value}</div>
      )}
      {subtitle ? <div className="mt-0.5 text-right text-xs opacity-70">{subtitle}</div> : null}
    </div>
  )
}
