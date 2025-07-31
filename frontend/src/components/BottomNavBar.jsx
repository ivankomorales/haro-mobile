import {
  House,
  Clipboard,
  Plus,
  ChartNoAxesCombined, // o ChartNoAxesCombined
  UserRound,
} from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { smartNavigate } from '../utils/smartNavigate'
import { useConfirm } from '../context/ConfirmContext'

export default function BottomNavBar() {
  const navigate = useNavigate()
  const location = useLocation()
  const confirm = useConfirm()
  const { pathname } = location

  const isActive = (route) => pathname.startsWith(route)

  return (
    <div
      className="
        fixed bottom-4 left-1/2 -translate-x-1/2 z-50 
        w-full max-w-lg h-16
        bg-white border dark:bg-gray-700
        border-gray-200 dark:border-gray-600
        rounded-full
      "
    >
      <div className="grid grid-cols-5 h-full max-w-lg mx-auto">
        {/* Home */}
        <button
          onClick={() =>
            smartNavigate(navigate, pathname, '/home', { confirm })
          }
          className="inline-flex flex-col items-center justify-center px-5 rounded-s-full group"
        >
          <House
            className={`
              w-5 h-5 transition-transform duration-200
              ${
                isActive('/home')
                  ? 'text-blue-600 dark:text-blue-400 scale-120'
                  : 'text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'
              }`}
          />
          <span className="sr-only">Home</span>
          {/* Indicador animado */}
          <span
            className={`absolute -top-0.5 w-7 h-1.5 rounded-full transition-all duration-200 
              ${isActive('/home') ? 'bg-blue-600 opacity-100 scale-100' : 'opacity-0 scale-0'}
            `}
          ></span>
        </button>

        {/* Orders */}
        <button
          onClick={() =>
            smartNavigate(navigate, pathname, '/orders', { confirm })
          }
          className="relative flex flex-col items-center justify-center px-5 group"
        >
          <Clipboard
            className={`
              w-5 h-5 transition-transform duration-200
              ${
                isActive('/orders')
                  ? 'text-blue-600 dark:text-blue-400 scale-120'
                  : 'text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'
              }`}
          />
          <span className="sr-only">Orders</span>
          {/* Indicador animado */}
          <span
            className={`absolute -top-0.5 w-7 h-1.5 rounded-full transition-all duration-200 
              ${isActive('/orders') ? 'bg-blue-600 opacity-100 scale-100' : 'opacity-0 scale-0'}
            `}
          ></span>
        </button>

        {/* Central Plus Button */}
        <div className="flex items-center justify-center">
          <button
            onClick={() =>
              navigate('/orders/new', { state: { from: location.pathname } })
            }
            className="
              inline-flex items-center justify-center 
              w-10 h-10 
              text-white font-medium 
              bg-blue-600 hover:bg-blue-700 
              rounded-full
              focus:outline-none
              group
            "
          >
            <Plus className="w-4 h-4" />
            <span className="sr-only">New Order</span>
          </button>
        </div>

        {/* Dashboard */}
        <button
          onClick={() =>
            smartNavigate(navigate, pathname, '/dashboard', { confirm })
          }
          className="inline-flex flex-col items-center justify-center px-5 group"
        >
          <ChartNoAxesCombined
            className={`
              w-5 h-5 transition-transform duration-200
              ${
                isActive('/dashboard')
                  ? 'text-blue-600 dark:text-blue-400 scale-120'
                  : 'text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'
              }`}
          />
          <span className="sr-only">Dashboard</span>
          {/* Indicador animado */}
          <span
            className={`absolute -top-0.5 w-7 h-1.5 rounded-full transition-all duration-200 
              ${isActive('/dashboard') ? 'bg-blue-600 opacity-100 scale-100' : 'opacity-0 scale-0'}
            `}
          ></span>
        </button>

        {/* Profile */}
        <button
          onClick={() =>
            smartNavigate(navigate, pathname, '/profile', { confirm })
          }
          className="inline-flex flex-col items-center justify-center px-5 rounded-e-full group"
        >
          <UserRound
            className={`
              w-5 h-5 transition-transform duration-200
              ${
                isActive('/profile')
                  ? 'text-blue-600 dark:text-blue-400 scale-120'
                  : 'text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400'
              }`}
          />
          <span className="sr-only">Profile</span>
          {/* Indicador animado */}
          <span
            className={`absolute -top-0.5 w-7 h-1.5 rounded-full transition-all duration-200 
              ${isActive('/profile') ? 'bg-blue-600 opacity-100 scale-100' : 'opacity-0 scale-0'}
            `}
          ></span>
        </button>
      </div>
    </div>
  )
}
