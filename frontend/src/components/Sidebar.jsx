// components/Sidebar.jsx
import { House, ClipboardList, UserRound, Package } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { smartNavigate } from '../utils/smartNavigate'
import { useConfirm } from '../context/ConfirmContext'
import { getOriginPath } from '../utils/navigationUtils'
import { useState } from 'react'

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const confirm = useConfirm()

  const isActive = (route) => location.pathname.startsWith(route)

  const [openProducts, setOpenProducts] = useState(true)
  const sectionBtn =
    'w-full flex items-center justify-between px-2 py-2 rounded-md font-semibold hover:bg-gray-100 dark:hover:bg-neutral-800'

  const handleNav = (path) => {
    smartNavigate(navigate, location.pathname, path, {
      confirm,
      state: {
        originPath: getOriginPath(location.pathname),
      },
    })
  }

  const linkClass = (route) =>
    `flex items-center gap-2 px-2 py-3 rounded-md transition-colors ${
      isActive(route)
        ? 'text-black dark:text-white bg-blue-100 dark:bg-gray-500 shadow-md'
        : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-neutral-800'
    }
    }`

  return (
    <div className="hidden h-[calc(100svh-var(--app-bar-h))] w-56 flex-col overflow-y-auto border-r bg-white px-4 py-6 pt-[var(--app-bar-h)] md:flex dark:border-neutral-800 dark:bg-neutral-900">
      {/* <div className="mb-6 text-center text-lg font-bold text-gray-800 dark:text-gray-100">
        Haro Mobile
      </div> */}

      <nav className="flex flex-col space-y-4 text-sm">
        <button onClick={() => handleNav('/home')} className={linkClass('/home')}>
          <House className="h-5 w-5" />
          Home
        </button>
        <button onClick={() => handleNav('/orders')} className={linkClass('/orders')}>
          <ClipboardList className="h-5 w-5" />
          Orders
        </button>
        <button onClick={() => handleNav('/profile')} className={linkClass('/profile')}>
          <UserRound className="h-5 w-5" />
          Users
        </button>
        <div className="mt-2">
          <button
            onClick={() => setOpenProducts((v) => !v)}
            className={sectionBtn}
            aria-expanded={openProducts}
          >
            <span className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Products
            </span>
            <span className="text-xs">{openProducts ? '▾' : '▸'}</span>
          </button>

          {openProducts && (
            <div className="mt-1 space-y-1 pl-6">
              <button
                onClick={() => handleNav('/products/glazes')}
                className={linkClass('/products/glazes')}
              >
                Glazes
              </button>
            </div>
          )}
        </div>
      </nav>
    </div>
  )
}
