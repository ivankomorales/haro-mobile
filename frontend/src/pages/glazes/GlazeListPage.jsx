// src/pages/glazes/GlazeListPage.jsx
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { getAllGlazes, deactivateGlaze, activateGlaze } from '../../api/glazes'
import { Pencil, Trash2, Plus, ArrowUpDown, ChevronUp, ChevronDown, RotateCcw } from 'lucide-react'
import ConfirmModal from '../../components/ConfirmModal'
import { useLayout } from '../../context/LayoutContext'
import { getMessage as t } from '../../utils/getMessage'

// Skeleton
import TableSkeleton from '../../components/TableSkeleton'

function norm(s) {
  return (s || '')
    .toString()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
}
function cmp(a, b) {
  if (a === b) return 0
  return a > b ? 1 : -1
}

export default function GlazeListPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)

  // tabs: 'active' | 'inactive' | 'all'
  const [tab, setTab] = useState('active')
  const [search, setSearch] = useState('')
  // sorting: 'name' | 'code' | 'hex' | 'status'
  const [sortKey, setSortKey] = useState('name')
  const [sortDir, setSortDir] = useState('asc') // 'asc' | 'desc'
  // Modal
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmType, setConfirmType] = useState(null) // 'deactivate' | 'activate'
  const [confirmId, setConfirmId] = useState(null)

  const navigate = useNavigate()
  const location = useLocation()
  const here = location.pathname || '/products/glazes'

  const { setTitle, setShowSplitButton, resetLayout } = useLayout()

  // one-time: put the page into "list mode" (no split button)
  useEffect(() => {
    setTitle(t('glaze.list') || 'Glazes')
    setShowSplitButton(false)
    return resetLayout
  }, [setTitle, setShowSplitButton, resetLayout])

  // load glazes
  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await getAllGlazes({ navigate, includeInactive: true })
        const list = Array.isArray(res) ? res : []
        if (mounted) setItems(list)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [navigate])

  const counts = useMemo(() => {
    const actives = items.filter((g) => g.isActive).length
    const inactives = items.length - actives
    return { actives, inactives, total: items.length }
  }, [items])

  const filteredByTab = useMemo(() => {
    if (tab === 'active') return items.filter((g) => g.isActive)
    if (tab === 'inactive') return items.filter((g) => !g.isActive)
    return items
  }, [items, tab])

  const filtered = useMemo(() => {
    const q = norm(search)
    if (!q) return filteredByTab
    return filteredByTab.filter((g) => {
      const name = norm(g.name)
      const code = norm(g.code)
      const hex = norm(g.hex)
      return name.includes(q) || code.includes(q) || hex.includes(q)
    })
  }, [filteredByTab, search])

  const sorted = useMemo(() => {
    const arr = [...filtered]
    arr.sort((a, b) => {
      let va, vb
      switch (sortKey) {
        case 'code':
          va = norm(a.code)
          vb = norm(b.code)
          break
        case 'hex':
          va = norm(a.hex)
          vb = norm(b.hex)
          break
        case 'status':
          va = a.isActive ? 0 : 1
          vb = b.isActive ? 0 : 1
          break
        case 'name':
        default:
          va = norm(a.name)
          vb = norm(b.name)
      }
      const base = cmp(va, vb)
      return sortDir === 'asc' ? base : -base
    })
    return arr
  }, [filtered, sortKey, sortDir])

  function onHeaderClick(key) {
    if (key === sortKey) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else {
      setSortKey(key)
      setSortDir('asc')
    }
  }

  function openConfirm(type, id) {
    setConfirmType(type)
    setConfirmId(id)
    setConfirmOpen(true)
  }

  async function handleDeactivate(id) {
    try {
      setBusyId(id)
      await deactivateGlaze(id, { navigate })
      const fresh = await getAllGlazes({ navigate, includeInactive: true })
      setItems(Array.isArray(fresh) ? fresh : [])
    } finally {
      setBusyId(null)
      setConfirmOpen(false)
      setConfirmId(null)
      setConfirmType(null)
    }
  }

  async function handleActivate(id) {
    try {
      setBusyId(id)
      await activateGlaze(id, { navigate })
      const fresh = await getAllGlazes({ navigate, includeInactive: true })
      setItems(Array.isArray(fresh) ? fresh : [])
    } finally {
      setBusyId(null)
      setConfirmOpen(false)
      setConfirmId(null)
      setConfirmType(null)
    }
  }

  // skeleton config to "look like" the table layout
  const skeletonColumns = [
    'w-15', // Image
    'flex-[2]', // Name (wider)
    'w-32', // Code
    'w-40', // Hex
    'w-28', // Status
    'w-32', // Actions
  ]

  function MobileCardsSkeleton({ count = 6 }) {
    return (
      <div className="grid gap-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="rounded border border-neutral-200 p-3 dark:border-neutral-800">
            <div className="flex animate-pulse items-start gap-3">
              {/* Imagen/hex */}
              <div className="h-12 w-12 rounded-md border bg-neutral-200 dark:bg-neutral-700" />

              {/* Texto */}
              <div className="min-w-0 flex-1">
                <div className="h-4 w-2/3 rounded bg-neutral-200 dark:bg-neutral-700" />
                <div className="mt-2 h-3 w-1/2 rounded bg-neutral-200 dark:bg-neutral-700" />
                <div className="mt-1 h-3 w-1/3 rounded bg-neutral-200 dark:bg-neutral-700" />
                <div className="mt-2 h-5 w-20 rounded bg-neutral-200 dark:bg-neutral-700" />
              </div>

              {/* Botones */}
              <div className="flex shrink-0 flex-col items-end gap-2">
                <div className="h-6 w-8 rounded bg-neutral-200 dark:bg-neutral-700" />
                <div className="h-6 w-8 rounded bg-neutral-200 dark:bg-neutral-700" />
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="h-full min-h-0 space-y-4 p-4">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 sm:justify-end">
          {/* Compact search (mobile) */}
          <input
            type="search"
            placeholder={t('glaze.searchPlaceholder')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full rounded border border-neutral-300 px-3 text-sm sm:w-80 dark:border-neutral-700 dark:bg-neutral-900 dark:text-white"
          />

          {/* New glaze: icon-only on mobile, label on desktop */}
          <button
            type="button"
            onClick={() =>
              navigate('/glazes/add', {
                state: { originPath: here, from: here, returnTo: '/products/glazes' },
              })
            }
            aria-label={t('glaze.new')}
            title={t('glaze.new')}
            className={[
              // mobile: icon button
              'inline-flex h-10 w-11 items-center justify-center rounded bg-blue-600 text-white',
              // desktop: regular button with label
              'sm:h-auto sm:w-auto sm:rounded-md sm:px-3 sm:py-2 dark:bg-blue-600',
              'hover:bg-blue-700 dark:hover:bg-blue-800',
            ].join(' ')}
          >
            <Plus className="h-5 w-5 sm:mr-2" />
            <span className="hidden sm:inline">{t('glaze.new')}</span>
          </button>
        </div>
      </div>

      {/* Chips/ Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <TabButton
            active={tab === 'active'}
            onClick={() => setTab('active')}
            label={`${t('status.active')} (${counts.actives})`}
          />
          <TabButton
            active={tab === 'inactive'}
            onClick={() => setTab('inactive')}
            label={`${t('status.inactive')} (${counts.inactives})`}
          />
          <TabButton
            active={tab === 'all'}
            onClick={() => setTab('all')}
            label={`${t('status.all')} (${counts.total})`}
          />
        </div>
      </div>

      {/* Loading vs Content */}
      {loading ? (
        <>
          {/* Desktop skeleton: tabla */}
          <div className="hidden sm:block">
            <TableSkeleton
              rows={10}
              columns={skeletonColumns}
              header
              approxRowHeight={59}
              showSpinner
              spinnerLabel={t('glaze.loading')}
            />
          </div>

          {/* Mobile skeleton: cards */}
          <div className="sm:hidden">
            <MobileCardsSkeleton count={6} />
          </div>
        </>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto rounded border border-neutral-200 sm:block dark:border-neutral-800">
            <table className="w-full">
              <thead>
                <tr className="bg-neutral-50 text-left text-sm dark:bg-neutral-800/60">
                  <th className="w-20 px-3 py-2 font-medium text-neutral-600 dark:text-neutral-300">
                    {t('headers.image')}
                  </th>
                  <SortableTH
                    className="px-3 py-2"
                    label={t('headers.name')}
                    active={sortKey === 'name'}
                    dir={sortDir}
                    onClick={() => onHeaderClick('name')}
                  />
                  <SortableTH
                    className="w-32 px-3 py-2"
                    label={t('headers.code')}
                    active={sortKey === 'code'}
                    dir={sortDir}
                    onClick={() => onHeaderClick('code')}
                  />
                  <SortableTH
                    className="w-40 px-3 py-2"
                    label={t('headers.hex')}
                    active={sortKey === 'hex'}
                    dir={sortDir}
                    onClick={() => onHeaderClick('hex')}
                  />
                  <SortableTH
                    className="w-28 px-3 py-2"
                    label={t('headers.status')}
                    active={sortKey === 'status'}
                    dir={sortDir}
                    onClick={() => onHeaderClick('status')}
                  />
                  <th className="w-32 px-3 py-2 text-right font-medium text-neutral-600 dark:text-neutral-300">
                    {t('headers.actions')}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-800">
                {sorted.map((g) => (
                  <tr key={g._id} className="align-middle">
                    <td className="px-3 py-2">
                      {g.image ? (
                        <img
                          src={g.image}
                          alt={g.name}
                          className="h-10 w-10 rounded-md border object-cover"
                          loading="lazy"
                        />
                      ) : g.hex ? (
                        <div
                          className="h-10 w-10 rounded-md border"
                          style={{ background: g.hex }}
                          title={g.hex}
                        />
                      ) : (
                        <div className="grid h-10 w-10 place-items-center rounded-md border text-[10px] text-neutral-500">
                          {t('common.na')}
                        </div>
                      )}
                    </td>

                    {/* Name */}
                    <td
                      className="px-3 py-2 font-medium break-words whitespace-normal"
                      title={g.name || ''}
                    >
                      {g.name || t('common.na')}
                    </td>

                    <td className="px-3 py-2">
                      <span className="text-sm text-neutral-600 dark:text-neutral-400">
                        {g.code || t('glaze.noCode')}
                      </span>
                    </td>

                    <td className="px-3 py-2">
                      {g.hex ? (
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-block h-4 w-4 rounded border"
                            style={{ background: g.hex }}
                            title={g.hex}
                          />
                          <span className="text-sm text-neutral-600 dark:text-neutral-400">
                            {g.hex}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-neutral-400">{t('glaze.noHex')}</span>
                      )}
                    </td>

                    <td className="px-3 py-2">
                      {g.isActive ? (
                        <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
                          {t('status.active')}
                        </span>
                      ) : (
                        <span className="rounded bg-neutral-200 px-2 py-0.5 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                          {t('status.inactive')}
                        </span>
                      )}
                    </td>

                    <td className="px-3 py-2">
                      <div className="flex items-center justify-end gap-2">
                        <IconButton
                          title={t('button.edit')}
                          onClick={() =>
                            navigate(`/glazes/${g._id}/edit`, {
                              state: { originPath: here, from: here, returnTo: '/products/glazes' },
                            })
                          }
                        >
                          <Pencil className="h-4 w-4 dark:text-blue-400/70 dark:hover:text-blue-400/90" />
                        </IconButton>

                        {g.isActive ? (
                          <IconButton
                            title={t('button.deactivate')}
                            disabled={busyId === g._id}
                            onClick={() => openConfirm('deactivate', g._id)}
                          >
                            <Trash2 className="h-4 w-4 dark:text-red-400/70 dark:hover:text-red-400/90" />
                          </IconButton>
                        ) : (
                          <IconButton
                            title={t('button.activate')}
                            disabled={busyId === g._id}
                            onClick={() => openConfirm('activate', g._id)}
                          >
                            <RotateCcw className="h-4 w-4 text-green-600" />
                          </IconButton>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}

                {sorted.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-3 py-10 text-center text-neutral-500">
                      {t('glaze.empty')}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="grid gap-3 sm:hidden">
            {sorted.map((g) => (
              <div
                key={g._id}
                className="rounded border border-neutral-200 p-3 dark:border-neutral-800"
              >
                <div className="flex items-start gap-3">
                  {g.image ? (
                    <img
                      src={g.image}
                      alt={g.name}
                      className="h-12 w-12 rounded-md border object-cover"
                      loading="lazy"
                    />
                  ) : g.hex ? (
                    <div
                      className="h-12 w-12 rounded-md border"
                      style={{ background: g.hex }}
                      title={g.hex}
                    />
                  ) : (
                    <div className="grid h-12 w-12 place-items-center rounded-md border text-[10px] text-neutral-500">
                      {t('common.na')}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="font-medium break-words whitespace-normal">
                      {g.name || t('common.na')}
                    </div>
                    <div className="text-xs text-neutral-500">
                      {g.code ? (
                        <>
                          {t('headers.code')}: <span className="font-mono">{g.code}</span>
                        </>
                      ) : (
                        t('glaze.noCode')
                      )}
                    </div>
                    <div className="text-xs text-neutral-500">
                      {g.hex ? (
                        <>
                          {t('glaze.hex')}: <span className="font-mono">{g.hex}</span>
                        </>
                      ) : (
                        t('glaze.noHex')
                      )}
                    </div>
                    <div className="mt-1">
                      {g.isActive ? (
                        <span className="rounded bg-green-100 px-2 py-0.5 text-[11px] font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
                          {t('status.active')}
                        </span>
                      ) : (
                        <span className="rounded bg-neutral-200 px-2 py-0.5 text-[11px] font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                          {t('status.inactive')}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <IconButton
                      title={t('button.edit')}
                      onClick={() =>
                        navigate(`/glazes/${g._id}/edit`, {
                          state: { originPath: here, from: here, returnTo: '/products/glazes' },
                        })
                      }
                    >
                      <Pencil className="h-4 w-4" />
                    </IconButton>

                    {g.isActive ? (
                      <IconButton
                        title={t('button.deactivate')}
                        disabled={busyId === g._id}
                        onClick={() => openConfirm('deactivate', g._id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </IconButton>
                    ) : (
                      <IconButton
                        title={t('button.activate')}
                        disabled={busyId === g._id}
                        onClick={() => openConfirm('activate', g._id)}
                      >
                        <RotateCcw className="h-4 w-4 text-green-600" />
                      </IconButton>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {sorted.length === 0 && (
              <div className="py-10 text-center text-neutral-500">{t('glaze.empty')}</div>
            )}
          </div>
        </>
      )}

      {/* Confirm modal */}
      <ConfirmModal
        open={confirmOpen}
        onClose={() => {
          setConfirmOpen(false)
          setConfirmId(null)
          setConfirmType(null)
        }}
        onConfirm={() => {
          if (!confirmId || !confirmType) return
          if (confirmType === 'deactivate') return handleDeactivate(confirmId)
          if (confirmType === 'activate') return handleActivate(confirmId)
        }}
        title={
          confirmType === 'activate'
            ? t('glaze.confirm.activate.title')
            : t('glaze.confirm.deactivate.title')
        }
        message={
          confirmType === 'activate'
            ? t('glaze.confirm.activate.message')
            : t('glaze.confirm.deactivate.message')
        }
        confirmText={
          busyId && confirmId === busyId
            ? t('common.working')
            : confirmType === 'activate'
              ? t('glaze.confirm.activate.confirm')
              : t('glaze.confirm.deactivate.confirm')
        }
        cancelText={t('common.cancel')}
      />
    </div>
  )
}

/** Small tab button */
function TabButton({ active, onClick, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'rounded-full px-3 py-1 text-sm',
        active
          ? 'bg-gray-400 text-white dark:bg-gray-700'
          : 'bg-neutral-200 text-neutral-800 hover:bg-neutral-300 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-gray-700',
      ].join(' ')}
    >
      {label}
    </button>
  )
}

/** Small icon button */
function IconButton({ title, onClick, disabled, children }) {
  return (
    <button
      type="button"
      title={title}
      onClick={onClick}
      disabled={disabled}
      className={[
        'inline-flex items-center justify-center rounded border px-2 py-1',
        'hover:bg-neutral-100 disabled:opacity-60 dark:hover:bg-neutral-800',
      ].join(' ')}
    >
      {children}
    </button>
  )
}

/** Sortable header cell */
function SortableTH({ label, active, dir, onClick, className = '' }) {
  return (
    <th
      className={[
        'cursor-pointer font-medium text-neutral-600 select-none dark:text-neutral-300',
        className,
      ].join(' ')}
    >
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-1 hover:underline"
        title={`${t('sort.by')} ${label}`}
      >
        <span>{label}</span>
        {!active ? (
          <ArrowUpDown className="h-4 w-4 opacity-60" />
        ) : dir === 'asc' ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>
    </th>
  )
}
