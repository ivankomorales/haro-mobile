// layouts/ResponsiveLayout.jsx
import { Outlet } from 'react-router-dom'
import AppBar from '../components/AppBar'
import Sidebar from '../components/Sidebar'
import BottomNavBar from '../components/BottomNavBar'
import { useMediaQuery } from 'react-responsive'
import useHideBars from '../hooks/useHideBars'

export default function ResponsiveLayout() {
  const shouldHideBars = useHideBars()
  const isDesktop = useMediaQuery({ minWidth: 1024 })

  return (
    <div className="flex min-h-screen">
      {/* Sidebar siempre visible en desktop */}
      {isDesktop && <Sidebar />}

      <div className="flex flex-col flex-1">
        <main className="flex-grow">
          <Outlet />
        </main>

        {/* BottomNavBar solo si no está oculto Y es mobile */}
        {!shouldHideBars && !isDesktop && <BottomNavBar />}
      </div>
    </div>
  )
}