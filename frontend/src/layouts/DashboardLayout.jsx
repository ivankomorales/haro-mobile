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
import AccountMenu from '../components/AccountMenu'
import { uploadToCloudinary } from '../utils/uploadToCloudinary'
import { updateMe } from '../api/users'

export default function DashboardLayout() {
  const isDesktop = useMediaQuery({ minWidth: 1024 })
  const hideBars = useHideBars()
  const kbOpen = useKeyboardOpen()
  const { isAdmin, user, logout, refreshUser } = useAuth()
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
    return () => document.removeEventListener('mousedown', handleClickOutside)
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

  // Show BottomNav only on mobile, when bars aren't hidden and keyboard is closed
  const showBottom = !isDesktop && !hideBars && !kbOpen

  const handleUploadAvatar = async (file) => {
    // 1) sube a Cloudinary
    const url = await uploadToCloudinary(file, 'haromobile/avatars')
    // 2) guarda en tu backend
    await updateMe({ avatarUrl: url })
    // 3) refresca el contexto (para email/ nombre/ avatar)
    await refreshUser()
    // 4) regresa la URL para que AccountMenu actualice el preview al instante
    return url
  }

  return (
    <div className="h-svh bg-stone-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      {/* 2-column grid only on desktop; single column on mobile */}
      <div className="grid h-full min-h-0 grid-cols-1 lg:grid-cols-[256px_minmax(0,1fr)]">
        {/* Sidebar on desktop */}
        {isDesktop && !hideBars && (
          <aside className="hidden h-full bg-white lg:block lg:border-r lg:border-neutral-200 dark:bg-neutral-900 dark:lg:border-neutral-800">
            <SideBar />
          </aside>
        )}

        {/* Right column: header + scrollable content + (mobile) bottom nav */}
        <div className="flex min-h-0 min-w-0 flex-col overflow-hidden">
          {/* Sticky AppBar inside the right column */}
          {!hideBars && (
            <header className="sticky top-0 z-40 border-b border-neutral-200 bg-stone-50/80 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/80">
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
                    {/* <button
                      ref={avatarRef}
                      onClick={handleAvatarClick}
                      className="h-8 w-8 overflow-hidden rounded-full focus:ring-2 focus:ring-amber-500/50 focus:outline-none"
                      aria-haspopup="menu"
                      aria-expanded={showMenu ? 'true' : 'false'}
                      title="Account"
                    >
                      <img
                        src="https://i.pravatar.cc/40"
                        alt="Avatar"
                        className="h-full w-full object-cover"
                      />
                    </button> */}
                    <AccountMenu
                      email={user?.email || 'user@example.com'}
                      name={[user?.name, user?.lastName].filter(Boolean).join(' ')}
                      avatarUrl={user?.avatarUrl || ''}
                      onLogout={handleLogout}
                      onUploadAvatar={handleUploadAvatar}
                      // onUploadAvatar = async (file) => {
                      //   // TODO: sube a tu backend y retorna la URL final
                      //   const url = await uploadAvatar(file)
                      //   return url
                      // }
                    />
                    {/* Avatar menu */}
                    {/* {showMenu && (
                      <div
                        ref={menuRef}
                        role="menu"
                        className="absolute top-[calc(100%+8px)] right-0 z-50 w-44 rounded-md border bg-white shadow-md dark:border-neutral-700 dark:bg-neutral-900"
                      >
                        <ul className="py-2 text-sm">
                          <li className="cursor-pointer px-4 py-2 hover:bg-gray-100 dark:hover:bg-neutral-800">
                            Profile
                          </li>
                          <li className="cursor-pointer px-4 py-2 hover:bg-gray-100 dark:hover:bg-neutral-800">
                            Settings
                          </li>
                          <li
                            className="cursor-pointer px-4 py-2 text-red-600 hover:bg-gray-100 dark:hover:bg-neutral-800"
                            onClick={handleLogout}
                          >
                            Log out
                          </li>
                        </ul>
                      </div>
                    )} */}
                  </div>
                }
              />
            </header>
          )}

          {/* Scrollable area + page container */}
          <main
            id="scrollable-content"
            className="min-h-0 flex-1 overflow-y-auto overscroll-contain"
          >
            <div className="mx-auto max-w-7xl p-4 lg:p-6">
              <Outlet />
            </div>
          </main>

          {/* Bottom navigation on mobile */}
          {showBottom && <BottomNavBar />}
        </div>
      </div>
    </div>
  )
}
