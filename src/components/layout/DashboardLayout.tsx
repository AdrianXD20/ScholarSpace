import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import Navbar from './Navbar'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/notes': 'Mis Apuntes',
  '/dashboard/achievements': 'Mis Logros',
  '/dashboard/activities': 'Actividades',
  '/dashboard/profile': 'Mi Perfil',
  '/dashboard/clases': 'Clases disponibles',
}

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const title = pageTitles[location.pathname] || 'Dashboard'

  return (
    <div className="min-h-screen notebook-page flex w-full max-w-full overflow-x-hidden">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 min-w-0 flex flex-col lg:ml-0">
        <Navbar onMenuClick={() => setSidebarOpen(true)} title={title} />

        <main className="flex-1 min-w-0 p-4 lg:p-6">
          <div className="page-shell notebook-content content-safe p-4 sm:p-5 lg:p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
