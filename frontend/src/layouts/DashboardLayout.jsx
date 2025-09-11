// src/layouts/DashboardLayout.jsx
import { Outlet, useNavigate } from 'react-router-dom'
import { useMediaQuery } from 'react-responsive'
import SideBar from '../components/Sidebar'
import AppBar from '../components/AppBar'
import BottomNavBar from '../components/BottomNavBar'
import useHideBars from '../hooks/useHideBars'
import { useAuth } from '../hooks/useAuth'
import SplitActionButton from '../components/SplitActionButton'
import { getMessage as t } from '../utils/getMessage'
import { useLayout } from '../context/LayoutContext'
import { useEffect, useRef, useState } from 'react'
import { logout } from '../api/auth'
import useKeyboardOpen from '../hooks/useKeyboardOpen'

export default function DashboardLayout() {
  const isDesktop = useMediaQuery({ minWidth: 1024 })
  const hideBars = useHideBars()
  const kbOpen = useKeyboardOpen()
  const { isAdmin } = useAuth()
  const { title } = useLayout()
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef(null)
  const avatarRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target) &&
        avatarRef.current &&
        !avatarRef.current.contains(event.target)
      ) {
        setShowMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleAvatarClick = () => setShowMenu((v) => !v)
  const handleLogout = () => logout(navigate)

  const splitLabels = {
    main: t('splitAction.new'),
    order: t('splitAction.order'),
    user: t('splitAction.user'),
    glaze: t('splitAction.glaze'),
  }

  const splitShow = {
    order: true,
    user: isAdmin,
    glaze: isAdmin,
  }

  const showBottom = !isDesktop && !hideBars && !kbOpen

  return (
    <div className="app-shell flex h-svh bg-white text-black dark:bg-neutral-900 dark:text-white">
      {/* Sidebar en Desktop */}
      {isDesktop && !hideBars && <SideBar />}

      {/* Contenedor principal */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {/* Contenido scroll con AppBar sticky ADENTRO */}
        <main id="scrollable-content" className="app-main min-h-0 flex-1 overflow-y-auto">
          {!hideBars && (
            <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 backdrop-blur dark:border-neutral-800 dark:bg-neutral-900/90">
              <AppBar
                title={title}
                extra={
                  isDesktop ? (
                    <SplitActionButton
                      showSecondary={isAdmin}
                      labels={splitLabels}
                      show={splitShow}
                    />
                  ) : null
                }
                right={
                  <div className="relative mr-4">
                    <button
                      ref={avatarRef}
                      onClick={handleAvatarClick}
                      className="h-8 w-8 overflow-hidden rounded-full focus:ring-2 focus:ring-amber-500/50 focus:outline-none"
                      aria-haspopup="menu"
                      aria-expanded={showMenu ? 'true' : 'false'}
                      title="Cuenta"
                    >
                      <img
                        src="https://i.pravatar.cc/40"
                        alt="Avatar"
                        className="h-full w-full object-cover"
                      />
                    </button>

                    {showMenu && (
                      <div
                        ref={menuRef}
                        role="menu"
                        className="absolute top-[calc(100%+8px)] right-0 z-50 w-44 rounded-md border bg-white shadow-md dark:border-neutral-700 dark:bg-neutral-900"
                      >
                        <ul className="py-2 text-sm">
                          <li className="cursor-pointer px-4 py-2 hover:bg-gray-100 dark:hover:bg-neutral-800">
                            Perfil
                          </li>
                          <li className="cursor-pointer px-4 py-2 hover:bg-gray-100 dark:hover:bg-neutral-800">
                            Ajustes
                          </li>
                          <li
                            className="cursor-pointer px-4 py-2 text-red-600 hover:bg-gray-100 dark:hover:bg-neutral-800"
                            onClick={handleLogout}
                          >
                            Cerrar sesión
                          </li>
                        </ul>
                      </div>
                    )}
                  </div>
                }
              />
            </header>
          )}

          <div className=" px-4 py-6">
            <Outlet />
          </div>
        </main>

        {/* BottomNav en móvil */}
        {showBottom && <BottomNavBar />}
      </div>
    </div>
  )
}
