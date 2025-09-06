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

export default function DashboardLayout() {
  const isDesktop = useMediaQuery({ minWidth: 1024 })
  const hideBars = useHideBars()
  const { isAdmin } = useAuth()
  const { title } = useLayout()
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef()
  const avatarRef = useRef()
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

  const handleAvatarClick = () => {
    setShowMenu(!showMenu) // Muestra o esconde el menú al hacer click
  }

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

  const showBottom = !isDesktop && !hideBars

  return (
    <div className="flex app-shell bg-white dark:bg-neutral-900 text-black dark:text-white overflow-hidden">
      {/* Sidebar on Desktop */}
      {isDesktop && !hideBars && <SideBar />}

      {/* Main container */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* AppBar fijo */}
        {!hideBars && (
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
              <div className="mr-4">
                <div
                  ref={avatarRef}
                  className="w-8 h-8 rounded-full overflow-hidden cursor-pointer"
                  onClick={handleAvatarClick}
                >
                  <img
                    src="https://i.pravatar.cc/40"
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            }
          />
        )}
        {showMenu && (
          <div
            ref={menuRef}
            className="absolute right-1 mt-10 w-40 bg-white shadow-md rounded-md z-50"
          >
            <ul className="py-2">
              <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                Perfil {/* TODO */}
              </li>
              <li className="px-4 py-2 hover:bg-gray-100 cursor-pointer">
                Ajustes {/* TODO */}
              </li>
              <li
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-red-600"
                onClick={handleLogout}
              >
                Cerrar sesión {/* TODO */}
              </li>
            </ul>
          </div>
        )}

        {/* Scrollable Content */}
        <main id="scrollable-content" className="flex-1 overflow-y-auto">
          <div className="max-w-[92%] mx-auto px-4 py-6">
            <Outlet />
          </div>
        </main>

        {/* BottomNav for Mobile */}
        {showBottom && <BottomNavBar />}
      </div>
    </div>
  )
}
