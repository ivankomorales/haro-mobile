// src/layouts/DashboardLayout.jsx
import { Outlet } from 'react-router-dom'
import { useMediaQuery } from 'react-responsive'
import SideBar from '../components/Sidebar'
import AppBar from '../components/AppBar'
import BottomNavBar from '../components/BottomNavBar'
import useHideBars from '../hooks/useHideBars'

export default function DashboardLayout() {
  const isDesktop = useMediaQuery({ minWidth: 1024 })
  const hideBars = useHideBars()

  return (
    <div className="flex min-h-screen bg-white dark:bg-neutral-900 text-black dark:text-white">
      {/* Sidebar en desktop */}
      {isDesktop && !hideBars && <SideBar />}

      {/* Contenedor principal */}
      <div className="flex-1 flex flex-col">
        {/* AppBar */}
        {!hideBars && (
          <AppBar
            title="Haro Mobile"
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

        {/* Contenido de la ruta */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[92%] mx-auto px-4 py-6">
            <Outlet />
          </div>
        </main>

        {/* Bottom Nav solo en mobile */}
        {!isDesktop && !hideBars && <BottomNavBar />}
      </div>
    </div>
  )
}
