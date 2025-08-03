// src/components/SplitActionButton.jsx

import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { smartNavigate } from '../utils/smartNavigate'
import { useConfirm } from '../context/ConfirmContext'

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

  const handleSelect = (path, context = {}) => {
    smartNavigate(navigate, location.pathname, path, {
      ...context,
      confirm,
    })
    setOpen(false)
  }

  return (
    <div className="relative">
      <div className="flex rounded-md shadow overflow-hidden">
        <button
          onClick={() =>
            handleSelect('/orders/new', {
              state: { originPath: location.pathname },
            })
          }
          className="bg-orange-600 text-white px-4 py-2 text-sm font-medium hover:bg-orange-700"
        >
          {labels.main}
        </button>
        {showSecondary && (
          <button
            onClick={() => setOpen((prev) => !prev)}
            className="bg-orange-600 text-white px-2 py-2 text-sm font-medium hover:bg-orange-700"
          >
            ▼
          </button>
        )}
      </div>

      {showSecondary && open && (
        <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 rounded-md shadow-lg z-50">
          {show.order && (
            <button
              onClick={() =>
                handleSelect('/orders/new', {
                  state: { originPath: location.pathname },
                })
              }
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-neutral-700"
            >
              {labels.order}
            </button>
          )}
          {show.user && (
            <button
              onClick={() => handleSelect('/users/add')}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-neutral-700"
            >
              {labels.user}
            </button>
          )}
          {show.glaze && (
            <button
              onClick={() => handleSelect('/glazes/add')}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-neutral-700"
            >
              {labels.glaze}
            </button>
          )}
        </div>
      )}
    </div>
  )
}
