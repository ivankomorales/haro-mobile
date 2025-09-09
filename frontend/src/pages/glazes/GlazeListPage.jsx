// src/pages/glazes/GlazeListPage.jsx
import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { getAllGlazes, deactivateGlaze, activateGlaze } from '../../api/glazes'
import {
  Pencil,
  Trash2,
  Plus,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  RotateCcw,
  Download,
} from 'lucide-react'
import ConfirmModal from '../../components/ConfirmModal'
import { exportGlazesToCSV } from '../../utils/exportUtils'
import { useLayout } from '../../context/LayoutContext'
import { getMessage as t } from '../../utils/getMessage'

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
function joinNameCode(name, code) {
  return name ? (code ? `${name} (${code})` : name) : ''
}

export default function GlazeListPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)

  const [tab, setTab] = useState('active') // 'active' | 'inactive' | 'all'
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState('name') // 'name' | 'code' | 'hex' | 'status'
  const [sortDir, setSortDir] = useState('asc') // 'asc' | 'desc'

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmType, setConfirmType] = useState(null) // 'deactivate' | 'activate'
  const [confirmId, setConfirmId] = useState(null)

  const navigate = useNavigate()
  const location = useLocation()
  const here = location.pathname || '/products/glazes'

  const { setTitle, setShowSplitButton, resetLayout } = useLayout()

  // one–time: put the page into "list mode" (no split button)
  useEffect(() => {
    setTitle(t('glaze.list') || 'Glazes')
    setShowSplitButton(false)
    return resetLayout
  }, [setTitle, setShowSplitButton, resetLayout])

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

  if (loading) {
    return (
      <div className="p-4">
        <div className="mb-4 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Glazes</h1>
          <div className="h-9 w-40 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
        </div>
        <div className="h-40 animate-pulse rounded border bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900/40" />
      </div>
    )
  }

  return (
    <div className="space-y-4 p-4 pb-24 sm:pb-8">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 sm:justify-end">
          {/* Compact search (mobile) */}
          <input
            type="search"
            placeholder="Search by name, code, hex…"
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
            aria-label="New glaze"
            title="New glaze"
            className={[
              // mobile: circular icon button
              'inline-flex h-10 w-11 items-center justify-center rounded bg-black text-white',
              // desktop: regular pill with label
              'sm:h-auto sm:w-auto sm:rounded-md sm:px-3 sm:py-2 dark:bg-amber-500',
              'hover:bg-neutral-800 dark:hover:bg-amber-600',
            ].join(' ')}
          >
            <Plus className="h-5 w-5 sm:mr-2" />
            <span className="hidden sm:inline">New glaze</span>
          </button>
        </div>
      </div>

      {/* Tabs + Export */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <TabButton
            active={tab === 'active'}
            onClick={() => setTab('active')}
            label={`Active (${counts.actives})`}
          />
          <TabButton
            active={tab === 'inactive'}
            onClick={() => setTab('inactive')}
            label={`Inactive (${counts.inactives})`}
          />
          <TabButton
            active={tab === 'all'}
            onClick={() => setTab('all')}
            label={`All (${counts.total})`}
          />
        </div>

        {/* Export CSV aligned with chips; icon-only on mobile */}
        <button
          type="button"
          onClick={() => exportGlazesToCSV(sorted)}
          aria-label="Export CSV"
          title="Export CSV"
          className="inline-flex items-center gap-2 rounded-md border px-2 py-1 text-sm hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
        >
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Export CSV</span>
        </button>
      </div>

      {/* Desktop table */}
      <div className="hidden overflow-x-auto rounded border border-neutral-200 sm:block dark:border-neutral-800">
        <table className="w-full">
          <thead>
            <tr className="bg-neutral-50 text-left text-sm dark:bg-neutral-800/60">
              <th className="w-20 px-3 py-2 font-medium text-neutral-600 dark:text-neutral-300">
                Image
              </th>
              <SortableTH
                className="px-3 py-2"
                label="Name"
                active={sortKey === 'name'}
                dir={sortDir}
                onClick={() => onHeaderClick('name')}
              />
              <SortableTH
                className="w-32 px-3 py-2"
                label="Code"
                active={sortKey === 'code'}
                dir={sortDir}
                onClick={() => onHeaderClick('code')}
              />
              <SortableTH
                className="w-40 px-3 py-2"
                label="Hex"
                active={sortKey === 'hex'}
                dir={sortDir}
                onClick={() => onHeaderClick('hex')}
              />
              <SortableTH
                className="w-28 px-3 py-2"
                label="Status"
                active={sortKey === 'status'}
                dir={sortDir}
                onClick={() => onHeaderClick('status')}
              />
              <th className="w-32 px-3 py-2 text-right font-medium text-neutral-600 dark:text-neutral-300">
                Actions
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
                      N/A
                    </div>
                  )}
                </td>

                {/* Name: wrap instead of truncate, and show full on hover via title */}
                <td
                  className="px-3 py-2 font-medium break-words whitespace-normal"
                  title={g.name || ''}
                >
                  {g.name || '—'}
                </td>

                <td className="px-3 py-2">
                  <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    {g.code || '—'}
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
                    <span className="text-sm text-neutral-400">—</span>
                  )}
                </td>

                <td className="px-3 py-2">
                  {g.isActive ? (
                    <span className="rounded bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
                      Active
                    </span>
                  ) : (
                    <span className="rounded bg-neutral-200 px-2 py-0.5 text-xs font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                      Inactive
                    </span>
                  )}
                </td>

                <td className="px-3 py-2">
                  <div className="flex items-center justify-end gap-2">
                    <IconButton
                      title="Edit"
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
                        title="Deactivate"
                        disabled={busyId === g._id}
                        onClick={() => openConfirm('deactivate', g._id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </IconButton>
                    ) : (
                      <IconButton
                        title="Activate"
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
                  No glazes
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
                  N/A
                </div>
              )}

              <div className="min-w-0 flex-1">
                <div className="font-medium break-words whitespace-normal">{g.name || '—'}</div>
                <div className="text-xs text-neutral-500">
                  {g.code ? (
                    <>
                      Code: <span className="font-mono">{g.code}</span>
                    </>
                  ) : (
                    'No code'
                  )}
                </div>
                <div className="text-xs text-neutral-500">
                  {g.hex ? (
                    <>
                      Hex: <span className="font-mono">{g.hex}</span>
                    </>
                  ) : (
                    'No hex'
                  )}
                </div>
                <div className="mt-1">
                  {g.isActive ? (
                    <span className="rounded bg-green-100 px-2 py-0.5 text-[11px] font-medium text-green-700 dark:bg-green-900/30 dark:text-green-300">
                      Active
                    </span>
                  ) : (
                    <span className="rounded bg-neutral-200 px-2 py-0.5 text-[11px] font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-300">
                      Inactive
                    </span>
                  )}
                </div>
              </div>

              <div className="flex shrink-0 flex-col items-end gap-2">
                <IconButton
                  title="Edit"
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
                    title="Deactivate"
                    disabled={busyId === g._id}
                    onClick={() => openConfirm('deactivate', g._id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </IconButton>
                ) : (
                  <IconButton
                    title="Activate"
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

        {sorted.length === 0 && <div className="py-10 text-center text-neutral-500">No glazes</div>}
      </div>

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
        title={confirmType === 'activate' ? 'Activate glaze?' : 'Deactivate glaze?'}
        message={
          confirmType === 'activate'
            ? 'This glaze will be marked as active and available for selection.'
            : 'This glaze will be marked as inactive and hidden from selection.'
        }
        confirmText={
          busyId && confirmId === busyId
            ? 'Working…'
            : confirmType === 'activate'
              ? 'Yes, activate'
              : 'Yes, deactivate'
        }
        cancelText="Cancel"
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
          ? 'bg-black text-white dark:bg-amber-500'
          : 'bg-neutral-200 text-neutral-800 hover:bg-neutral-300 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700',
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
        title={`Sort by ${label}`}
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
