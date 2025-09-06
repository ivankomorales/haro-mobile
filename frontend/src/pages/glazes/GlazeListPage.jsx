// src/pages/glazes/GlazeListPage.jsx
// comments in English only
import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { getAllGlazes, deactivateGlaze } from '../../api/glazes'

function joinNameCode(name, code) {
  if (!name) return ''
  return code ? `${name} (${code})` : name
}

export default function GlazeListPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [busyId, setBusyId] = useState(null)
  const navigate = useNavigate()
  const location = useLocation()
  const here = location.pathname || '/products/glazes'

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await getAllGlazes({ navigate })
        const list = Array.isArray(res) ? res : []
        if (mounted) setItems(list.filter((g) => g.isActive))
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [navigate])

  async function handleDeactivate(id) {
    if (!confirm('Deactivate this glaze?')) return
    try {
      setBusyId(id)
      await deactivateGlaze(id, { navigate })
      setItems((prev) => prev.filter((g) => g._id !== id))
    } finally {
      setBusyId(null)
    }
  }

  if (loading) {
    /* skeleton omitted for brevity */
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Glazes</h1>
        <button
          onClick={() =>
            navigate('/glazes/add', {
              state: {
                originPath: here,
                from: here,
                returnTo: '/products/glazes',
              },
            })
          }
          className="px-3 py-2 rounded-md bg-black text-white dark:bg-amber-500"
        >
          New glaze
        </button>
      </div>

      <ul className="divide-y divide-neutral-200 dark:divide-neutral-800">
        {items.map((g) => (
          <li key={g._id} className="flex items-center gap-3 py-3">
            {g.image ? (
              <img
                src={g.image}
                alt={g.name}
                className="w-14 h-14 rounded-md border object-cover"
                loading="lazy"
              />
            ) : g.hex ? (
              <div
                className="w-14 h-14 rounded-md border"
                style={{ background: g.hex }}
                title={g.hex}
              />
            ) : (
              <div className="w-14 h-14 rounded-md border grid place-items-center text-xs text-neutral-500">
                N/A
              </div>
            )}

            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">
                {joinNameCode(g.name, g.code)}
              </div>
              <div className="text-xs text-neutral-500">{g.hex || '—'}</div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  navigate(`/glazes/${g._id}/edit`, {
                    state: {
                      originPath: here,
                      from: here,
                      returnTo: '/products/glazes',
                    },
                  })
                }
                className="px-2 py-1 rounded-md border hover:bg-neutral-100 dark:hover:bg-neutral-800 text-sm"
              >
                Edit
              </button>
              <button
                onClick={() => handleDeactivate(g._id)}
                disabled={busyId === g._id}
                className="px-2 py-1 rounded-md border text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm disabled:opacity-60"
                title="Deactivate"
              >
                {busyId === g._id ? '…' : 'Deactivate'}
              </button>
            </div>
          </li>
        ))}
        {items.length === 0 && (
          <li className="py-10 text-center text-neutral-500">No glazes</li>
        )}
      </ul>
    </div>
  )
}
