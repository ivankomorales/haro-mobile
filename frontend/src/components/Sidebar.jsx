// components/Sidebar.jsx
import { House, ClipboardList, UserRound } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { smartNavigate } from '../utils/smartNavigate'
import { useConfirm } from '../context/ConfirmContext'
import { getOriginPath } from '../utils/navigationUtils'

export default function Sidebar() {
  const navigate = useNavigate()
  const location = useLocation()
  const confirm = useConfirm()

  const isActive = (route) => location.pathname.startsWith(route)

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
    <div
      className="hidden md:flex flex-col w-56 h-screen px-4 py-6
                 bg-white dark:bg-neutral-900 border-r dark:border-neutral-800"
    >
      <div className="mb-6 text-center text-lg font-bold text-gray-800 dark:text-gray-100">
        Haro Mobile
      </div>

      <nav className="flex flex-col space-y-4 text-sm">
        <button
          onClick={() => handleNav('/home')}
          className={linkClass('/home')}
        >
          <House className="w-5 h-5" />
          Home
        </button>
        <button
          onClick={() => handleNav('/orders')}
          className={linkClass('/orders')}
        >
          <ClipboardList className="w-5 h-5" />
          Orders
        </button>
        <button
          onClick={() => handleNav('/profile')}
          className={linkClass('/profile')}
        >
          <UserRound className="w-5 h-5" />
          Users
        </button>
      </nav>
    </div>
  )
}
