import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import ProfesorSidebar from './ProfesorSidebar'
import Navbar from '../../components/layout/Navbar'

function tituloRuta(pathname: string): string {
  if (pathname === '/profesor' || pathname === '/profesor/') return 'Panel docente'
  if (pathname === '/profesor/clases') return 'Mis clases'
  if (pathname.includes('/estudiantes/')) return 'Portafolio del estudiante'
  if (pathname.startsWith('/profesor/clases/')) return 'Detalle de clase'
  return 'Panel docente'
}

export default function ProfesorLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const title = tituloRuta(location.pathname)

  return (
    <div className="min-h-screen notebook-page flex w-full max-w-full overflow-x-hidden">
      <ProfesorSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
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
