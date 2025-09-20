import {
  House,
  Clipboard,
  Plus,
  // ChartNoAxesCombined, // or ChartNoAxesCombined (not used)
  UserRound,
  Paintbrush,
} from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'

import { useConfirm } from '../context/ConfirmContext'
import { getOriginPath } from '../utils/navigationUtils'
import { smartNavigate } from '../utils/smartNavigate'

export default function BottomNavBar({ t }) {
  const navigate = useNavigate()
  const location = useLocation()
  const confirm = useConfirm()
  const { pathname } = location

  const isActive = (route) => pathname.startsWith(route)

  return (
    <div className="fixed bottom-4 left-1/2 z-50 h-16 w-full max-w-lg -translate-x-1/2 rounded-full border border-gray-200 bg-white dark:border-gray-600 dark:bg-gray-700">
      {/* TODO: Change to a bottom-fixed bar:
          <nav className="fixed bottom-0 left-0 right-0 h-[var(--bottom-bar-h)] pb-[var(--safe-bottom)] bg-white/90 dark:bg-neutral-900/90 backdrop-blur border-t border-neutral-200 dark:border-neutral-800 z-50"> */}
      <div className="mx-auto grid h-full max-w-lg grid-cols-5">
        {/* Home */}
        <button
          aria-label={t('navBar.home')}
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
                ? 'scale-120 text-blue-600 dark:text-blue-500'
                : 'text-gray-500 group-hover:text-blue-600 dark:text-gray-400 dark:group-hover:text-blue-400'
            }`}
          />
          <span className="sr-only">{t('navBar.home')}</span>
          {/* Animated indicator */}
          <span
            className={`absolute -top-0.5 h-1.5 w-7 rounded-full transition-all duration-200 ${
              isActive('/home') ? 'scale-100 bg-blue-600 opacity-100' : 'scale-0 opacity-0'
            }`}
          />
        </button>

        {/* Orders */}
        <button
          aria-label={t('navBar.orders')}
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
                ? 'scale-120 text-blue-600 dark:text-blue-500'
                : 'text-gray-500 group-hover:text-blue-600 dark:text-gray-400 dark:group-hover:text-blue-400'
            }`}
          />
          <span className="sr-only">{t('navBar.orders')}</span>
          {/* Animated indicator */}
          <span
            className={`absolute -top-0.5 h-1.5 w-7 rounded-full transition-all duration-200 ${
              isActive('/orders') ? 'scale-100 bg-blue-600 opacity-100' : 'scale-0 opacity-0'
            }`}
          />
        </button>

        {/* Central Plus Button */}
        <div className="flex items-center justify-center">
          <button
            aria-label={t('navBar.newOrder')}
            onClick={() =>
              navigate('/orders/new', {
                state: { originPath: getOriginPath(location.pathname) },
              })
            }
            className="group inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 font-medium text-white hover:bg-blue-700 focus:outline-none"
          >
            <Plus className="h-7 w-7" />
            <span className="sr-only">{t('navBar.newOrder')}</span>
          </button>
        </div>

        {/* Glazes */}
        <button
          aria-label={t('navBar.glazes')}
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
                ? 'scale-120 text-blue-600 dark:text-blue-500'
                : 'text-gray-500 group-hover:text-blue-600 dark:text-gray-400 dark:group-hover:text-blue-400'
            }`}
          />
          <span className="sr-only">{t('navBar.glazes')}</span>
          {/* Animated indicator */}
          <span
            className={`absolute -top-0.5 h-1.5 w-7 rounded-full transition-all duration-200 ${
              isActive('/products/glazes')
                ? 'scale-100 bg-blue-600 opacity-100'
                : 'scale-0 opacity-0'
            }`}
          />
        </button>

        {/* Profile */}
        <button
          aria-label={t('navBar.profile')}
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
                ? 'scale-120 text-blue-600 dark:text-blue-500'
                : 'text-gray-500 group-hover:text-blue-600 dark:text-gray-400 dark:group-hover:text-blue-400'
            }`}
          />
          <span className="sr-only">{t('navBar.profile')}</span>
          {/* Animated indicator */}
          <span
            className={`absolute -top-0.5 h-1.5 w-7 rounded-full transition-all duration-200 ${
              isActive('/profile') ? 'scale-100 bg-blue-600 opacity-100' : 'scale-0 opacity-0'
            }`}
          />
        </button>
      </div>
    </div>
  )
}
