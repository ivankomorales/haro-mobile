// src/components/SplitActionButton.jsx
import { ClipboardList, UserRound, Paintbrush, Plus } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

import { useConfirm } from '../context/ConfirmContext'
import { getOriginPath } from '../utils/navigationUtils'
import { smartNavigate } from '../utils/smartNavigate'
/**
 * Reusable action button with dropdown support.
 *
 * Props:
 * - showSecondary: Boolean to toggle dropdown button
 * - labels: Object with i18n strings { main, order, user, glaze }
 * - show: Object to toggle visibility of secondary actions { order, user, glaze }
 */
export default function SplitActionButton({
  showSecondary = false,
  labels = {
    main: '+ New',
    order: 'Order',
    user: 'User',
    glaze: 'Glaze',
  },
  show = {
    order: true,
    user: true,
    glaze: true,
  },
}) {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const confirm = useConfirm()
  const dropdownRef = useRef(null)

  const handleSelect = (path, context = {}) => {
    smartNavigate(navigate, location.pathname, path, {
      ...context,
      confirm,
    })
    setOpen(false)
  }

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false)
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    } else {
      document.removeEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex overflow-hidden rounded-md shadow">
        <button
          onClick={() =>
            handleSelect('/orders/new', {
              state: { originPath: getOriginPath(location.pathname) },
            })
          }
          className="inline-flex bg-gray-600 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-700"
        >
          <Plus className='h-5 w-5'/>
          {labels.main}
        </button>
        {showSecondary && (
          <button
            onClick={() => setOpen((prev) => !prev)}
            className="bg-gray-600 px-2 py-2 text-sm font-medium text-white hover:bg-gray-700 dark:bg-gray-500 dark:hover:bg-gray-700"
          >
            ▼
          </button>
        )}
      </div>

      {showSecondary && open && (
        <div className="absolute right-0 z-50 mt-1 w-40 rounded-md border border-gray-300 bg-white shadow-lg dark:border-neutral-700 dark:bg-neutral-800">
          {show.order && (
            <button
              onClick={() =>
                handleSelect('/orders/new', {
                  state: { originPath: getOriginPath(location.pathname) },
                })
              }
              className="flex w-full items-center gap-4 px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-neutral-700"
            >
              <ClipboardList className="h-5, w-5 text-gray-600 dark:text-gray-400" />
              {labels.order}
            </button>
          )}
          {show.user && (
            <button
              onClick={() =>
                handleSelect('/users/add', {
                  state: { originPath: getOriginPath(location.pathname) },
                })
              }
              className="flex w-full items-center gap-4 px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-neutral-700"
            >
              <UserRound className="h-5, w-5 text-gray-600 dark:text-gray-400" />
              {labels.user}
            </button>
          )}
          {show.glaze && (
            <button
              onClick={() =>
                handleSelect('/glazes/add', {
                  state: { originPath: getOriginPath(location.pathname) },
                })
              }
              className="flex w-full items-center gap-4 px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-neutral-700"
            >
              <Paintbrush className="h-5, w-5 text-gray-600 dark:text-gray-400" />
              {labels.glaze}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
