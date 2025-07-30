// src/layouts/DashboardLayout.jsx
import { Outlet } from 'react-router-dom'
import { useMediaQuery } from 'react-responsive'
import SideBar from '../components/Sidebar'
import AppBar from '../components/AppBar'
import BottomNavBar from '../components/BottomNavBar'
import useHideBars from '../hooks/useHideBars'
import { useAuth } from '../context/AuthContext'
import SplitActionButton from '../components/SplitActionButton'

export default function DashboardLayout() {
  const isDesktop = useMediaQuery({ minWidth: 1024 })
  const hideBars = useHideBars()
  const { isAdmin } = useAuth()

  return (
    <div className="flex h-screen bg-white dark:bg-neutral-900 text-black dark:text-white overflow-hidden">
      {/* Sidebar en desktop */}
      {isDesktop && !hideBars && <SideBar />}

      {/* Main container */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* AppBar fijo */}
        {!hideBars && (
          <AppBar
            title="Haro Mobile"
            extra={isDesktop && isAdmin ? <SplitActionButton /> : null}
            right={
              <div className="mr-4">
                <div className="w-10 h-10 rounded-full overflow-hidden">
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

        {/* Contenido scrolleable */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[92%] mx-auto px-4 py-6">
            <Outlet />
          </div>
        </main>

        {/* Bottom Nav en mobile */}
        {!isDesktop && !hideBars && <BottomNavBar />}
      </div>
    </div>
  )
}
