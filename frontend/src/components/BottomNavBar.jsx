import {
  House,
  Clipboard,
  Plus,
  ChartNoAxesCombined, // o ChartNoAxesCombined
  UserRound,
  Paintbrush,
} from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'
import { smartNavigate } from '../utils/smartNavigate'
import { useConfirm } from '../context/ConfirmContext'
import { getOriginPath } from '../utils/navigationUtils'

export default function BottomNavBar() {
  const navigate = useNavigate()
  const location = useLocation()
  const confirm = useConfirm()
  const { pathname } = location

  const isActive = (route) => pathname.startsWith(route)

  return (
    <div className="fixed bottom-4 left-1/2 z-50 h-16 w-full max-w-lg -translate-x-1/2 rounded-full border border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-700">
      {/* TODO Change to have bottom bar fixed at bottom <nav className="fixed bottom-0 left-0 right-0 h-[var(--bottom-bar-h)] pb-[var(--safe-bottom)] bg-white/90 dark:bg-neutral-900/90 backdrop-blur border-t border-neutral-200 dark:border-neutral-800 z-50"> */}
      <div className="mx-auto grid h-full max-w-lg grid-cols-5">
        {/* Home */}
        <button
          onClick={() =>
            smartNavigate(navigate, pathname, '/home', {
              confirm,
              state: { originPath: getOriginPath(pathname) },
            })
          }
          className="group inline-flex flex-col items-center justify-center rounded-s-full px-5"
        >
          <House
            className={`h-5 w-5 transition-transform duration-200 ${
              isActive('/home')
                ? 'scale-120 text-blue-600 dark:text-blue-400'
                : 'text-gray-500 group-hover:text-blue-600 dark:text-gray-400 dark:group-hover:text-blue-400'
            }`}
          />
          <span className="sr-only">Home</span>
          {/* Indicador animado */}
          <span
            className={`absolute -top-0.5 h-1.5 w-7 rounded-full transition-all duration-200 ${isActive('/home') ? 'scale-100 bg-blue-600 opacity-100' : 'scale-0 opacity-0'} `}
          ></span>
        </button>

        {/* Orders */}
        <button
          onClick={() =>
            smartNavigate(navigate, pathname, '/orders', {
              confirm,
              state: { originPath: getOriginPath(pathname) },
            })
          }
          className="group relative flex flex-col items-center justify-center px-5"
        >
          <Clipboard
            className={`h-5 w-5 transition-transform duration-200 ${
              isActive('/orders')
                ? 'scale-120 text-blue-600 dark:text-blue-400'
                : 'text-gray-500 group-hover:text-blue-600 dark:text-gray-400 dark:group-hover:text-blue-400'
            }`}
          />
          <span className="sr-only">Orders</span>
          {/* Indicador animado */}
          <span
            className={`absolute -top-0.5 h-1.5 w-7 rounded-full transition-all duration-200 ${isActive('/orders') ? 'scale-100 bg-blue-600 opacity-100' : 'scale-0 opacity-0'} `}
          ></span>
        </button>

        {/* Central Plus Button */}
        <div className="flex items-center justify-center">
          <button
            onClick={() =>
              navigate('/orders/new', {
                state: {
                  originPath: getOriginPath(location.pathname),
                },
              })
            }
            className="group inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-medium text-white hover:bg-blue-700 focus:outline-none"
          >
            <Plus className="h-7 w-7" />
            <span className="sr-only">New Order</span>
          </button>
        </div>

        {/* Dashboard */}
        <button
          onClick={() =>
            smartNavigate(navigate, pathname, '/products/glazes', {
              confirm,
              state: { originPath: getOriginPath(pathname) },
            })
          }
          className="group inline-flex flex-col items-center justify-center px-5"
        >
          <Paintbrush
            className={`h-5 w-5 transition-transform duration-200 ${
              isActive('/products/glazes')
                ? 'scale-120 text-blue-600 dark:text-blue-400'
                : 'text-gray-500 group-hover:text-blue-600 dark:text-gray-400 dark:group-hover:text-blue-400'
            }`}
          />
          <span className="sr-only">Esmaltes</span>
          {/* Indicador animado */}
          <span
            className={`absolute -top-0.5 h-1.5 w-7 rounded-full transition-all duration-200 ${isActive('/products/glazes') ? 'scale-100 bg-blue-600 opacity-100' : 'scale-0 opacity-0'} `}
          ></span>
        </button>

        {/* Profile */}
        <button
          onClick={() =>
            smartNavigate(navigate, pathname, '/profile', {
              confirm,
              state: { originPath: getOriginPath(pathname) },
            })
          }
          className="group inline-flex flex-col items-center justify-center rounded-e-full px-5"
        >
          <UserRound
            className={`h-5 w-5 transition-transform duration-200 ${
              isActive('/profile')
                ? 'scale-120 text-blue-600 dark:text-blue-400'
                : 'text-gray-500 group-hover:text-blue-600 dark:text-gray-400 dark:group-hover:text-blue-400'
            }`}
          />
          <span className="sr-only">Profile</span>
          {/* Indicador animado */}
          <span
            className={`absolute -top-0.5 h-1.5 w-7 rounded-full transition-all duration-200 ${isActive('/profile') ? 'scale-100 bg-blue-600 opacity-100' : 'scale-0 opacity-0'} `}
          ></span>
        </button>
      </div>
    </div>
  )
}
