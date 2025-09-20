// components/Sidebar.jsx
import { House, ClipboardList, UserRound, Package } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

import { useConfirm } from '../context/ConfirmContext'
import { getMessage as t } from '../utils/getMessage'
import { getOriginPath } from '../utils/navigationUtils'
import { smartNavigate } from '../utils/smartNavigate'
/* -------------------------------------------
   Styling helpers
   - Taller items (py-3.5)
   - Full-bleed backgrounds via -mx-3 on <nav>
   - Active: left border + font-medium
   - Section header never looks "selected"
-------------------------------------------- */

function cx(...args) {
  return args.filter(Boolean).join(' ')
}

function navItemBase(active) {
  return cx(
    'w-full flex items-center gap-2 px-7 py-3.5 text-sm transition-colors',
    'text-neutral-800 dark:text-neutral-100',
    !active && '[&>svg]:opacity-70',
    'hover:bg-neutral-100 dark:hover:bg-neutral-800',
    active &&
      'bg-neutral-200 dark:bg-neutral-800/70 font-medium border-l-2 border-neutral-400 dark:border-neutral-500'
  )
}

function navSectionButton() {
  // section header is never "selected" – only hover
  return cx(
    'w-full flex items-center justify-between px-7 py-3.5 text-sm transition-colors',
    'text-neutral-800 dark:text-neutral-100',
    'hover:bg-neutral-100 dark:hover:bg-neutral-800',
    '[&>span>svg]:opacity-70'
  )
}

// tiny label for groups
function SectionLabel({ children }) {
  return (
    <div className="mt-4 mb-2 px-3 text-[10px] font-semibold tracking-wider text-neutral-500 uppercase dark:text-neutral-400">
      {children}
    </div>
  )
}

export default function Sidebar({ ordersCount = 0 }) {
  // ^ pass real value from props/store; defaults to 0

  const navigate = useNavigate()
  const location = useLocation()
  const confirm = useConfirm()
  const [openProducts, setOpenProducts] = useState(true)

  const handleNav = (path) => {
    smartNavigate(navigate, location.pathname, path, {
      confirm,
      state: { originPath: getOriginPath(location.pathname) },
    })
  }

  const isActive = (p) => location.pathname === p

  return (
    <div
      className="flex h-full w-full flex-col overflow-y-auto bg-white px-3 dark:bg-neutral-900"
      style={{
        paddingTop: 'calc(var(--app-bar-h) + env(safe-area-inset-top))',
      }}
    >
      <div className="mb-2 text-center text-lg font-bold text-gray-800 dark:text-gray-100">
        {t('app.name')}
      </div>

      {/* Full-bleed buttons inside */}
      <nav className="-mx-3 flex flex-col space-y-0 text-sm">
        <SectionLabel>{t('nav.main')}</SectionLabel>

        {/* Home */}
        <button
          type="button"
          onClick={() => handleNav('/home')}
          className={navItemBase(isActive('/home'))}
        >
          <House className="h-5 w-5" />
          {t('nav.home')}
        </button>

        {/* Orders with badge (only if > 0) */}
        <button
          type="button"
          onClick={() => handleNav('/orders')}
          className={navItemBase(isActive('/orders'))}
        >
          <ClipboardList className="h-5 w-5" />
          {t('nav.orders')}
          {ordersCount > 0 && (
            // badge sits on the right
            <span
              className={cx(
                'ml-auto inline-flex items-center rounded-full px-2 py-0.5 text-xs tabular-nums',
                isActive('/orders')
                  ? 'bg-neutral-300 text-neutral-800 dark:bg-neutral-700 dark:text-neutral-100'
                  : 'bg-neutral-200 text-neutral-700 dark:bg-neutral-800/60 dark:text-neutral-200'
              )}
            >
              {ordersCount}
            </span>
          )}
        </button>

        {/* Users */}
        <button
          type="button"
          onClick={() => handleNav('/profile')}
          className={navItemBase(isActive('/profile'))}
        >
          <UserRound className="h-5 w-5" />
          {t('nav.users')}
        </button>

        <SectionLabel>{t('nav.catalog')}</SectionLabel>

        {/* Products section (header never "selected") */}
        <div>
          <button
            type="button"
            onClick={() => setOpenProducts((v) => !v)}
            className={navSectionButton()}
            aria-expanded={openProducts}
          >
            <span className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {t('nav.products')}
            </span>
            <span className="text-xs">{openProducts ? '▾' : '▸'}</span>
          </button>

          {openProducts && (
            <div className="space-y-0">
              <button
                type="button"
                onClick={() => handleNav('/products/glazes')}
                className={cx('pl-15', navItemBase(isActive('/products/glazes')))}
              >
                {t('glaze.list')}
              </button>
            </div>
          )}
        </div>
      </nav>
    </div>
  )
}
