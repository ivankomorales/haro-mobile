// src/layouts/DashboardLayout.jsx
import { Outlet } from 'react-router-dom'
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
import { useNavigate } from 'react-router-dom'
import { LogOut } from 'lucide-react'
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

  const handleAvatarClick = () => setShowMenu((v) => !v) //Show/Hide menu when clickinig using most recent value: (v)
  const handleLogout = () => {
    logout(navigate)
  }

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
    <div className="app-shell h-svh flex bg-white text-black dark:bg-neutral-900 dark:text-white">
      {/* Sidebar on Desktop */}
      {isDesktop && !hideBars && <SideBar />}

      {/* Main container */}
       <div className="flex flex-1 min-h-0 flex-col">
        {/* AppBar fijo */}
        {!hideBars && (
          <AppBar
            title={title}
            extra={
              isDesktop ? (
                <SplitActionButton showSecondary={isAdmin} labels={splitLabels} show={splitShow} />
              ) : null
            }
            right={
              <div className="mr-4">
                <div
                  ref={avatarRef}
                  className="h-8 w-8 cursor-pointer overflow-hidden rounded-full"
                  onClick={handleAvatarClick}
                >
                  <img
                    src="https://i.pravatar.cc/40"
                    alt="Avatar"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            }
          />
        )}
        {showMenu && (
          <div
            ref={menuRef}
            className="absolute right-1 z-50 mt-10 w-40 rounded-md bg-white shadow-md"
          >
            <ul className="py-2">
              <li className="cursor-pointer px-4 py-2 hover:bg-gray-100">Perfil {/* TODO */}</li>
              <li className="cursor-pointer px-4 py-2 hover:bg-gray-100">Ajustes {/* TODO */}</li>
              <li
                className="cursor-pointer px-4 py-2 text-red-600 hover:bg-gray-100"
                onClick={handleLogout}
              >
                Cerrar sesión {/* TODO */}
              </li>
            </ul>
          </div>
        )}

        {/* Scrollable Content */}
        <main id="scrollable-content" className="app-main flex-1 min-h-0 overflow-y-auto">
          <div className="mx-auto max-w-[92%] px-4 py-6">
            <Outlet />
          </div>
        </main>

        {/* BottomNav for Mobile */}
        {showBottom && <BottomNavBar />}
      </div>
    </div>
  )
}
