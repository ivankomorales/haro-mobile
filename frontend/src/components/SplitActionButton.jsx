// src/components/SplitActionButton.jsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function SplitActionButton() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { isAdmin } = useAuth()

  const handleSelect = (path) => {
    navigate(path)
    setOpen(false)
  }

  return (
    <div className="relative">
      <div className="flex rounded-md shadow overflow-hidden">
        <button
          onClick={() => handleSelect('/orders/new')}
          className="bg-orange-600 text-white px-4 py-2 text-sm font-medium hover:bg-orange-700"
        >
          + Nuevo
        </button>
        {isAdmin && (
          <button
            onClick={() => setOpen(!open)}
            className="bg-orange-600 text-white px-2 py-2 text-sm font-medium hover:bg-orange-700"
          >
            ▼
          </button>
        )}
      </div>

      {isAdmin && open && (
        <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-neutral-800 border border-gray-300 dark:border-neutral-700 rounded-md shadow-lg z-50">
          <button
            onClick={() => handleSelect('/orders/new')}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-neutral-700"
          >
            Pedido
          </button>
          <button
            onClick={() => handleSelect('/users/add')}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-neutral-700"
          >
            Usuario
          </button>
          <button
            onClick={() => handleSelect('/glazes/add')}
            className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 dark:hover:bg-neutral-700"
          >
            Esmalte
          </button>
        </div>
      )}
    </div>
  )
}
